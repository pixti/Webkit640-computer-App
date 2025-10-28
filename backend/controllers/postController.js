const db = require('../models');
const { Post, User, BoardType } = db; // User와 BoardType 모델도 함께 가져옵니다.

/**
 * 1. 게시글 생성 (POST /api/posts)
 * 프론트에서 boardTypeId (숫자)를 보내줍니다.
 */
exports.createPost = async (req, res) => {
    try {
        // [수정] 프론트에서 quoteId 대신 estimateId를 보낼 가능성을 대비
        const { title, content, boardTypeId, quoteId, estimateId } = req.body;
        const userId = req.user.id;

        if (!title || !content || !boardTypeId) {
            return res.status(400).json({ message: '제목, 내용, 게시판 선택은 필수입니다.'});
        }

        const newPost = await Post.create({
            title,
            content,
            boardTypeId,
            userId,
            // [수정] estimateId가 있으면 그것을 사용하고, 없으면 예전 방식의 quoteId를 사용
            estimateId: estimateId || quoteId || null,
        });

        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ message: '서버 오류', error: error.message });
    }
};

/**
 * 2. 게시글 목록 조회 (GET /api/posts?boardSlug=...)
 * 프론트에서 boardSlug (영문)를 보내줍니다.
 */
exports.getPosts = async (req, res) => {
    try {
        const { boardSlug } = req.query;
        let whereClause = {};

        if (boardSlug && boardSlug !== 'all') {
            const boardType = await BoardType.findOne({ where: { slug: boardSlug } });
            if (boardType) {
                whereClause.boardTypeId = boardType.id;
            } else {
                return res.status(200).json([]); // 해당 slug의 게시판이 없으면 빈 배열 반환
            }
        }

        const posts = await Post.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
            include: [{ model: User, attributes: ['nickname'] }],
        });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: '서버 오류', error: error.message });
    }
};

/**
 * 3. 특정 게시글 상세 조회 (GET /api/posts/:id)
 */
exports.getPostById = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post.findByPk(id, {
            include: [
                { model: User, attributes: ['nickname'] },
                { model: BoardType, attributes: ['name', 'slug'] } // 게시판의 이름과 slug도 함께 전송
            ]
        });
        if (!post) return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });

        // 조회수 증가
        post.viewCount += 1;
        await post.save({ fields: ['viewCount'] }); // viewCount 필드만 업데이트

        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: '서버 오류', error: error.message });
    }
};

/**
 * 4. 게시글 수정 (PUT /api/posts/:id)
 */
exports.updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, boardTypeId } = req.body;
        const post = await Post.findByPk(id);

        if (!post) return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        if (post.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: '수정 권한이 없습니다.' });
        }

        post.title = title;
        post.content = content;
        post.boardTypeId = boardTypeId;
        await post.save();

        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: '서버 오류' });
    }
};

/**
 * 5. 게시글 삭제 (DELETE /api/posts/:id)
 */
exports.deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post.findByPk(id);

        if (!post) return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        if (post.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: '삭제 권한이 없습니다.' });
        }

        await post.destroy();
        res.status(200).json({ message: '게시글이 삭제되었습니다.' });
    } catch (error) {
        res.status(500).json({ message: '서버 오류' });
    }
};


/**
 * 6. 홈페이지용: 각 게시판별 최신글 미리보기 (GET /api/posts/homepage)
 */
exports.getHomepagePosts = async (req, res) => {
    try {
        const boardTypes = await BoardType.findAll();
        const limit = 3;
        const results = {};
        for (const boardType of boardTypes) {
            const posts = await Post.findAll({
                where: { boardTypeId: boardType.id },
                order: [['createdAt', 'DESC']],
                limit: limit,
                include: { model: User, attributes: ['nickname'] },
            });
            results[boardType.name] = {
                name: boardType.name,
                slug: boardType.slug,
                posts: posts,
            };
        }
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: '서버 오류' });
    }
};