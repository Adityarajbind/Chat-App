import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  sendMessage,
  getMessages,
} from "../controllers/messageController.js";

const router = express.Router();

router.post(
  "/send",
  authMiddleware,
  sendMessage
);

router.get(
  "/:roomCode",
  authMiddleware,
  getMessages
);

export default router;