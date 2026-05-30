
import Room from "../models/Room.js";

function GenerateRoomCode() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  let code = "";

  for (let i = 0; i < 6; i++) {
    code += chars.charAt(
      Math.floor(Math.random() * chars.length)
    );
  }

  return code;
}

const createRoom = async (req, res) => {
  try {
    const { roomName, userId } = req.body;
    

    const roomCode = GenerateRoomCode();

    const room = await Room.create({
      roomName,
      roomCode,
      createdBy: userId,
      members: [userId],
    });

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const joinRoom = async (req, res) => {
  try {
    const { roomCode, userId } = req.body;

    const room = await Room.findOne({ roomCode });

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    if (!room.members.includes(userId)) {
      room.members.push(userId);
      await room.save();
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export { createRoom, joinRoom };