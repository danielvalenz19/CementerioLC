const { pool } = require("../config/db");

async function listar() {
  const [rows] = await pool.query(`
    SELECT *
    FROM tarifas
    ORDER BY vigencia_desde DESC
  `);
  return rows;
}

async function crear(dto) {
  const { concepto, alcance, monto, moneda, vigencia_desde, vigencia_hasta } = dto;

  const [res] = await pool.execute(
    `
    INSERT INTO tarifas (concepto, alcance, monto, moneda, vigencia_desde, vigencia_hasta)
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [concepto, alcance, monto, moneda, vigencia_desde, vigencia_hasta || null]
  );

  const [row] = await pool.query("SELECT * FROM tarifas WHERE id = ?", [res.insertId]);
  return row[0];
}

async function actualizar(id, dto) {
  const sets = [];
  const params = [];

  Object.entries(dto).forEach(([key, value]) => {
    sets.push(`${key} = ?`);
    params.push(value);
  });

  if (sets.length === 0) return false;

  params.push(id);

  const [res] = await pool.execute(`UPDATE tarifas SET ${sets.join(", ")} WHERE id = ?`, params);

  return res.affectedRows > 0;
}

module.exports = { listar, crear, actualizar };
