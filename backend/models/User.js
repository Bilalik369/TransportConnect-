import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"


const userSchema = new mongoose.Schema({

    
    firstName: {
        type: String,
        required: [true, "Le prénom est requis"],
        trim: true,
        maxlength: [50, "Le prénom ne peut pas dépasser 50 caractères"],
      },
      lastName: {
        type: String,
        required: [true, "Le nom est requis"],
        trim: true,
        maxlength: [50, "Le nom ne peut pas dépasser 50 caractères"],
      },
      email: {
        type: String,
        required: [true, "L'email est requis"],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Email invalide"],
        trim : true,
      },
      phone: {
        type: String,
        required: [true, "Le téléphone est requis"],
        match: [/^[0-9+\-\s()]+$/, "Numéro de téléphone invalide"],
      },
      password: {
        type: String,
        required: [true, "Le mot de passe est requis"],
        minlength: [6, "Le mot de passe doit contenir au moins 6 caractères"],
      },
      role: {
        type: String,
        enum: ["conducteur", "expediteur", "admin"],
        required: [true, "Le rôle est requis"],
      },
      isVerified: {
        type: Boolean,
        default: false,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
      avatar: {
        type: String,
        default: null,
      },
      address: {
        street: String,
        city: String,
        postalCode: String,
        country: { type: String, default: "Maroc" },
      },
      vehicleInfo: {
        type: {
          type: String,
          enum: ["camion", "camionnette", "voiture", "moto"],
        },
        capacity: Number,
        dimensions: {
          length: Number, 
          width: Number,
          height: Number,
        },
        licensePlate: String,
      },
      
      stats: {
        totalTrips: { type: Number, default: 0 },
        totalRequests: { type: Number, default: 0 },
        averageRating: { type: Number, default: 0 },
        totalRatings: { type: Number, default: 0 },
      },
      lastLogin: {
        type: Date,
        default: Date.now,
      },
    },
    {
      timestamps: true,
    },
  )


  


  //  userSchema.index({ email: 1 })
  //  userSchema.index({ role: 1 })
  //  userSchema.index({ isActive: 1 })


   userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()
  
    try {
      const salt = await bcrypt.genSalt(12)
      this.password = await bcrypt.hash(this.password, salt)
      next()
    } catch (error) {
      next(error)
    }
  })
  
  
  userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password)
  }
  
  
  userSchema.virtual("fullName").get(function () {
    return `${this.firstName} ${this.lastName}`
  })
  
  
  // userSchema.methods.toJSON = function () {
  //   const user = this.toObject()
  //   delete user.password
  //   return user
  // }

const User =    mongoose.model("User" , userSchema);
export default User ;