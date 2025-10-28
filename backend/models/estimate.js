const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Estimate = sequelize.define('Estimate', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });

    Estimate.associate = (models) => {
        Estimate.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
        Estimate.hasMany(models.EstimateItem, { foreignKey: 'estimateId', onDelete: 'CASCADE' });

        // [최종 수정] onDelete: 'CASCADE' 옵션을 추가합니다.
        Estimate.hasOne(models.Quotation, {
            foreignKey: 'estimateId',
            onDelete: 'CASCADE'
        });
    };

    return Estimate;
};