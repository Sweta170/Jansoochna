const mongoose = require('mongoose')

const PostSchema = new mongoose.Schema({
  body:    { type: String, required: true, maxlength: 200 },
  type:    { type: String, enum: ['notice', 'outage', 'alert', 'market'], default: 'notice' },
  pincode: { type: String, required: true },
  author:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true })

PostSchema.index({ pincode: 1, createdAt: -1 })

module.exports = mongoose.model('Post', PostSchema)
