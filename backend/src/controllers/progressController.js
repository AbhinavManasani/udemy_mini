const { Progress, Lecture, Module } = require('../models');

exports.updateProgress = async (req, res) => {
  try {
    const { lecture_id, last_position_seconds, completed } = req.body;

    if (!lecture_id) {
      return res.status(400).json({ error: 'lecture_id is required.' });
    }

    const [progress, created] = await Progress.findOrCreate({
      where: { student_id: req.user.id, lecture_id },
      defaults: {
        last_position_seconds: last_position_seconds || 0,
        completed: completed || false,
      },
    });

    if (!created) {
      if (last_position_seconds !== undefined) progress.last_position_seconds = last_position_seconds;
      if (completed !== undefined) progress.completed = completed;
      await progress.save();
    }

    res.json({ progress });
  } catch (err) {
    console.error('Update progress error:', err);
    res.status(500).json({ error: 'Failed to update progress.' });
  }
};

exports.getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Get all lectures in this course
    const modules = await Module.findAll({
      where: { course_id: courseId },
      include: [{ model: Lecture, as: 'lectures', attributes: ['id'] }],
    });

    const lectureIds = modules.reduce(
      (ids, m) => [...ids, ...m.lectures.map(l => l.id)], []
    );

    if (lectureIds.length === 0) {
      return res.json({ progress: [], summary: { total: 0, completed: 0, percent: 0 } });
    }

    const progress = await Progress.findAll({
      where: { student_id: req.user.id, lecture_id: lectureIds },
    });

    const completedCount = progress.filter(p => p.completed).length;

    res.json({
      progress,
      summary: {
        total: lectureIds.length,
        completed: completedCount,
        percent: Math.round((completedCount / lectureIds.length) * 100),
      },
    });
  } catch (err) {
    console.error('Get progress error:', err);
    res.status(500).json({ error: 'Failed to fetch progress.' });
  }
};
