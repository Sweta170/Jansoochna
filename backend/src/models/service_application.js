module.exports = (sequelize, DataTypes) => {
    const ServiceApplication = sequelize.define('ServiceApplication', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        user_id: { type: DataTypes.INTEGER, allowNull: false },
        service_type: {
            type: DataTypes.ENUM('property_tax', 'water_bill', 'birth_certificate', 'death_certificate'),
            allowNull: false
        },
        form_data: { type: DataTypes.TEXT, defaultValue: '{}' }, // Store JSON as string
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected'),
            defaultValue: 'pending'
        },
        submitted_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        processed_at: { type: DataTypes.DATE, allowNull: true }
    }, {
        tableName: 'service_applications',
        timestamps: false
    });

    ServiceApplication.associate = (models) => {
        ServiceApplication.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    };

    return ServiceApplication;
};
