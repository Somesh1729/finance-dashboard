const FinancialRecordRepository = require('../repositories/FinancialRecordRepository');

class DashboardService {
  constructor() {
    this.recordRepo = new FinancialRecordRepository();
  }

  getSummary({ startDate, endDate } = {}) {
    const totals = this.recordRepo.getTotals({ startDate, endDate });
    return {
      total_income:  parseFloat(totals.total_income.toFixed(2)),
      total_expense: parseFloat(totals.total_expense.toFixed(2)),
      net_balance:   parseFloat(totals.net_balance.toFixed(2)),
    };
  }

  getCategoryBreakdown({ startDate, endDate } = {}) {
    const rows = this.recordRepo.getCategoryTotals({ startDate, endDate });

    return rows.reduce((acc, row) => {
      if (!acc[row.type]) acc[row.type] = [];
      acc[row.type].push({
        category: row.category,
        total:    parseFloat(row.total.toFixed(2)),
        count:    row.count,
      });
      return acc;
    }, {});
  }
  getMonthlyTrends({ months = 6 } = {}) {
    const rows = this.recordRepo.getMonthlyTrends({ months });
    const monthMap = {};
    for (const row of rows) {
      if (!monthMap[row.month]) {
        monthMap[row.month] = { month: row.month, income: 0, expense: 0 };
      }
      monthMap[row.month][row.type] = parseFloat(row.total.toFixed(2));
    }

    return Object.values(monthMap).sort((a, b) =>
      a.month.localeCompare(b.month)
    );
  }

  getRecentActivity(limit = 5) {
    return this.recordRepo.getRecentActivity(limit);
  }

  getFullDashboard({ startDate, endDate, months } = {}) {
    return {
      summary:            this.getSummary({ startDate, endDate }),
      category_breakdown: this.getCategoryBreakdown({ startDate, endDate }),
      monthly_trends:     this.getMonthlyTrends({ months }),
      recent_activity:    this.getRecentActivity(5),
    };
  }
}

module.exports = DashboardService;