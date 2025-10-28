const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const EstimateItem = sequelize.define('EstimateItem', {
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
    });

    EstimateItem.associate = (models) => {
        EstimateItem.belongsTo(models.Estimate, { foreignKey: 'estimateId' });
        EstimateItem.belongsTo(models.Part, { foreignKey: 'partId', onDelete: 'SET NULL' });
        EstimateItem.belongsTo(models.Price, { foreignKey: 'priceId', onDelete: 'SET NULL' });
        // EstimateItem은 하나의 Quotation을 가질 수 있음 (1:1 관계)
        EstimateItem.hasOne(models.Quotation, { foreignKey: 'estimateItemId' });
    };
    return EstimateItem;
};