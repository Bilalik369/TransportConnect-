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