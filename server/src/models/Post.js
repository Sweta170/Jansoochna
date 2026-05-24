const mongoose = require('mongoose')

const PostSchema = new mongoose.Schema({
  body:    { type: String, required: true, maxlength: 200 },
  type:    { type: String, enum: ['notice', 'outage', 'alert', 'market', 'emergency'], default: 'notice' },
  pincode: { type: String, required: true },
  state:   { type: String, default: '' },
  district:{ type: String, default: '' },
  author:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reported:{ type: Number, default: 0 },
  hidden:  { type: Boolean, default: false },
}, { timestamps: true })

PostSchema.index({ pincode: 1, createdAt: -1 })

module.exports = mongoose.model('Post', PostSchema)
