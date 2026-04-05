const { Router } = require('express');

const authRoutes      = require('./auth.routes');
const userRoutes      = require('./user.routes');
const recordRoutes    = require('./record.routes');
const dashboardRoutes = require('./dashboard.routes');

const router = Router();

router.use('/auth',      authRoutes);
router.use('/users',     userRoutes);
router.use('/records',   recordRoutes);
router.use('/dashboard', dashboardRoutes);

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Finance Dashboard API is running', timestamp: new Date().toISOString() });
});

module.exports = router;