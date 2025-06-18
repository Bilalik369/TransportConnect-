import Chat from "../models/Chat.js"
import User from "../models/User.js"
import jwt from "jsonwebtoken"

const chatHandler = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token
      if (!token) {
        return next(new Error("Token manquant"))
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.userId).select("-password")

      if (!user || !user.isActive) {
        return next(new Error("Utilisateur non autorisé"))
      }

      socket.userId = user._id.toString()
      socket.user = user
      next()
    } catch (error) {
      next(new Error("Authentification échouée"))
    }
  })

  io.on("connection", (socket) => {
    console.log(`Utilisateur connecté: ${socket.user.firstName} ${socket.user.lastName}`)

    socket.on("join_chats", async () => {
      try {
        const chats = await Chat.find({
          participants: socket.userId,
          isActive: true,
        }).select("_id request")

        chats.forEach((chat) => {
          socket.join(`chat_${chat._id}`)
        })

        socket.emit("chats_joined", { count: chats.length })
      } catch (error) {
        socket.emit("error", { message: "Erreur lors de la connexion aux chats" })
      }
    })

    socket.on("join_chat", async (data) => {
      try {
        const { requestId } = data

        const chat = await Chat.findOne({
          request: requestId,
          participants: socket.userId,
        })

        if (!chat) {
          return socket.emit("error", { message: "Chat non trouvé ou accès refusé" })
        }

        socket.join(`chat_${chat._id}`)

        await Chat.updateOne(
          { _id: chat._id },
          {
            $set: {
              "messages.$[elem].read": true,
            },
          },
          {
            arrayFilters: [{ "elem.sender": { $ne: socket.userId }, "elem.read": false }],
          },
        )

        socket.emit("chat_joined", { chatId: chat._id })
      } catch (error) {
        socket.emit("error", { message: "Erreur lors de la connexion au chat" })
      }
    })

    socket.on("send_message", async (data) => {
      try {
        const { requestId, content } = data

        if (!content || content.trim().length === 0) {
          return socket.emit("error", { message: "Le message ne peut pas être vide" })
        }

        if (content.length > 1000) {
          return socket.emit("error", { message: "Le message est trop long" })
        }

        const chat = await Chat.findOne({
          request: requestId,
          participants: socket.userId,
        })

        if (!chat) {
          return socket.emit("error", { message: "Chat non trouvé ou accès refusé" })
        }

        const newMessage = {
          sender: socket.userId,
          content: content.trim(),
          timestamp: new Date(),
          read: false,
        }

        chat.messages.push(newMessage)
        chat.lastMessage = new Date()
        await chat.save()

        await chat.populate("messages.sender", "firstName lastName avatar")
        const populatedMessage = chat.messages[chat.messages.length - 1]

        io.to(`chat_${chat._id}`).emit("new_message", {
          chatId: chat._id,
          message: populatedMessage,
        })

        const otherParticipants = chat.participants.filter((p) => p.toString() !== socket.userId)

        otherParticipants.forEach((participantId) => {
          io.to(`user_${participantId}`).emit("message_notification", {
            chatId: chat._id,
            requestId: chat.request,
            sender: {
              id: socket.userId,
              name: `${socket.user.firstName} ${socket.user.lastName}`,
            },
            preview: content.substring(0, 50) + (content.length > 50 ? "..." : ""),
          })
        })
      } catch (error) {
        console.error("Erreur envoi message:", error)
        socket.emit("error", { message: "Erreur lors de l'envoi du message" })
      }
    })

    socket.on("mark_as_read", async (data) => {
      try {
        const { chatId } = data

        await Chat.updateOne(
          { _id: chatId, participants: socket.userId },
          {
            $set: {
              "messages.$[elem].read": true,
            },
          },
          {
            arrayFilters: [{ "elem.sender": { $ne: socket.userId }, "elem.read": false }],
          },
        )

        socket.emit("messages_marked_read", { chatId })
      } catch (error) {
        socket.emit("error", { message: "Erreur lors du marquage des messages" })
      }
    })

    socket.on("typing", (data) => {
      const { chatId } = data
      socket.to(`chat_${chatId}`).emit("user_typing", {
        userId: socket.userId,
        userName: `${socket.user.firstName} ${socket.user.lastName}`,
      })
    })

    socket.on("stop_typing", (data) => {
      const { chatId } = data
      socket.to(`chat_${chatId}`).emit("user_stop_typing", {
        userId: socket.userId,
      })
    })

    socket.join(`user_${socket.userId}`)

    socket.on("disconnect", () => {
      console.log(`Utilisateur déconnecté: ${socket.user.firstName} ${socket.user.lastName}`)
    })
  })
}

export default chatHandler
