import User from "../models/User.js";
import Trip from "../models/Trip.js";
import Request from "../models/Request.js";
import Chat from "../models/Chat.js";
import Review from "../models/Review.js";
import mongoose from "mongoose";

export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalTrips,
      totalRequests,
      totalChats,
      totalReviews,
      activeUsers,
      recentUsers,
      recentTrips,
      recentRequests,
    ] = await Promise.all([
      User.countDocuments(),
      Trip.countDocuments(),
      Request.countDocuments(),
      Chat.countDocuments(),
      Review.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select("firstName lastName email role createdAt"),
      Trip.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("driver", "firstName lastName")
        .select("departureCity destinationCity departureDate createdAt"),
      Request.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("sender", "firstName lastName")
        .select("departureCity destinationCity status createdAt"),
    ]);

   
    const usersByRole = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

   
    const requestsByStatus = await Request.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

 
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRegistrations = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json({
      stats: {
        totalUsers,
        totalTrips,
        totalRequests,
        totalChats,
        totalReviews,
        activeUsers,
      },
      charts: {
        usersByRole,
        requestsByStatus,
        monthlyRegistrations,
      },
      recent: {
        users: recentUsers,
        trips: recentTrips,
        requests: recentRequests,
      },
    });
  } catch (error) {
    console.error("Erreur dashboard admin:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const role = req.query.role || "";
    const status = req.query.status || "";


    const filter = {};
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (role) filter.role = role;
    if (status === "active") filter.isActive = true;
    if (status === "inactive") filter.isActive = false;

    const options = {
      page,
      limit,
      sort: { createdAt: -1 },
      select: "-password",
    };

    const users = await User.paginate(filter, options);
    res.json(users);
  } catch (error) {
    console.error("Erreur récupération utilisateurs:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    
    const [trips, requests, reviews] = await Promise.all([
      Trip.countDocuments({ driver: id }),
      Request.countDocuments({ sender: id }),
      Review.countDocuments({ reviewee: id }),
    ]);

    res.json({
      user,
      stats: { trips, requests, reviews },
    });
  } catch (error) {
    console.error("Erreur récupération utilisateur:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    
    delete updates.password;
    delete updates._id;

    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.json({ user, message: "Utilisateur mis à jour avec succès" });
  } catch (error) {
    console.error("Erreur mise à jour utilisateur:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      user: { ...user.toObject(), password: undefined },
      message: `Utilisateur ${user.isActive ? "activé" : "désactivé"} avec succès`,
    });
  } catch (error) {
    console.error("Erreur changement statut utilisateur:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

   
    if (id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "Vous ne pouvez pas supprimer votre propre compte" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

 
    const [activeTrips, activeRequests] = await Promise.all([
      Trip.countDocuments({
        driver: id,
        status: { $in: ["active", "in_transit"] },
      }),
      Request.countDocuments({
        sender: id,
        status: { $in: ["pending", "accepted", "in_transit"] },
      }),
    ]);

    if (activeTrips > 0 || activeRequests > 0) {
      return res.status(400).json({
        message:
          "Impossible de supprimer un utilisateur avec des trajets ou demandes actifs",
      });
    }

    await User.findByIdAndDelete(id);
    res.json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    console.error("Erreur suppression utilisateur:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


export const getTrips = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || "";
    const driverId = req.query.driverId || "";

    const filter = {};
    if (status) filter.status = status;
    if (driverId) filter.driver = driverId;

    const options = {
      page,
      limit,
      sort: { createdAt: -1 },
      populate: {
        path: "driver",
        select: "firstName lastName email",
      },
    };

    const trips = await Trip.paginate(filter, options);
    res.json(trips);
  } catch (error) {
    console.error("Erreur récupération trajets:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


export const getRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || "";
    const senderId = req.query.senderId || "";

    const filter = {};
    if (status) filter.status = status;
    if (senderId) filter.sender = senderId;

    const options = {
      page,
      limit,
      sort: { createdAt: -1 },
      populate: [
        { path: "sender", select: "firstName lastName email" },
        {
          path: "trip",
          populate: { path: "driver", select: "firstName lastName" },
        },
      ],
    };

    const requests = await Request.paginate(filter, options);
    res.json(requests);
  } catch (error) {
    console.error("Erreur récupération demandes:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


export const getReports = async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;

    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    let report = {};

    switch (type) {
      case "users":
        report = await generateUsersReport(start, end);
        break;
      case "trips":
        report = await generateTripsReport(start, end);
        break;
      case "requests":
        report = await generateRequestsReport(start, end);
        break;
      case "revenue":
        report = await generateRevenueReport(start, end);
        break;
      default:
        return res.status(400).json({ message: "Type de rapport invalide" });
    }

    res.json(report);
  } catch (error) {
    console.error("Erreur génération rapport:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


const generateUsersReport = async (start, end) => {
  const registrations = await User.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          role: "$role",
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.date": 1 } },
  ]);

  return {
    title: "Rapport des inscriptions",
    period: { start, end },
    data: registrations,
  };
};

const generateTripsReport = async (start, end) => {
  const trips = await Trip.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          status: "$status",
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.date": 1 } },
  ]);

  return {
    title: "Rapport des trajets",
    period: { start, end },
    data: trips,
  };
};

const generateRequestsReport = async (start, end) => {
  const requests = await Request.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          status: "$status",
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.date": 1 } },
  ]);

  return {
    title: "Rapport des demandes",
    period: { start, end },
    data: requests,
  };
};

const generateRevenueReport = async (start, end) => {

  return {
    title: "Rapport des revenus",
    period: { start, end },
    data: [],
    message: "Fonctionnalité à implémenter avec le système de paiement",
  };
};
