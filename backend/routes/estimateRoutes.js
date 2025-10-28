const express = require('express');
const router = express.Router();
const estimateController = require('../controllers/estimateController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, estimateController.saveEstimate);
router.get('/', protect, estimateController.getMyEstimates);
router.delete('/:id', protect, estimateController.deleteMyEstimate);

module.exports = router;