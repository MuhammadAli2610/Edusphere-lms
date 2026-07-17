const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

const enrollInCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) { res.status(404); throw new Error('Course not found'); }
    const existing = await Enrollment.findOne({ student: req.user.id, course: course._id });
    if (existing) { res.status(400); throw new Error('Already enrolled in this course'); }
    const enrollment = await Enrollment.create({ student: req.user.id, course: course._id });
    res.status(201).json(enrollment);
  } catch (err) { next(err); }
};

const getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user.id }).populate('course');
    res.json(enrollments);
  } catch (err) { next(err); }
};

const getEnrollmentStatus = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findOne({ student: req.user.id, course: req.params.courseId });
    res.json({ enrolled: !!enrollment, enrollment: enrollment || null });
  } catch (err) { next(err); }
};

const markLessonComplete = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findOne({ student: req.user.id, course: req.params.courseId });
    if (!enrollment) { res.status(404); throw new Error('Not enrolled in this course'); }
    const { lessonId } = req.body;
    if (!enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId);
      await enrollment.save();
    }
    res.json(enrollment);
  } catch (err) { next(err); }
};

const getCourseRoster = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) { res.status(404); throw new Error('Course not found'); }
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(403); throw new Error('Not authorized to view this roster');
    }
    const enrollments = await Enrollment.find({ course: course._id }).populate('student', 'name email');
    res.json(enrollments);
  } catch (err) { next(err); }
};

module.exports = { enrollInCourse, getMyEnrollments, getEnrollmentStatus, markLessonComplete, getCourseRoster };