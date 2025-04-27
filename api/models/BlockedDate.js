const mongoose = require('mongoose');

const BlockedDateSchema = new mongoose.Schema({
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  date: { type: Date, required: true }
});

module.exports = mongoose.model('BlockedDate', BlockedDateSchema);
