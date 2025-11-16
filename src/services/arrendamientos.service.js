const { pool } = require("../config/db");

async function listar({ estado, propietario_id, nicho_id }) {
  const params = [];
  let sql = `
    SELECT
      a.id,
      a.propietario_id,
      p.nombres,
      p.apellidos,
      a.nicho_id,
      n.numero        AS numero_nicho,
      n.manzana_id,
      a.recibo_id,
      r.numero_recibo,
      r.monto         AS recibo_monto,
      r.fecha_pago    AS recibo_fecha_pago,
      a.fecha_inicio,
      a.fecha_fin,
      a.nombre_difunto,
      CASE
        WHEN a.fecha_fin IS NULL OR a.fecha_fin >= CURDATE() THEN 'Vigente'
        ELSE 'Vencido'
      END AS estado_virtual
    FROM arrendamientos a
    JOIN propietarios p ON p.id = a.propietario_id
    JOIN nichos n       ON n.id = a.nicho_id
    LEFT JOIN recibos r ON r.id = a.recibo_id
    WHERE 1=1
  `;

  if (estado === "Vigente") {
    sql += " AND (a.fecha_fin IS NULL OR a.fecha_fin >= CURDATE())";
  } else if (estado === "Vencido") {
    sql += " AND (a.fecha_fin IS NOT NULL AND a.fecha_fin < CURDATE())";
  }

  if (propietario_id) {
    sql += " AND a.propietario_id = ?";
    params.push(propietario_id);
  }

  if (nicho_id) {
    sql += " AND a.nicho_id = ?";
    params.push(nicho_id);
  }

  sql += " ORDER BY a.fecha_inicio DESC, a.id DESC";

  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function obtenerPorId(id) {
  const [rows] = await pool.execute(
    `
    SELECT
      a.id,
      a.propietario_id,
      p.nombres,
      p.apellidos,
      a.nicho_id,
      n.numero        AS numero_nicho,
      n.manzana_id,
      a.recibo_id,
      r.numero_recibo,
      r.monto         AS recibo_monto,
      r.fecha_pago    AS recibo_fecha_pago,
      a.fecha_inicio,
      a.fecha_fin,
      a.nombre_difunto,
      CASE
        WHEN a.fecha_fin IS NULL OR a.fecha_fin >= CURDATE() THEN 'Vigente'
        ELSE 'Vencido'
      END AS estado_virtual
    FROM arrendamientos a
    JOIN propietarios p ON p.id = a.propietario_id
    JOIN nichos n       ON n.id = a.nicho_id
    LEFT JOIN recibos r ON r.id = a.recibo_id
    WHERE a.id = ?
    LIMIT 1
    `,
    [id]
  );
  return rows[0];
}

async function crear({ propietario_id, nicho_id, recibo_id, fecha_inicio, fecha_fin, nombre_difunto }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [resInsert] = await conn.execute(
      `
      INSERT INTO arrendamientos (
        propietario_id,
        nicho_id,
        recibo_id,
        fecha_inicio,
        fecha_fin,
        nombre_difunto
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        propietario_id,
        nicho_id,
        recibo_id || null,
        fecha_inicio,
        fecha_fin || null,
        nombre_difunto || null,
      ]
    );

    await conn.execute(`UPDATE nichos SET estado = 'Ocupado' WHERE id = ?`, [nicho_id]);

    await conn.commit();
    const id = resInsert.insertId;

    return obtenerPorId(id);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function renovar(id, { nueva_fecha_fin }) {
  const [rows] = await pool.execute("SELECT id FROM arrendamientos WHERE id = ? LIMIT 1", [id]);
  const row = rows[0];
  if (!row) return { notFound: true };

  await pool.execute("UPDATE arrendamientos SET fecha_fin = ? WHERE id = ?", [nueva_fecha_fin, id]);

  return { notFound: false, updated: await obtenerPorId(id) };
}

async function cancelar(id) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.execute("SELECT id, nicho_id FROM arrendamientos WHERE id = ? LIMIT 1", [id]);
    const row = rows[0];
    if (!row) {
      await conn.rollback();
      return { notFound: true };
    }

    await conn.execute("UPDATE arrendamientos SET fecha_fin = CURDATE() WHERE id = ?", [id]);

    await conn.execute(`UPDATE nichos SET estado = 'Disponible' WHERE id = ?`, [row.nicho_id]);

    await conn.commit();
    return { notFound: false, updated: await obtenerPorId(id) };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = {
  listar,
  obtenerPorId,
  crear,
  renovar,
  cancelar,
};
