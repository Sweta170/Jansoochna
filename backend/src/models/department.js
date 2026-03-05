module.exports = (sequelize, DataTypes) => {
    const Department = sequelize.define('Department', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false, unique: true },
        description: { type: DataTypes.TEXT }
    }, {
        tableName: 'departments',
        timestamps: false
    });

    Department.associate = (models) => {
        Department.hasMany(models.User, { foreignKey: 'department_id', as: 'officials' });
        Department.hasMany(models.Complaint, { foreignKey: 'department_id', as: 'complaints' });
    };

    return Department;
};
