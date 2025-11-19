const { pool } = require("../config/db");
const bcrypt = require("bcrypt");

// Listar todos los usuarios
exports.listar = async (req, res) => {
  try {
    // Ocultamos el password en la consulta
    const [rows] = await pool.query(
      `
      SELECT u.id, u.nombre_completo, u.correo, u.rol_id, r.nombre as rol_nombre, u.activo
      FROM usuarios u
      LEFT JOIN roles r ON u.rol_id = r.id
      ORDER BY u.nombre_completo ASC
    `,
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ message: "Error al listar usuarios", error: err.message });
  }
};

// Crear nuevo usuario
exports.crear = async (req, res) => {
  try {
    const { nombre_completo, correo, password, rol_id } = req.body;

    if (!nombre_completo || !correo || !password || !rol_id) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // Verificar si el correo ya existe
    const [existing] = await pool.query("SELECT id FROM usuarios WHERE correo = ?", [correo]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "El correo ya está registrado." });
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    await pool.query(
      "INSERT INTO usuarios (nombre_completo, correo, password, rol_id, activo) VALUES (?, ?, ?, ?, 1)",
      [nombre_completo, correo, hash, rol_id],
    );

    return res.status(201).json({ message: "Usuario creado exitosamente" });
  } catch (err) {
    return res.status(500).json({ message: "Error al crear usuario", error: err.message });
  }
};

// Cambiar estado (Activar/Desactivar)
exports.toggleEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { activo } = req.body; // boolean

    await pool.query("UPDATE usuarios SET activo = ? WHERE id = ?", [activo ? 1 : 0, id]);
    return res.json({ message: "Estado actualizado" });
  } catch (err) {
    return res.status(500).json({ message: "Error al actualizar estado", error: err.message });
  }
};

exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;

    // Opcional: Evitar que un usuario se borre a sí mismo si tienes el id en req.auth
    // if (req.auth.sub == id) return res.status(400).json({ message: "No puedes eliminar tu propio usuario." });

    const [result] = await pool.query("DELETE FROM usuarios WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    return res.status(204).end(); // 204 No Content (éxito sin cuerpo)
  } catch (err) {
    // Si el error es por clave foránea (tiene auditoría o registros asociados)
    if (err.code === "ER_ROW_IS_REFERENCED_2" || err.errno === 1451) {
      return res.status(409).json({
        message: "No se puede eliminar: El usuario tiene historial en el sistema. Debes desactivarlo en su lugar.",
      });
    }
    return res.status(500).json({ message: "Error al eliminar usuario", error: err.message });
  }
};
