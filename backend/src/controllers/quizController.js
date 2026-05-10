const { Quiz, Question, QuizAttempt, Module } = require('../models');

exports.createQuiz = async (req, res) => {
  try {
    const { module_id, title, questions } = req.body;
    if (!module_id || !title) return res.status(400).json({ error: 'module_id and title required.' });

    const existing = await Quiz.findOne({ where: { module_id } });
    if (existing) return res.status(409).json({ error: 'Quiz already exists for this module.' });

    const quiz = await Quiz.create({ module_id, title });

    if (questions && Array.isArray(questions)) {
      for (const q of questions) {
        await Question.create({
          quiz_id: quiz.id, text: q.text,
          options: JSON.stringify(q.options), correct_index: q.correct_index,
        });
      }
    }

    const full = await Quiz.findByPk(quiz.id, { include: [{ model: Question, as: 'questions' }] });
    res.status(201).json({ quiz: full });
  } catch (err) { res.status(500).json({ error: 'Failed to create quiz.' }); }
};

exports.getQuizByModule = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      where: { module_id: req.params.moduleId },
      include: [{ model: Question, as: 'questions' }],
    });
    if (!quiz) return res.status(404).json({ error: 'No quiz for this module.' });

    const data = quiz.toJSON();
    data.questions = data.questions.map(q => ({
      ...q, options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
    }));
    res.json({ quiz: data });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch quiz.' }); }
};

exports.submitAttempt = async (req, res) => {
  try {
    const { answers } = req.body;
    const quiz = await Quiz.findByPk(req.params.id, { include: [{ model: Question, as: 'questions' }] });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found.' });

    let correct = 0;
    const total = quiz.questions.length;
    const results = quiz.questions.map((q, i) => {
      const ua = answers ? answers[i] : -1;
      const ok = ua === q.correct_index;
      if (ok) correct++;
      return { question_id: q.id, user_answer: ua, correct_answer: q.correct_index, is_correct: ok };
    });

    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    const attempt = await QuizAttempt.create({
      student_id: req.user.id, quiz_id: quiz.id, score,
      total_questions: total, correct_answers: correct, answers: JSON.stringify(results),
    });
    res.status(201).json({ attempt: { ...attempt.toJSON(), results } });
  } catch (err) { res.status(500).json({ error: 'Failed to submit attempt.' }); }
};

exports.getAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.findAll({
      where: { student_id: req.user.id, quiz_id: req.params.id },
      order: [['created_at', 'DESC']],
    });
    res.json({
      attempts: attempts.map(a => ({
        ...a.toJSON(), answers: typeof a.answers === 'string' ? JSON.parse(a.answers) : a.answers,
      })),
    });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch attempts.' }); }
};

exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found.' });
    await quiz.destroy();
    res.json({ message: 'Quiz deleted.' });
  } catch (err) { res.status(500).json({ error: 'Failed to delete quiz.' }); }
};
