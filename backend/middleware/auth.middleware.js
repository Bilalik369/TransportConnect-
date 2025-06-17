    import jwt, { decode } from "jsonwebtoken"
    import User from "../models/User.js"


    export const authenticateToken = async (req, res, next) => {
        try {
        const authHeader = req.headers["authorization"]
        const token = authHeader && authHeader.split(" ")[1]
    
        if (!token) {
            return res.status(401).json({ message: "Token d'accès requis" })
        }
    
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.userId).select("-password")
    
        if (!user) {
            return res.status(401).json({ message: "Utilisateur non trouvé" })
        }
    
        if (!user.isActive) {
            return res.status(403).json({ message: "Compte suspendu" })
        }
    
        req.user = user
        next()
        } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(403).json({ message: "Token invalide" })
        }
        if (error.name === "TokenExpiredError") {
            return res.status(403).json({ message: "Token expiré" })
        }
        return res.status(500).json({ message: "Erreur serveur" })
        }
    }

    export const authorizeRoles = (...roles) => {
        return (req, res, next) => {
          if (!roles.includes(req.user.role)) {
            return res.status(403).json({
              message: "Accès refusé. Permissions insuffisantes.",
            })
          }
          next()
        }
      }

