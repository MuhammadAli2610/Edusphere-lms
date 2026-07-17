const Course = require('../models/Course');

const createCourse = async (req, res, next) => {
  try {
    const { title } = req.body;
    if (!title || title.trim().length < 3) {
      res.status(400);
      throw new Error('Title must be at least 3 characters');
    }
    const course = await Course.create({ ...req.body, instructor: req.user.id });
    res.status(201).json(course);
  } catch (err) { next(err); }
};

const getCourses = async (req, res, next) => {
  try {
    const { search, category, difficulty, instructor, page = 1, limit = 9 } = req.query;
    const query = {};
    if (search) query.title = { $regex: search, $options: 'i' };
    if (category) query.category = { $regex: category, $options: 'i' };
    if (difficulty) query.difficulty = difficulty;
    if (instructor) query.instructor = instructor;

    const total = await Course.countDocuments(query);
    const courses = await Course.find(query)
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ courses, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate('instructor', 'name email');
    if (!course) { res.status(404); throw new Error('Course not found'); }
    res.json(course);
  } catch (err) { next(err); }
};

const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) { res.status(404); throw new Error('Course not found'); }
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(403); throw new Error('Not authorized to edit this course');
    }
    Object.assign(course, req.body);
    await course.save();
    res.json(course);
  } catch (err) { next(err); }
};

const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) { res.status(404); throw new Error('Course not found'); }
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(403); throw new Error('Not authorized to delete this course');
    }
    await course.deleteOne();
    res.json({ message: 'Course deleted' });
  } catch (err) { next(err); }
};

module.exports = { createCourse, getCourses, getCourseById, updateCourse, deleteCourse };