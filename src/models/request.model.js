import mongoose from "mongoose";

const ethTransaction = new mongoose.Schema(
  {
    amount: {
      type: Number,
    },
  },
  {
    timestamps: {
      currentTime: () => new Date().toLocaleString("en-US", { hour12: true }),
    },
  }
);

const testLinkTransaction = new mongoose.Schema(
  {
    amount: {
      type: Number,
    },
  },
  {
    timestamps: {
      currentTime: () => new Date().toLocaleString("en-US", { hour12: true }),
    },
  }
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
  {
    timestamps: {
      currentTime: () => new Date().toLocaleString("en-US", { hour12: true }),
    },
  }
);

export const Request = mongoose.model("Request", requestSchema);
