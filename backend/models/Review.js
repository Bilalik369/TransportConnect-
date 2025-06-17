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


  reviewSchema.index({ reviewer: 1, reviewee: 1, request: 1 }, { unique: true })
reviewSchema.index({ reviewee: 1 })
reviewSchema.index({ rating: 1 })

// Middleware pour mettre à jour les statistiques de l'utilisateur évalué
reviewSchema.post("save", async function () {
  try {
    const User = mongoose.model("User")
    const reviews = await mongoose.model("Review").find({ reviewee: this.reviewee })

    const totalRatings = reviews.length
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalRatings

    await User.findByIdAndUpdate(this.reviewee, {
      "stats.totalRatings": totalRatings,
      "stats.averageRating": Math.round(averageRating * 10) / 10,
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour des statistiques:", error)
  }
})


  const Review = mongoose.model("Review" , reviewSchema);
  export default Review