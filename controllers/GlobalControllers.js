const {Bike} = require("../models/bikesdb");
const {TransactionDB} = require("../models/transactiondb");
const Razorpay = require("razorpay");
const shortid = require("shortid");
const moment = require("moment");
const { Details } = require("../models/db");
const razorpay = new Razorpay({
  key_id: "rzp_test_6YWgCz8B9XBA7M",
  key_secret: "OC5PdOulwyIg6WtWY1tLARGe",
});
const fetchBikeDetails = async (bikeId) => {
  try {
    const bikeDetails = await Bike.findById(bikeId); // Assuming you are using mongoose

    // Handle the case where the bike is not found
    if (!bikeDetails) {
      return null;
    }

    // Return the bike details
    return {
      price: bikeDetails.price,
      // Add other bike details as needed
    };
  } catch (error) {
    console.error("Error fetching bike details:", error);
    throw error; // Throw the error to be caught in the calling function
  }
};
const razorPay = async (req, res) => {
  const payment_capture = 1;
  const bikeId = req.body.bikeId; // Assuming you receive bikeId from the frontend

  try {
    // Fetch bike details using bikeId
    const bikeDetails = await fetchBikeDetails(bikeId);

    if (!bikeDetails) {
      res.status(404).json({ error: "Bike not found" });
      return;
    }

    const options = {
      amount: req.body.totalPrice * 100, // Set the amount based on the bike price
      currency: "INR",
      receipt: shortid.generate(),
      payment_capture,
    };

    const response = await razorpay.orders.create(options);
    console.log(response);

    res.json({
      id: response.id,
      currency: response.currency,
      amount: response.amount,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const savedTransaction = async (req, res) => {
  try {
    const {
      orderId,
      paymentId,
      userName,
      userEmail,
      amount,
      phoneNumber,
      startDate,
      endDate,
      bikeId,
      bikeName,
    } = req.body;
    // console.log(orderId);
    // console.log(paymentId);
    const transaction = new TransactionDB({
      orderId,
      paymentId,
      userName,
      userEmail,
      amount,
      phoneNumber,
      startDate: moment(startDate).format("DD/MM/YY LT"),
      endDate: moment(endDate).format("DD/MM/YY LT"),
      bikeId,
      bikeName,
    });

    const savedTransaction = await transaction.save();
    // console.log('Transaction saved:', savedTransaction);

    res.json({ success: true, message: "Transaction saved successfully." });
  } catch (error) {
    console.error("Error saving transaction:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
const getOrders = async (req, res) => {
  try {
    const userEmail = req.params.userEmail;
    const orders = await TransactionDB.find({ userEmail }).exec();
    res.status(200).json({ status: "ok", orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ status: "error", error: "Internal Server Error" });
  }
};
const generateInvoice = async (req, res) => {
  try {
      const orderId = req.params.orderId;
      // Fetch order details based on orderId
      const order = await TransactionDB.findOne({ orderId }).exec();

      // Assuming you have the logic to generate the invoice data here
      const invoiceData = generateInvoiceLogic(order);

      // Send the generated invoice data to the client
      res.status(200).json({ status: "ok", invoiceData });
  } catch (error) {
      console.error("Error generating invoice:", error);
      res.status(500).json({ status: "error", error: "Internal Server Error" });
  }
};

// Add this function to generate invoice data based on order details
const generateInvoiceLogic = (order) => {
  // Implement your logic to generate the invoice here
  // For example, create an object with invoice details
  const invoiceData = {
      orderId: order.orderId,
      amount: order.amount,
      // Add other invoice details as needed
  };

  return invoiceData;
};

// Add the new endpoint to your server


const getProfileInfo = async (req, res) => {
  try {
    console.log("iuyygs");
    const userEmail = req.params.userEmail;
    const profileinfo = await Details.findOne({ email: userEmail }).exec();
    console.log(profileinfo);
    res.status(200).json({ status: "ok",profileinfo});
  } catch (error) {
    console.error("Error fetching profile info:", error);
    res.status(500).json({ status: "error", error: "Internal Server Error" });
  }
};
const updateProfile= async (req, res) => {

  const userEmail = req.params.userEmail;
  try {
    // Find the existing bike
    const existingBike = await Details.findOne({ email: userEmail }).exec();

    // Construct the update object with only the fields that are provided in the request
    const updateFields = {};

    if (req.body.phno) {
      updateFields.phno = req.body.phno;
    }
    if (req.add) {
      updateFields.add = req.body.add; // Update picture only if a new file is provided
    }

    // Merge the existing bike data with the updateFields
    const updatedProfile = { ...existingBike._doc, ...updateFields };

    // Perform the update
    const updatedData = await Details.findOneAndUpdate({ email: userEmail }, updatedProfile, { new: true });
    if (!updatedData) {
      res.status(404).send({
        message: `Cannot update user with email ${userEmail}. Maybe user not found`,
      });
    } else {
      res.send(updatedData);
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).send({ message: "Error updating user information" });
  } 
};
const transactions = async (req, res) => {
  try {
    const transactions = await TransactionDB.find();
    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const updateReturnController = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const { returned } = req.body;

    // Update the returned status in the TransactionDB
    await TransactionDB.findByIdAndUpdate(transactionId, { returned });

    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Error updating returned status:", error);
    res.status(500).json({ status: "error" });
  }
};
module.exports = {
  fetchBikeDetails,
  razorPay,
  savedTransaction,
  updateProfile,
  getOrders,
  getProfileInfo,
  transactions,
  updateReturnController,
  generateInvoice
};
