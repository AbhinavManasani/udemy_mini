const { User, Course, Enrollment, Progress, QuizAttempt, Module, Lecture } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalStudents = await User.count({ where: { role: 'student' } });
    const totalInstructors = await User.count({ where: { role: 'instructor' } });
    const totalCourses = await Course.count();
    const publishedCourses = await Course.count({ where: { is_published: true } });
    const totalEnrollments = await Enrollment.count();

    const completedProgress = await Progress.count({ where: { completed: true } });
    const totalProgress = await Progress.count();
    const completionRate = totalProgress > 0 ? Math.round((completedProgress / totalProgress) * 100) : 0;

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentEnrollments = await Enrollment.count({
      where: { created_at: { [Op.gte]: thirtyDaysAgo } },
    });
    const recentUsers = await User.count({
      where: { created_at: { [Op.gte]: thirtyDaysAgo } },
    });

    res.json({
      stats: {
        totalUsers, totalStudents, totalInstructors, totalCourses,
        publishedCourses, totalEnrollments, completionRate,
        recentEnrollments, recentUsers,
      },
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const where = {};
    if (role) where.role = role;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password_hash'] },
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['created_at', 'DESC']],
    });

    res.json({ users: rows, total: count, page: parseInt(page), totalPages: Math.ceil(count / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const { role, is_active } = req.body;
    if (role) user.role = role;
    if (is_active !== undefined) user.is_active = is_active;
    await user.save();

    const { password_hash, ...userData } = user.toJSON();
    res.json({ user: userData });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user.' });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      include: [{ model: User, as: 'instructor', attributes: ['id', 'name'] }],
      order: [['created_at', 'DESC']],
    });
    const result = await Promise.all(courses.map(async (c) => {
      const ec = await Enrollment.count({ where: { course_id: c.id } });
      return { ...c.toJSON(), enrollment_count: ec };
    }));
    res.json({ courses: result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch courses.' });
  }
};
