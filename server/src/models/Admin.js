const mongoose = require('mongoose')

const AdminSchema = new mongoose.Schema({
  email:       { type: String, required: true, unique: true },
  password:    { type: String, required: true },
  name:        String,
  role:        { type: String, enum: ['superadmin', 'state_admin', 'district_admin'], default: 'district_admin' },
  state:       String,       // null for superadmin
  district:    String,       // null for state_admin
  isActive:    { type: Boolean, default: true },
  lastLogin:   Date,
}, { timestamps: true })

module.exports = mongoose.model('Admin', AdminSchema)
