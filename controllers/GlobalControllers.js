const {Bike} = require("../models/bikesdb");
const {TransactionDB} = require("../models/transactiondb");
const Razorpay = require("razorpay");
const shortid = require("shortid");
const moment = require("moment");
const { Details } = require("../models/db");
const Review = require('../models/review');
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
    // console.log(response);

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
      bikePicture
    } = req.body;
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
      bikePicture
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
const updateProfile = async (req, res) => {
  console.log("request:", req.body);

  const userEmail = req.params.userEmail;
  try {
    const existingBike = await Details.findOne({ email: userEmail }).exec();
    const updateFields = {};

    if (req.body.no) {
      updateFields.no = req.body.no;
    }
    if (req.body.add) {
      updateFields.add = req.body.add;
    }

    const updatedProfile = { ...existingBike._doc, ...updateFields };
    const updatedData = await Details.findOneAndUpdate(
      { email: userEmail },
      updatedProfile,
      { new: true }
    );

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

const submitReview = async (req, res) => {
  try {
    const { rating, bikeId, description, userEmail } = req.body;

    // Check if the bikeId already exists in the database
    const existingReview = await Review.findOne({ bikeId });

    if (existingReview) {
      // If the bikeId exists, calculate the new average rating
      const newAverageRating =
        (existingReview.rating * existingReview.numReviews + rating) /
        (existingReview.numReviews + 1);

      // Update the existing entry with the new average rating and increment the number of reviews
      await Review.findOneAndUpdate(
        { bikeId },
        {
          $set: { rating: newAverageRating },
          $push: { description: { $each: description }, userEmail: { $each: userEmail } },
          $inc: { numReviews: 1 },
        }
      );
    } else {
      // If the bikeId doesn't exist, create a new entry
      const newReview = new Review({
        rating,
        bikeId,
        description,
        userEmail,
        numReviews: 1, // Initialize numReviews to 1 for the new entry
      });

      // Save the new review to the database
      await newReview.save();
    }

    res.status(200).json({ message: 'Review submitted successfully.' });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
const getRatings=async(req,res)=>{
  try {
    const ratings = await Review.find({}, 'bikeId rating userEmail description');
    res.json({ status: 'ok', ratings });
} catch (error) {
    console.error('Error fetching bike ratings:', error);
    res.status(500).json({ status: 'error', error: 'Internal Server Error' });
}
}

module.exports = {
  fetchBikeDetails,
  razorPay,
  savedTransaction,
  updateProfile,
  getOrders,
  getProfileInfo,
  transactions,
  updateReturnController,
  generateInvoice,
  submitReview,
  getRatings
};
