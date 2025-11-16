const { pool } = require("../config/db");

async function listar({ propietario_id, nicho_id }) {
  const params = [];
  let sql = `
    SELECT
      t.id,
      t.propietario_anterior_id,
      pa.nombres AS anterior_nombres,
      pa.apellidos AS anterior_apellidos,
      t.nuevo_propietario_id,
      pn.nombres AS nuevo_nombres,
      pn.apellidos AS nuevo_apellidos,
      t.nicho_id,
      n.numero AS numero_nicho,
      n.manzana_id,
      t.recibo_id,
      r.numero_recibo,
      r.monto AS recibo_monto,
      t.fecha_traspaso
    FROM traspasos t
    JOIN propietarios pa ON pa.id = t.propietario_anterior_id
    JOIN propietarios pn ON pn.id = t.nuevo_propietario_id
    JOIN nichos n ON n.id = t.nicho_id
    LEFT JOIN recibos r ON r.id = t.recibo_id
    WHERE 1=1
  `;

  if (propietario_id) {
    sql += " AND t.nuevo_propietario_id = ?";
    params.push(propietario_id);
  }

  if (nicho_id) {
    sql += " AND t.nicho_id = ?";
    params.push(nicho_id);
  }

  sql += " ORDER BY t.fecha_traspaso DESC, t.id DESC";

  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function obtenerPorId(id) {
  const [rows] = await pool.execute(
    `
    SELECT
      t.id,
      t.propietario_anterior_id,
      pa.nombres AS anterior_nombres,
      pa.apellidos AS anterior_apellidos,
      t.nuevo_propietario_id,
      pn.nombres AS nuevo_nombres,
      pn.apellidos AS nuevo_apellidos,
      t.nicho_id,
      n.numero AS numero_nicho,
      n.manzana_id,
      t.recibo_id,
      r.numero_recibo,
      r.monto AS recibo_monto,
      t.fecha_traspaso
    FROM traspasos t
    JOIN propietarios pa ON pa.id = t.propietario_anterior_id
    JOIN propietarios pn ON pn.id = t.nuevo_propietario_id
    JOIN nichos n ON n.id = t.nicho_id
    LEFT JOIN recibos r ON r.id = t.recibo_id
    WHERE t.id = ?
    LIMIT 1
    `,
    [id]
  );
  return rows[0];
}

async function crear({ propietario_anterior_id, nuevo_propietario_id, nicho_id, recibo_id }) {
  const fecha = new Date().toISOString().slice(0, 10);

  const [result] = await pool.execute(
    `
    INSERT INTO traspasos (
      propietario_anterior_id,
      nuevo_propietario_id,
      nicho_id,
      recibo_id,
      fecha_traspaso
    )
    VALUES (?, ?, ?, ?, ?)
    `,
    [propietario_anterior_id, nuevo_propietario_id, nicho_id, recibo_id || null, fecha]
  );

  return obtenerPorId(result.insertId);
}

module.exports = {
  listar,
  obtenerPorId,
  crear,
};
