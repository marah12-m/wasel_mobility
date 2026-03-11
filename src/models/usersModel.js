const pool = require("../config/db");

const usersModel = {
  async getAll() {
    const [rows] = await pool.query("SELECT * FROM users ORDER BY id DESC");
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
    return rows[0] || null;
  },

  async create(data) {
    const sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
    const values = [data.name, data.email, data.password, data.role];
    const [result] = await pool.query(sql, values);
    return this.getById(result.insertId);
  },

  async update(id, data) {
    const sql = "UPDATE users SET name = ?, email = ?, password = ?, role = ? WHERE id = ?";
    const values = [data.name, data.email, data.password, data.role, id];
    await pool.query(sql, values);
    return this.getById(id);
  },

  async remove(id) {
    const [result] = await pool.query("DELETE FROM users WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }
};

module.exports = usersModel;
