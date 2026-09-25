const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    matchRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'MatchRequest', required: true },
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    stars: { type: Number, required: true, min: 1, max: 5 },
    feedback: { type: String, default: '', trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Rating', ratingSchema);
