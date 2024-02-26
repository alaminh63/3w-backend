// user.routes.js
import { Router } from "express";
import {
  getRequest,
  getSingleRequest,
  requestPost,
} from "../controllers/request.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/requestPost").post(verifyJWT, requestPost);
router.route("/getRequest").get(verifyJWT, getRequest);
router.route("/getSingleRequest").get(verifyJWT, getSingleRequest);

export default router;
