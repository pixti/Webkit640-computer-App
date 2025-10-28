const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', categoryController.getAllCategories);
router.post('/', protect, admin, categoryController.createCategory);
router.delete('/:id', protect, admin, categoryController.deleteCategory);

module.exports = router;