const mongoose = require('mongoose')

const CorrectionSchema = new mongoose.Schema({
  entryId:     { type: String, required: true },  // formData entry id
  field:       String,
  correction:  String,
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verified:    { type: Boolean, default: false },
}, { timestamps: true })

module.exports = mongoose.model('Correction', CorrectionSchema)
