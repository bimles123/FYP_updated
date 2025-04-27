const mongoose = require('mongoose');

const HotelSchema = new mongoose.Schema({

  isDeleted: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },

  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  pricePerNight: {
    type: Number,
    required: true
  },
  stars: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true // This is the main cover image
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  media: [
    {
      type: {
        type: String,
        enum: ['image', 'video'],
        required: true
      },
      url: {
        type: String,
        required: true
      }
    }
  ]
}, { timestamps: true }); // Optional: adds createdAt and updatedAt

const Hotel = mongoose.model('Hotel', HotelSchema);

module.exports = Hotel;
