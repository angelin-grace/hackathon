const mongoose = require('mongoose');

const matchRequestSchema = new mongoose.Schema(
  {
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    offeredSkill: { type: String, required: true, trim: true },
    requestedSkill: { type: String, required: true, trim: true },
    message: { type: String, default: '', trim: true },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected', 'Completed'],
      default: 'Pending'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('MatchRequest', matchRequestSchema);
