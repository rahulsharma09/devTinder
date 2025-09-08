const userRouter = require("express").Router();
const ConnectionRequest = require("../models/connectionRequests");
const { userAuth } = require("../middleware/auth");
const User = require("../models/user");

// Check all connection requests
userRouter.get("/user/connection/requests", userAuth, async (req, res) => {
  try {
    const { _id } = req.user;
    const requests = await ConnectionRequest.find({
      toUserId: _id,
      status: "interested",
    }).populate("fromUserId", [
      "firstName",
      "lastName",
      "email",
      "profilePicture",
    ]);
    res.status(200).send(requests);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Get all connections for authenticated user
userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const { _id } = req.user;
    const connections = await ConnectionRequest.find({
      $or: [{ fromUserId: _id }, { toUserId: _id }],
      status: "accepted",
    }).populate("fromUserId", [
      "firstName",
      "lastName",
      "email",
      "profilePicture",
    ]);
    res.status(200).send(connections);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// User feeds
userRouter.get("/users/feed", userAuth, async (req, res) => {
  try {
    /*
        1. User should not see his own card
        2. User should not see his connections
        3. User should not see ignored people
        4. User should not see people to whom he has sent connection request
    */
    const { _id } = req.user;
    const { page, limit } = req.query;
    const skip = (page - 1) * limit;

    // Check the connection requests sent and received by the user
    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: _id }, { toUserId: _id }],
    }).select("fromUserId toUserId");

    const hiddenUsers = new Set();
    connectionRequests.forEach((request) => {
      hiddenUsers.add(request.fromUserId.toString());
      hiddenUsers.add(request.toUserId.toString());
    });

    const users = await User.find({
      $and: [{ _id: { $ne: _id } }, { _id: { $nin: Array.from(hiddenUsers) } }],
    })
      .select("firstName lastName email profilePicture")
      .skip(skip)
      .limit(limit ? parseInt(limit) : 10);

    res.status(200).json(users);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = userRouter;
