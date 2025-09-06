const express = require("express");
const authRouter = express.Router();
const { validateSignupData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const User = require("../models/user");

// Register a user
authRouter.post("/api/signup", async (req, res) => {
  try {
    // Vaidation of data
    validateSignupData(req);
    // Encrypt the password
    const { password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    console.log(passwordHash);
    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: passwordHash,
    });
    await user
      .save()
      .then(() => res.status(201).send("User created successfully"))
      .catch((err) => {
        console.log(err.message);
        res.status(400).send("Error creating user: ");
      });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Login a user
authRouter.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).send("Invalid email or password");
    }
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(400).send("Invalid email or password");
    } else {
      // Create a JWT token
      const accessToken = await user.getJWT();
      // Add them to cookie and send the response back to user
      res.cookie("dev_access_token", accessToken);
      return res.status(200).send("Login successful");
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Logout user
authRouter.post("/api/logout", async (req, res) => {
  try {
   res.clearCookie("dev_access_token");
   res.status(200).send("Logged out successfully")
  } catch (error) {
    res.send(500).send("Something went wrong")
  }
})

// Forget password
authRouter.post("/api/forgot-password", async (req, res) => {
  try {
    const { email, password } = req.body;
    if(!email || !password) {
      return res.status(400).send("Email and new password are required");
    }
    const user = await User.findOne({ email: req.body.email });
    if(!user) {
      return res.status(400).send("Invalid request, please enter correct email address");
    }
    const encryptedPassword = await user.getHashPassword(password);
    await User.findByIdAndUpdate(user._id, { password: encryptedPassword });
    res.status(200).send("Password updated successfully");
  } catch (error) {
    console.log(error)
    res.status(500).send("Something went wrong")
  }
})

module.exports = authRouter;