import express from "express"
import {getUserRequests , getReceivedRequests , getRequestById} from "../controllers/requests.controller.js"
import {authorizeRoles} from "../middleware/auth.middleware.js";
import {validateRequest , validateObjectId } from "../middleware/validation.js"




const router = express.Router();


router.get("/", getUserRequests)
router.get("/received", authorizeRoles("conducteur"), getReceivedRequests)
router.get("/:id", validateObjectId("id"), getRequestById)


export default router