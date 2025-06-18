import express from "express"
import {getUserRequests} from "../controllers/requests.controller.js"



const router = express.Router();


router.get("/", getUserRequests)

export default router