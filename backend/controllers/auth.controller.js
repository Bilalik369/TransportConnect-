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

   
    if (!firstName || !lastName || !email || !phone || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

   
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
 
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ msg: "Email ou mot de passe incorrect" });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ msg: "Email ou mot de passe incorrect" });
    }

    if (!user.isActive) {
      return res.status(403).json({ msg: "Votre compte a été suspendu" });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id); 

    res.status(200).json({
      msg: "Connexion réussie",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        stats: user.stats,
      },
    });

  } catch (error) {
    console.error("Erreur connexion:", error);
    res.status(500).json({ msg: "Erreur lors de la connexion" });
  }
};

export const getMyProfile  = async(req , res)=>{
  try {
    const user = await User.findById(req.user._id).select("-password")
    res.json({
      user :{
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        avatar: user.avatar,
        address: user.address,
        vehicleInfo: user.vehicleInfo,
        stats: user.stats,
        lastLogin: user.lastLogin,
      }
    })

  } catch (error) {
    console.error("Erreur récupération profil:", error)
    res.status(500).json({ message: "Erreur lors de la récupération du profil" })
  }
}
