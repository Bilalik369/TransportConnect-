import express from "express"
import { register , login , getMyProfile} from "../controllers/auth.controller.js"
import {authenticateToken} from "../middleware/auth.middleware.js"

const router = express.Router()

router.post("/register", register);
router.post("/login" , login)
router.get("/me" ,authenticateToken, getMyProfile);
export default router
