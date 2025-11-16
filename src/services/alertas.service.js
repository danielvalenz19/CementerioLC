const { pool } = require("../config/db");

async function vencimientos() {
  const [rows] = await pool.execute(`
    SELECT
      a.id AS arrendamiento_id,
      p.nombres,
      p.apellidos,
      n.numero AS numero_nicho,
      n.manzana_id,
      a.fecha_fin,
      DATEDIFF(a.fecha_fin, CURDATE()) AS dias_restantes
    FROM arrendamientos a
    JOIN propietarios p ON p.id = a.propietario_id
    JOIN nichos n ON n.id = a.nicho_id
    WHERE a.fecha_fin IS NOT NULL
      AND a.fecha_fin >= CURDATE()
      AND DATEDIFF(a.fecha_fin, CURDATE()) <= 30
    ORDER BY a.fecha_fin ASC
  `);

  return rows;
}

module.exports = { vencimientos };
