const router = require('express').Router();
const ctrl = require('../controllers/progressController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, ctrl.updateProgress);
router.get('/:courseId', authenticate, ctrl.getCourseProgress);

module.exports = router;
