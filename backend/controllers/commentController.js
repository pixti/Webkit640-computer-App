const db = require('../models');
const Comment = db.Comment;
const User = db.User;

// 1. 특정 게시글의 모든 댓글 조회 (GET /api/posts/:postId/comments)
exports.getCommentsByPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const comments = await Comment.findAll({
            where: { postId },
            order: [['createdAt', 'ASC']], // 오래된 댓글부터 순서대로
            include: {
                model: User,
                attributes: ['nickname'],
            },
        });
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: '서버 오류' });
    }
};

// 2. 새 댓글 생성 (POST /api/posts/:postId/comments)
exports.createComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        const newComment = await Comment.create({
            content,
            postId,
            userId,
        });

        // 생성된 댓글 정보를 작성자 닉네임과 함께 다시 보내줌 (프론트 즉시 업데이트용)
        const commentWithUser = await Comment.findByPk(newComment.id, {
            include: { model: User, attributes: ['nickname'] }
        });

        res.status(201).json(commentWithUser);
    } catch (error) {
        res.status(500).json({ message: '서버 오류' });
    }
};

// 3. 댓글 수정 (PUT /api/comments/:commentId) - 경로는 app.js에서 설정
exports.updateComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        const comment = await Comment.findByPk(commentId);

        if (!comment) {
            return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
        }
        if (comment.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: '수정 권한이 없습니다.' });
        }

        comment.content = content;
        await comment.save();

        // [핵심 수정] 수정된 댓글 정보를 '작성자 닉네임'과 함께 다시 조회하여 반환합니다.
        const updatedCommentWithUser = await Comment.findByPk(comment.id, {
            include: { model: User, attributes: ['nickname'] }
        });

        res.status(200).json(updatedCommentWithUser); // 사용자 정보가 포함된 객체를 응답

    } catch (error) {
        console.error("댓글 수정 오류:", error); // 서버 로그에 에러를 남기면 디버깅에 좋습니다.
        res.status(500).json({ message: '서버 오류' });
    }
};

// 4. 댓글 삭제 (DELETE /api/comments/:commentId)
exports.deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const comment = await Comment.findByPk(commentId);

        if (!comment) {
            return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
        }
        if (comment.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: '삭제 권한이 없습니다.' });
        }

        await comment.destroy();
        res.status(200).json({ message: '댓글이 삭제되었습니다.' });
    } catch (error) {
        res.status(500).json({ message: '서버 오류' });
    }
};