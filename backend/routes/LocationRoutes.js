const express = require('express');
const Location = require('../models/location');
const router = express.Router();

// Create location (Point, Polygon, Circle)
router.post('/', async (req, res) => {
  try {
    const { name, type, location, center, radius } = req.body;
    const newLocation = new Location({ name, type, location, center, radius });
    await newLocation.save();
    res.status(201).json(newLocation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all locations
router.get('/', async (req, res) => {
  try {
    const locations = await Location.find();
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
