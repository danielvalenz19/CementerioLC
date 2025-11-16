const { pool } = require("../config/db");

const ESTADOS_VALIDOS = ["Pendiente", "Aprobada", "Rechazada"];

async function listar({ estado, propietario_id, nicho_id }) {
  const params = [];
  let sql = `
    SELECT
      s.id,
      s.propietario_id,
      p.nombres,
      p.apellidos,
      s.nicho_id,
      n.numero      AS numero_nicho,
      n.manzana_id,
      s.recibo_id,
      r.numero_recibo,
      r.monto       AS recibo_monto,
      r.fecha_pago  AS recibo_fecha_pago,
      s.estado,
      s.fecha_solicitud
    FROM solicitudes_compra s
    JOIN propietarios p ON p.id = s.propietario_id
    JOIN nichos n       ON n.id = s.nicho_id
    LEFT JOIN recibos r ON r.id = s.recibo_id
    WHERE 1 = 1
  `;

  if (estado) {
    sql += " AND s.estado = ?";
    params.push(estado);
  }
  if (propietario_id) {
    sql += " AND s.propietario_id = ?";
    params.push(propietario_id);
  }
  if (nicho_id) {
    sql += " AND s.nicho_id = ?";
    params.push(nicho_id);
  }

  sql += " ORDER BY s.fecha_solicitud DESC, s.id DESC";

  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function obtenerPorId(id) {
  const [rows] = await pool.execute(
    `
    SELECT
      s.id,
      s.propietario_id,
      p.nombres,
      p.apellidos,
      s.nicho_id,
      n.numero      AS numero_nicho,
      n.manzana_id,
      s.recibo_id,
      r.numero_recibo,
      r.monto       AS recibo_monto,
      r.fecha_pago  AS recibo_fecha_pago,
      s.estado,
      s.fecha_solicitud
    FROM solicitudes_compra s
    JOIN propietarios p ON p.id = s.propietario_id
    JOIN nichos n       ON n.id = s.nicho_id
    LEFT JOIN recibos r ON r.id = s.recibo_id
    WHERE s.id = ?
    LIMIT 1
    `,
    [id]
  );
  return rows[0];
}

async function crear({ propietario_id, nicho_id, fecha_solicitud }) {
  const [result] = await pool.execute(
    `
    INSERT INTO solicitudes_compra (
      propietario_id,
      nicho_id,
      fecha_solicitud,
      estado
    )
    VALUES (
      ?,
      ?,
      COALESCE(?, CURDATE()),
      'Pendiente'
    )
    `,
    [propietario_id, nicho_id, fecha_solicitud || null]
  );

  return obtenerPorId(result.insertId);
}

async function aprobar(id, { recibo_id }) {
  const [rows] = await pool.execute(
    "SELECT id, estado, recibo_id FROM solicitudes_compra WHERE id = ? LIMIT 1",
    [id]
  );
  const row = rows[0];
  if (!row) return { notFound: true };

  if (row.estado !== "Pendiente") {
    const err = new Error("Solo se pueden aprobar solicitudes en estado Pendiente.");
    err.code = "BAD_STATE";
    throw err;
  }

  const params = [];
  let sql = 'UPDATE solicitudes_compra SET estado = "Aprobada"';

  if (recibo_id !== undefined) {
    sql += ", recibo_id = ?";
    params.push(recibo_id);
  }

  sql += " WHERE id = ?";
  params.push(id);

  await pool.execute(sql, params);

  return { notFound: false, updated: await obtenerPorId(id) };
}

async function rechazar(id) {
  const [rows] = await pool.execute("SELECT id, estado FROM solicitudes_compra WHERE id = ? LIMIT 1", [
    id,
  ]);
  const row = rows[0];
  if (!row) return { notFound: true };

  if (row.estado !== "Pendiente") {
    const err = new Error("Solo se pueden rechazar solicitudes en estado Pendiente.");
    err.code = "BAD_STATE";
    throw err;
  }

  await pool.execute('UPDATE solicitudes_compra SET estado = "Rechazada" WHERE id = ?', [id]);

  return { notFound: false, updated: await obtenerPorId(id) };
}

module.exports = {
  ESTADOS_VALIDOS,
  listar,
  obtenerPorId,
  crear,
  aprobar,
  rechazar,
};
