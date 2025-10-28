const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Price = sequelize.define('Price', {
        price: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        // 아래 두 필드가 반드시 있어야 합니다.
        storeName: {
            type: DataTypes.STRING,
        },
        url: {
            type: DataTypes.STRING(2048), // URL은 길 수 있으므로 넉넉하게
        },
    });

    Price.associate = (models) => {
        Price.belongsTo(models.Part, { foreignKey: 'partId' });
        Price.hasMany(models.EstimateItem, { foreignKey: 'priceId' });
    };

    return Price;
};