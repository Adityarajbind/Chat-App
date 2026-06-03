import Message from "../models/Message.js";
import Room from "../models/Room.js";
import { io } from "../server.js";

const sendMessage = async (req, res) => {
  try {
    const { roomCode, content } = req.body;

    const room = await Room.findOne({
      roomCode,
    });

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    const message = await Message.create({
      roomId: room._id,
      sender: req.user.id,
      content,
    });

    const populatedMessage = await Message.findById(message._id).populate(
      "sender",
      "username",
    );

    room.lastActivity = new Date();

    await room.save();
    io.to(roomCode).emit("receive_message", populatedMessage);

    res.status(201).json(populatedMessage);

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getMessages = async (req, res) => {
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

    const messages = await Message.find({
      roomId: room._id,
    })
      .populate("sender", "username")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export { sendMessage, getMessages };
