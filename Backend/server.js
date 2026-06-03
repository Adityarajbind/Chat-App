import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { Server } from "socket.io";
import http from "http";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

dotenv.config();

connectDB();


app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API Running");
});

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/messages", messageRoutes);

io.on("connection", (socket) => {
  socket.on("join_room", ({ roomCode, username }) => {
    socket.join(roomCode);

    socket.to(roomCode).emit("member_joined", {
      message: `${username} joined the room`,
    });
  });

  socket.on("leave_room", ({ roomCode, username }) => {
    socket.to(roomCode).emit("member_left", {
      message: `${username} left the room`,
    });

    socket.leave(roomCode);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

export { io };