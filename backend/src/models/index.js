const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const RoleModel = require('./role');
const UserModel = require('./user');
const CategoryModel = require('./category');
const ComplaintModel = require('./complaint');
const CommentModel = require('./comment');
const UpvoteModel = require('./upvote');
const AssignmentModel = require('./assignment');
const AISummaryModel = require('./ai_summary');
const NotificationModel = require('./notification');

const Role = RoleModel(sequelize, DataTypes);
const User = UserModel(sequelize, DataTypes);
const Category = CategoryModel(sequelize, DataTypes);
const Complaint = ComplaintModel(sequelize, DataTypes);
const Comment = CommentModel(sequelize, DataTypes);
const Upvote = UpvoteModel(sequelize, DataTypes);
const Assignment = AssignmentModel(sequelize, DataTypes);
const AISummary = AISummaryModel(sequelize, DataTypes);
const Notification = NotificationModel(sequelize, DataTypes);

// Setup associations
if (typeof User.associate === 'function') User.associate({ Role });
if (typeof Complaint.associate === 'function') Complaint.associate({ Category, User, Comment, Upvote, AISummary });
if (typeof Comment.associate === 'function') Comment.associate({ Complaint, User });
if (typeof Upvote.associate === 'function') Upvote.associate({ Complaint, User });
if (typeof Assignment.associate === 'function') Assignment.associate({ Complaint });
if (typeof AISummary.associate === 'function') AISummary.associate({ Complaint });
if (typeof Notification.associate === 'function') Notification.associate({ User, Complaint });

module.exports = {
  sequelize,
  Role,
  User,
  Category,
  Complaint,
  Comment,
  Upvote,
  Assignment,
  AISummary,
  Notification
};
