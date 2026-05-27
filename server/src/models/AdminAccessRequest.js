const mongoose = require('mongoose')

const AdminAccessRequestSchema = new mongoose.Schema({
  full_name: { 
    type: String, 
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  designation: { 
    type: String, 
    required: true,
    trim: true
  },
  state: { 
    type: String, 
    required: true,
    trim: true
  },
  district: { 
    type: String, 
    required: true,
    trim: true
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  reason: {
    type: String,
    trim: true
  },
  requested_at: { 
    type: Date, 
    default: Date.now 
  },
  reviewed_at: { 
    type: Date 
  },
  reviewed_by: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Admin' 
  }
}, { timestamps: true })

module.exports = mongoose.model('AdminAccessRequest', AdminAccessRequestSchema)
