const service = require("../services/solicitudes.service");

const ESTADOS_VALIDOS = service.ESTADOS_VALIDOS;

function isPosInt(n) {
  return Number.isInteger(n) && n > 0;
}

exports.listar = async (req, res) => {
  try {
    const estado = req.query.estado ? String(req.query.estado).trim() : null;
    const propietario_id = req.query.propietario_id ? Number(req.query.propietario_id) : null;
    const nicho_id = req.query.nicho_id ? Number(req.query.nicho_id) : null;

    if (estado && !ESTADOS_VALIDOS.includes(estado)) {
      return res.status(400).json({
        message: `Estado inválido. Use: ${ESTADOS_VALIDOS.join(", ")}`,
      });
    }
    if (propietario_id !== null && !isPosInt(propietario_id)) {
      return res.status(400).json({ message: "propietario_id debe ser entero positivo." });
    }
    if (nicho_id !== null && !isPosInt(nicho_id)) {
      return res.status(400).json({ message: "nicho_id debe ser entero positivo." });
    }

    const data = await service.listar({ estado, propietario_id, nicho_id });

    return res.json({
      count: data.length,
      data,
    });
  } catch (err) {
    return res.status(500).json({ message: "Error al listar solicitudes", error: err.message });
  }
};

exports.obtenerPorId = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!isPosInt(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const item = await service.obtenerPorId(id);
    if (!item) {
      return res.status(404).json({ message: "Solicitud no encontrada" });
    }

    return res.json(item);
  } catch (err) {
    return res.status(500).json({ message: "Error al obtener solicitud", error: err.message });
  }
};

exports.crear = async (req, res) => {
  try {
    const propietario_id = Number(req.body.propietario_id);
    const nicho_id = Number(req.body.nicho_id);
    const fecha_solicitud = req.body.fecha_solicitud ? String(req.body.fecha_solicitud).trim() : null;

    if (!isPosInt(propietario_id)) {
      return res.status(400).json({
        message: "propietario_id es obligatorio y debe ser entero positivo.",
      });
    }
    if (!isPosInt(nicho_id)) {
      return res.status(400).json({
        message: "nicho_id es obligatorio y debe ser entero positivo.",
      });
    }

    if (fecha_solicitud && !/^\d{4}-\d{2}-\d{2}$/.test(fecha_solicitud)) {
      return res.status(400).json({
        message: "fecha_solicitud debe estar en formato YYYY-MM-DD.",
      });
    }

    const nueva = await service.crear({
      propietario_id,
      nicho_id,
      fecha_solicitud,
    });

    return res.status(201).json(nueva);
  } catch (err) {
    return res.status(500).json({ message: "Error al crear solicitud", error: err.message });
  }
};

exports.aprobar = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!isPosInt(id)) {
      return res.status(400).json({ message: "ID de solicitud inválido" });
    }

    const numero_recibo = req.body.numero_recibo ? String(req.body.numero_recibo).trim() : null;

    const result = await service.aprobar(id, { numero_recibo });
    
    if (result.notFound) {
      return res.status(404).json({ message: "Solicitud no encontrada" });
    }

    return res.json(result.updated);
  } catch (err) {
    if (err.code === "BAD_STATE") {
      return res.status(400).json({ message: err.message });
    }
    if (err.message === "RECIBO_NOT_FOUND") {
      return res.status(404).json({ message: "No existe un recibo con ese número. Regístralo primero en Recibos." });
    }
    return res.status(500).json({
      message: "Error al aprobar solicitud",
      error: err.message,
    });
  }
};

exports.rechazar = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!isPosInt(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const result = await service.rechazar(id);
    if (result.notFound) {
      return res.status(404).json({ message: "Solicitud no encontrada" });
    }

    return res.json(result.updated);
  } catch (err) {
    if (err.code === "BAD_STATE") {
      return res.status(400).json({ message: err.message });
    }
    return res.status(500).json({
      message: "Error al rechazar solicitud",
      error: err.message,
    });
  }
};
