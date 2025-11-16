const { pool } = require("../config/db");

exports.obtenerCatalogos = async (req, res) => {
  try {
    const [manzanas] = await pool.query("SELECT id, nombre FROM manzanas ORDER BY nombre");
    const [estados_nichos] = await pool.query(`
      SELECT 'Disponible' AS estado
      UNION SELECT 'Reservado'
      UNION SELECT 'Ocupado'
    `);

    return res.json({
      manzanas,
      estados_nichos,
    });
  } catch (err) {
    return res.status(500).json({ message: "Error en catálogos", error: err.message });
  }
};
