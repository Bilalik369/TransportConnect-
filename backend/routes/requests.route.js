import express from "express"
import {getUserRequests , getReceivedRequests} from "../controllers/requests.controller.js"
import {authorizeRoles} from "../middleware/auth.middleware.js";




const router = express.Router();


router.get("/", getUserRequests)
router.get("/received", authorizeRoles("conducteur"), getReceivedRequests)


export default router