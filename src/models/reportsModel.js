const pool = require("../config/db");

const reportsModel = {
  async getAll() {
    const [rows] = await pool.query("SELECT * FROM reports ORDER BY id DESC");
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query("SELECT * FROM reports WHERE id = ?", [id]);
    return rows[0] || null;
  },

  async create(data) {
    const sql = "INSERT INTO reports (user_id, category_id, description, latitude, longitude, status, duplicate_of) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const values = [
      data.user_id,
      data.category_id,
      data.description,
      data.latitude,
      data.longitude,
      data.status,
      data.duplicate_of
    ];
    const [result] = await pool.query(sql, values);
    return this.getById(result.insertId);
  },

  async update(id, data) {
    const sql = "UPDATE reports SET user_id = ?, category_id = ?, description = ?, latitude = ?, longitude = ?, status = ?, duplicate_of = ? WHERE id = ?";
    const values = [
      data.user_id,
      data.category_id,
      data.description,
      data.latitude,
      data.longitude,
      data.status,
      data.duplicate_of,
      id
    ];
    await pool.query(sql, values);
    return this.getById(id);
  },

  async remove(id) {
    const [result] = await pool.query("DELETE FROM reports WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }
};

module.exports = reportsModel;
