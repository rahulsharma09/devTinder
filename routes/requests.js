const { userAuth } = require("../middleware/auth");
const requestRouter = require("express").Router();
const ConnectionRequest = require("../models/connectionRequests");
const User = require("../models/user");

// Send connection request
requestRouter.post(
  "/request/send/interested/:userId",
  userAuth,
  async (req, res) => {
    try {
      const allowedStatuses = ["interested", "ignored"];
      const { status } = req.query;
      const { _id } = req.user; // Authenticated user
      const { userId } = req.params; // User to whom the request is sent

      const toUser = await User.findById(userId);
      if (!toUser) {
        return res.status(404).send({ message: "User not found" });
      }

      // if (userId === _id.toString()) {
      //   return res
      //     .status(400)
      //     .send({ message: "You cannot send request to yourself" });
      // }

      if (!allowedStatuses.includes(status)) {
        return res.status(400).send({ message: "Invalid status type" });
      }

      const requestExists = await ConnectionRequest.findOne({
        $or: [
          {
            fromUserId: _id,
            toUserId: userId,
            status: "interested",
          },
          {
            fromUserId: userId,
            toUserId: _id,
            status: "interested",
          },
        ],
      });
      if (requestExists) {
        return res.status(400).send({ message: "Request already sent" });
      }
      const newRequest = new ConnectionRequest({
        fromUserId: _id,
        toUserId: userId,
        status: status || "pending",
      });
      await newRequest.save();
      res.status(200).send({ message: "Request sent successfully" });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  }
);

// Update connection request
requestRouter.patch(
  "/request/connection/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const { status } = req.query;
      const allowedStatuses = ["interested", "ignored"];
      const { _id } = req.user;
      const { requestId } = req.params;
      if (!allowedStatuses.includes(status)) {
        return res.status(400).send({ message: "Invalid status type" });
      }
      const request = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: _id,
      });
      if (!request) {
        res.status(404).send({ message: "Request not found" });
      }
      await ConnectionRequest.findByIdAndUpdate(requestId, { status: status });
      res.status(200).send({ message: "Request updated successfully" });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  }
);

// Check all connection requests
requestRouter.get(
  "/request/connection/requests",
  userAuth,
  async (req, res) => {
    try {
      const { _id } = req.user;
      const requests = await ConnectionRequest.find({
        toUserId: _id,
        status: "pending",
      });
      res.status(200).send(requests);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  }
);

module.exports = requestRouter;
