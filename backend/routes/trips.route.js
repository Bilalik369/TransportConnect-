import express from "express"
import { getTrips, getMyTrips, getTripById, createTrip, updateTrip,deleteTrip, completeTrip } from "../controllers/trips.controller.js"
import {validateTrip , validateObjectId , validateTripSearch} from "../middleware/validation.js"

const router = express.Router();

router.get("/",validateTripSearch, getTrips);
router.get("/my-trips" , getMyTrips)
router.get("/:id",validateObjectId("id"),  getTripById)
router.post("/", validateTrip, createTrip)
router.put("/:id", validateObjectId("id"),validateTrip, updateTrip)
router.delete("/:id", validateObjectId("id"),deleteTrip)
router.post("/:id/complete",validateObjectId("id"), completeTrip)

export default router;
