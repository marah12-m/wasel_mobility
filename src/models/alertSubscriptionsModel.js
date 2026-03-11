const pool = require("../config/db");

const alertSubscriptionsModel = {
  async getAll() {
    const [rows] = await pool.query("SELECT * FROM alert_subscriptions ORDER BY id DESC");
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query("SELECT * FROM alert_subscriptions WHERE id = ?", [id]);
    return rows[0] || null;
  },

  async create(data) {
    const sql = "INSERT INTO alert_subscriptions (user_id, region, incident_category_id) VALUES (?, ?, ?)";
    const values = [data.user_id, data.region, data.incident_category_id];
    const [result] = await pool.query(sql, values);
    return this.getById(result.insertId);
  },

  async update(id, data) {
    const sql = "UPDATE alert_subscriptions SET user_id = ?, region = ?, incident_category_id = ? WHERE id = ?";
    const values = [data.user_id, data.region, data.incident_category_id, id];
    await pool.query(sql, values);
    return this.getById(id);
  },

  async remove(id) {
    const [result] = await pool.query("DELETE FROM alert_subscriptions WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }
};

module.exports = alertSubscriptionsModel;
