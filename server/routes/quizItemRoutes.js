const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { submitQuiz, deleteQuiz } = require('../controllers/quizController');

router.post('/:id/submit', protect, submitQuiz);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteQuiz);

module.exports = router;