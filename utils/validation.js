const validator = require("validator");

function validateSignupData(req) {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    throw new Error("Missing required fields");
  } else if (firstName.length < 3 || firstName.length > 50) {
    throw new Error("First name must be between 3 and 50 characters");
  } else if (lastName.length < 3 || lastName.length > 50) {
    throw new Error("Last name must be between 3 and 50 characters");
  } else if (!validator.isEmail(email)) {
    throw new Error("Invalid email format");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Please enter a strong password");
  }
}

function validateProfileUpdateData(req) {
  const allowedUpdates = [
    "firstName",
    "lastName",
    "age",
    "gender",
    "profilePicture",
  ];
  console.log(req.body);
  const requestedUpdates = Object.keys(req.body);
  const isValidOperation = requestedUpdates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    throw new Error("Invalid updates!");
  }
  const { firstName, lastName, age } = req.body;
  if (firstName && (firstName.length < 3 || firstName.length > 50)) {
    throw new Error("First name must be between 3 and 50 characters");
  }
  if (lastName && (lastName.length < 3 || lastName.length > 50)) {
    throw new Error("Last name must be between 3 and 50 characters");
  }
  if (age && (age < 18 || age > 100)) {
    throw new Error("Age must be between 18 and 100");
  }
}

module.exports = { validateSignupData, validateProfileUpdateData };
