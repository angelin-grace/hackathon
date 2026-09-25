const mongoose = require('mongoose');

const skillOfferedSchema = new mongoose.Schema({
  skill: { type: String, required: true },
  category: { type: String, default: 'General' },
  proficiency: { type: String, enum: ['Beginner', 'Intermediate', 'Expert'], default: 'Intermediate' }
});

const skillRequiredSchema = new mongoose.Schema({
  skill: { type: String, required: true },
  category: { type: String, default: 'General' },
  urgency: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' }
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    bio: { type: String, default: '' },
    availability: { type: String, enum: ['Weekdays', 'Weekends', 'Evenings', 'Flexible'], default: 'Flexible' },
    skillsOffered: [skillOfferedSchema],
    skillsRequired: [skillRequiredSchema],
    avgRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Helper method to omit password when converting to JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
