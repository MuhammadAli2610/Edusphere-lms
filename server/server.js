require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const lessonItemRoutes = require('./routes/lessonItemRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const quizRoutes = require('./routes/quizRoutes');
const quizItemRoutes = require('./routes/quizItemRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.send('EduSphere API is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/courses/:courseId/lessons', lessonRoutes);
app.use('/api/lessons', lessonItemRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/lessons/:lessonId/quiz', quizRoutes);
app.use('/api/quiz', quizItemRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));