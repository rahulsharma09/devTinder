const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const { dev_access_token } = req.cookies;
    if (!dev_access_token) {
      throw new Error("Invalid token");
    }
    const decodedToken = await jwt.verify(dev_access_token, "DEV@TINDER$790");
    if (!decodedToken) {
      return res.status(401).send("Unauthorized");
    }
    const { _id } = decodedToken;
    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User not found");
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(400).send(error.message);
  }
};

module.exports = { userAuth };
