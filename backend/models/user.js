const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        username: { type: DataTypes.STRING, allowNull: false, unique: true },
        password: { type: DataTypes.STRING, allowNull: false },
        nickname: { type: DataTypes.STRING, allowNull: false, unique: true },
        role: { type: DataTypes.STRING, defaultValue: 'user' }
    });

    User.associate = (models) => {
        User.belongsTo(models.UserStatus, { foreignKey: 'statusId' });
        User.hasMany(models.Estimate, { foreignKey: 'userId' }); // 수정
        User.hasMany(models.Post, { foreignKey: 'userId' });
        User.hasMany(models.Comment, { foreignKey: 'userId' });
    };

    User.beforeCreate(async (user) => {
        if (user.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
        }
    });

    return User;
};