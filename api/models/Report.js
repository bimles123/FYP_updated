const mongoose = require('mongoose');
const { Schema } = mongoose;

const ReportSchema = new Schema({
  hotel: { type: Schema.Types.ObjectId, ref: 'Hotel' },
  reporter: { type: Schema.Types.ObjectId, ref: 'User' },
  reason: String,
  details: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', ReportSchema);
