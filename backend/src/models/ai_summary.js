module.exports = (sequelize, DataTypes) => {
  const AISummary = sequelize.define('AISummary', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    complaint_id: { type: DataTypes.INTEGER, allowNull: false },
    summary: { type: DataTypes.TEXT },
    model_version: { type: DataTypes.STRING }
  }, {
    tableName: 'ai_summaries',
    timestamps: false
  });

  AISummary.associate = (models) => {
    AISummary.belongsTo(models.Complaint, { foreignKey: 'complaint_id', as: 'complaint' });
  };

  return AISummary;
};
