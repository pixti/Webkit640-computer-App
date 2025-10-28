const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Post = sequelize.define('Post', {
        title: { type: DataTypes.STRING, allowNull: false },
        content: { type: DataTypes.TEXT, allowNull: false },
        viewCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    });

    Post.associate = (models) => {
        Post.belongsTo(models.User, { foreignKey: 'userId' });
        // [최종 수정] Quote -> Estimate 로 변경했습니다.
        Post.belongsTo(models.Estimate, { foreignKey: 'estimateId', allowNull: true });
        Post.belongsTo(models.BoardType, { foreignKey: 'boardTypeId' });
        Post.hasMany(models.Comment, { foreignKey: 'postId', onDelete: 'CASCADE' });
    };

    return Post;
};