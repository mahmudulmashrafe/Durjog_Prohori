const mongoose = require('mongoose');

const earthquakeSchema = new mongoose.Schema({
  magnitude: Number,
  place: String,
  time: Number,
  latitude: Number,
  longitude: Number,
  depth: Number,
  url: String,
  fetchedAt: {
    type: Date,
    default: Date.now
  },
  felt: Number,              // Number of "felt" reports
  cdi: Number,               // Community Decimal Intensity
  mmi: Number,               // Modified Mercalli Intensity
  alert: String,             // Alert level (green, yellow, orange, red)
  status: String,            // Status of the event (reviewed, automatic)
  tsunami: Number,           // Tsunami warning (1 if a tsunami warning was issued)
  sig: Number,               // Significance of the event (based on magnitude, felt reports)
  title: String,             // Title/summary of the event
  location: {                // GeoJSON point
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },
  isVisible: {
    type: Number,
    default: 1
  }
}, { timestamps: true });

// Create a 2dsphere index on the location field
earthquakeSchema.index({ location: '2dsphere' });

// Virtual property for a readable date
earthquakeSchema.virtual('date').get(function() {
  return new Date(this.time).toLocaleString();
});

// Middleware to set the location coordinates before saving
earthquakeSchema.pre('save', function(next) {
  if (this.longitude && this.latitude) {
    this.location.coordinates = [this.longitude, this.latitude];
  }
  next();
});

const Earthquake = mongoose.model('Earthquake', earthquakeSchema);

module.exports = Earthquake; 