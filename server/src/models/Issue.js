const mongoose = require('mongoose')

const IssueSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, required: true, minlength: 30 },
  category:    { type: String, enum: ['road', 'water', 'electricity', 'garbage', 'drainage', 'parks', 'streetlight', 'other'], required: true },
  status:      { type: String, enum: ['open', 'in_progress', 'resolved'], default: 'open' },
  location: {
    lat:     Number,
    lng:     Number,
    pincode: { type: String, required: true },
    address: String,
  },
  photoUrl:    String,
  voteCount:   { type: Number, default: 0 },
  author:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  petitionUrl: String,   // set when voteCount hits 50
  assignedTo:  { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  timeline: [{
    status:    String,
    note:      String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    date:      { type: Date, default: Date.now }
  }],
}, { timestamps: true })

IssueSchema.index({ 'location.pincode': 1, category: 1, status: 1 })

module.exports = mongoose.model('Issue', IssueSchema)
