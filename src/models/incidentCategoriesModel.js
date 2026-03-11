const pool = require("../config/db");

const incidentCategoriesModel = {
  async getAll() {
    const [rows] = await pool.query("SELECT * FROM incident_categories ORDER BY id DESC");
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query("SELECT * FROM incident_categories WHERE id = ?", [id]);
    return rows[0] || null;
  },

  async create(data) {
    const sql = "INSERT INTO incident_categories (name, description) VALUES (?, ?)";
    const values = [data.name, data.description];
    const [result] = await pool.query(sql, values);
    return this.getById(result.insertId);
  },

  async update(id, data) {
    const sql = "UPDATE incident_categories SET name = ?, description = ? WHERE id = ?";
    const values = [data.name, data.description, id];
    await pool.query(sql, values);
    return this.getById(id);
  },

  async remove(id) {
    const [result] = await pool.query("DELETE FROM incident_categories WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }
};

module.exports = incidentCategoriesModel;
