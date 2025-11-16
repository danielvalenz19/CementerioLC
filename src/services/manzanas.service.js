const { pool } = require("../config/db");

async function listar({ search }) {
  let sql = "SELECT id, nombre FROM manzanas";
  const params = [];

  if (search) {
    sql += " WHERE nombre LIKE ?";
    params.push(`%${search}%`);
  }

  sql += " ORDER BY nombre ASC";

  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function obtenerPorId(id) {
  const [rows] = await pool.execute("SELECT id, nombre FROM manzanas WHERE id = ?", [id]);
  return rows[0];
}

async function crear({ nombre }) {
  const [result] = await pool.execute("INSERT INTO manzanas (nombre) VALUES (?)", [nombre]);
  const id = result.insertId;
  return { id, nombre };
}

async function actualizar(id, { nombre }) {
  const [result] = await pool.execute("UPDATE manzanas SET nombre = ? WHERE id = ?", [nombre, id]);
  return result.affectedRows > 0;
}

async function eliminar(id) {
  const [result] = await pool.execute("DELETE FROM manzanas WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

module.exports = {
  listar,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
};
