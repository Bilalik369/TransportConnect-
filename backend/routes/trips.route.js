import express from "express"
import { getTrips, getMyTrips, getTripById } from "../controllers/trips.controller.js"

const router = express.Router();

router.get("/", getTrips);
router.get("/my-trips" , getMyTrips)
router.get("/:id",  getTripById)

export default router;
