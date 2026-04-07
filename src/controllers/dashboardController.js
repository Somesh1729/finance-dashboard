const DashboardService = require('../services/DashboardService');
const { sendSuccess } = require('../utils/Response');

class dashboardController {
  constructor() {
    this.dashboardService = new DashboardService();
    this.overview          = this.overview.bind(this);
    this.summary           = this.summary.bind(this);
    this.categoryBreakdown = this.categoryBreakdown.bind(this);
    this.monthlyTrends     = this.monthlyTrends.bind(this);
    this.recentActivity    = this.recentActivity.bind(this);
  }

  overview(req, res, next) {
    try {
      const { startDate, endDate, months } = req.query;
      const data = this.dashboardService.getFullDashboard({
        startDate, endDate, months,
      });
      sendSuccess(res, data, 'Dashboard overview retrieved');
    } catch (err) {
      next(err);
    }
  }

  summary(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const data = this.dashboardService.getSummary({ startDate, endDate });
      sendSuccess(res, data, 'Summary retrieved');
    } catch (err) {
      next(err);
    }
  }

  categoryBreakdown(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const data = this.dashboardService.getCategoryBreakdown({
        startDate, endDate,
      });
      sendSuccess(res, data, 'Category breakdown retrieved');
    } catch (err) {
      next(err);
    }
  }
  monthlyTrends(req, res, next) {
    try {
      const months = parseInt(req.query.months, 10) || 6;
      const data = this.dashboardService.getMonthlyTrends({ months });
      sendSuccess(res, data, 'Monthly trends retrieved');
    } catch (err) {
      next(err);
    }
  }

  recentActivity(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 5;
      const data = this.dashboardService.getRecentActivity(limit);
      sendSuccess(res, data, 'Recent activity retrieved');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new dashboardController();
