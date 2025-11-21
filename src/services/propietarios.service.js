const { pool } = require("../config/db");

async function listar({ q }) {
  let sql = `
    SELECT 
      id,
      nombres,
      apellidos,
      dpi,
      telefono
    FROM propietarios
    WHERE 1=1
  `;
  const params = [];

  if (q) {
    // Usamos CONCAT para encontrar coincidencias aunque busquen nombre y apellido juntos
    sql += ` AND (
      CONCAT(nombres, ' ', apellidos) LIKE ? OR
      dpi LIKE ? OR
      telefono LIKE ?
    )`;
    const likeQ = `%${q}%`;
    params.push(likeQ, likeQ, likeQ);
  }

  sql += " ORDER BY apellidos, nombres";

  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function obtenerPorId(id) {
  const [rows] = await pool.execute(
    `SELECT id, nombres, apellidos, dpi, telefono
     FROM propietarios
     WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0];
}

async function crear({ nombres, apellidos, dpi, telefono }) {
  const [result] = await pool.execute(
    `INSERT INTO propietarios (nombres, apellidos, dpi, telefono)
     VALUES (?, ?, ?, ?)`,
    [nombres, apellidos, dpi, telefono]
  );
  return obtenerPorId(result.insertId);
}

async function actualizar(id, dto) {
  const sets = [];
  const params = [];

  if (dto.nombres !== undefined) {
    sets.push("nombres = ?");
    params.push(dto.nombres);
  }
  if (dto.apellidos !== undefined) {
    sets.push("apellidos = ?");
    params.push(dto.apellidos);
  }
  if (dto.dpi !== undefined) {
    sets.push("dpi = ?");
    params.push(dto.dpi);
  }
  if (dto.telefono !== undefined) {
    sets.push("telefono = ?");
    params.push(dto.telefono);
  }

  if (sets.length === 0) return false;

  params.push(id);

  const sql = `UPDATE propietarios SET ${sets.join(", ")} WHERE id = ?`;
  const [result] = await pool.execute(sql, params);

  return result.affectedRows > 0;
}

async function eliminar(id) {
  try {
    const [result] = await pool.execute(`DELETE FROM propietarios WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  } catch (err) {
    if (err.code === "ER_ROW_IS_REFERENCED_2" || err.errno === 1451) {
      err.code = "FK_CONFLICT";
    }
    throw err;
  }
}

module.exports = {
  listar,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
};
