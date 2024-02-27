const bcrypt = require("bcryptjs");
const {Details} = require("../models/db");
const registerController = async (req, res) => {
  console.log("Received registration request:", req.body);

  const { name, email, pwd, no, add, city, pincode } = req.body;
  var encpwd = await bcrypt.hash(pwd, 10);

  try {
    if (!name.match(/^[a-zA-Z]+$/)) {
      return res
        .status(400)
        .json({ status: "error", message: "Name must contain only letters" });
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res
        .status(400)
        .json({
          status: "error",
          field: "email",
          message: "Please enter a valid email address",
        });
    }

    if (
      !pwd.match(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]+$/)
    ) {
      console.log("Password validation failed");
      return res
        .status(400)
        .json({ status: "error", message: "Please enter a valid password" });
    }

    if (pwd.length < 8) {
      console.log("Password length validation failed");
      return res
        .status(400)
        .json({
          status: "error",
          message: "Password must be at least 8 characters long",
        });
    }

    if (!no.match(/^[0-9\b]+$/)) {
      console.log("Phone number validation failed");
      return res
        .status(400)
        .json({
          status: "error",
          message: "Please enter a valid phone number",
        });
    }

    if (no.length !== 10) {
      console.log("Phone number length validation failed");
      return res
        .status(400)
        .json({
          status: "error",
          message: "Phone number must be 10 digits long",
        });
    }

    if (!city.match(/^[a-zA-Z]+$/)) {
      return res
        .status(400)
        .json({ status: "error", message: "City must contain only letters" });
    }

    if (!pincode.match(/^\d{6}$/)) {
      return res
        .status(400)
        .json({ status: "error", message: "Pin code must be 6 digits long" });
    }

    console.log("Validation successful. Registering user...");

    const oldUser = await Details.findOne({ email });
    if (oldUser) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "User with this email already exists",
        });
    }

    await Details.create({
      name,
      email,
      pwd: encpwd,
      no,
      add,
      city,
      pincode,
    });

    console.log("User registered successfully.");

    res.json({ status: "ok" });
  } catch (error) {
    console.error("Error during registration:", error);
    const errorMessage = error.message || "Internal Server Error";
    res.status(500).json({ status: "error", message: errorMessage });
  }
};
module.exports = { registerController };
