import mongoose from "mongoose";


const RoomSchema = new mongoose.Schema(
  {
    roomName: {
      type: String,
      required: true,
    },

    roomCode: {
      type: String,
      required: true,
      unique: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

RoomSchema.index(
  { lastActivity: 1 },
  {
    expireAfterSeconds: 3 * 24 * 60 * 60,
  }
);


const room = mongoose.model("Room", RoomSchema);
export default room;