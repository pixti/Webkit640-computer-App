const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const BoardType = sequelize.define('BoardType', {
        name: { type: DataTypes.STRING, allowNull: false, unique: true },
        slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    });

    BoardType.associate = (models) => {
        BoardType.hasMany(models.Post, { foreignKey: 'boardTypeId' });
    };

    return BoardType;
};