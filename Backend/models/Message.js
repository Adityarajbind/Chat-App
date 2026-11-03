import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },
    clientMessageId: {
      type: String,
      trim: true,
    },
    expiresAt: {
      type: Date,
      default: () =>
        new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      expires: 0,
    },
  },
  {
    timestamps: true,
  },
);

MessageSchema.index({ roomId: 1, createdAt: -1, _id: -1 });
MessageSchema.index(
  { roomId: 1, sender: 1, clientMessageId: 1 },
  {
    unique: true,
    partialFilterExpression: { clientMessageId: { $type: "string" } },
  },
);

const Message = mongoose.model("Message", MessageSchema);

export default Message;
