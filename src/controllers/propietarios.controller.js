const service = require("../services/propietarios.service");

function isPosInt(n) {
  return Number.isInteger(n) && n > 0;
}

exports.listar = async (req, res) => {
  try {
    const q = req.query.q ? String(req.query.q).trim() : null;
    const data = await service.listar({ q });
    return res.json({
      count: data.length,
      data,
    });
  } catch (err) {
    return res.status(500).json({ message: "Error al listar propietarios", error: err.message });
  }
};

exports.obtenerPorId = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!isPosInt(id)) return res.status(400).json({ message: "ID inválido" });

    const item = await service.obtenerPorId(id);
    if (!item) return res.status(404).json({ message: "Propietario no encontrado" });

    return res.json(item);
  } catch (err) {
    return res.status(500).json({ message: "Error al obtener propietario", error: err.message });
  }
};

exports.crear = async (req, res) => {
  try {
    const { nombres, apellidos, dpi, telefono } = req.body || {};

    if (!nombres || !apellidos) {
      return res.status(400).json({
        message: "nombres y apellidos son obligatorios",
      });
    }

    const nuevo = await service.crear({
      nombres,
      apellidos,
      dpi: dpi || null,
      telefono: telefono || null,
    });

    return res.status(201).json(nuevo);
  } catch (err) {
    return res.status(500).json({ message: "Error al crear propietario", error: err.message });
  }
};

exports.actualizar = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!isPosInt(id)) return res.status(400).json({ message: "ID inválido" });

    const dto = { ...req.body };
    const ok = await service.actualizar(id, dto);

    if (!ok) return res.status(404).json({ message: "Propietario no encontrado para actualizar" });

    return res.status(204).end();
  } catch (err) {
    return res.status(500).json({ message: "Error al actualizar propietario", error: err.message });
  }
};

exports.eliminar = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!isPosInt(id)) return res.status(400).json({ message: "ID inválido" });

    try {
      const ok = await service.eliminar(id);
      if (!ok) return res.status(404).json({ message: "Propietario no encontrado para eliminar" });
    } catch (err) {
      if (err.code === "FK_CONFLICT") {
        return res.status(409).json({
          message: "No se puede eliminar porque tiene nichos, solicitudes o arrendamientos relacionados.",
        });
      }
      throw err;
    }

    return res.status(204).end();
  } catch (err) {
    return res.status(500).json({ message: "Error al eliminar propietario", error: err.message });
  }
};
