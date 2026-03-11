const pool = require("../config/db");

const incidentsModel = {
  async getAll() {
    const [rows] = await pool.query("SELECT * FROM incidents ORDER BY id DESC");
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query("SELECT * FROM incidents WHERE id = ?", [id]);
    return rows[0] || null;
  },

  async create(data) {
    const sql = "INSERT INTO incidents (title, description, incident_type, severity, latitude, longitude, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [
      data.title,
      data.description,
      data.incident_type,
      data.severity,
      data.latitude,
      data.longitude,
      data.status,
      data.created_by
    ];
    const [result] = await pool.query(sql, values);
    return this.getById(result.insertId);
  },

  async update(id, data) {
    const sql = "UPDATE incidents SET title = ?, description = ?, incident_type = ?, severity = ?, latitude = ?, longitude = ?, status = ?, created_by = ? WHERE id = ?";
    const values = [
      data.title,
      data.description,
      data.incident_type,
      data.severity,
      data.latitude,
      data.longitude,
      data.status,
      data.created_by,
      id
    ];
    await pool.query(sql, values);
    return this.getById(id);
  },

  async remove(id) {
    const [result] = await pool.query("DELETE FROM incidents WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }
};

module.exports = incidentsModel;
