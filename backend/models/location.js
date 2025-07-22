const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['Point', 'Polygon', 'Circle'], required: true },
  location: {
    type: {
      type: String, enum: ['Point', 'Polygon']
    },
    coordinates: []
  },
  center: {
    type: {
      type: String, enum: ['Point']
    },
    coordinates: [Number]
  },
  radius: Number,
  createdAt: { type: Date, default: Date.now }
});

// 2dsphere index for geospatial queries
locationSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Location', locationSchema);
