const User = require('../models/User');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');

const getAllUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const query = role ? { role } : {};
    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { next(err); }
};

const getStats = async (req, res, next) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalCourses = await Course.countDocuments();
    res.json({ totalStudents, totalTeachers, totalCourses });
  } catch (err) { next(err); }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['student', 'teacher', 'admin'].includes(role)) {
      res.status(400); throw new Error('Invalid role');
    }
    const user = await User.findById(req.params.id);
    if (!user) { res.status(404); throw new Error('User not found'); }
    if (user._id.toString() === req.user.id) {
      res.status(400); throw new Error('You cannot change your own role');
    }
    user.role = role;
    await user.save();
    res.json({ message: 'Role updated', user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { next(err); }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) { res.status(404); throw new Error('User not found'); }
    if (user._id.toString() === req.user.id) {
      res.status(400); throw new Error('You cannot delete your own account');
    }
    await user.deleteOne();
    res.json({ message: 'User deleted' });
  } catch (err) { next(err); }
};

const getAllCourses = async (req, res, next) => {
  try {
    const courses = await Course.find().populate('instructor', 'name email').sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) { next(err); }
};

const deleteCourseAsAdmin = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) { res.status(404); throw new Error('Course not found'); }
    await Lesson.deleteMany({ course: course._id });
    await course.deleteOne();
    res.json({ message: 'Course deleted' });
  } catch (err) { next(err); }
};

module.exports = { getAllUsers, getStats, updateUserRole, deleteUser, getAllCourses, deleteCourseAsAdmin };