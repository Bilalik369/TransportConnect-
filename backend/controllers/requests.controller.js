import Request from "../models/Request.js";
import User from "../models/User.js";
import Chat from "../models/Chat.js";
import Trip from "../models/Trip.js";




export const getUserRequests = async (req, res) => {
    try {
      const { status, page = 1, limit = 10 } = req.query
  
      const filter = { sender: req.user._id }
      if (status) {
        filter.status = status
      }
  
      const requests = await Request.find(filter)
        .populate("trip", "departure destination departureDate driver")
        .populate("trip.driver", "firstName lastName avatar stats")
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
  
      const total = await Request.countDocuments(filter)
  
      res.json({
        requests,
        pagination: {
          currentPage: Number.parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalRequests: total,
        },
      })
    } catch (error) {
      console.error("Erreur récupération demandes:", error)
      res.status(500).json({ message: "Erreur lors de la récupération des demandes" })
    }
  }

export const getReceivedRequests = async (req, res) => {
    try {
      const { status, page = 1, limit = 10 } = req.query
  
      const driverTrips = await Trip.find({ driver: req.user._id }).select("_id")
      const tripIds = driverTrips.map((trip) => trip._id)
  
      const filter = { trip: { $in: tripIds } }
      if (status) {
        filter.status = status
      }
  
      const requests = await Request.find(filter)
        .populate("sender", "firstName lastName avatar stats phone")
        .populate("trip", "departure destination departureDate availableCapacity")
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
  
      const total = await Request.countDocuments(filter)
  
      res.json({
        requests,
        pagination: {
          currentPage: Number.parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalRequests: total,
        },
      })
    } catch (error) {
      console.error("Erreur récupération demandes reçues:", error)
      res.status(500).json({ message: "Erreur lors de la récupération des demandes reçues" })
    }
}
  
export const getRequestById = async (req, res) => {
    try {
      const request = await Request.findById(req.params.id)
        .populate("sender", "firstName lastName avatar stats phone")
        .populate({
          path: "trip",
          populate: {
            path: "driver",
            select: "firstName lastName avatar stats phone",
          },
        })
  
      if (!request) {
        return res.status(404).json({ message: "Demande non trouvée" })
      }
  
   
      const isOwner = request.sender._id.toString() === req.user._id.toString()
      const isDriver = request.trip.driver._id.toString() === req.user._id.toString()
      const isAdmin = req.user.role === "admin"
  
      if (!isOwner && !isDriver && !isAdmin) {
        return res.status(403).json({ message: "Accès refusé" })
      }
  
      res.json({ request })
    } catch (error) {
      console.error("Erreur récupération demande:", error)
      res.status(500).json({ message: "Erreur lors de la récupération de la demande" })
    }
  }
  
export const createRequest = async (req, res) => {
    try {
      const { tripId, ...requestData } = req.body
  
      
      const trip = await Trip.findById(tripId).populate("driver")
      if (!trip) {
        return res.status(404).json({ message: "Trajet non trouvé" })
      }
  
      if (trip.status !== "active") {
        return res.status(400).json({ message: "Ce trajet n'est plus disponible" })
      }
  
      
      if (trip.driver._id.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: "Vous ne pouvez pas demander votre propre trajet" })
      }
  
     
      if (requestData.cargo.weight > trip.availableCapacity.weight) {
        return res.status(400).json({
          message: "Le poids de votre colis dépasse la capacité disponible",
        })
      }
  
     
      if (!trip.acceptedCargoTypes.includes(requestData.cargo.type)) {
        return res.status(400).json({
          message: "Ce type de cargaison n'est pas accepté pour ce trajet",
        })
      }
  
  
      const existingRequest = await Request.findOne({
        sender: req.user._id,
        trip: tripId,
        status: { $in: ["pending", "accepted"] },
      })
  
      if (existingRequest) {
        return res.status(400).json({
          message: "Vous avez déjà une demande en cours pour ce trajet",
        })
      }
  
     
      const request = new Request({
        ...requestData,
        sender: req.user._id,
        trip: tripId,
      })
  
      await request.save()
  
      
      trip.requests.push(request._id)
      await trip.save()
  
     
      await request.populate([
        { path: "sender", select: "firstName lastName avatar" },
        { path: "trip", select: "departure destination departureDate driver" },
      ])
  
      
      const chat = new Chat({
        request: request._id,
        participants: [req.user._id, trip.driver._id],
        messages: [],
        isActive: true,
      })
      await chat.save()
  
      
      try {
        await sendNotificationEmail(
          trip.driver.email,
          "Nouvelle demande de transport",
          `Vous avez reçu une nouvelle demande de transport de ${req.user.firstName} ${req.user.lastName}.`,
        )
      } catch (emailError) {
        console.error("Erreur envoi email:", emailError)
      }
  
      // Notification en temps réel via Socket.IO
      const io = req.app.get("io")
      io.to(`user_${trip.driver._id}`).emit("new_request", {
        request: {
          id: request._id,
          sender: {
            name: `${req.user.firstName} ${req.user.lastName}`,
            avatar: req.user.avatar,
          },
          cargo: request.cargo,
          trip: {
            departure: trip.departure.city,
            destination: trip.destination.city,
          },
        },
      })
  
      res.status(201).json({
        message: "Demande créée avec succès",
        request,
      })
    } catch (error) {
      console.error("Erreur création demande:", error)
      res.status(500).json({ message: "Erreur lors de la création de la demande" })
    }
  }
