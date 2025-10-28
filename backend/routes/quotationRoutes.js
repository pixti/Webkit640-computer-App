const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotationController');

// GET /api/quotations/:id - 누구나 접근 가능한 공개 경로
router.get('/:id', quotationController.getPublicQuoteById);

module.exports = router;