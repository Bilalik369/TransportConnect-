import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
    {
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      trip: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trip",
        required: true,
      },
      cargo: {
        description: {
          type: String,
          required: [true, "La description du colis est requise"],
          maxlength: [300, "La description ne peut pas dépasser 300 caractères"],
        },
        weight: {
          type: Number,
          required: [true, "Le poids est requis"],
          min: [0.1, "Le poids doit être supérieur à 0"],
        },
        dimensions: {
          length: {
            type: Number,
            required: [true, "La longueur est requise"],
          },
          width: {
            type: Number,
            required: [true, "La largeur est requise"],
          },
          height: {
            type: Number,
            required: [true, "La hauteur est requise"],
          },
        },
        type: {
          type: String,
          required: [true, "Le type de colis est requis"],
          enum: ["fragile", "liquide", "dangereux", "alimentaire", "electronique", "textile", "mobilier", "autre"],
        },
        value: {
          type: Number,
          min: [0, "La valeur ne peut pas être négative"],
        },
      },
      pickup: {
        address: {
          type: String,
          required: [true, "L'adresse de collecte est requise"],
        },
        city: {
          type: String,
          required: [true, "La ville de collecte est requise"],
        },
        contactPerson: {
          name: String,
          phone: String,
        },
        availableFrom: Date,
        availableUntil: Date,
      },
      delivery: {
        address: {
          type: String,
          required: [true, "L'adresse de livraison est requise"],
        },
        city: {
          type: String,
          required: [true, "La ville de livraison est requise"],
        },
        contactPerson: {
          name: String,
          phone: String,
        },
        preferredDate: Date,
      },
      status: {
        type: String,
        enum: ["pending", "accepted", "rejected", "in_transit", "delivered", "cancelled"],
        default: "pending",
      },
      price: {
        type: Number,
        min: [0, "Le prix ne peut pas être négatif"],
      },
      message: {
        type: String,
        maxlength: [200, "Le message ne peut pas dépasser 200 caractères"],
      },
      driverResponse: {
        message: String,
        respondedAt: Date,
      },
      tracking: {
        pickupConfirmed: {
          confirmed: { type: Boolean, default: false },
          confirmedAt: Date,
          confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        },
        inTransit: {
          confirmed: { type: Boolean, default: false },
          confirmedAt: Date,
        },
        delivered: {
          confirmed: { type: Boolean, default: false },
          confirmedAt: Date,
          confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          signature: String,
        },
      },
    },
    {
      timestamps: true,
    },
  )
 
  requestSchema.pre("save", async function (next) {
    if (this.isNew && !this.price) {
      try {
        const Trip = mongoose.model("Trip")
        const trip = await Trip.findById(this.trip)
        if (trip) {
          this.price = this.cargo.weight * trip.pricePerKg
        }
      } catch (error) {
        return next(error)
      }
    }
    next()
  })

  const Request =mongoose.model("Request" , requestSchema);
  export default Request