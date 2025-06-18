import Request from "../models/Request.js";
import User from "../models/User.js";
import Chat from "../models/Chat.js";
import Trip from "../models/Trip.js";
import {sendNotificationEmail} from "../utils/emailService.js"




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

    if (!trip.driver) {
      return res.status(400).json({ message: "Le conducteur du trajet est introuvable" })
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

export const acceptRequest = async (req, res) => {
    try {
      const { message } = req.body
  
      const request = await Request.findById(req.params.id).populate("sender").populate("trip")
  
      if (!request) {
        return res.status(404).json({ message: "Demande non trouvée" })
      }
  
      
      if (request.trip.driver.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Non autorisé à accepter cette demande" })
      }
  
      if (request.status !== "pending") {
        return res.status(400).json({ message: "Cette demande ne peut plus être acceptée" })
      }
  
    
      if (request.cargo.weight > request.trip.availableCapacity.weight) {
        return res.status(400).json({
          message: "Capacité insuffisante pour accepter cette demande",
        })
      }
  
      
      request.status = "accepted"
      request.driverResponse = {
        message: message || "Demande acceptée",
        respondedAt: new Date(),
      }
      await request.save()
  
      
      const trip = await Trip.findById(request.trip._id)
      trip.acceptedRequests.push(request._id)
      trip.availableCapacity.weight -= request.cargo.weight
      await trip.save()
  
     
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { "stats.totalRequests": 1 },
      })
  
      try {
        await sendNotificationEmail(
          request.sender.email,
          "Demande acceptée",
          `Votre demande de transport a été acceptée par ${req.user.firstName} ${req.user.lastName}.`,
        )
      } catch (emailError) {
        console.error("Erreur envoi email:", emailError)
      }
  
      
      const io = req.app.get("io")
      io.to(`user_${request.sender._id}`).emit("request_accepted", {
        requestId: request._id,
        driver: {
          name: `${req.user.firstName} ${req.user.lastName}`,
          avatar: req.user.avatar,
        },
        message: request.driverResponse.message,
      })
  
      res.json({
        message: "Demande acceptée avec succès",
        request,
      })
    } catch (error) {
      console.error("Erreur acceptation demande:", error)
      res.status(500).json({ message: "Erreur lors de l'acceptation de la demande" })
    }
  }

  export const rejectRequest = async (req, res) => {
    try {
      const { message } = req.body
  
      const request = await Request.findById(req.params.id).populate("sender").populate("trip")
  
      if (!request) {
        return res.status(404).json({ message: "Demande non trouvée" })
      }
  
      if (request.trip.driver.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Non autorisé à refuser cette demande" })
      }
  
      if (request.status !== "pending") {
        return res.status(400).json({ message: "Cette demande ne peut plus être refusée" })
      }
  
      request.status = "rejected"
      request.driverResponse = {
        message: message || "Demande refusée",
        respondedAt: new Date(),
      }
      await request.save()
  
      
      try {
        await sendNotificationEmail(
          request.sender.email,
          "Demande refusée",
          `Votre demande de transport a été refusée par ${req.user.firstName} ${req.user.lastName}.`,
        )
      } catch (emailError) {
        console.error("Erreur envoi email:", emailError)
      }
  
      const io = req.app.get("io")
      io.to(`user_${request.sender._id}`).emit("request_rejected", {
        requestId: request._id,
        driver: {
          name: `${req.user.firstName} ${req.user.lastName}`,
        },
        message: request.driverResponse.message,
      })
  
      res.json({
        message: "Demande refusée",
        request,
      })
    } catch (error) {
      console.error("Erreur refus demande:", error)
      res.status(500).json({ message: "Erreur lors du refus de la demande" })
    }
  }

  export const cancelRequest = async (req, res) => {
    try {
      const request = await Request.findById(req.params.id).populate("trip")
  
      if (!request) {
        return res.status(404).json({ message: "Demande non trouvée" })
      }
  
      if (request.sender.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Non autorisé à annuler cette demande" })
      }
  
      if (!["pending", "accepted"].includes(request.status)) {
        return res.status(400).json({ message: "Cette demande ne peut plus être annulée" })
      }
  
      const oldStatus = request.status
      request.status = "cancelled"
      await request.save()
  
   
      if (oldStatus === "accepted") {
        await Trip.findByIdAndUpdate(request.trip._id, {
          $pull: { acceptedRequests: request._id },
          $inc: { "availableCapacity.weight": request.cargo.weight },
        })
      }
  
      res.json({
        message: "Demande annulée avec succès",
        request,
      })
    } catch (error) {
      console.error("Erreur annulation demande:", error)
      res.status(500).json({ message: "Erreur lors de l'annulation de la demande" })
    }
  }
  export const confirmPickup = async (req, res) => {
    try {
      const request = await Request.findById(req.params.id).populate("trip")
  
      if (!request) {
        return res.status(404).json({ message: "Demande non trouvée" })
      }
  
      if (request.trip.driver.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Non autorisé" })
      }
  
      if (request.status !== "accepted") {
        return res.status(400).json({ message: "La demande doit être acceptée pour confirmer la collecte" })
      }
  
      request.status = "in_transit"
      request.tracking.pickupConfirmed = {
        confirmed: true,
        confirmedAt: new Date(),
        confirmedBy: req.user._id,
      }
      request.tracking.inTransit = {
        confirmed: true,
        confirmedAt: new Date(),
      }
      await request.save()
  
      res.json({
        message: "Collecte confirmée avec succès",
        request,
      })
    } catch (error) {
      console.error("Erreur confirmation collecte:", error)
      res.status(500).json({ message: "Erreur lors de la confirmation de collecte" })
    }
  }
  
  
  export const confirmDelivery = async (req, res) => {
    try {
      const { signature } = req.body
      const request = await Request.findById(req.params.id).populate("trip").populate("sender")
  
      if (!request) {
        return res.status(404).json({ message: "Demande non trouvée" })
      }
  
      const isDriver = request.trip.driver.toString() === req.user._id.toString()
      const isSender = request.sender._id.toString() === req.user._id.toString()
  
      if (!isDriver && !isSender) {
        return res.status(403).json({ message: "Non autorisé" })
      }
  
      if (request.status !== "in_transit") {
        return res.status(400).json({ message: "Le colis doit être en transit pour confirmer la livraison" })
      }
  
      request.status = "delivered"
      request.tracking.delivered = {
        confirmed: true,
        confirmedAt: new Date(),
        confirmedBy: req.user._id,
        signature: signature || null,
      }
      await request.save()
  
      
      if (isDriver) {
        await Trip.findByIdAndUpdate(request.trip._id, {
          $inc: { totalEarnings: request.price },
        })
      }
  
      res.json({
        message: "Livraison confirmée avec succès",
        request,
      })
    } catch (error) {
      console.error("Erreur confirmation livraison:", error)
      res.status(500).json({ message: "Erreur lors de la confirmation de livraison" })
    }
  }
  


