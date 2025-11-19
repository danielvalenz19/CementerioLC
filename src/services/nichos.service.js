const { pool } = require("../config/db");

const ESTADOS_VALIDOS = ["Disponible", "Reservado", "Ocupado"];

async function listar({ manzanaId, estado, q, page, pageSize }) {
  const params = [];
  // CORRECCIÓN: Agregamos LEFT JOIN a arrendamientos y propietarios
  // Filtramos el arrendamiento para que sea el "Vigente" (fecha_fin NULL o futura)
  let sql = `
    SELECT
      n.id,
      n.numero,
      n.estado,
      n.manzana_id,
      m.nombre AS manzana,
      
      -- Datos del Arrendamiento Vigente
      a.id AS arrendamiento_id,
      a.fecha_inicio,
      a.fecha_fin,
      a.nombre_difunto,
      
      -- Datos del Propietario
      p.id AS propietario_id,
      p.nombres,
      p.apellidos,
      p.telefono
      
    FROM nichos n
    JOIN manzanas m ON m.id = n.manzana_id
    
    -- Buscamos solo el arrendamiento ACTIVO (si existe)
    LEFT JOIN arrendamientos a ON a.nicho_id = n.id 
         AND (a.fecha_fin IS NULL OR a.fecha_fin >= CURDATE())
         
    LEFT JOIN propietarios p ON p.id = a.propietario_id
    
    WHERE 1=1
  `;

  if (manzanaId) {
    sql += " AND n.manzana_id = ?";
    params.push(manzanaId);
  }

  if (estado) {
    sql += " AND n.estado = ?";
    params.push(estado);
  }

  if (q) {
    const n = Number(q);
    if (Number.isInteger(n)) {
      sql += " AND n.numero = ?";
      params.push(n);
    } else {
      // Búsqueda extendida: ahora permite buscar por nombre de propietario o difunto también
      sql += ` AND (
        m.nombre LIKE ? OR 
        p.nombres LIKE ? OR 
        p.apellidos LIKE ? OR 
        a.nombre_difunto LIKE ?
      )`;
      const likeQ = `%${q}%`;
      params.push(likeQ, likeQ, likeQ, likeQ);
    }
  }

  const limit = pageSize;
  const offset = (page - 1) * pageSize;
  sql += ` ORDER BY m.nombre, n.numero LIMIT ${limit} OFFSET ${offset}`;

  const [rows] = await pool.execute(sql, params);
  return rows;
}


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
