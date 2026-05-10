const router = require('express').Router();
const ctrl = require('../controllers/quizController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/', authenticate, authorize('instructor', 'admin'), ctrl.createQuiz);
router.get('/module/:moduleId', authenticate, ctrl.getQuizByModule);
router.post('/:id/attempt', authenticate, ctrl.submitAttempt);
router.get('/:id/attempts', authenticate, ctrl.getAttempts);
router.delete('/:id', authenticate, authorize('instructor', 'admin'), ctrl.deleteQuiz);

module.exports = router;
