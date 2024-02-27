const express = require("express");
const Razorpay = require("razorpay");
const app = express();
const shortid = require("shortid");
const multer = require("multer");
const uuidv4 = require("uuid/v4");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const {
  getCartItemsController,
  getcartcountController,
  addToCartController,
} = require("./controllers/CartController");

const {
  addBikeController,
  getBikeController,
  bikesController,
  removeItemController,
  handlesubtractController,
  handleaddController,
  bikesinfoController,
  bikeInfoController,
} = require("./controllers/BikesController");

const { loginController } = require("./controllers/loginController");
const {
  razorPay,
  savedTransaction,
  transactions,
  getOrders,
  fetchBikeDetails,
  updateReturnController,
} = require("./controllers/GlobalControllers");

const { registerController } = require("./controllers/RegisterController");
const {
  getUserController,
  resetpasswordController,
  forgotpasswordController,
  sendpasswordlinkController,
  getUsersController,
} = require("./controllers/UsersController");

app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

mongoose
  .connect(
    "mongodb+srv://Kavya:Mydatabase@cluster0.ikviqqi.mongodb.net/BikesDB",
    { useUnifiedTopology: true, useNewUrlParser: true }
  )
  .then(() => {
    console.log("mongodb connected");
  })
  .catch((error) => {
    console.log(error);
  });

require("./models/db");
const Details = mongoose.model("Userdetails");

const razorpay = new Razorpay({
  key_id: "rzp_test_6YWgCz8B9XBA7M",
  key_secret: "OC5PdOulwyIg6WtWY1tLARGe",
});

app.post("/razorpay", razorPay);

app.post("/save-transaction", savedTransaction);
app.get("/get-orders/:userEmail", getOrders);
app.get("/api/transactions", transactions);

app.use("/images", express.static(__dirname + "/uploads"));

app.post("/register", registerController);
app.post("/login", loginController);

function checkAdminCriteria(user) {
  return user.email === "satwikatyam@gmail.com";
}

const Bike = require("./models/bikesdb");
const DIR = "./uploads/";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIR);
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase().split(" ").join("-");
    cb(null, uuidv4() + "-" + fileName);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  },
});

app.post("/addbike", upload.single("bikeImg"), addBikeController);
app.get("/getbikes", getBikeController);
app.get("/getusers", getUserController);
app.get("/bikes/:id", bikesController);
app.put("/api/updateReturnedStatus/:id", updateReturnController);
app.put("/bikesinfo/:id", upload.single("picture"), bikeInfoController);
app.delete("/bikesinfo/:id", bikesinfoController);

app.post("/addtocart/:bikeId/:userEmail", addToCartController);
app.get("/getcartcount/:userEmail", getcartcountController);
app.get("/get-cart-items/:userEmail", getCartItemsController);
app.post("/handleadd/:bikeId/:userEmail", handleaddController);
app.post("/handlesubtract/:bikeId/:userEmail", handlesubtractController);
app.delete("/remove-item/:bikeId/:userEmail", removeItemController);

app.get("/getusers", getUsersController);

const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "satwikatyam@gmail.com",
    pass: "tpetuiptgpjuqbkz",
  },
});

app.post("/sendpasswordlink", sendpasswordlinkController);

app.get("/forgotpassword/:id/:tokens", forgotpasswordController);
app.post("/resetpassword/:id/:tokens", resetpasswordController);

app.listen(5000, () => {
  console.log("server started");
});
