const { userAuth } = require("../middleware/auth");
const requestRouter = require("express").Router();
const ConnectionRequest = require("../models/connectionRequests");

// Send connection request
requestRouter.post(
  "/request/send/interested/:userId",
  userAuth,
  async (req, res) => {
    try {
      const { status } = req.query;
      const { _id } = req.user; // Authenticated user
      const { userId } = req.params; // User to whom the request is sent
      const requestExists = await ConnectionRequest.findOne({
        fromUserId: _id,
        toUserId: userId,
        status: status || "pending",
      });
      if (requestExists) {
        return res.status(400).send({ message: "Request already sent" });
      }
      const newRequest = new ConnectionRequest({
        fromUserId: _id,
        toUserId: userId,
      });
      await newRequest.save();
      res.status(200).send({ message: "Request sent successfully" });
    } catch (error) {
      res.status(400).send(error);
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
