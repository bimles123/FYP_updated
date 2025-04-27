const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['active', 'cancelled'], default: 'active' }
});

module.exports = mongoose.model('Booking', BookingSchema);
