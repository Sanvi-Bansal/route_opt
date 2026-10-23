const Stop = require('../models/Stop');

// GET /api/stops
async function getStops(req, res) {
  try {
    const filter = { user: req.user._id };
    if (req.query.setName) filter.setName = req.query.setName;
    const stops = await Stop.find(filter).sort({ createdAt: 1 });
    res.json(stops);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch stops' });
  }
}

// GET /api/stops/sets/list  (before /:id patterns)
async function listStopSets(req, res) {
  try {
    const stops = await Stop.find({
      user: req.user._id,
      setName: { $ne: null, $exists: true },
    });
    const sets = {};
    for (const s of stops) {
      if (!sets[s.setName]) sets[s.setName] = [];
      sets[s.setName].push({
        _id: s._id,
        name: s.name,
        lat: s.lat,
        lng: s.lng,
      });
    }
    res.json(sets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to list sets' });
  }
}

// POST /api/stops/sets
async function saveStopSet(req, res) {
  try {
    const { name, stops } = req.body;
    if (!name || !Array.isArray(stops) || stops.length === 0) {
      return res.status(400).json({ message: 'name and non-empty stops array required' });
    }
    await Stop.deleteMany({ user: req.user._id, setName: name });
    const docs = stops.map((s) => ({
      user: req.user._id,
      name: String(s.name).trim(),
      lat: Number(s.lat),
      lng: Number(s.lng),
      setName: name,
    }));
    const created = await Stop.insertMany(docs);
    res.status(201).json({ name, stops: created });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to save set' });
  }
}

// DELETE /api/stops/sets/:name
async function deleteStopSet(req, res) {
  try {
    const result = await Stop.deleteMany({
      user: req.user._id,
      setName: req.params.name,
    });
    res.json({ message: 'Set deleted', deletedCount: result.deletedCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete set' });
  }
}

// POST /api/stops
async function createStop(req, res) {
  try {
    const { name, lat, lng, setName } = req.body;
    if (!name || lat === undefined || lng === undefined) {
      return res.status(400).json({ message: 'name, lat, lng are required' });
    }
    const latN = Number(lat);
    const lngN = Number(lng);
    if (isNaN(latN) || isNaN(lngN) || latN < -90 || latN > 90 || lngN < -180 || lngN > 180) {
      return res.status(400).json({ message: 'Invalid coordinates' });
    }
    const stop = await Stop.create({
      user: req.user._id,
      name: String(name).trim(),
      lat: latN,
      lng: lngN,
      setName: setName || null,
    });
    res.status(201).json(stop);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create stop' });
  }
}

// PUT /api/stops/:id
async function updateStop(req, res) {
  try {
    const stop = await Stop.findOne({ _id: req.params.id, user: req.user._id });
    if (!stop) return res.status(404).json({ message: 'Stop not found' });
    const { name, lat, lng, setName } = req.body;
    if (name !== undefined) stop.name = String(name).trim();
    if (lat !== undefined) {
      const latN = Number(lat);
      if (isNaN(latN) || latN < -90 || latN > 90) {
        return res.status(400).json({ message: 'Invalid latitude' });
      }
      stop.lat = latN;
    }
    if (lng !== undefined) {
      const lngN = Number(lng);
      if (isNaN(lngN) || lngN < -180 || lngN > 180) {
        return res.status(400).json({ message: 'Invalid longitude' });
      }
      stop.lng = lngN;
    }
    if (setName !== undefined) stop.setName = setName || null;
    await stop.save();
    res.json(stop);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update stop' });
  }
}

// DELETE /api/stops/:id
async function deleteStop(req, res) {
  try {
    const stop = await Stop.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!stop) return res.status(404).json({ message: 'Stop not found' });
    res.json({ message: 'Stop deleted', id: stop._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete stop' });
  }
}

// DELETE /api/stops
async function clearStops(req, res) {
  try {
    const filter = { user: req.user._id };
    if (req.query.setName) filter.setName = req.query.setName;
    const result = await Stop.deleteMany(filter);
    res.json({ message: 'Stops cleared', deletedCount: result.deletedCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to clear stops' });
  }
}

module.exports = {
  getStops,
  listStopSets,
  saveStopSet,
  deleteStopSet,
  createStop,
  updateStop,
  deleteStop,
  clearStops,
};
