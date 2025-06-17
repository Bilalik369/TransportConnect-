import express from "express"
import { getTrips, getMyTrips, getTripById, createTrip } from "../controllers/trips.controller.js"

const router = express.Router();

router.get("/", getTrips);
router.get("/my-trips" , getMyTrips)
router.get("/:id",  getTripById)
router.post("/",  createTrip)

export default router;
