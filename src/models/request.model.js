import mongoose from "mongoose";

const ethTransaction = new mongoose.Schema(
  {
    amount: {
      type: Number,
    },
  },
  { timestamps: true }
);

const testLinkTransaction = new mongoose.Schema(
  {
    amount: {
      type: Number,
    },
  },
  { timestamps: true }
);

const requestSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    ethTransactionHistory: {
      type: [ethTransaction],
    },
    testLinkTransactionHistory: {
      type: [testLinkTransaction],
    },
  },
  { timestamps: true }
);

export const Request = mongoose.model("Request", requestSchema);
