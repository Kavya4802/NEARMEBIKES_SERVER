const mongoose = require("mongoose");
const BikesSchema = new mongoose.Schema({
  brand: {
    type: String,
  },
  model: {
    type: String,
  },
  price: {
    type: Number,
  },
  status: {
    type: String,
  },
  picture: {
    // data:Buffer,
    // contentType:String
    type: String,
  },
});
module.exports = mongoose.model("Bike", BikesSchema);
