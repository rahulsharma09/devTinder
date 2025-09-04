const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");
const { validateSignupData } = require("./utils/validation");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { userAuth } = require("./middleware/auth");

const app = express();
app.use(express.json());
app.use(cookieParser());

// Get all users
app.get("/api/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Get user by email (query param)
app.get("/api/users", async (req, res) => {
  const users = await User.find({ email: req.query.email });
  res.json(users);
});

// Update user details
app.patch("/api/users/:id", async (req, res) => {
  try {
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
app.get("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  const userDetails = await User.findById(id);
  if (userDetails) {
    res.status(200).json(userDetails);
  } else {
    res.status(404).send("User not found");
  }
});

// Register a user
app.post("/api/signup", async (req, res) => {
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
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).send("Invalid email or password");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).send("Invalid email or password");
    } else {
      // Create a JWT token
      const accessToken = await jwt.sign({ _id: user._id }, "DEV@TINDER$790", {
        expiresIn: "1h",
      });
      // Add them to cookie and send the response back to user
      res.cookie("dev_access_token", accessToken);
      return res.status(200).send("Login successful");
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Fetch profile
app.get("/api/profile", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    res.status(200).json(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete a user
app.delete("/api/users/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.send("User deleted");
});

connectDB()
  .then(() => {
    console.log("Database connected successfully");
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((err) => {
    console.error("Database connection failed", err);
  });
