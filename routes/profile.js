const { userAuth } = require("../middleware/auth");
const User = require("../models/user");
const profileRouter = require("express").Router();
const { validateProfileUpdateData } = require("../utils/validation");

// Get all users
profileRouter.get("/api/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Update user details
profileRouter.patch("/api/users/:id", userAuth, async (req, res) => {
  try {
    validateProfileUpdateData(req)
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(user);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

// Get user by id
profileRouter.get("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  const userDetails = await User.findById(id);
  if (userDetails) {
    res.status(200).json(userDetails);
  } else {
    res.status(404).send("User not found");
  }
});

// Delete a user
profileRouter.delete("/api/users/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.send("User deleted");
});

// Fetch profile
profileRouter.get("/api/profile", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    res.status(200).json(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = profileRouter;
