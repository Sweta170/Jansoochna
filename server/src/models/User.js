const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone:      { type: String },
  name:       { type: String, default: 'Nagarik' },
  pincode:    { type: String, required: true },
  area:       { type: String, default: '' },
  city:       { type: String, default: '' },
  state:      { type: String, default: '' },
  ward:       { type: String, default: '', trim: true },
  district:   { type: String, default: '', trim: true },
  location: {
    address:  { type: String, default: '' },
    city:     { type: String, default: '' },
    district: { type: String, default: '' },
    state:    { type: String, default: '' },
    pincode:  { type: String, default: '' },
    ward:     { type: String, default: '' },
    country:  { type: String, default: 'India' },
  },
  points:     { type: Number, default: 0 },
  badge:      { type: String, default: 'Nagarik' },  // Nagarik → Sewak → Jan Nayak → Pratinidhi
  otp:        { type: String },
  otpExpiry:  { type: Date },
}, { timestamps: true })

module.exports = mongoose.model('User', UserSchema)
