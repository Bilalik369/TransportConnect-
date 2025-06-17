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
