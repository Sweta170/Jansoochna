module.exports = (sequelize, DataTypes) => {
  const Upvote = sequelize.define('Upvote', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    complaint_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false }
  }, {
    tableName: 'upvotes',
    timestamps: false,
    indexes: [
      { unique: true, fields: ['complaint_id', 'user_id'] }
    ]
  });

  Upvote.associate = (models) => {
    Upvote.belongsTo(models.Complaint, { foreignKey: 'complaint_id', as: 'complaint' });
    Upvote.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return Upvote;
};
