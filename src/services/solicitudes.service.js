const { pool } = require("../config/db");

const ESTADOS_VALIDOS = ["Pendiente", "Aprobada", "Rechazada"];

// LISTAR (Esta se queda igual)
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
      m.nombre      AS manzana_nombre, -- Agregamos nombre de manzana
      s.recibo_id,
      r.numero_recibo,
      r.monto       AS recibo_monto,
      r.fecha_pago  AS recibo_fecha_pago,
      s.estado,
      s.fecha_solicitud
    FROM solicitudes_compra s
    JOIN propietarios p ON p.id = s.propietario_id
    JOIN nichos n       ON n.id = s.nicho_id
    JOIN manzanas m     ON m.id = n.manzana_id
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

// OBTENER POR ID (Igual, solo aseguramos traer nombre manzana)
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
      m.nombre      AS manzana_nombre,
      s.recibo_id,
      r.numero_recibo,
      r.monto       AS recibo_monto,
      r.fecha_pago  AS recibo_fecha_pago,
      s.estado,
      s.fecha_solicitud
    FROM solicitudes_compra s
    JOIN propietarios p ON p.id = s.propietario_id
    JOIN nichos n       ON n.id = s.nicho_id
    JOIN manzanas m     ON m.id = n.manzana_id
    LEFT JOIN recibos r ON r.id = s.recibo_id
    WHERE s.id = ?
    LIMIT 1
    `,
    [id]
  );
  return rows[0];
}

// --- CREAR (CORREGIDO: AHORA APARTA EL NICHO) ---
async function crear({ propietario_id, nicho_id, fecha_solicitud }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Verificar que el nicho esté Disponible antes de apartarlo
    const [nichoRows] = await conn.execute("SELECT estado FROM nichos WHERE id = ? FOR UPDATE", [nicho_id]);
    
    if (nichoRows.length === 0) throw new Error("El nicho no existe.");
    if (nichoRows[0].estado !== 'Disponible') {
      throw new Error("El nicho ya no está disponible (fue reservado u ocupado).");
    }

    // 2. Crear la solicitud
    const [result] = await conn.execute(
      `INSERT INTO solicitudes_compra (propietario_id, nicho_id, fecha_solicitud, estado)
       VALUES (?, ?, COALESCE(?, CURDATE()), 'Pendiente')`,
      [propietario_id, nicho_id, fecha_solicitud || null]
    );

    // 3. CAMBIAR ESTADO DEL NICHO A 'RESERVADO' (BLOQUEO)
    await conn.execute("UPDATE nichos SET estado = 'Reservado' WHERE id = ?", [nicho_id]);

    await conn.commit();
    return obtenerPorId(result.insertId); // Retornamos dato completo (fuera de transaccion esta lectura ok)

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// --- APROBAR (YA CORREGIDO EN EL PASO ANTERIOR: Pone Ocupado) ---
async function aprobar(id, { numero_recibo }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Validar solicitud
    const [rows] = await conn.execute("SELECT id, estado, nicho_id FROM solicitudes_compra WHERE id = ? LIMIT 1", [id]);
    const solicitud = rows[0];

    if (!solicitud) { await conn.rollback(); return { notFound: true }; }
    if (solicitud.estado !== "Pendiente") {
      throw new Error("Solo se pueden aprobar solicitudes en estado Pendiente.");
    }

    // Buscar Recibo por Numero
    let reciboIdFinal = null;
    if (numero_recibo) {
      const [recibos] = await conn.execute("SELECT id FROM recibos WHERE numero_recibo = ? LIMIT 1", [numero_recibo]);
      if (recibos.length === 0) throw new Error("RECIBO_NOT_FOUND");
      reciboIdFinal = recibos[0].id;
    }

    // Actualizar Solicitud
    let sqlSol = 'UPDATE solicitudes_compra SET estado = "Aprobada"';
    const paramsSol = [];
    if (reciboIdFinal) {
      sqlSol += ", recibo_id = ?";
      paramsSol.push(reciboIdFinal);
    }
    sqlSol += " WHERE id = ?";
    paramsSol.push(id);
    await conn.execute(sqlSol, paramsSol);

    // Actualizar Nicho a OCUPADO
    await conn.execute("UPDATE nichos SET estado = 'Ocupado' WHERE id = ?", [solicitud.nicho_id]);

    await conn.commit();
    return { notFound: false, updated: await obtenerPorId(id) };
  } catch (err) {
    await conn.rollback();
    if (err.message.includes("Pendiente")) err.code = "BAD_STATE";
    throw err;
  } finally {
    conn.release();
  }
}

// --- RECHAZAR (CORREGIDO: LIBERA EL NICHO) ---
async function rechazar(id) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.execute("SELECT id, estado, nicho_id FROM solicitudes_compra WHERE id = ? LIMIT 1", [id]);
    const row = rows[0];

    if (!row) { await conn.rollback(); return { notFound: true }; }
    if (row.estado !== "Pendiente") {
      throw new Error("Solo se pueden rechazar solicitudes en estado Pendiente.");
    }

    // 1. Marcar solicitud como rechazada
    await conn.execute('UPDATE solicitudes_compra SET estado = "Rechazada" WHERE id = ?', [id]);

    // 2. LIBERAR EL NICHO (Volver a Disponible)
    await conn.execute("UPDATE nichos SET estado = 'Disponible' WHERE id = ?", [row.nicho_id]);

    await conn.commit();
    return { notFound: false, updated: await obtenerPorId(id) };

  } catch (err) {
    await conn.rollback();
    if (err.message.includes("Pendiente")) err.code = "BAD_STATE";
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = {
  ESTADOS_VALIDOS,
  listar,
  obtenerPorId,
  crear,
  aprobar,
  rechazar,
};
