const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  rating: {
    type: Number,
  },
  bikeId: {
    type: String,
  },
  description: {
    type: [String], // Change to an array of strings
    default: ['good'], // Set default as 'good'
  },
  userEmail: {
    type: [String], // Change to an array of strings
  },
  numReviews: {
    type: Number,
    default: 1,
  },
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
