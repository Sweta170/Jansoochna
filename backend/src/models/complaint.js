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
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE }
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
  };

  return Complaint;
};
