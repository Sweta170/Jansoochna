module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    role_id: { type: DataTypes.INTEGER },
    points: { type: DataTypes.INTEGER, defaultValue: 0 },
    rank: { type: DataTypes.STRING, defaultValue: 'Citizen' },
    department_id: { type: DataTypes.INTEGER },
    status: { type: DataTypes.STRING, defaultValue: 'active' },
    expo_push_token: { type: DataTypes.STRING }
  }, {
    tableName: 'users',
    timestamps: true, // Enabling timestamps to track updates
    underscored: true
  });

  User.associate = (models) => {
    User.belongsTo(models.Role, { foreignKey: 'role_id', as: 'role' });
    User.belongsTo(models.Department, { foreignKey: 'department_id', as: 'department' });
  };

  return User;
};
