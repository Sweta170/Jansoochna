module.exports = (sequelize, DataTypes) => {
  const Assignment = sequelize.define('Assignment', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    complaint_id: { type: DataTypes.INTEGER, allowNull: false },
    department_id: { type: DataTypes.INTEGER },
    assigned_to: { type: DataTypes.INTEGER }
  }, {
    tableName: 'assignments',
    timestamps: false
  });

  Assignment.associate = (models) => {
    Assignment.belongsTo(models.Complaint, { foreignKey: 'complaint_id', as: 'complaint' });
  };

  return Assignment;
};
