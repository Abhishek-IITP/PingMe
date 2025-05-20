import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  acceptFriendRequest,
  getFriendRequests,
  getMyFriends,
  getOutgoingFriendReqs,
  getRecommendedUsers,
  sendFriendRequest,
  getUserProfile,
  removeFriend,
} from "../controllers/user.controller.js";

const router = express.Router();

router.use(protectRoute);

// Specific routes first
router.get("/friends", getMyFriends);
router.get("/friend-requests", getFriendRequests);
router.get("/outgoing-friend-requests", getOutgoingFriendReqs);
router.post("/friend-request/:id", sendFriendRequest);
router.put("/friend-request/:id/accept", acceptFriendRequest);
router.delete("/friends/:friendId", removeFriend);

// Generic routes last
router.get("/", getRecommendedUsers);
router.get("/:userId", getUserProfile);

export default router;