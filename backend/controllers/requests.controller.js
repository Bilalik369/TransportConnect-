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
  