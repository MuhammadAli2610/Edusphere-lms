const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getAllUsers, getStats, updateUserRole, deleteUser,
  getAllCourses, deleteCourseAsAdmin,
} = require('../controllers/adminController');

router.use(protect, authorize('admin'));

router.get('/users', getAllUsers);
router.get('/stats', getStats);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/courses', getAllCourses);
router.delete('/courses/:id', deleteCourseAsAdmin);

module.exports = router;