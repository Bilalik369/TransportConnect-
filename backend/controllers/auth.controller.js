import User from "../models/User.js"
import jwt from 'jsonwebtoken';


const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  })
}

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, role, vehicleInfo } = req.body

   
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "Cet email est déjà utilisé" })
    }

   
    const userData = {
      firstName,
      lastName,
      email,
      phone,
      password,
      role,
    }

    if (role === "conducteur" && vehicleInfo) {
      userData.vehicleInfo = vehicleInfo
    }

    const user = new User(userData)
    await user.save()

 
    const token = generateToken(user._id)

    res.status(201).json({
      message: "Inscription réussie",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    })
  } catch (error) {
    console.error("Erreur inscription:", error)
    res.status(500).json({ message: "Erreur lors de l'inscription" })
  }
}
 
