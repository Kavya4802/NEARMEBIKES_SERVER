const {Details} = require("../models/db");
const getCartItemsController = async (req, res) => {
  const userEmail = req.params.userEmail;

  try {
    const user = await Details.findOne({ email: userEmail });

    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    const cartItems = await Promise.all(
      user.cart.map(async (cartItem) => {
        try {
          // Fetch details for each bike
          const bikeDetails = await Bike.findById(cartItem.bikeId);

          if (!bikeDetails) {
            // Handle the case where the bike details are not found
            console.error(`Bike details not found for id: ${cartItem.bikeId}`);
            return null;
          }

          return {
            bikeId: bikeDetails._id,
            bikeName: bikeDetails.brand,
            bikePicture: bikeDetails.picture,
            bikePrice: bikeDetails.price,
            quantity: cartItem.quantity,
            // Add other properties as needed
          };
        } catch (error) {
          console.error(
            `Error fetching bike details for id ${cartItem.bikeId}: ${error}`
          );
          return null;
        }
      })
    );

    // Filter out any null values (where bike details were not found)
    const validCartItems = cartItems.filter((item) => item !== null);

    res.status(200).json({ status: "ok", cartItems: validCartItems });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error" });
  }
};
const getcartcountController = async (req, res) => {
  const userEmail = req.params.userEmail; // Assuming you have a user ID in the JWT payload

  try {
    // Find the user by ID
    const user = await Details.findOne({ email: userEmail });

    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }
    const cartCount = user.cart.length;
    res.status(200).json({ status: "ok", cartCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error" });
  }
};
const addToCartController = async (req, res) => {
  const bikeId = req.params.bikeId;
  const userEmail = req.params.userEmail;

  try {
    // Find the user by email
    const user = await Details.findOne({ email: userEmail });

    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    // Check if the bike is already in the cart
    const index = user.cart.findIndex(
      (cartItem) => cartItem.bikeId.toString() === bikeId
    );

    if (index !== -1) {
      // If the bike is already in the cart, update the quantity
      user.cart[index].quantity += 1;
      console.log(`Quantity of ${bikeId}: ${user.cart[index].quantity}`);
    } else {
      // If the bike is not in the cart, add it with quantity 1
      user.cart.push({ bikeId, quantity: 1 });
    }

    // Save the updated user document
    await user.save();

    // Send a success response
    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", error: error.message });
  }
};
module.exports = {
  getCartItemsController,
  getcartcountController,
  addToCartController,
};
