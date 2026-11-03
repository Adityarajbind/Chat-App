import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { Server } from "socket.io";
import http from "http";
import Room from "./models/Room.js";

const app = express();
const server = http.createServer(app);
dotenv.config();
const io = new Server(server, {
  cors: {
    origin: [process.env.FRONTEND_URL] ,
    methods: ["GET", "POST"],
  },
});


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
  socket.on("join_room", async ({ roomCode, username } = {}) => {
    if (typeof roomCode !== "string" || !roomCode.trim()) {
      return;
    }

    const normalizedRoomCode = roomCode.trim();
    if (
      socket.data.roomCode === normalizedRoomCode &&
      socket.rooms.has(normalizedRoomCode)
    ) {
      return;
    }
    if (socket.data.requestedRoomCode === normalizedRoomCode) {
      return;
    }

    const joinRequestId = (socket.data.joinRequestId || 0) + 1;
    socket.data.joinRequestId = joinRequestId;
    socket.data.requestedRoomCode = normalizedRoomCode;

    try {
      const room = await Room.findOne({ roomCode: normalizedRoomCode })
        .select("_id")
        .lean();

      if (socket.data.joinRequestId !== joinRequestId) {
        return;
      }

      if (!room) {
        delete socket.data.requestedRoomCode;
        socket.emit("room_error", { message: "Room not found" });
        return;
      }

      const previousRoomCode = socket.data.roomCode;
      if (previousRoomCode && previousRoomCode !== normalizedRoomCode) {
        socket.leave(previousRoomCode);
      }

      const alreadyJoined = socket.rooms.has(normalizedRoomCode);
      socket.data.roomCode = normalizedRoomCode;
      delete socket.data.requestedRoomCode;
      socket.join(normalizedRoomCode);

      if (!alreadyJoined) {
        socket.to(normalizedRoomCode).emit("member_joined", {
          message: `${username} joined the room`,
        });
      }
    } catch (error) {
      if (socket.data.joinRequestId === joinRequestId) {
        delete socket.data.requestedRoomCode;
        console.error("Socket room join failed:", error);
        socket.emit("room_error", {
          message: "Could not join this room. Please try again.",
        });
      }
    }
  });

  socket.on("leave_room", ({ roomCode, username } = {}) => {
    if (socket.data.requestedRoomCode === roomCode) {
      socket.data.joinRequestId = (socket.data.joinRequestId || 0) + 1;
      delete socket.data.requestedRoomCode;
    }

    if (typeof roomCode !== "string" || !socket.rooms.has(roomCode)) {
      return;
    }

    socket.to(roomCode).emit("member_left", {
      message: `${username} left the room`,
    });

    socket.leave(roomCode);
    if (socket.data.roomCode === roomCode) {
      delete socket.data.roomCode;
    }
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

export { io };