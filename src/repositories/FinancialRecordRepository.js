const { getDb } = require('../config/database');

class FinancialRecordRepository {
  constructor() {
    this.db = getDb();
  }



  findById(id) {
    return this.db
      .prepare(`
        SELECT * FROM financial_records
        WHERE id = ? AND deleted_at IS NULL
      `)
      .get(id);
  }

  create({ id, amount, type, category, date, notes, created_by }) {
    this.db.prepare(`
      INSERT INTO financial_records (id, amount, type, category, date, notes, created_by)
      VALUES (@id, @amount, @type, @category, @date, @notes, @created_by)
    `).run({ id, amount, type, category, date, notes: notes || null, created_by });

    return this.findById(id);
  }

  update(id, fields) {
    const allowed = ['amount', 'type', 'category', 'date', 'notes'];

    const setClauses = Object.keys(fields)
      .filter(key => allowed.includes(key))
      .map(key => `${key} = @${key}`)
      .join(', ');

    if (!setClauses) return null;

    this.db.prepare(`
      UPDATE financial_records
      SET ${setClauses}, updated_at = datetime('now')
      WHERE id = @id AND deleted_at IS NULL
    `).run({ ...fields, id });

    return this.findById(id);
  }

  softDelete(id) {
    const result = this.db.prepare(`
      UPDATE financial_records
      SET deleted_at = datetime('now')
      WHERE id = ? AND deleted_at IS NULL
    `).run(id);
    return result.changes > 0;
  }


  findAll({ type, category, startDate, endDate, search, page = 1, limit = 10 }) {
    const { where, params } = this._buildWhereClause({
      type, category, startDate, endDate, search,
    });

    const offset = (page - 1) * limit;

    const rows = this.db.prepare(`
      SELECT * FROM financial_records
      ${where}
      ORDER BY date DESC, created_at DESC
      LIMIT @limit OFFSET @offset
    `).all({ ...params, limit, offset });

    const { total } = this.db.prepare(`
      SELECT COUNT(*) as total FROM financial_records ${where}
    `).get(params);

    return { rows, total };
  }


  getTotals({ startDate, endDate } = {}) {
    const { where, params } = this._buildWhereClause({ startDate, endDate });

    return this.db.prepare(`
      SELECT
        COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) AS total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense,
        COALESCE(SUM(CASE WHEN type = 'income'  THEN amount
                          WHEN type = 'expense' THEN -amount END), 0)       AS net_balance
      FROM financial_records ${where}
    `).get(params);
  }

  getCategoryTotals({ startDate, endDate } = {}) {
    const { where, params } = this._buildWhereClause({ startDate, endDate });

    return this.db.prepare(`
      SELECT
        category,
        type,
        COALESCE(SUM(amount), 0) AS total,
        COUNT(*) AS count
      FROM financial_records ${where}
      GROUP BY category, type
      ORDER BY total DESC
    `).all(params);
  }

  getMonthlyTrends({ months = 6 } = {}) {
    return this.db.prepare(`
      SELECT
        strftime('%Y-%m', date) AS month,
        type,
        COALESCE(SUM(amount), 0) AS total,
        COUNT(*) AS count
      FROM financial_records
      WHERE deleted_at IS NULL
        AND date >= date('now', '-' || @months || ' months')
      GROUP BY month, type
      ORDER BY month ASC
    `).all({ months });
  }

  getRecentActivity(limit = 5) {
    return this.db.prepare(`
      SELECT * FROM financial_records
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT ?
    `).all(limit);
  }
  _buildWhereClause({ type, category, startDate, endDate, search } = {}) {
    const conditions = ['deleted_at IS NULL'];
    const params = {};

    if (type) {
      conditions.push('type = @type');
      params.type = type;
    }
    if (category) {
      conditions.push('category = @category');
      params.category = category;
    }
    if (startDate) {
      conditions.push('date >= @startDate');
      params.startDate = startDate;
    }
    if (endDate) {
      conditions.push('date <= @endDate');
      params.endDate = endDate;
    }
    if (search) {
      conditions.push('(category LIKE @search OR notes LIKE @search)');
      params.search = `%${search}%`;
    }

    return {
      where: `WHERE ${conditions.join(' AND ')}`,
      params,
    };
  }
}

module.exports = FinancialRecordRepository;