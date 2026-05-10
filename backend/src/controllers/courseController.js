const { Course, Module, Lecture, User, Enrollment, Quiz, Question } = require('../models');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
  try {
    const { category, level, search, instructor_id, page = 1, limit = 12 } = req.query;
    const where = { is_published: true };

    if (category && category !== 'all') where.category = category;
    if (level) where.level = level;
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }
    if (instructor_id) where.instructor_id = instructor_id;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Course.findAndCountAll({
      where,
      include: [
        { model: User, as: 'instructor', attributes: ['id', 'name', 'avatar_url'] },
        {
          model: Module, as: 'modules',
          attributes: ['id'],
          include: [{ model: Lecture, as: 'lectures', attributes: ['id', 'duration'] }],
        },
      ],
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']],
      distinct: true,
    });

    // Compute enrollment count for each course
    const courses = await Promise.all(rows.map(async (course) => {
      const enrollmentCount = await Enrollment.count({ where: { course_id: course.id } });
      const totalLectures = course.modules.reduce((sum, m) => sum + m.lectures.length, 0);
      const totalDuration = course.modules.reduce(
        (sum, m) => sum + m.lectures.reduce((s, l) => s + (l.duration || 0), 0), 0
      );
      return {
        ...course.toJSON(),
        enrollment_count: enrollmentCount,
        total_lectures: totalLectures,
        total_duration: totalDuration,
      };
    }));

    res.json({
      courses,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
    });
  } catch (err) {
    console.error('Get courses error:', err);
    res.status(500).json({ error: 'Failed to fetch courses.' });
  }
};

exports.getById = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [
        { model: User, as: 'instructor', attributes: ['id', 'name', 'avatar_url', 'bio'] },
        {
          model: Module,
          as: 'modules',
          include: [
            { model: Lecture, as: 'lectures', order: [['order', 'ASC']] },
            {
              model: Quiz,
              as: 'quiz',
              include: [{ model: Question, as: 'questions' }],
            },
          ],
          order: [['order', 'ASC']],
        },
      ],
      order: [
        [{ model: Module, as: 'modules' }, 'order', 'ASC'],
        [{ model: Module, as: 'modules' }, { model: Lecture, as: 'lectures' }, 'order', 'ASC'],
      ],
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    const enrollmentCount = await Enrollment.count({ where: { course_id: course.id } });

    // Check if current user is enrolled (if authenticated)
    let isEnrolled = false;
    if (req.user) {
      const enrollment = await Enrollment.findOne({
        where: { student_id: req.user.id, course_id: course.id },
      });
      isEnrolled = !!enrollment;
    }

    res.json({
      course: { ...course.toJSON(), enrollment_count: enrollmentCount, is_enrolled: isEnrolled },
    });
  } catch (err) {
    console.error('Get course error:', err);
    res.status(500).json({ error: 'Failed to fetch course.' });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, subtitle, description, thumbnail_url, category, level, price, modules } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required.' });
    }

    const course = await Course.create({
      title,
      subtitle: subtitle || '',
      description,
      thumbnail_url: thumbnail_url || undefined,
      category: category || 'development',
      level: level || 'beginner',
      price: price || 0,
      instructor_id: req.user.id,
      is_published: false,
    });

    // Create modules with lectures if provided
    if (modules && Array.isArray(modules)) {
      for (let i = 0; i < modules.length; i++) {
        const mod = await Module.create({
          course_id: course.id,
          title: modules[i].title,
          order: i,
        });

        if (modules[i].lectures && Array.isArray(modules[i].lectures)) {
          for (let j = 0; j < modules[i].lectures.length; j++) {
            await Lecture.create({
              module_id: mod.id,
              title: modules[i].lectures[j].title,
              video_url: modules[i].lectures[j].video_url || '',
              duration: modules[i].lectures[j].duration || 0,
              order: j,
              description: modules[i].lectures[j].description || '',
            });
          }
        }
      }
    }

    const fullCourse = await Course.findByPk(course.id, {
      include: [
        { model: User, as: 'instructor', attributes: ['id', 'name'] },
        {
          model: Module, as: 'modules',
          include: [{ model: Lecture, as: 'lectures' }],
        },
      ],
    });

    res.status(201).json({ course: fullCourse });
  } catch (err) {
    console.error('Create course error:', err);
    res.status(500).json({ error: 'Failed to create course.' });
  }
};

exports.update = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found.' });

    // Only the instructor or admin can update
    if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    const allowed = ['title', 'subtitle', 'description', 'thumbnail_url', 'category', 'level', 'price', 'is_published'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    await course.update(updates);

    // Handle modules update if provided
    if (req.body.modules && Array.isArray(req.body.modules)) {
      // Delete old modules & lectures (cascade)
      await Module.destroy({ where: { course_id: course.id } });

      for (let i = 0; i < req.body.modules.length; i++) {
        const mod = await Module.create({
          course_id: course.id,
          title: req.body.modules[i].title,
          order: i,
        });

        if (req.body.modules[i].lectures) {
          for (let j = 0; j < req.body.modules[i].lectures.length; j++) {
            await Lecture.create({
              module_id: mod.id,
              title: req.body.modules[i].lectures[j].title,
              video_url: req.body.modules[i].lectures[j].video_url || '',
              duration: req.body.modules[i].lectures[j].duration || 0,
              order: j,
              description: req.body.modules[i].lectures[j].description || '',
            });
          }
        }
      }
    }

    const updated = await Course.findByPk(course.id, {
      include: [
        { model: User, as: 'instructor', attributes: ['id', 'name'] },
        { model: Module, as: 'modules', include: [{ model: Lecture, as: 'lectures' }] },
      ],
    });

    res.json({ course: updated });
  } catch (err) {
    console.error('Update course error:', err);
    res.status(500).json({ error: 'Failed to update course.' });
  }
};

exports.remove = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found.' });

    if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    await course.destroy();
    res.json({ message: 'Course deleted successfully.' });
  } catch (err) {
    console.error('Delete course error:', err);
    res.status(500).json({ error: 'Failed to delete course.' });
  }
};

exports.getInstructorCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      where: { instructor_id: req.user.id },
      include: [
        { model: Module, as: 'modules', include: [{ model: Lecture, as: 'lectures' }] },
      ],
      order: [['created_at', 'DESC']],
    });

    const result = await Promise.all(courses.map(async (course) => {
      const enrollmentCount = await Enrollment.count({ where: { course_id: course.id } });
      return { ...course.toJSON(), enrollment_count: enrollmentCount };
    }));

    res.json({ courses: result });
  } catch (err) {
    console.error('Get instructor courses error:', err);
    res.status(500).json({ error: 'Failed to fetch courses.' });
  }
};
