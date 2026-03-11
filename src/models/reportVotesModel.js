const pool = require("../config/db");

const reportVotesModel = {
  async getAll() {
    const [rows] = await pool.query("SELECT * FROM report_votes ORDER BY id DESC");
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query("SELECT * FROM report_votes WHERE id = ?", [id]);
    return rows[0] || null;
  },

  async create(data) {
    const sql = "INSERT INTO report_votes (report_id, user_id, vote_type) VALUES (?, ?, ?)";
    const values = [data.report_id, data.user_id, data.vote_type];
    const [result] = await pool.query(sql, values);
    return this.getById(result.insertId);
  },

  async update(id, data) {
    const sql = "UPDATE report_votes SET report_id = ?, user_id = ?, vote_type = ? WHERE id = ?";
    const values = [data.report_id, data.user_id, data.vote_type, id];
    await pool.query(sql, values);
    return this.getById(id);
  },

  async remove(id) {
    const [result] = await pool.query("DELETE FROM report_votes WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }
};

module.exports = reportVotesModel;
