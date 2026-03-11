const pool = require("../config/db");

const checkpointStatusHistoryModel = {
  async getAll() {
    const [rows] = await pool.query("SELECT * FROM checkpoint_status_history ORDER BY id DESC");
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query("SELECT * FROM checkpoint_status_history WHERE id = ?", [id]);
    return rows[0] || null;
  },

  async create(data) {
    const sql = "INSERT INTO checkpoint_status_history (checkpoint_id, status, updated_by, notes) VALUES (?, ?, ?, ?)";
    const values = [data.checkpoint_id, data.status, data.updated_by, data.notes];
    const [result] = await pool.query(sql, values);
    return this.getById(result.insertId);
  },

  async update(id, data) {
    const sql = "UPDATE checkpoint_status_history SET checkpoint_id = ?, status = ?, updated_by = ?, notes = ? WHERE id = ?";
    const values = [data.checkpoint_id, data.status, data.updated_by, data.notes, id];
    await pool.query(sql, values);
    return this.getById(id);
  },

  async remove(id) {
    const [result] = await pool.query("DELETE FROM checkpoint_status_history WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }
};

module.exports = checkpointStatusHistoryModel;
