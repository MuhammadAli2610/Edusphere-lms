const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { createLesson, getLessonsByCourse } = require('../controllers/lessonController');

router.get('/', getLessonsByCourse);
router.post('/', protect, authorize('teacher', 'admin'), upload.single('pdf'), createLesson);

module.exports = router;