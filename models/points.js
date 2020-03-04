const mongoose = require("../config/database");

const pointsSchema = new mongoose.Schema({
  name: String,
  date: String,
    markerImageArray: [String],
    tags: [String],
  location: {
    type: {
      type: String, 
      enum: ['Point'], 
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
