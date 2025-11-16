const { pool } = require("../config/db");

async function listar({ usuario_id, desde, hasta }) {
  const params = [];
  let sql = `
    SELECT 
      a.id,
      a.usuario_id,
      u.nombre_completo AS usuario,
      a.accion,
      a.fecha
    FROM auditoria a
    JOIN usuarios u ON u.id = a.usuario_id
    WHERE 1=1
  `;

  if (usuario_id) {
    sql += " AND a.usuario_id = ?";
    params.push(usuario_id);
  }

  if (desde) {
    sql += " AND a.fecha >= ?";
    params.push(desde);
  }

  if (hasta) {
    sql += " AND a.fecha <= ?";
    params.push(hasta);
  }

  sql += " ORDER BY a.fecha DESC";

  const [rows] = await pool.execute(sql, params);
  return rows;
}

module.exports = { listar };
