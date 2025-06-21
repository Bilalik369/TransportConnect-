  import Trip from "../models/Trip.js";
  import User from "../models/User.js";
  import Request from "../models/Request.js";




  export const getTrips = async (req, res) => {
    try {
      const {
        departure,
        destination,
        date,
        cargoType,
        maxWeight,
        minCapacity,
        page = 1,
        limit = 10,
        sortBy = "departureDate",
      } = req.query

      const filter = { status: "active" }

      if (departure) {
        filter["departure.city"] = { $regex: departure, $options: "i" }
      }

      if (destination) {
        filter["destination.city"] = { $regex: destination, $options: "i" }
      }

      if (date) {
        const searchDate = new Date(date)
        const nextDay = new Date(searchDate)
        nextDay.setDate(nextDay.getDate() + 1)
        filter.departureDate = { $gte: searchDate, $lt: nextDay }
      }

      if (cargoType) {
        filter.acceptedCargoTypes = { $in: [cargoType] }
      }

      if (maxWeight || minCapacity) {
        filter["availableCapacity.weight"] = {}
        if (maxWeight) filter["availableCapacity.weight"].$lte = parseFloat(maxWeight)
        if (minCapacity) filter["availableCapacity.weight"].$gte = parseFloat(minCapacity)
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { [sortBy]: 1 },
        populate: {
          path: "driver",
          select: "firstName lastName avatar stats isVerified",
        },
      }

      const trips = await Trip.paginate(filter, options)

      res.json({
        trips: trips.docs,
        pagination: {
          currentPage: trips.page,
          totalPages: trips.totalPages,
          totalTrips: trips.totalDocs,
          hasNext: trips.hasNextPage,
          hasPrev: trips.hasPrevPage,
        },
      })
    } catch (error) {
      console.error("Erreur récupération trajets:", error)
      res.status(500).json({ message: "Erreur lors de la récupération des trajets" })
    }
  }

  export const getMyTrips = async (req, res) => {
    try {
      const { status, page = 1, limit = 10 } = req.query

      const filter = { driver: req.user._id }
      if (status) filter.status = status

      const trips = await Trip.find(filter)
        .populate("requests", "sender cargo status createdAt")
        .populate("acceptedRequests", "sender cargo pickup delivery status")
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)

      const total = await Trip.countDocuments(filter)

      res.json({
        trips,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalTrips: total,
        },
      })
    } catch (error) {
      console.error("Erreur récupération mes trajets:", error)
      res.status(500).json({ message: "Erreur lors de la récupération de vos trajets" })
    }
  }

  export const getTripById = async (req, res) => {
    try {
      const trip = await Trip.findById(req.params.id)
        .populate("driver", "firstName lastName avatar stats isVerified phone")
        .populate({
          path: "requests",
          populate: {
            path: "sender",
            select: "firstName lastName avatar stats",
          },
        })

      if (!trip) return res.status(404).json({ message: "Trajet non trouvé" })

      res.json({ trip })
    } catch (error) {
      console.error("Erreur récupération trajet:", error)
      res.status(500).json({ message: "Erreur lors de la récupération du trajet" })
    }
  }

  export const createTrip = async (req, res) => {
    try {
      const tripData = {
        ...req.body,
        driver: req.user._id,
      }

      const trip = new Trip(tripData)
      await trip.save()
      await trip.populate("driver", "firstName lastName avatar stats")

      res.status(201).json({ message: "Trajet créé avec succès", trip })
    } catch (error) {
      console.error("Erreur création trajet:", error)
      res.status(500).json({ message: "Erreur lors de la création du trajet" })
    }
  }

  export const updateTrip = async (req, res) => {
    try {
      const trip = await Trip.findById(req.params.id)
      if (!trip) return res.status(404).json({ message: "Trajet non trouvé" })
      if (trip.driver.toString() !== req.user._id.toString())
        return res.status(403).json({ message: "Non autorisé à modifier ce trajet" })
      if (trip.acceptedRequests.length > 0)
        return res.status(400).json({ message: "Impossible de modifier un trajet avec des demandes acceptées" })

      Object.assign(trip, req.body)
      await trip.save()
      await trip.populate("driver", "firstName lastName avatar stats")

      res.json({ message: "Trajet modifié avec succès", trip })
    } catch (error) {
      console.error("Erreur modification trajet:", error)
      res.status(500).json({ message: "Erreur lors de la modification du trajet" })
    }
  }

  export const deleteTrip = async (req, res) => {
    try {
      const trip = await Trip.findById(req.params.id)
      if (!trip) return res.status(404).json({ message: "Trajet non trouvé" })
      if (trip.driver.toString() !== req.user._id.toString())
        return res.status(403).json({ message: "Non autorisé à supprimer ce trajet" })

      const activeRequests = await Request.find({
        trip: trip._id,
        status: { $in: ["accepted", "in_transit"] },
      })

      if (activeRequests.length > 0)
        return res.status(400).json({ message: "Impossible de supprimer un trajet avec des demandes en cours" })

      trip.status = "cancelled"
      await trip.save()
      await Request.updateMany({ trip: trip._id, status: "pending" }, { status: "cancelled" })

      res.json({ message: "Trajet annulé avec succès" })
    } catch (error) {
      console.error("Erreur suppression trajet:", error)
      res.status(500).json({ message: "Erreur lors de la suppression du trajet" })
    }
  }

  export const completeTrip = async (req, res) => {
    try {
      const trip = await Trip.findById(req.params.id)
      if (!trip) return res.status(404).json({ message: "Trajet non trouvé" })
      if (trip.driver.toString() !== req.user._id.toString())
        return res.status(403).json({ message: "Non autorisé" })
      if (trip.status !== "active")
        return res.status(400).json({ message: "Ce trajet ne peut pas être terminé" })

      trip.status = "completed"
      await trip.save()

      await User.findByIdAndUpdate(req.user._id, {
        $inc: { "stats.totalTrips": 1 },
      })

      res.json({ message: "Trajet terminé avec succès", trip })
    } catch (error) {
      console.error("Erreur finalisation trajet:", error)
      res.status(500).json({ message: "Erreur lors de la finalisation du trajet" })
    }
  }
