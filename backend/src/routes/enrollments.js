const router = require('express').Router();
const ctrl = require('../controllers/enrollmentController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, ctrl.enroll);
router.get('/my', authenticate, ctrl.getMyEnrollments);
router.delete('/:courseId', authenticate, ctrl.unenroll);

module.exports = router;
