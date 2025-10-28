const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const UserStatus = sequelize.define('UserStatus', {
        status: { type: DataTypes.STRING, allowNull: false, unique: true }
    });

    UserStatus.associate = (models) => {
        // UserStatus는 여러 User를 가질 수 있음
        UserStatus.hasMany(models.User, { foreignKey: 'statusId' });
    };

    return UserStatus;
};