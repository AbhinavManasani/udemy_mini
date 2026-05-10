const router = require('express').Router();
const ctrl = require('../controllers/courseController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, ctrl.getAll);
router.get('/instructor/mine', authenticate, authorize('instructor'), ctrl.getInstructorCourses);
router.get('/:id', optionalAuth, ctrl.getById);
router.post('/', authenticate, authorize('instructor', 'admin'), ctrl.create);
router.put('/:id', authenticate, authorize('instructor', 'admin'), ctrl.update);
router.delete('/:id', authenticate, authorize('instructor', 'admin'), ctrl.remove);

module.exports = router;
