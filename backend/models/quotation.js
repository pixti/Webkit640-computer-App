const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Quotation = sequelize.define('Quotation', {
        isPublic: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        }
    });

    Quotation.associate = (models) => {
        Quotation.belongsTo(models.Estimate, { foreignKey: 'estimateId', onDelete: 'CASCADE' });
        Quotation.belongsTo(models.EstimateItem, { foreignKey: 'estimateItemId', onDelete: 'CASCADE' });
    };

    return Quotation;
};