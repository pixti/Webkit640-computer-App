const express = require('express');
const router = express.Router();
const boardTypeController = require('../controllers/boardTypeController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', boardTypeController.getAllBoardTypes);
router.post('/', protect, admin, boardTypeController.createBoardType);
router.delete('/:id', protect, admin, boardTypeController.deleteBoardType);

module.exports = router;