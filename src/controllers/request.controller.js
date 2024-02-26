// user.controller.js

import { Request } from "../models/request.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const requestPost = asyncHandler(async (req, res) => {
  const { amount, transactionType } = req.body;

  if (!amount && !amount === Number) {
    throw new ApiError(403, "Amount be need with number value");
  }

  // Validate transactionType to ensure it's either "ethTransaction" or "testLinkTransaction"
  if (!["ethTransaction", "testLinkTransaction"].includes(transactionType)) {
    throw new ApiError(400, "Invalid transaction type");
  }

  const newTransaction = { amount };

  // Create a new request document
  const createdRequest = await Request.findOneAndUpdate(
    { owner: req.user._id },
    { $push: { [`${transactionType}History`]: newTransaction } },
    { new: true, upsert: true }
  );

  return res
    .status(201)
    .json(
      new ApiResponse(200, createdRequest, "Transaction added successfully")
    );
});

const getRequest = asyncHandler(async (req, res) => {
  // Fetch all requests
  const allRequests = await Request.find({});

  if (!allRequests) {
    throw new ApiError(404, "No requests found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, allRequests, "All requests fetched successfully")
    );
});
const getSingleRequest = asyncHandler(async (req, res) => {
  // Fetch all requests
  const userRequests = await Request.findOne({ owner: req.user._id });

  if (!userRequests) {
    throw new ApiError(404, "No requests found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, userRequests, "All requests fetched successfully")
    );
});

export { requestPost, getRequest, getSingleRequest };
