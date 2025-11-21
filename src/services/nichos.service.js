const { pool } = require("../config/db");

const ESTADOS_VALIDOS = ["Disponible", "Reservado", "Ocupado"];

async function listar({ manzanaId, estado, q, page, pageSize }) {
  const params = [];
  
  // 1. Armamos los filtros (WHERE)
  let whereClause = " WHERE 1=1";

  // --- MEJORA CLAVE: JOINs INTELIGENTES ---
  // Ahora unimos también con 'solicitudes_compra' para ver dueños por compra, no solo por alquiler.
  let joins = `
    JOIN manzanas m ON m.id = n.manzana_id
    
    -- 1. Buscamos Arrendamientos Activos (Inquilinos)
    LEFT JOIN arrendamientos a ON a.nicho_id = n.id 
         AND (a.fecha_fin IS NULL OR a.fecha_fin >= CURDATE())
    LEFT JOIN propietarios p_arr ON p_arr.id = a.propietario_id

    -- 2. Buscamos Solicitudes (Dueños por compra o Reservas)
    -- Priorizamos las Aprobadas (Dueños) o Pendientes (Reservas)
    LEFT JOIN solicitudes_compra s ON s.nicho_id = n.id 
         AND s.estado IN ('Aprobada', 'Pendiente')
    LEFT JOIN propietarios p_sol ON p_sol.id = s.propietario_id
  `;

  if (manzanaId) {
    whereClause += " AND n.manzana_id = ?";
    params.push(manzanaId);
  }

  if (estado) {
    whereClause += " AND n.estado = ?";
    params.push(estado);
  }

  if (q) {
    const n = Number(q);
    if (Number.isInteger(n)) {
      whereClause += " AND n.numero = ?";
      params.push(n);
    } else {
      // Búsqueda por texto ampliada a ambos tipos de propietarios
      whereClause += ` AND (
        m.nombre LIKE ? OR 
        p_arr.nombres LIKE ? OR p_arr.apellidos LIKE ? OR
        p_sol.nombres LIKE ? OR p_sol.apellidos LIKE ? OR
        a.nombre_difunto LIKE ?
      )`;
      const likeQ = `%${q}%`;
      // Repetimos el parámetro para cada ?
      params.push(likeQ, likeQ, likeQ, likeQ, likeQ, likeQ);
    }
  }

  // 2. CONSULTA 1: CONTAR EL TOTAL REAL
  const sqlCount = `SELECT COUNT(*) as total FROM nichos n ${joins} ${whereClause}`;
  const [rowsCount] = await pool.execute(sqlCount, params);
  const totalReal = rowsCount[0].total;

  // 3. CONSULTA 2: TRAER LOS DATOS
  const limit = pageSize;
  const offset = (page - 1) * pageSize;
  
  // Usamos COALESCE para elegir el nombre: 
  // Si hay Arrendamiento (p_arr), mostramos ese. Si no, mostramos el de la Solicitud (p_sol).
  const sqlData = `
    SELECT
      n.id,
      n.numero,
      n.estado,
      n.manzana_id,
      m.nombre AS manzana,
      
      -- Datos de arrendamiento (si existe)
      a.id AS arrendamiento_id,
      a.fecha_inicio,
      a.fecha_fin,
      a.nombre_difunto,
      
      -- Datos del Solicitud/Compra (si existe)
      s.id AS solicitud_id,
      s.estado AS solicitud_estado,

      -- LÓGICA DEL PROPIETARIO (La Magia)
      COALESCE(p_arr.id, p_sol.id) AS propietario_id,
      COALESCE(p_arr.nombres, p_sol.nombres) AS nombres,
      COALESCE(p_arr.apellidos, p_sol.apellidos) AS apellidos,
      COALESCE(p_arr.telefono, p_sol.telefono) AS telefono

    FROM nichos n
    ${joins}
    ${whereClause}
    ORDER BY m.nombre, n.numero
    LIMIT ${limit} OFFSET ${offset}
  `;

  const [rows] = await pool.execute(sqlData, params);

  return { data: rows, total: totalReal };
}

// --- RESTO DE FUNCIONES (SE MANTIENEN IGUAL QUE ANTES) ---

async function obtenerPorId(id) {
  const [rows] = await pool.execute(
    `
    SELECT
      n.id,
      n.numero,
      n.estado,
      n.manzana_id,
      m.nombre AS manzana
    FROM nichos n
    JOIN manzanas m ON m.id = n.manzana_id
    WHERE n.id = ?
    LIMIT 1
    `,
    [id]
  );
  return rows[0];
}

async function obtenerPorNumero({ numero, manzana_id, manzana }) {
  const params = [numero];
  let sql = `
    SELECT
      n.id,
      n.numero,
      n.estado,
      n.manzana_id,
      m.nombre AS manzana
    FROM nichos n
    JOIN manzanas m ON m.id = n.manzana_id
    WHERE n.numero = ?
  `;

  if (manzana_id) {
    sql += " AND n.manzana_id = ?";
    params.push(manzana_id);
  } else if (manzana) {
    sql += " AND m.nombre = ?";
    params.push(manzana);
  }

  sql += " LIMIT 1";

  const [rows] = await pool.execute(sql, params);
  return rows[0];
}

async function crear({ numero, estado, manzana_id }) {
  const [result] = await pool.execute("INSERT INTO nichos (numero, estado, manzana_id) VALUES (?, ?, ?)", [
    numero,
    estado,
    manzana_id,
  ]);
  const id = result.insertId;
  return obtenerPorId(id);
}

async function actualizar(id, dto) {
  const sets = [];
  const params = [];
  if (dto.numero !== undefined) {
    sets.push("numero = ?");
    params.push(dto.numero);
  }
  if (dto.manzana_id !== undefined) {
    sets.push("manzana_id = ?");
    params.push(dto.manzana_id);
  }
  if (dto.estado !== undefined) {
    sets.push("estado = ?");
    params.push(dto.estado);
  }

  if (sets.length === 0) {
    return null;
  }

  params.push(id);
  const sql = `UPDATE nichos SET ${sets.join(", ")} WHERE id = ?`;
  const [result] = await pool.execute(sql, params);
  return result.affectedRows > 0;
}

async function eliminar(id) {
  try {
    const [result] = await pool.execute("DELETE FROM nichos WHERE id = ?", [id]);
    return result.affectedRows > 0;
  } catch (err) {
    if (err.code === "ER_ROW_IS_REFERENCED_2" || err.errno === 1451) {
      err.code = "FK_CONFLICT";
    }
    throw err;
  }
}

async function cambiarEstado(id, nuevo_estado) {
  if (!ESTADOS_VALIDOS.includes(nuevo_estado)) {
    const e = new Error(`Estado inválido. Use: ${ESTADOS_VALIDOS.join(", ")}`);
    e.code = "BAD_STATE";
    throw e;
  }

  const [result] = await pool.execute("UPDATE nichos SET estado = ? WHERE id = ?", [nuevo_estado, id]);
  if (result.affectedRows === 0) return null;

  return obtenerPorId(id);
}

module.exports = {
  ESTADOS_VALIDOS,
  listar,
  obtenerPorId,
  obtenerPorNumero,
  crear,
  actualizar,
  eliminar,
  cambiarEstado,
};
