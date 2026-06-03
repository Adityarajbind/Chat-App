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

const Message = mongoose.model("Message", MessageSchema);

export default Message;
