const pool = require("../config/db");

const moderationLogsModel = {
  async getAll() {
    const [rows] = await pool.query("SELECT * FROM moderation_logs ORDER BY id DESC");
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query("SELECT * FROM moderation_logs WHERE id = ?", [id]);
    return rows[0] || null;
  },

  async create(data) {
    const sql = "INSERT INTO moderation_logs (user_id, action, target_type, target_id, notes) VALUES (?, ?, ?, ?, ?)";
    const values = [data.user_id, data.action, data.target_type, data.target_id, data.notes];
    const [result] = await pool.query(sql, values);
    return this.getById(result.insertId);
  },

  async update(id, data) {
    const sql = "UPDATE moderation_logs SET user_id = ?, action = ?, target_type = ?, target_id = ?, notes = ? WHERE id = ?";
    const values = [data.user_id, data.action, data.target_type, data.target_id, data.notes, id];
    await pool.query(sql, values);
    return this.getById(id);
  },

  async remove(id) {
    const [result] = await pool.query("DELETE FROM moderation_logs WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }
};

module.exports = moderationLogsModel;
