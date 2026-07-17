const Lesson = require('../models/Lesson');
const Course = require('../models/Course');

const createLesson = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) { res.status(404); throw new Error('Course not found'); }
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(403); throw new Error('Not authorized to add lessons to this course');
    }

    const lessonData = {
      title: req.body.title,
      content: req.body.content,
      videoUrl: req.body.videoUrl || '',
      course: course._id,
    };

    if (req.file) {
      lessonData.pdfUrl = `/uploads/pdfs/${req.file.filename}`;
    }

    const lesson = await Lesson.create(lessonData);
    res.status(201).json(lesson);
  } catch (err) { next(err); }
};

const getLessonsByCourse = async (req, res, next) => {
  try {
    const lessons = await Lesson.find({ course: req.params.courseId }).sort({ order: 1, createdAt: 1 });
    res.json(lessons);
  } catch (err) { next(err); }
};

const updateLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate('course');
    if (!lesson) { res.status(404); throw new Error('Lesson not found'); }
    if (lesson.course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(403); throw new Error('Not authorized');
    }
    Object.assign(lesson, req.body);
    await lesson.save();
    res.json(lesson);
  } catch (err) { next(err); }
};

const deleteLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate('course');
    if (!lesson) { res.status(404); throw new Error('Lesson not found'); }
    if (lesson.course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(403); throw new Error('Not authorized');
    }
    await lesson.deleteOne();
    res.json({ message: 'Lesson deleted' });
  } catch (err) { next(err); }
};

module.exports = { createLesson, getLessonsByCourse, updateLesson, deleteLesson };