import express from "express";
import {
  getDashboardStats,
  getUsers,
  getUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
  getTrips,
  getRequests,
  getReports,
} from "../controllers/admin.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { body } from "express-validator";
import { validateRequest } from "../middleware/validation.js";

const router = express.Router();


const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Accès refusé - Admin requis" });
  }
  next();
};


router.use(authenticateToken);
router.use(requireAdmin);


router.get("/dashboard", getDashboardStats);


router.get("/users", getUsers);
router.get("/users/:id", getUser);

router.put(
  "/users/:id",
  [
    body("firstName")
      .optional()
      .isLength({ min: 2 })
      .withMessage("Prénom requis (min 2 caractères)"),
    body("lastName")
      .optional()
      .isLength({ min: 2 })
      .withMessage("Nom requis (min 2 caractères)"),
    body("email").optional().isEmail().withMessage("Email invalide"),
    body("phone")
      .optional()
      .matches(/^[0-9+\-\s()]+$/)
      .withMessage("Téléphone invalide"),
    body("role")
      .optional()
      .isIn(["conducteur", "expediteur", "admin"])
      .withMessage("Rôle invalide"),
    body("isVerified")
      .optional()
      .isBoolean()
      .withMessage("Statut de vérification invalide"),
    body("isActive")
      .optional()
      .isBoolean()
      .withMessage("Statut d'activité invalide"),
  ],
  validateRequest,
  updateUser,
);

router.patch("/users/:id/status", toggleUserStatus);
router.delete("/users/:id", deleteUser);

router.get("/trips", getTrips);


router.get("/requests", getRequests);

router.get("/reports", getReports);

export default router;
