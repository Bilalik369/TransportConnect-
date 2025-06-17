import mongoose from "mongoose"

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: [true, "Le contenu du message est requis"],
    maxlength: [1000, "Le message ne peut pas dépasser 1000 caractères"],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  read: {
    type: Boolean,
    default: false,
  },
})

const chatSchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Request",
      required: true,
      unique: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    messages: [messageSchema],
    lastMessage: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

// Index pour les performances
// chatSchema.index({ request: 1 })
// chatSchema.index({ participants: 1 })
// chatSchema.index({ lastMessage: -1 })


const Chat = mongoose.model("Chat" , chatSchema);
export default Chat;