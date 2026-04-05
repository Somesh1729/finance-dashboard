const { getDb } = require('../config/database');

class UserRepository {
  constructor() {
    this.db = getDb();
  }


  findById(id) {
    return this.db
      .prepare(`
        SELECT id, name, email, role, status, created_at, updated_at
        FROM users
        WHERE id = ?
      `)
      .get(id); 
  }

  findByEmail(email) {
    return this.db
      .prepare('SELECT * FROM users WHERE email = ?')
      .get(email);
  }

  findAll() {
    return this.db
      .prepare(`
        SELECT id, name, email, role, status, created_at, updated_at
        FROM users
        ORDER BY created_at DESC
      `)
      .all();
  }

  existsByEmail(email) {
    const row = this.db
      .prepare('SELECT 1 FROM users WHERE email = ?')
      .get(email);
    return !!row; 
  }

  create({ id, name, email, password, role, status }) {
    this.db.prepare(`
      INSERT INTO users (id, name, email, password, role, status)
      VALUES (@id, @name, @email, @password, @role, @status)
    `).run({ id, name, email, password, role, status });
    return this.findById(id);
  }

  update(id, fields) {
    const allowed = ['name', 'role', 'status'];

    const setClauses = Object.keys(fields)
      .filter(key => allowed.includes(key)) 
      .map(key => `${key} = @${key}`)
      .join(', ');

    if (!setClauses) return null;

    this.db.prepare(`
      UPDATE users
      SET ${setClauses}, updated_at = datetime('now')
      WHERE id = @id
    `).run({ ...fields, id });

    return this.findById(id);
  }

  delete(id) {
    const result = this.db
      .prepare('DELETE FROM users WHERE id = ?')
      .run(id);
    return result.changes > 0;
  }
}

module.exports = UserRepository;