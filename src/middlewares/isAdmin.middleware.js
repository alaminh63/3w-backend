import { ApiError } from "../utils/ApiError.js";


export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return next(
      new ApiError(403, "Unauthorized. Only admins can access this route.")
    );
  }
  next();
};
