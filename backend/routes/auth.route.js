import express from "express"
import { register , login , getMyProfile} from "../controllers/auth.controller.js"
import {authenticateToken} from "../middleware/auth.middleware.js"
import {validateRegister , validateLogin} from "../middleware/validation.js"

const router = express.Router()

router.post("/register",validateRegister, register);
router.post("/login" ,validateLogin, login)
router.get("/me" ,authenticateToken, getMyProfile);

export default router
