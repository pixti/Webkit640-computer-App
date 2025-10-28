const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Part = sequelize.define('Part', {
        modelName: { type: DataTypes.STRING, allowNull: false },
        manufacturer: { type: DataTypes.STRING },
        spec: { type: DataTypes.JSON },
        imageUrl: { type: DataTypes.STRING(1024) },
    });

    Part.associate = (models) => {
        Part.belongsTo(models.Category, { foreignKey: 'categoryId' });
        Part.hasMany(models.Price, { foreignKey: 'partId' });
        Part.hasMany(models.EstimateItem, { foreignKey: 'partId' }); // 수정
    };

    return Part;
};