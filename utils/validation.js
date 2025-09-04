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

module.exports = { validateSignupData };