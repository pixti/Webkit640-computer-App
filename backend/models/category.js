const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Category = sequelize.define('Category', {
        name: { type: DataTypes.STRING, allowNull: false, unique: true },
        slug: { type: DataTypes.STRING, allowNull: false, unique: true }
    });

    Category.associate = (models) => {
        Category.hasMany(models.Part, { foreignKey: 'categoryId' });
    };

    return Category;
};