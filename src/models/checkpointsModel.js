const pool = require("../config/db");

const checkpointsModel = {
  async getAll() {
    const [rows] = await pool.query("SELECT * FROM checkpoints ORDER BY id DESC");
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query("SELECT * FROM checkpoints WHERE id = ?", [id]);
    return rows[0] || null;
  },

  async create(data) {
    const sql = "INSERT INTO checkpoints (name, latitude, longitude, region, description, is_active) VALUES (?, ?, ?, ?, ?, ?)";
    const values = [data.name, data.latitude, data.longitude, data.region, data.description, data.is_active];
    const [result] = await pool.query(sql, values);
    return this.getById(result.insertId);
  },

  async update(id, data) {
    const sql = "UPDATE checkpoints SET name = ?, latitude = ?, longitude = ?, region = ?, description = ?, is_active = ? WHERE id = ?";
    const values = [data.name, data.latitude, data.longitude, data.region, data.description, data.is_active, id];
    await pool.query(sql, values);
    return this.getById(id);
  },

  async remove(id) {
    const [result] = await pool.query("DELETE FROM checkpoints WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }
};

module.exports = checkpointsModel;
