const mongoose = require('mongoose')

const NotificationSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:    { type: String, enum: ['issue_update','vote_milestone','badge_upgrade','petition_ready','admin_message'] },
  title:   String,
  body:    String,
  data:    mongoose.Schema.Types.Mixed,  // { issueId, etc. }
  read:    { type: Boolean, default: false },
}, { timestamps: true })

module.exports = mongoose.model('Notification', NotificationSchema)
