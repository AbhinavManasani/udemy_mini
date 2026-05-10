const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/* ================================================================
   USER
   ================================================================ */
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  role: {
    type: DataTypes.ENUM('student', 'instructor', 'admin'),
    defaultValue: 'student',
    allowNull: false,
  },
  avatar_url: { type: DataTypes.STRING(500), defaultValue: null },
  bio: { type: DataTypes.TEXT, defaultValue: '' },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'users' });

/* ================================================================
   COURSE
   ================================================================ */
const Course = sequelize.define('Course', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(255), allowNull: false },
  subtitle: { type: DataTypes.STRING(500), defaultValue: '' },
  description: { type: DataTypes.TEXT, allowNull: false },
  thumbnail_url: {
    type: DataTypes.STRING(500),
    defaultValue: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=640',
  },
  category: {
    type: DataTypes.STRING(50),
    defaultValue: 'development',
  },
  level: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    defaultValue: 'beginner',
  },
  price: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  is_published: { type: DataTypes.BOOLEAN, defaultValue: false },
  instructor_id: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'courses' });

/* ================================================================
   MODULE
   ================================================================ */
const Module = sequelize.define('Module', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  course_id: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING(255), allowNull: false },
  order: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'modules' });

/* ================================================================
   LECTURE
   ================================================================ */
const Lecture = sequelize.define('Lecture', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  module_id: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING(255), allowNull: false },
  video_url: { type: DataTypes.STRING(500), defaultValue: '' },
  duration: { type: DataTypes.INTEGER, defaultValue: 0 }, // seconds
  order: { type: DataTypes.INTEGER, defaultValue: 0 },
  description: { type: DataTypes.TEXT, defaultValue: '' },
}, { tableName: 'lectures' });

/* ================================================================
   ENROLLMENT
   ================================================================ */
const Enrollment = sequelize.define('Enrollment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  course_id: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'enrollments' });

/* ================================================================
   PROGRESS
   ================================================================ */
const Progress = sequelize.define('Progress', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  lecture_id: { type: DataTypes.INTEGER, allowNull: false },
  last_position_seconds: { type: DataTypes.INTEGER, defaultValue: 0 },
  completed: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'progress' });

/* ================================================================
   QUIZ
   ================================================================ */
const Quiz = sequelize.define('Quiz', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  module_id: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING(255), allowNull: false },
}, { tableName: 'quizzes' });

/* ================================================================
   QUESTION
   ================================================================ */
const Question = sequelize.define('Question', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  quiz_id: { type: DataTypes.INTEGER, allowNull: false },
  text: { type: DataTypes.TEXT, allowNull: false },
  options: { type: DataTypes.TEXT, allowNull: false }, // JSON string of options array
  correct_index: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'questions' });

/* ================================================================
   QUIZ ATTEMPT
   ================================================================ */
const QuizAttempt = sequelize.define('QuizAttempt', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  quiz_id: { type: DataTypes.INTEGER, allowNull: false },
  score: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
  total_questions: { type: DataTypes.INTEGER, allowNull: false },
  correct_answers: { type: DataTypes.INTEGER, allowNull: false },
  answers: { type: DataTypes.TEXT, defaultValue: '[]' }, // JSON string
}, { tableName: 'quiz_attempts' });

/* ================================================================
   ASSOCIATIONS
   ================================================================ */

// User -> Courses (as instructor)
User.hasMany(Course, { foreignKey: 'instructor_id', as: 'courses' });
Course.belongsTo(User, { foreignKey: 'instructor_id', as: 'instructor' });

// Course -> Modules
Course.hasMany(Module, { foreignKey: 'course_id', as: 'modules', onDelete: 'CASCADE' });
Module.belongsTo(Course, { foreignKey: 'course_id' });

// Module -> Lectures
Module.hasMany(Lecture, { foreignKey: 'module_id', as: 'lectures', onDelete: 'CASCADE' });
Lecture.belongsTo(Module, { foreignKey: 'module_id' });

// Module -> Quiz
Module.hasOne(Quiz, { foreignKey: 'module_id', as: 'quiz', onDelete: 'CASCADE' });
Quiz.belongsTo(Module, { foreignKey: 'module_id' });

// Quiz -> Questions
Quiz.hasMany(Question, { foreignKey: 'quiz_id', as: 'questions', onDelete: 'CASCADE' });
Question.belongsTo(Quiz, { foreignKey: 'quiz_id' });

// Enrollments
User.belongsToMany(Course, { through: Enrollment, foreignKey: 'student_id', as: 'enrolledCourses' });
Course.belongsToMany(User, { through: Enrollment, foreignKey: 'course_id', as: 'students' });
Enrollment.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
Enrollment.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

// Progress
User.hasMany(Progress, { foreignKey: 'student_id', as: 'progress' });
Progress.belongsTo(User, { foreignKey: 'student_id' });
Lecture.hasMany(Progress, { foreignKey: 'lecture_id', as: 'progress' });
Progress.belongsTo(Lecture, { foreignKey: 'lecture_id' });

// Quiz Attempts
User.hasMany(QuizAttempt, { foreignKey: 'student_id', as: 'quizAttempts' });
QuizAttempt.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
Quiz.hasMany(QuizAttempt, { foreignKey: 'quiz_id', as: 'attempts' });
QuizAttempt.belongsTo(Quiz, { foreignKey: 'quiz_id' });

module.exports = {
  sequelize,
  User,
  Course,
  Module,
  Lecture,
  Enrollment,
  Progress,
  Quiz,
  Question,
  QuizAttempt,
};
