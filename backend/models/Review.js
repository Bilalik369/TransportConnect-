import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
      reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      reviewee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      request: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Request",
        required: true,
      },
      rating: {
        type: Number,
        required: [true, "La note est requise"],
        min: [1, "La note minimum est 1"],
        max: [5, "La note maximum est 5"],
      },
      comment: {
        type: String,
        maxlength: [300, "Le commentaire ne peut pas dépasser 300 caractères"],
      },
      criteria: {
        punctuality: {
          type: Number,
          min: 1,
          max: 5,
        },
        communication: {
          type: Number,
          min: 1,
          max: 5,
        },
        cargoHandling: {
          type: Number,
          min: 1,
          max: 5,
        },
        professionalism: {
          type: Number,
          min: 1,
          max: 5,
        },
      },
    },
    {
      timestamps: true,
    },
  )


  const Review = mongoose.model("Review" , reviewSchema);
  export default Review