const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  enrollInCourse, getMyEnrollments, getEnrollmentStatus, markLessonComplete, getCourseRoster,
} = require('../controllers/enrollmentController');

router.get('/', protect, authorize('student'), getMyEnrollments);
router.post('/:courseId', protect, authorize('student'), enrollInCourse);
router.get('/:courseId/status', protect, authorize('student'), getEnrollmentStatus);
router.post('/:courseId/complete', protect, authorize('student'), markLessonComplete);
router.get('/course/:courseId/roster', protect, authorize('teacher', 'admin'), getCourseRoster);

module.exports = router;