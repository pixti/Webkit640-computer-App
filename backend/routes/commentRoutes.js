const express = require('express');
// { mergeParams: true } 옵션은 부모 라우터(postRoutes)의 :postId 같은 파라미터를 가져올 수 있게 해줌
const router = express.Router({ mergeParams: true });
const commentController = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', commentController.getCommentsByPost);
router.post('/', protect, commentController.createComment);
// 이 파일은 /api/posts/:postId/comments 경로에 사용되므로,
// 댓글 수정/삭제는 별도 경로로 분리하는 것이 좋습니다.
// 여기서는 일단 비워두고 app.js에서 직접 처리합니다.

module.exports = router;