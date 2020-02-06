const mongoose = require("../database");

const pointsSchema = new mongoose.Schema({
  name: String,
  date: String,
    markerImageArray: [String],
    tags: [String],
  location: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
    username: String,
    approved: String
});

module.exports = mongoose.model('Points', pointsSchema)
