const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Lesson = require('../models/Lesson');

const createQuiz = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId).populate('course');
    if (!lesson) { res.status(404); throw new Error('Lesson not found'); }
    if (lesson.course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(403); throw new Error('Not authorized');
    }
    const { title, questions } = req.body;
    if (!questions || questions.length === 0) {
      res.status(400); throw new Error('Quiz must have at least one question');
    }
    const existing = await Quiz.findOne({ lesson: lesson._id });
    if (existing) { res.status(400); throw new Error('This lesson already has a quiz'); }

    const quiz = await Quiz.create({ lesson: lesson._id, course: lesson.course._id, title, questions });
    res.status(201).json(quiz);
  } catch (err) { next(err); }
};

const getQuizByLesson = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({ lesson: req.params.lessonId });
    if (!quiz) return res.json(null);

    if (req.user.role === 'student') {
      const attempt = await QuizAttempt.findOne({ quiz: quiz._id, student: req.user.id });
      if (attempt) return res.json({ ...quiz.toObject(), attempt });

      const sanitized = {
        ...quiz.toObject(),
        questions: quiz.questions.map(q => ({ questionText: q.questionText, options: q.options })),
      };
      return res.json(sanitized);
    }
    res.json(quiz);
  } catch (err) { next(err); }
};

const submitQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) { res.status(404); throw new Error('Quiz not found'); }

    const existing = await QuizAttempt.findOne({ quiz: quiz._id, student: req.user.id });
    if (existing) { res.status(400); throw new Error('You already attempted this quiz'); }

    const { answers } = req.body;
    let score = 0;
    quiz.questions.forEach((q, i) => { if (answers[i] === q.correctOption) score++; });

    const attempt = await QuizAttempt.create({
      quiz: quiz._id, student: req.user.id, score, total: quiz.questions.length, answers,
    });
    res.status(201).json(attempt);
  } catch (err) { next(err); }
};

const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('course');
    if (!quiz) { res.status(404); throw new Error('Quiz not found'); }
    if (quiz.course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(403); throw new Error('Not authorized');
    }
    await QuizAttempt.deleteMany({ quiz: quiz._id });
    await quiz.deleteOne();
    res.json({ message: 'Quiz deleted' });
  } catch (err) { next(err); }
};

module.exports = { createQuiz, getQuizByLesson, submitQuiz, deleteQuiz };