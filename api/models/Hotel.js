const mongoose = require('mongoose');

const HotelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    pricePerNight: { type: Number, required: true },
    rating: { type: Number, required: true },
    image: { type: String, required: true },
});

const Hotel = mongoose.model('Hotel', HotelSchema);

module.exports = Hotel;
