import express from "express"
import {
  getTrips,
  getMyTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  completeTrip,
} from "../controllers/trips.controller.js"

import {
  validateTrip,
  validateObjectId,
  validateTripSearch,
} from "../middleware/validation.js"

import {
  authenticateToken,
  authorizeRoles
} from "../middleware/auth.middleware.js"

const router = express.Router()


router.get("/", validateTripSearch, getTrips)


router.get("/my-trips", authenticateToken, authorizeRoles("conducteur"), getMyTrips)
router.get("/:id", authenticateToken, validateObjectId("id"), getTripById)
router.post("/", authenticateToken, authorizeRoles("conducteur"), validateTrip, createTrip)
router.put("/:id", authenticateToken, validateObjectId("id"), validateTrip, updateTrip)
router.delete("/:id", authenticateToken, validateObjectId("id"), deleteTrip)
router.post("/:id/complete", authenticateToken, validateObjectId("id"), completeTrip)

export default router
