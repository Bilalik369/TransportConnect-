import express from "express"
import { getTrips, getMyTrips, getTripById, createTrip, updateTrip } from "../controllers/trips.controller.js"

const router = express.Router();

router.get("/", getTrips);
router.get("/my-trips" , getMyTrips)
router.get("/:id",  getTripById)
router.post("/",  createTrip)
router.put("/:id",  updateTrip)

export default router;
