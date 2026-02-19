module.exports = (sequelize, DataTypes) => {
    const Notification = sequelize.define('Notification', {
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM('status_change', 'new_comment', 'other'),
            defaultValue: 'other'
        },
        message: {
            type: DataTypes.STRING,
            allowNull: false
        },
        complaint_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        is_read: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        tableName: 'notifications',
        timestamps: true,
        underscored: true
    });

    Notification.associate = (models) => {
        Notification.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
        Notification.belongsTo(models.Complaint, { foreignKey: 'complaint_id', as: 'complaint' });
    };

    return Notification;
};
