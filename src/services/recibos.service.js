const { pool } = require("../config/db");

async function listar({ desde, hasta, search }) {
  const params = [];
  
  // LÓGICA MEJORADA: Hacemos JOIN inverso para saber de qué es el recibo
  let sql = `
    SELECT
      r.id,
      r.monto,
      r.fecha_pago,
      r.numero_recibo,
      
      -- Intentamos encontrar quién está asociado a este recibo
      COALESCE(
        CONCAT(p_arr.nombres, ' ', p_arr.apellidos),
        CONCAT(p_sol.nombres, ' ', p_sol.apellidos),
        CONCAT(p_tras_nuevo.nombres, ' ', p_tras_nuevo.apellidos),
        'Desconocido / Sin asignar'
      ) AS propietario_nombre,

      -- Determinamos el concepto según la tabla donde se encuentre
      CASE
        WHEN a.id IS NOT NULL THEN CONCAT('Arrendamiento - Nicho ', IFNULL(n_arr.numero, '?'))
        WHEN s.id IS NOT NULL THEN CONCAT('Solicitud Compra - Nicho ', IFNULL(n_sol.numero, '?'))
        WHEN t.id IS NOT NULL THEN 'Traspaso de Título'
        ELSE 'Pago General'
      END AS concepto

    FROM recibos r
    
    -- Buscamos en Arrendamientos
    LEFT JOIN arrendamientos a ON a.recibo_id = r.id
    LEFT JOIN propietarios p_arr ON a.propietario_id = p_arr.id
    LEFT JOIN nichos n_arr ON a.nicho_id = n_arr.id

    -- Buscamos en Solicitudes
    LEFT JOIN solicitudes_compra s ON s.recibo_id = r.id
    LEFT JOIN propietarios p_sol ON s.propietario_id = p_sol.id
    LEFT JOIN nichos n_sol ON s.nicho_id = n_sol.id

    -- Buscamos en Traspasos
    LEFT JOIN traspasos t ON t.recibo_id = r.id
    LEFT JOIN propietarios p_tras_nuevo ON t.nuevo_propietario_id = p_tras_nuevo.id

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
  if (search) {
    sql += " AND r.numero_recibo LIKE ?";
    params.push(`%${search}%`);
  }

  sql += " ORDER BY r.fecha_pago DESC, r.id DESC";

  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function obtenerPorId(id) {
  // Reutilizamos la lógica para el detalle
  // (Podrías copiar la query gigante de arriba y agregar "AND r.id = ? LIMIT 1")
  // Por brevedad, dejaremos la básica o puedes expandirla igual que listar.
  const [rows] = await pool.execute(`SELECT * FROM recibos WHERE id = ?`, [id]);
  return rows[0];
}

async function crear({ monto, fecha_pago, numero_recibo }) {
  const [result] = await pool.execute(
    `INSERT INTO recibos (monto, fecha_pago, numero_recibo) VALUES (?, ?, ?)`,
    [monto, fecha_pago, numero_recibo]
  );
  // Retornamos el ID para que el frontend pueda usarlo
  return { id: result.insertId, monto, fecha_pago, numero_recibo };
}

module.exports = { listar, obtenerPorId, crear };
