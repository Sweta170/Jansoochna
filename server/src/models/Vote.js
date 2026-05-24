const mongoose = require('mongoose')

const VoteSchema = new mongoose.Schema({
  user:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issue: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue', required: true },
}, { timestamps: true })

VoteSchema.index({ user: 1, issue: 1 }, { unique: true })  // prevents duplicate votes

module.exports = mongoose.model('Vote', VoteSchema)
