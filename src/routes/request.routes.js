// user.routes.js
import { Router } from "express";
import {
  getRequest,
  getSingleRequest,
  getSingleRequestForAdmin,
  requestPost,
} from "../controllers/request.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/isAdmin.middleware.js";

const router = Router();

router.route("/requestPost").post(verifyJWT, requestPost);
router.route("/getRequest").get(verifyJWT, getRequest);
router.route("/getSingleRequest").get(verifyJWT, getSingleRequest);
router
  .route("/getSingleRequestAdmin/:id")
  .get(verifyJWT, getSingleRequestForAdmin);

export default router;
