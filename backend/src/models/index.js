const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

// Import model factories
const RoleModel = require('./role');
const UserModel = require('./user');
const CategoryModel = require('./category');
const ComplaintModel = require('./complaint');
const CommentModel = require('./comment');
const UpvoteModel = require('./upvote');
const AssignmentModel = require('./assignment');
const AISummaryModel = require('./ai_summary');
const NotificationModel = require('./notification');
const DepartmentModel = require('./department');
const ServiceApplicationModel = require('./service_application');
const EmergencyLogModel = require('./emergency_log');

// Initialize models
const Role = RoleModel(sequelize, DataTypes);
const User = UserModel(sequelize, DataTypes);
const Category = CategoryModel(sequelize, DataTypes);
const Complaint = ComplaintModel(sequelize, DataTypes);
const Comment = CommentModel(sequelize, DataTypes);
const Upvote = UpvoteModel(sequelize, DataTypes);
const Assignment = AssignmentModel(sequelize, DataTypes);
const AISummary = AISummaryModel(sequelize, DataTypes);
const Notification = NotificationModel(sequelize, DataTypes);
const Department = DepartmentModel(sequelize, DataTypes);
const ServiceApplication = ServiceApplicationModel(sequelize, DataTypes);
const EmergencyLog = EmergencyLogModel(sequelize, DataTypes);

// Group for associations
const models = {
  Role,
  User,
  Category,
  Complaint,
  Comment,
  Upvote,
  Assignment,
  AISummary,
  Notification,
  Department,
  ServiceApplication,
  EmergencyLog
};

// Setup associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = {
  sequelize,
  ...models
};
