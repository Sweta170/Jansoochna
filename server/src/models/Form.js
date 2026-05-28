const mongoose = require('mongoose')

const DocumentSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  nameHindi: { type: String, required: true },
  note:      { type: String, default: '' }
}, { _id: false })

const OfficeSchema = new mongoose.Schema({
  type:            { type: String },
  typeHindi:       { type: String },
  counter:         { type: String },
  hours:           { type: String },
  onlineUrl:       { type: String },
  onlineAvailable: { type: Boolean, default: false }
}, { _id: false })

const FormSchema = new mongoose.Schema({
  slug:              { type: String, required: true, unique: true, index: true },
  title:             { type: String, required: true },
  state:             { type: String, required: true }, // e.g. punjab, bihar, all
  category:          { type: String, required: true }, // e.g. identity, income, ration
  description:       { type: String },
  steps:             [{ type: String }],
  requiredDocuments: [DocumentSchema],
  fees:              { type: String },
  processingTime:    { type: String },
  officeAddress:     { type: String },
  downloadUrl:       { type: String },
  
  // Backward compatibility fields
  nameHindi:    { type: String },
  categoryIcon: { type: String },
  helpline:     { type: String },
  office:       OfficeSchema
}, { timestamps: true })

module.exports = mongoose.model('Form', FormSchema)
