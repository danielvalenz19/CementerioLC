const { pool } = require("../config/db");

async function ocupacion() {
  const [rows] = await pool.execute(`
    SELECT estado, COUNT(*) AS total
    FROM nichos
    GROUP BY estado
  `);
  return rows;
}

async function arrendamientos({ desde, hasta }) {
  const params = [];
  let sql = `
    SELECT 
      a.id,
      p.nombres,
      p.apellidos,
      n.numero AS numero_nicho,
      a.fecha_inicio,
      a.fecha_fin
    FROM arrendamientos a
    JOIN propietarios p ON p.id = a.propietario_id
    JOIN nichos n ON n.id = a.nicho_id
    WHERE 1=1
  `;

  if (desde) {
    sql += " AND a.fecha_inicio >= ?";
    params.push(desde);
  }
  if (hasta) {
    sql += " AND a.fecha_inicio <= ?";
    params.push(hasta);
  }

  sql += " ORDER BY a.fecha_inicio DESC";

  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function cartera() {
  const [rows] = await pool.execute(`
    SELECT 
      a.id AS arrendamiento_id,
      p.nombres,
      p.apellidos,
      n.numero AS numero_nicho,
      a.fecha_fin,
      DATEDIFF(CURDATE(), a.fecha_fin) AS dias_mora
    FROM arrendamientos a
    JOIN propietarios p ON p.id = a.propietario_id
    JOIN nichos n ON n.id = a.nicho_id
    WHERE a.fecha_fin < CURDATE()
  `);
  return rows;
}

module.exports = { ocupacion, arrendamientos, cartera };
