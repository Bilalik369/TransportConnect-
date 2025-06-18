import { io } from "socket.io-client"

const socket = io("http://localhost:3000", {
  auth: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", 
  },
})

socket.on("connect", () => {
  console.log(" Connecté au serveur Socket.IO")
})

socket.on("connect_error", (err) => {
  console.error(" Erreur de connexion:", err.message)
})

socket.on("error", (err) => {
  console.log(" Erreur event:", err)
})

socket.on("chats_joined", (data) => {
  console.log(" Chats rejoints:", data)
})


socket.emit("join_chats")
