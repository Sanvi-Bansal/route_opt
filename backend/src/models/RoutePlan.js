const mongoose = require('mongoose');

const stopSnapshotSchema = new mongoose.Schema(
  {
    name: String,
    lat: Number,
    lng: Number,
  },
  { _id: false }
);

const routePlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    orderedStops: [stopSnapshotSchema],
    order: [Number],
    stopCount: { type: Number, required: true },
    totalKm: { type: Number, required: true },
    fuelLitres: { type: Number, default: 0 },
    fuelCost: { type: Number, default: 0 },
    mileage: { type: Number, default: 15 },
    fuelPrice: { type: Number, default: 100 },
    stopNames: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RoutePlan', routePlanSchema);
