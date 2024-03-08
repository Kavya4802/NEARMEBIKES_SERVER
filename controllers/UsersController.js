const {Details} = require("../models/db");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "whfiugfdhfe4f5d716455()*&^%$#@!hdgfsd697825";
const bcrypt = require("bcryptjs");
const getUserController = async (req, res) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await Details.findOne({ email: decoded.email });

    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }
    res.json({
      status: "ok",
      user: { name: user.name, email: user.email, no: user.no, id: user._id },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Internal Server Error" });
    console.error(error);
  }
};
const resetpasswordController = async (req, res) => {
  const { id, tokens } = req.params;

  const { password } = req.body;
  try {
    const validUser = await Details.findOne({ _id: id, verifytoken: tokens });

    const verifyToken = jwt.verify(tokens, JWT_SECRET);

    if (validUser && verifyToken._id) {
      const newpassword = await bcrypt.hash(password, 12);

      const setnewuserpass = await Details.findByIdAndUpdate(
        { _id: id },
        { pwd: newpassword }
      );

      setnewuserpass.save();
      res.status(201).json({ status: 201, setnewuserpass });
    } else {
      res.status(401).json({ status: 401, message: "user not exist" });
    }
  } catch (error) {
    res.status(401).json({ status: 401, error });
  }
};
const forgotpasswordController = async (req, res) => {
  const { id, tokens } = req.params;
  try {
    const validUser = await Details.findOne({ _id: id, verifytoken: tokens });

    const verifyToken = jwt.verify(tokens, JWT_SECRET);
   

    if (validUser && verifyToken._id) {
      res.status(201).json({ status: 201, validUser });
    } else {
      res.status(401).json({ status: 401, message: "user not exist" });
    }
  } catch (error) {
    res.status(401).json({ status: 401, error });
  }
};
const sendpasswordlinkController = async (req, res) => {
  console.log(req.body);
  const { email } = req.body;

  if (!email) {
    return res.status(401).json({ status: 401, message: "Enter your email" });
  }

  try {
    const userfind = await Details.findOne({ email: email });

    if (!userfind) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }
    const tokens = jwt.sign({ _id: userfind._id }, JWT_SECRET, {
      expiresIn: "1h",
    });
    // console.log(tokens);
    const setusertoken = await Details.findByIdAndUpdate(
      { _id: userfind._id },
      { verifytoken: tokens },
      { new: true }
    );
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'satwikatyam@gmail.com',
        pass: 'tpetuiptgpjuqbkz'
      }
    });
    if (setusertoken) {
      const mailOptions = {
        from: "satwikatyam@gmail.com",
        to: email,
        subject: "sending email for password reset",
        text: `This Link is valid for 2 minutes http://localhost:3000/forgotpassword/${userfind.id}/${setusertoken.verifytoken}`,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("error", error);
          res.status(401).json({ status: 401, message: "email not send" });
        } else {
          console.log("Email sent", info.response);
          res.status(201).json({ status: 201, message: "email sent " });
        }
      });
    }
  } catch (error) {
    res.status(401).json({ status: 401, message: "email not send" });
  }
};
const getUsersController = async (req, res) => {
  try {
    const users = await Details.find(
      {},
      { name: 1, email: 1, no: 1, add: 1, city: 1, pincode: 1 }
    );
    res.json({ status: "ok", users });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "error", message: "Error fetching user details" });
  }
};
module.exports = {
  getUserController,
  resetpasswordController,
  forgotpasswordController,
  sendpasswordlinkController,
  getUsersController,
};
