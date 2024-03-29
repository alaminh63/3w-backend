import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import crypto from "crypto";
import userRouter from "./routes/user.routes.js";
import requestRouter from "./routes/request.routes.js";
import {
  verifyJWT,
  googleAuthMiddleware,
  googleAuthCallbackMiddleware,
  handleGoogleAuthCallback,
} from "./middlewares/auth.middleware.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

const generateSessionSecret = () => {
  return crypto.randomBytes(64).toString("hex");
};

app.use(
  session({
    secret: generateSessionSecret(),
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.route("/auth/google").get(googleAuthMiddleware);
app
  .route("/auth/google/callback")
  .get(googleAuthCallbackMiddleware, handleGoogleAuthCallback);

app.get("/", (req, res) => {
  res.send("Server is running well");
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/request", requestRouter);

export { app };
