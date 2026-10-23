const RoutePlan = require('../models/RoutePlan');
const { optimize } = require('../utils/optimizer');

/**
 * POST /api/routes/optimize
 * Body: { stops: [{name, lat, lng}], mileage?, fuelPrice?, save?: boolean }
 */
async function optimizeRoute(req, res) {
  try {
    const { stops, mileage = 15, fuelPrice = 100, save = true } = req.body;

    if (!Array.isArray(stops) || stops.length < 2) {
      return res.status(400).json({ message: 'At least 2 stops are required' });
    }
    for (const s of stops) {
      if (typeof s.lat !== 'number' || typeof s.lng !== 'number') {
        return res.status(400).json({ message: 'Each stop needs numeric lat and lng' });
      }
    }

    const result = optimize(stops);
    const fuelLitres = result.totalKm / Number(mileage);
    const fuelCost = fuelLitres * Number(fuelPrice);
    const stopNames = result.order
      .slice(0, -1)
      .map((idx) => stops[idx].name || `Stop ${idx + 1}`)
      .join(' → ');

    let plan = null;
    if (save) {
      plan = await RoutePlan.create({
        user: req.user._id,
        orderedStops: result.orderedStops,
        order: result.order,
        stopCount: stops.length,
        totalKm: Number(result.totalKm.toFixed(4)),
        fuelLitres: Number(fuelLitres.toFixed(4)),
        fuelCost: Number(fuelCost.toFixed(2)),
        mileage: Number(mileage),
        fuelPrice: Number(fuelPrice),
        stopNames,
      });
    }

    res.json({
      order: result.order,
      totalKm: result.totalKm,
      matrix: result.matrix,
      orderedStops: result.orderedStops,
      fuelLitres,
      fuelCost,
      stopNames,
      plan: plan ? { id: plan._id, createdAt: plan.createdAt } : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Optimization failed' });
  }
}

// GET /api/routes
async function getRoutePlans(req, res) {
  try {
    const plans = await RoutePlan.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(plans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch route plans' });
  }
}

// GET /api/routes/stats/summary
async function getRouteStatsSummary(req, res) {
  try {
    const plans = await RoutePlan.find({ user: req.user._id });
    const totalSpent = plans.reduce((s, p) => s + (p.fuelCost || 0), 0);
    const totalKm = plans.reduce((s, p) => s + (p.totalKm || 0), 0);
    res.json({ totalSpent, totalKm, runCount: plans.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to compute stats' });
  }
}

// PUT /api/routes/:id - Update a saved route plan
async function updateRoutePlan(req, res) {
  try {
    const { mileage, fuelPrice } = req.body;

    const plan = await RoutePlan.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!plan) {
      return res.status(404).json({
        message: 'Route plan not found',
      });
    }

    if (mileage !== undefined) {
      if (
        typeof mileage !== 'number' ||
        !Number.isFinite(mileage) ||
        mileage <= 0
      ) {
        return res.status(400).json({
          message: 'Mileage must be a positive number',
        });
      }

      plan.mileage = mileage;
    }

    if (fuelPrice !== undefined) {
      if (
        typeof fuelPrice !== 'number' ||
        !Number.isFinite(fuelPrice) ||
        fuelPrice < 0
      ) {
        return res.status(400).json({
          message: 'Fuel price must be a non-negative number',
        });
      }

      plan.fuelPrice = fuelPrice;
    }

    if (mileage === undefined && fuelPrice === undefined) {
      return res.status(400).json({
        message: 'Provide mileage or fuelPrice to update',
      });
    }

    // Recalculate fuel usage and cost.
    plan.fuelLitres = Number(
      (plan.totalKm / plan.mileage).toFixed(4)
    );

    plan.fuelCost = Number(
      (plan.fuelLitres * plan.fuelPrice).toFixed(2)
    );

    await plan.save();

    res.json({
      message: 'Route plan updated successfully',
      plan,
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid route plan ID',
      });
    }

    console.error(err);
    res.status(500).json({
      message: 'Failed to update route plan',
    });
  }
}

// GET /api/routes/:id
async function getRoutePlan(req, res) {
  try {
    const plan = await RoutePlan.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!plan) return res.status(404).json({ message: 'Route plan not found' });
    res.json(plan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch route plan' });
  }
}

// DELETE /api/routes/:id
async function deleteRoutePlan(req, res) {
  try {
    const plan = await RoutePlan.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!plan) return res.status(404).json({ message: 'Route plan not found' });
    res.json({ message: 'Route plan deleted', id: plan._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete route plan' });
  }
}

// DELETE /api/routes
async function clearRouteHistory(req, res) {
  try {
    const result = await RoutePlan.deleteMany({ user: req.user._id });
    res.json({ message: 'History cleared', deletedCount: result.deletedCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to clear history' });
  }
}

module.exports = {
  optimizeRoute,
  getRoutePlans,
  getRouteStatsSummary,
  updateRoutePlan,
  getRoutePlan,
  deleteRoutePlan,
  clearRouteHistory,
};
