module.exports = (sequelize, DataTypes) => {
    const EmergencyLog = sequelize.define('EmergencyLog', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        user_id: { type: DataTypes.INTEGER, allowNull: false },
        type: {
            type: DataTypes.ENUM('police', 'ambulance', 'fire', 'women_helpline', 'disaster_sos'),
            allowNull: false
        },
        latitude: { type: DataTypes.FLOAT },
        longitude: { type: DataTypes.FLOAT },
        timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    }, {
        tableName: 'emergency_logs',
        timestamps: false
    });

    EmergencyLog.associate = (models) => {
        EmergencyLog.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    };

    return EmergencyLog;
};
