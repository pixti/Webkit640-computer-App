const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Comment = sequelize.define('Comment', {
        content: { type: DataTypes.TEXT, allowNull: false },
    });

    Comment.associate = (models) => {
        Comment.belongsTo(models.User, { foreignKey: 'userId' });
        Comment.belongsTo(models.Post, { foreignKey: 'postId' });
    };

    return Comment;
};