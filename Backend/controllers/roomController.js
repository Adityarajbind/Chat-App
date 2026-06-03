import Room from "../models/Room.js";

function GenerateRoomCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  let code = "";

  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return code;
}

const createRoom = async (req, res) => {
  try {
    const { roomName } = req.body;

    const userId = req.user.id;

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
    const { roomCode } = req.body;

    const userId = req.user.id;

    const room = await Room.findOne({ roomCode });

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    if (!room.members.includes(userId)) {
      room.members.push(userId);
    }

    room.lastActivity = new Date();

    await room.save();

    res.json(room);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getRoom = async (req, res) => {
  try {
    const { roomCode } = req.params;

    const room = await Room.findOne({
      roomCode,
    });

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getRoomMembers = async (req, res) => {
  try {
    const { roomCode } = req.params;

    const room = await Room.findOne({
      roomCode,
    }).populate("members", "username email");

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    res.json(room.members);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const leaveRoom = async (req, res) => {
  try {
    const { roomCode } = req.body;

    const userId = req.user.id;

    const room = await Room.findOne({ roomCode });

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    const originalLength = room.members.length;

    room.members = room.members.filter(
      (member) => member.toString() !== userId,
    );

    if (room.members.length === originalLength) {
      return res.status(400).json({
        message: "User is not in this room",
      });
    }

    await room.save();

    res.json({
      message: "Left room successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
export { createRoom, joinRoom, leaveRoom, getRoom, getRoomMembers };
