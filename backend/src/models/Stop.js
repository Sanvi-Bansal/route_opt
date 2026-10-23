const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    lat: { type: Number, required: true, min: -90, max: 90 },
    lng: { type: Number, required: true, min: -180, max: 180 },
    setName: { type: String, default: null, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Stop', stopSchema);
