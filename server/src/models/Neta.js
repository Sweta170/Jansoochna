const mongoose = require('mongoose')

const PromiseSchema = new mongoose.Schema({
  title:  { type: String, required: true },
  status: { type: String, enum: ['done', 'partial', 'notdone'], default: 'notdone' }
}, { _id: false })

const NetaSchema = new mongoose.Schema({
  name:              { type: String, required: true },
  constituency:      { type: String, required: true }, // e.g., Ward 42
  pincodes:          [{ type: String }],
  party:             { type: String },
  attendancePercent: { type: Number, default: 0 },
  allocatedFunds:    { type: Number, default: 0 },
  spentFunds:        { type: Number, default: 0 },
  promises:          [PromiseSchema],
  photoUrl:          { type: String, default: '' },
  contact: {
    phone:  { type: String },
    office: { type: String }
  }
}, { timestamps: true })

module.exports = mongoose.model('Neta', NetaSchema)
