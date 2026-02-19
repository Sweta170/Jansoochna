module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    complaint_id: { type: DataTypes.INTEGER, allowNull: false },
    author_id: { type: DataTypes.INTEGER },
    body: { type: DataTypes.TEXT }
  }, {
    tableName: 'comments',
    timestamps: false
  });

  Comment.associate = (models) => {
    Comment.belongsTo(models.Complaint, { foreignKey: 'complaint_id', as: 'complaint' });
    Comment.belongsTo(models.User, { foreignKey: 'author_id', as: 'author' });
  };

  return Comment;
};
