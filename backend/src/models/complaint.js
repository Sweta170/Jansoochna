module.exports = (sequelize, DataTypes) => {
  const Complaint = sequelize.define('Complaint', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING },
    description: { type: DataTypes.TEXT },
    category_id: { type: DataTypes.INTEGER },
    reporter_id: { type: DataTypes.INTEGER },
    location: { type: DataTypes.STRING },
    latitude: { type: DataTypes.FLOAT, allowNull: true },
    longitude: { type: DataTypes.FLOAT, allowNull: true },
    status: { type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'), defaultValue: 'open' },
    priority_score: { type: DataTypes.FLOAT },
    resolved_at: { type: DataTypes.DATE, allowNull: true },
    resolution_image_url: { type: DataTypes.STRING, allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE },
    department_id: { type: DataTypes.INTEGER },
    verification_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    verified_by: { type: DataTypes.TEXT, defaultValue: '[]' }, // JSON array of user IDs
    is_duplicate: { type: DataTypes.BOOLEAN, defaultValue: false },
    parent_complaint_id: { type: DataTypes.INTEGER, allowNull: true },
    is_anonymous: { type: DataTypes.BOOLEAN, defaultValue: false },
    sla_deadline: { type: DataTypes.DATE, allowNull: true },
    status_changed_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    rating: { type: DataTypes.INTEGER, allowNull: true },
    feedback: { type: DataTypes.TEXT, allowNull: true },
    rated_at: { type: DataTypes.DATE, allowNull: true },
    timeline: { type: DataTypes.TEXT, defaultValue: '[]' } // Array of { stage, updatedAt, updatedBy }
  }, {
    tableName: 'complaints',
    timestamps: false
  });

  Complaint.associate = (models) => {
    Complaint.belongsTo(models.Category, { foreignKey: 'category_id', as: 'category' });
    Complaint.belongsTo(models.User, { foreignKey: 'reporter_id', as: 'reporter' });
    Complaint.hasMany(models.Comment, { foreignKey: 'complaint_id', as: 'comments' });
    Complaint.hasMany(models.Upvote, { foreignKey: 'complaint_id', as: 'upvotes' });
    Complaint.hasOne(models.AISummary, { foreignKey: 'complaint_id', as: 'ai_summary' });
    Complaint.belongsTo(models.Department, { foreignKey: 'department_id', as: 'department' });
    Complaint.belongsTo(models.Complaint, { foreignKey: 'parent_complaint_id', as: 'parent' });
  };

  return Complaint;
};
