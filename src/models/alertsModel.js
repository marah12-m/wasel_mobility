const pool = require("../config/db");

const alertsModel = {
  async getAll() {
    const [rows] = await pool.query("SELECT * FROM alerts ORDER BY id DESC");
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query("SELECT * FROM alerts WHERE id = ?", [id]);
    return rows[0] || null;
  },

  async create(data) {
    const sql = "INSERT INTO alerts (incident_id, region, message) VALUES (?, ?, ?)";
    const values = [data.incident_id, data.region, data.message];
    const [result] = await pool.query(sql, values);
    return this.getById(result.insertId);
  },

  async update(id, data) {
    const sql = "UPDATE alerts SET incident_id = ?, region = ?, message = ? WHERE id = ?";
    const values = [data.incident_id, data.region, data.message, id];
    await pool.query(sql, values);
    return this.getById(id);
  },

  async remove(id) {
    const [result] = await pool.query("DELETE FROM alerts WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }
};

module.exports = alertsModel;
