const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect, authorize } = require('../middleware/authMiddleware');
const { createQuiz, getQuizByLesson } = require('../controllers/quizController');

router.get('/', protect, getQuizByLesson);
router.post('/', protect, authorize('teacher', 'admin'), createQuiz);

module.exports = router;