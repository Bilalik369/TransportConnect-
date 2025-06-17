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

