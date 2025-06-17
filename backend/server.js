
import express from "express"
import dotenv from "dotenv"
import { connectDB } from "./lib/db.js"
import authRoutes from "./routes/auth.route.js"
import tripsRoutes from "./routes/trips.route.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/trips", tripsRoutes)

app.listen(PORT, () => {
  console.log(` Serveur en marche sur le port ${PORT}`)
  connectDB()
})
