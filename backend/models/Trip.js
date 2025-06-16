import mongoose  from "mongoose";


const tripSchema = new mongoose.Schema({
    driver  :{
        type :mongoose.Schema.Types.ObjectId,
        ref : "User", 
        required : true,
    },
    departure : {
        address :{
            type:String,
            required : [true , "L'adresse de départ est requise"]
        },
        city : {
            type : String,
            required : [true , "La ville de départ est requise"]
        },

        coordinates: {
            lat: Number,
            lng: Number,
        },

            
    },
    destination :{
        address : {
            type : String,
            required : [true , "L'adresse de destination est requise"],
            
        },
        city : {
            type :String,
            required :[true , "La ville de destination est requise"]
        },
        coordinates: {
            lat: Number,
            lng: Number,
          },
    },

    intermediateStops : [
        {
            address : String,
            city: String,
            coordinates : {
                lat: Number,
                lng: Number,
            },
        }
    ],
    departureDate : {
        type : Date ,
        required : [true  ,"La date de départ est requise"],

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



})

const Trip = mongoose.model("Trip" , tripSchema);
export default Trip