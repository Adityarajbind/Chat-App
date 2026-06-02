import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  createRoom,
  joinRoom,
  getRoom,
  getRoomMembers,
  leaveRoom,
} from "../controllers/roomController.js";

const router = express.Router();

router.post("/create", authMiddleware, createRoom);
router.post("/join", authMiddleware, joinRoom);
router.post("/leave", authMiddleware, leaveRoom);
router.get("/:roomCode", authMiddleware, getRoom);

router.get(
  "/:roomCode/members",
  authMiddleware,
  getRoomMembers
);

export default router;