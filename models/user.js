const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");


const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (value) => {
          if (!validator.isEmail(value)) {
            throw new Error("Invalid email format");
          }
        },
      },
    },
    password: { type: String, required: true },
    age: { type: Number },
    gender: { type: String },
  },
  { timestamps: true }
);

userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user._id }, "DEV@TINDER$790", {
    expiresIn: "1h",
  });
  return token;
};

userSchema.methods.getHashPassword = async function (password) {
  const passwordHash = await bcrypt.hash(password, 10);
  return passwordHash;
}

userSchema.methods.validatePassword = async function (userInputPassword){
  const user = this;
  const isPasswordValid = await bcrypt.compare(userInputPassword, user.password);
  return isPasswordValid;
}

const User = mongoose.model("User", userSchema);
module.exports = User;
