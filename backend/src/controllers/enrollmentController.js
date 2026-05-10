const { Enrollment, Course, User, Module, Lecture, Progress } = require('../models');

exports.enroll = async (req, res) => {
  try {
    const { course_id } = req.body;

    if (!course_id) {
      return res.status(400).json({ error: 'course_id is required.' });
    }

    const course = await Course.findByPk(course_id);
    if (!course || !course.is_published) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    // Check if already enrolled
    const existing = await Enrollment.findOne({
      where: { student_id: req.user.id, course_id },
    });
    if (existing) {
      return res.status(409).json({ error: 'Already enrolled in this course.' });
    }

    const enrollment = await Enrollment.create({
      student_id: req.user.id,
      course_id,
    });

    res.status(201).json({ enrollment });
  } catch (err) {
    console.error('Enroll error:', err);
    res.status(500).json({ error: 'Failed to enroll.' });
  }
};

exports.getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll({
      where: { student_id: req.user.id },
      include: [
        {
          model: Course,
          as: 'course',
          include: [
            { model: User, as: 'instructor', attributes: ['id', 'name', 'avatar_url'] },
            {
              model: Module,
              as: 'modules',
              include: [{ model: Lecture, as: 'lectures', attributes: ['id', 'duration'] }],
            },
          ],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    // Compute progress for each enrollment
    const result = await Promise.all(enrollments.map(async (enrollment) => {
      const course = enrollment.course;
      const allLectureIds = course.modules.reduce(
        (ids, m) => [...ids, ...m.lectures.map(l => l.id)], []
      );

      const completedCount = await Progress.count({
        where: {
          student_id: req.user.id,
          lecture_id: allLectureIds.length > 0 ? allLectureIds : [-1],
          completed: true,
        },
      });

      const progressPercent = allLectureIds.length > 0
        ? Math.round((completedCount / allLectureIds.length) * 100)
        : 0;

      return {
        ...enrollment.toJSON(),
        progress_percent: progressPercent,
        completed_lectures: completedCount,
        total_lectures: allLectureIds.length,
      };
    }));

    res.json({ enrollments: result });
  } catch (err) {
    console.error('Get enrollments error:', err);
    res.status(500).json({ error: 'Failed to fetch enrollments.' });
  }
};

exports.unenroll = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      where: { student_id: req.user.id, course_id: req.params.courseId },
    });
    if (!enrollment) {
      return res.status(404).json({ error: 'Not enrolled in this course.' });
    }

    await enrollment.destroy();
    res.json({ message: 'Unenrolled successfully.' });
  } catch (err) {
    console.error('Unenroll error:', err);
    res.status(500).json({ error: 'Failed to unenroll.' });
  }
};
