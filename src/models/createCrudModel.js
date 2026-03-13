const pool = require("../config/db");

const buildValues = (fields, data) => fields.map((field) => data[field]);

const createCrudModel = ({ tableName, fields, orderBy = "id DESC" }) => {
  const selectAllSql = `SELECT * FROM ${tableName} ORDER BY ${orderBy}`;
  const selectByIdSql = `SELECT * FROM ${tableName} WHERE id = ?`;
  const insertColumns = fields.join(", ");
  const insertPlaceholders = fields.map(() => "?").join(", ");
  const updateAssignments = fields.map((field) => `${field} = ?`).join(", ");
  const insertSql = `INSERT INTO ${tableName} (${insertColumns}) VALUES (${insertPlaceholders})`;
  const updateSql = `UPDATE ${tableName} SET ${updateAssignments} WHERE id = ?`;
  const deleteSql = `DELETE FROM ${tableName} WHERE id = ?`;

  const getById = async (id) => {
    const [rows] = await pool.query(selectByIdSql, [id]);
    return rows[0] || null;
  };

  return {
    async getAll() {
      const [rows] = await pool.query(selectAllSql);
      return rows;
    },

    getById,

    async create(data) {
      const [result] = await pool.query(insertSql, buildValues(fields, data));
      return getById(result.insertId);
    },

    async update(id, data) {
      const values = [...buildValues(fields, data), id];
      await pool.query(updateSql, values);
      return getById(id);
    },

    async remove(id) {
      const [result] = await pool.query(deleteSql, [id]);
      return result.affectedRows > 0;
    }
  };
};

module.exports = createCrudModel;
