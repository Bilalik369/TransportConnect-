import express from "express"
import dotenv from "dotenv"
import { connectDB } from "./lib/db.js"
import authRoutes from "./routes/auth.route.js"
import tripsRoutes from "./routes/trips.route.js"
import http from "http"
import { Server } from "socket.io"
import chatHandler from "./socket/chatHandler.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
})


chatHandler(io)

app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/trips", tripsRoutes)


server.listen(PORT, () => {
  connectDB()
  console.log(`Serveur en marche sur le port ${PORT}`)
})
