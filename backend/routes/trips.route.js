import express from "express"
import { getTrips } from "../controllers/trips.controller.js"

const route = express.Router();

route.get("/", getTrips);

export default route;
