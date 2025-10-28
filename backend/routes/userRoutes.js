const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

// PUT /api/users/nickname - 닉네임 변경
router.put('/nickname', protect, userController.updateNickname);

// PUT /api/users/password - 비밀번호 변경
router.put('/password', protect, userController.updatePassword);

// DELETE /api/users - 회원 탈퇴 (비밀번호 확인을 위해 POST 사용)
router.post('/delete', protect, userController.deleteUser);
// ※ DELETE 메서드는 보통 req.body를 포함하지 않으므로, 비밀번호를 받아야 하는 이 경우 POST가 더 적합합니다.

// --- [신규] 마이페이지용 경로 추가 ---
router.get('/myposts', protect, userController.getMyPosts);
router.get('/mycomments', protect, userController.getMyComments);

// --- [추가] 관리자 전용 사용자 관리 경로 ---
router.get('/', protect, admin, userController.getAllUsers); // GET /api/users 또는 /api/users?search=...
router.get('/statuses', protect, admin, userController.getAllUserStatuses); // GET /api/users/statuses
router.put('/:userId/status', protect, admin, userController.updateUserStatus); // PUT /api/users/123/status

module.exports = router;