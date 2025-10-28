const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const commentRoutes = require('./commentRoutes'); // 1. 댓글 라우트 import

// 2. 특정 게시글 ID에 대한 요청일 경우, commentRoutes를 사용하도록 연결
router.use('/:postId/comments', commentRoutes);

router.post('/', protect, postController.createPost);
router.get('/', postController.getPosts);
router.get('/homepage', postController.getHomepagePosts); // [추가] 홈페이지용 경로
router.get('/:id', postController.getPostById);
router.put('/:id', protect, postController.updatePost);   // [추가]
router.delete('/:id', protect, postController.deletePost); // [추가]

module.exports = router;