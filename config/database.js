const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://rahulsharma:7KxD83s9VDj5nBcy@cluster0.gvhtt.mongodb.net/devTinder"
  );
};

module.exports = connectDB;


