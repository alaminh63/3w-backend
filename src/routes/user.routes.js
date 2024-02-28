import express from "express";
import passport from "passport";
import {
  googleAuthMiddleware,
  googleAuthCallbackMiddleware,
  handleGoogleAuthCallback,
} from "../middlewares/auth.middleware.js";
import {
  getAllUsers,
  getSingleUser,
  deleteUser,
  registerUser,
loginUser,
  logout,
  refreshAccessToken,
  getCurrentUser,
  makeAdmin,
  loginWithGoogle,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/isAdmin.middleware.js";

const router = express.Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

router.route("/auth/google").get(googleAuthMiddleware);
router
  .route("/auth/google/callback")
  .get(googleAuthCallbackMiddleware, handleGoogleAuthCallback);
router.route("/loginWithGoogle").post(loginWithGoogle);

router.route("/logout").post(verifyJWT, logout);
router.route("/refreshToken").post(refreshAccessToken);
router.route("/currentUser").get(verifyJWT, getCurrentUser);
router.route("/make-admin/:userId").put(verifyJWT, isAdmin, makeAdmin);
router.route("/getAllUser").get(verifyJWT, isAdmin, getAllUsers);
router.route("/getSingleUser/:userId").get(verifyJWT, getSingleUser);
router.route("/deleteUser/:userId").delete(verifyJWT, isAdmin, deleteUser);

export default router;
