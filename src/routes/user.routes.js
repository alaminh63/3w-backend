// user.routes.js
import { Router } from "express";
import passport from "passport";
import {
  deleteUser,
  getAllUsers,
  getCurrentUser,
  loginUser,
  loginWithGoogle,
  logout,
  makeAdmin,
  refreshAccessToken,
  registerUser,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/isAdmin.middleware.js";
const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

router
  .route("/auth/google")
  .get(passport.authenticate("google", { scope: ["profile", "email"] }));
router
  .route("/auth/google/callback")
  .get(passport.authenticate("google", { failureRedirect: "/" }), (_, res) =>
    res.redirect("/")
  );

// secured routes
router.route("/logout").post(verifyJWT, logout);
router.route("/refreshToken").post(refreshAccessToken);
router.route("/currentUser").get(verifyJWT, getCurrentUser);
// router.route("/auth/google").post(loginWithGoogle);
// router.post("/admin-only-route", verifyJWT, isAdmin, (req, res) => {
//   res.json({ message: "This route is accessible only to admins." });
// });
router.route("/make-admin/:userId").put(verifyJWT, isAdmin, makeAdmin);
router.route("/getAllUser").get(verifyJWT, isAdmin, getAllUsers);
router.route("/deleteUser/:userId").delete(verifyJWT, isAdmin, deleteUser);
export default router;
