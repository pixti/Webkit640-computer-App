const express = require('express');
const router = express.Router();
const partController = require('../controllers/partController');
const { protect, admin } = require('../middleware/authMiddleware');

// 일반 경로는 위에, 동적 경로(:id)는 아래에 배치해야 합니다.

// GET /api/parts?category=... (쿼리 스트링을 사용하므로 순서 영향 적음)
router.get('/', partController.getPartsByCategory);

// GET /api/parts/latest
router.get('/latest', partController.getLatestParts);

// GET /api/parts/search?q=...
router.get('/search', partController.searchParts);

// GET /api/parts/:id
router.get('/:id', partController.getPartById);

// POST /api/parts - 신규 부품 생성 (관리자 전용)
router.post('/', protect, admin, partController.createPart);

// PUT /api/parts/:id - 부품 정보 수정 (관리자 전용)
router.put('/:id', protect, admin, partController.updatePart);

// DELETE /api/parts/:id
router.delete('/:id', protect, admin, partController.deletePart);

module.exports = router;