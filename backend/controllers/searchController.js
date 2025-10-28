const db = require('../models');
// [수정] Comment 모델도 가져옵니다.
const { Part, Post, User, Category, Price, Comment } = db;
const { Op } = require('sequelize');

exports.combinedSearch = async (req, res) => {
    try {
        // [수정] 게시글 검색 필드를 위한 postSearchFields 파라미터 추가
        const { q, categoryId, minPrice, maxPrice, postSearchFields } = req.query;

        if (!q) return res.status(400).json({ message: '검색어를 입력해야 합니다.' });

        // --- 부품 검색 조건 (이전과 유사) ---
        const partWhere = { [Op.or]: [{ modelName: { [Op.like]: `%${q}%` } }, { manufacturer: { [Op.like]: `%${q}%` } }] };
        if (categoryId) partWhere.categoryId = categoryId;
        const priceWhere = {};
        if (minPrice) priceWhere.price = { ...priceWhere.price, [Op.gte]: Number(minPrice) };
        if (maxPrice) priceWhere.price = { ...priceWhere.price, [Op.lte]: Number(maxPrice) };

        // --- [신규] 게시글 검색 조건 동적 생성 ---
        const postWhereOr = [];
        const searchFields = postSearchFields ? postSearchFields.split(',') : ['title', 'content', 'author'];
        if (searchFields.includes('title')) postWhereOr.push({ title: { [Op.like]: `%${q}%` } });
        if (searchFields.includes('content')) postWhereOr.push({ content: { [Op.like]: `%${q}%` } });
        if (searchFields.includes('author')) postWhereOr.push({ '$User.nickname$': { [Op.like]: `%${q}%` } });
        const postWhere = postWhereOr.length > 0 ? { [Op.or]: postWhereOr } : {};

        const [partResults, postResults, commentResults] = await Promise.all([
            // 1. 부품 검색
            Part.findAll({
                where: partWhere,
                include: [Category, { model: Price, where: priceWhere, required: !!Object.keys(priceWhere).length }]
            }),
            // 2. 게시글 검색
            Post.findAll({
                where: postWhere,
                include: [{ model: User, attributes: ['nickname'] }]
            }),
            // 3. [신규] 댓글 검색
            Comment.findAll({
                where: { content: { [Op.like]: `%${q}%` } },
                include: [
                    { model: User, attributes: ['nickname'] },
                    // 댓글이 달린 원본 게시글 정보도 함께 가져옵니다.
                    { model: Post, attributes: ['id', 'title'] }
                ]
            })
        ]);

        res.status(200).json({
            parts: partResults,
            posts: postResults,
            comments: commentResults // [신규] 댓글 검색 결과 추가
        });

    } catch (error) {
        console.error("통합 검색 오류:", error);
        res.status(500).json({ message: '검색 중 서버 오류가 발생했습니다.' });
    }
};