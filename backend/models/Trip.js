import mongoose  from "mongoose";


const tripSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    departure: {
      address: {
        type: String,
        required: [true, "L'adresse de départ est requise"],
      },
      city: {
        type: String,
        required: [true, "La ville de départ est requise"],
      },
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    destination: {
      address: {
        type: String,
        required: [true, "L'adresse de destination est requise"],
      },
      city: {
        type: String,
        required: [true, "La ville de destination est requise"],
      },
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    intermediateStops: [
      {
        address: String,
        city: String,
        coordinates: {
          lat: Number,
          lng: Number,
        },
      },
    ],
    departureDate: {
      type: Date,
      required: [true, "La date de départ est requise"],
    },
    arrivalDate: {
      type: Date,
      required: [true, "La date d'arrivée est requise"],
    },
    availableCapacity: {
      weight: {
        type: Number,
        required: [true, "La capacité de poids est requise"],
        min: [1, "La capacité doit être supérieure à 0"],
      },
      dimensions: {
        length: Number,
        width: Number,
        height: Number,
      },
    },
    acceptedCargoTypes: [
      {
        type: String,
        enum: ["fragile", "liquide", "dangereux", "alimentaire", "electronique", "textile", "mobilier", "autre"],
      },
    ],
    pricePerKg: {
      type: Number,
      required: [true, "Le prix par kg est requis"],
      min: [0, "Le prix ne peut pas être négatif"],
    },
    description: {
      type: String,
      maxlength: [500, "La description ne peut pas dépasser 500 caractères"],
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    requests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Request",
      },
    ],
    acceptedRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Request",
      },
    ],
    totalEarnings: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)


tripSchema.pre("save", function (next) {
  if (this.departureDate <= new Date()) {
    return next(new Error("La date de départ doit être dans le futur"))
  }
  if (this.arrivalDate <= this.departureDate) {
    return next(new Error("La date d'arrivée doit être après la date de départ"))
  }
  next()
})

const Trip = mongoose.model("Trip" , tripSchema);
export default Trip