const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: { type: mongoose.Schema.Types.ObjectId, required: true },
    toUserId: { type: mongoose.Schema.Types.ObjectId, required: true },
    status: {
      type: String,
      enum: ["interested", "ignored"],
      message: `{VALUE} is not supported`,
      required: true,
    },
  },
  { timestamps: true }
);

// Create an index
connectionRequestSchema.index({fromUserId: 1, toUserId: 1}); // 1 means ascending and -1 means descending

// Middleware or a pre-function to ensure unique requests
connectionRequestSchema.pre("save", function (next) {
  const connectionRequests = this;
  if (connectionRequests.fromUserId.equals(connectionRequests.toUserId)) {
    throw new Error("Cannot send request to oneself");
  }
  next(); 
});

const ConnectionRequest = mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema
);
module.exports = ConnectionRequest;
