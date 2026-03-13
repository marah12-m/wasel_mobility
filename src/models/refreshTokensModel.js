const pool = require("../config/db");

const getByTokenHash = async (tokenHash) => {
  const [rows] = await pool.query(
    `SELECT rt.*, u.email, u.role, u.name
     FROM refresh_tokens rt
     INNER JOIN users u ON u.id = rt.user_id
     WHERE rt.token_hash = ? AND rt.revoked_at IS NULL
     LIMIT 1`,
    [tokenHash]
  );

  return rows[0] || null;
};

const create = async ({ userId, tokenHash, expiresAt }) => {
  const [result] = await pool.query(
    "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
    [userId, tokenHash, expiresAt]
  );

  const [rows] = await pool.query("SELECT * FROM refresh_tokens WHERE id = ?", [result.insertId]);
  return rows[0] || null;
};

const revokeByTokenHash = async (tokenHash) => {
  const [result] = await pool.query(
    "UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE token_hash = ? AND revoked_at IS NULL",
    [tokenHash]
  );

  return result.affectedRows > 0;
};

const revokeByUserId = async (userId) => {
  const [result] = await pool.query(
    "UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = ? AND revoked_at IS NULL",
    [userId]
  );

  return result.affectedRows;
};

const revokeExpired = async () => {
  await pool.query(
    "UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE expires_at <= CURRENT_TIMESTAMP AND revoked_at IS NULL"
  );
};

module.exports = {
  getByTokenHash,
  create,
  revokeByTokenHash,
  revokeByUserId,
  revokeExpired
};
