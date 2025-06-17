import express from "express"
import { getTrips, getMyTrips, getTripById, createTrip, updateTrip,deleteTrip, completeTrip } from "../controllers/trips.controller.js"
import {validateTrip , validateObjectId , validateTripSearch} from "../middleware/validation.js"
import {authorizeRoles} from "../middleware/auth.middleware.js"

const router = express.Router();

router.get("/",validateTripSearch, getTrips);
router.get("/my-trips", authorizeRoles("conducteur"), getMyTrips)
router.get("/:id",validateObjectId("id"),  getTripById)
router.post("/", authorizeRoles("conducteur"),validateTrip, createTrip)
router.put("/:id", validateObjectId("id"),validateTrip, updateTrip)
router.delete("/:id", validateObjectId("id"),deleteTrip)
router.post("/:id/complete",validateObjectId("id"), completeTrip)

export default router;
