import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import tripsRoutes from "./routes/trips.route.js";
import http from "http";
import { Server } from "socket.io";
import chatHandler from "./socket/chatHandler.js";
import requestRoutes from "./routes/requests.route.js";
import adminRoutes from "./routes/admin.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/trips", tripsRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/admin", adminRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

chatHandler(io);

server.listen(PORT, async () => {
  await connectDB();
  console.log(`Serveur en marche sur le port ${PORT}`);
});
