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
  },
  {
    timestamps: true,
  }
);

const room = mongoose.model("Room", RoomSchema);
export default room;