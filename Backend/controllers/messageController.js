import mongoose from "mongoose";
import Message from "../models/Message.js";
import Room from "../models/Room.js";
import { io } from "../server.js";

const sendMessage = async (req, res) => {
  try {
    const { roomCode, content, clientMessageId } = req.body;

    if (typeof roomCode !== "string" || !roomCode.trim()) {
      return res.status(400).json({
        message: "Room code is required",
      });
    }

    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({
        message: "Message content is required",
      });
    }

    const normalizedRoomCode = roomCode.trim();
    const room = await Room.findOne({
      roomCode: normalizedRoomCode,
    }).select("_id");

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    await Room.updateOne(
      { _id: room._id },
      { $set: { lastActivity: new Date() } },
    );

    const normalizedClientMessageId =
      typeof clientMessageId === "string" ? clientMessageId.trim() : "";
    let message;

    try {
      message = await Message.create({
        roomId: room._id,
        sender: req.user.id,
        content: content.trim(),
        ...(normalizedClientMessageId
          ? { clientMessageId: normalizedClientMessageId }
          : {}),
      });
    } catch (error) {
      if (error.code !== 11000 || !normalizedClientMessageId) {
        throw error;
      }

      message = await Message.findOne({
        roomId: room._id,
        sender: req.user.id,
        clientMessageId: normalizedClientMessageId,
      });
      if (!message) {
        throw error;
      }
    }

    const populatedMessage = await message.populate("sender", "username");

    const responseMessage = {
      ...populatedMessage.toObject(),
      roomCode: normalizedRoomCode,
    };
    io.to(normalizedRoomCode).emit("receive_message", responseMessage);

    return res.status(201).json(responseMessage);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const { roomCode } = req.params;
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isInteger(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 100)
      : 50;
    const { beforeCreatedAt, beforeId } = req.query;

    const room = await Room.findOne({
      roomCode,
    }).select("_id");

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    const query = {
      roomId: room._id,
    };

    if (beforeCreatedAt || beforeId) {
      const beforeDate = new Date(beforeCreatedAt);

      if (
        !beforeCreatedAt ||
        !beforeId ||
        Number.isNaN(beforeDate.getTime()) ||
        !mongoose.Types.ObjectId.isValid(beforeId)
      ) {
        return res.status(400).json({
          message: "A valid message cursor is required",
        });
      }

      query.$or = [
        { createdAt: { $lt: beforeDate } },
        { createdAt: beforeDate, _id: { $lt: beforeId } },
      ];
    }

    const results = await Message.find(query)
      .populate("sender", "username")
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1)
      .lean();

    const hasMore = results.length > limit;
    const messages = results.slice(0, limit).reverse();

    res.json({ messages, hasMore });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export { sendMessage, getMessages };
