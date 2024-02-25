const {Bike} = require("../models/bikesdb");
const {Details} = require("../models/db");
const addBikeController = async (req, res) => {
  console.log(JSON.parse(req.body.formData));
  const { brand, model, price, status } = JSON.parse(req.body.formData);
  try {
    const bike = await Bike.create({
      brand,
      model,
      price,
      status,
      picture: req.file.filename,
    });
    res.send({ status: "ok", bike });
  } catch (error) {
    res.send({ status: "error" });
    console.log(error);
  }
};
const getBikeController = async (req, res) => {
  try {
    const bikes = await Bike.find();
    res.send({ status: "ok", bikes });
  } catch (error) {
    res.send({ status: "error" });
    console.log(error);
  }
};
const bikesController = async (req, res) => {
  const id = req.params.id;
  try {
    const bikeData = await Bike.findById(id);
    res.send(bikeData);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving bike data");
  }
};
const removeItemController = async (req, res) => {
  const bikeId = req.params.bikeId;
  const userEmail = req.params.userEmail;

  try {
    // Update the user's cart by pulling the specified bikeId
    const result = await Details.updateOne(
      { email: userEmail },
      { $pull: { cart: { bikeId: bikeId } } }
    );

    // Check if the update was successful
    if (result.nModified === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Bike not found in the cart" });
    }

    // Send a success response
    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error" });
  }
};
const handlesubtractController = async (req, res) => {
  const bikeId = req.params.bikeId;
  const userEmail = req.params.userEmail;

  try {
    const user = await Details.findOne({ email: userEmail });

    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    const isBikeInCartIndex = user.cart.findIndex(
      (cartItem) => cartItem.bikeId.toString() === bikeId.toString()
    );

    if (isBikeInCartIndex !== -1) {
      // Decrement the quantity if it's greater than 0
      if (user.cart[isBikeInCartIndex].quantity > 0) {
        user.cart[isBikeInCartIndex].quantity -= 1;

        // Remove the item from the cart if the quantity becomes 0
        if (user.cart[isBikeInCartIndex].quantity === 0) {
          user.cart.splice(isBikeInCartIndex, 1);
        }
      }
    }

    // Save the updated user document
    await user.save();

    // Send a success response
    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error" });
  }
};
const handleaddController = async (req, res) => {
  const bikeId = req.params.bikeId;
  const userEmail = req.params.userEmail;

  try {
    const user = await Details.findOne({ email: userEmail });

    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    const index = user.cart.findIndex(
      (cartItem) => cartItem.bikeId.toString() === bikeId
    );
    // Increment the quantity
    if (index !== -1) {
      // If the bike is already in the cart, update the quantity
      user.cart[index].quantity += 1;
    }

    // Save the updated user document
    await user.save();

    // Send a success response
    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error" });
  }
};
const bikesinfoController = (req, res) => {
  const id = req.params.id;
  Bike.findByIdAndDelete(id)
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete bike with ${id}. Maybe bike not found`,
        });
      } else {
        res.send({ status: "ok", message: "Bike deleted successfully" });
      }
    })
    .catch((err) => {
      res.status(500).send({ message: "Error deleting bike" });
    });
};
const bikeInfoController = async (req, res) => {
  const id = req.params.id;
  try {
    // Find the existing bike
    const existingBike = await Bike.findById(id);

    // Construct the update object with only the fields that are provided in the request
    const updateFields = {};
    if (req.body.brand) {
      updateFields.brand = req.body.brand;
    }
    if (req.body.model) {
      updateFields.model = req.body.model;
    }
    if (req.body.price) {
      updateFields.price = req.body.price;
    }
    if (req.file) {
      updateFields.picture = req.file.buffer; // Update picture only if a new file is provided
    }

    // Merge the existing bike data with the updateFields
    const updatedBike = { ...existingBike._doc, ...updateFields };

    // Perform the update
    const updatedData = await Bike.findByIdAndUpdate(id, updatedBike, {
      new: true,
    });

    if (!updatedData) {
      res.status(404).send({
        message: `Cannot update bike with id ${id}. Maybe bike not found`,
      });
    } else {
      res.send(updatedData);
    }
  } catch (error) {
    console.error("Error updating bike:", error);
    res.status(500).send({ message: "Error updating bike information" });
  }
};
module.exports = {
  addBikeController,
  getBikeController,
  bikesController,
  removeItemController,
  handlesubtractController,
  handleaddController,
  bikesinfoController,
  bikeInfoController,
};
