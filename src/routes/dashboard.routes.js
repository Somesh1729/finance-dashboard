const { Router } = require('express');
const dashboardController = require('../controllers/DashboardController');
const authenticate        = require('../middleware/authenticate');
const authorize           = require('../middleware/authorize');

const router = Router();

router.use(authenticate);
router.use(authorize('dashboard:read'));

router.get('/',           dashboardController.overview);
router.get('/summary',    dashboardController.summary);
router.get('/categories', dashboardController.categoryBreakdown);
router.get('/trends',     dashboardController.monthlyTrends);
router.get('/recent',     dashboardController.recentActivity);

module.exports = router;