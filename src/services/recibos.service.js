const { pool } = require("../config/db");

async function listar({ desde, hasta }) {
  const params = [];
  let sql = `
    SELECT
      r.id,
      r.monto,
      r.fecha_pago,
      r.numero_recibo
    FROM recibos r
    WHERE 1=1
  `;

  if (desde) {
    sql += " AND r.fecha_pago >= ?";
    params.push(desde);
  }
  if (hasta) {
    sql += " AND r.fecha_pago <= ?";
    params.push(hasta);
  }

  sql += " ORDER BY r.fecha_pago DESC, r.id DESC";

  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function obtenerPorId(id) {
  const [rows] = await pool.execute(
    `
    SELECT
      r.id,
      r.monto,
      r.fecha_pago,
      r.numero_recibo
    FROM recibos r
    WHERE r.id = ?
    LIMIT 1
    `,
    [id]
  );
  return rows[0];
}

async function crear({ monto, fecha_pago, numero_recibo }) {
  const [result] = await pool.execute(
    `
    INSERT INTO recibos (monto, fecha_pago, numero_recibo)
    VALUES (?, ?, ?)
    `,
    [monto, fecha_pago, numero_recibo]
  );

  return obtenerPorId(result.insertId);
}

module.exports = { listar, obtenerPorId, crear };
