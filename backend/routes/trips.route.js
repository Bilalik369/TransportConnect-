import express from "express"
import { getTrips, getMyTrips } from "../controllers/trips.controller.js"

const route = express.Router();

route.get("/", getTrips);
route.get("/my-trips" , getMyTrips)

export default route;
