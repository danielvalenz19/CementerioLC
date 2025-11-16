const service = require("../services/arrendamientos.service");

function isPosInt(n) {
  return Number.isInteger(n) && n > 0;
}

exports.listar = async (req, res) => {
  try {
    const estado = req.query.estado ? String(req.query.estado).trim() : null;
    const propietario_id = req.query.propietario_id ? Number(req.query.propietario_id) : null;
    const nicho_id = req.query.nicho_id ? Number(req.query.nicho_id) : null;

    if (estado && !["Vigente", "Vencido"].includes(estado)) {
      return res.status(400).json({
        message: "estado debe ser 'Vigente' o 'Vencido' si se envía.",
      });
    }
    if (propietario_id !== null && !isPosInt(propietario_id)) {
      return res.status(400).json({
        message: "propietario_id debe ser entero positivo.",
      });
    }
    if (nicho_id !== null && !isPosInt(nicho_id)) {
      return res.status(400).json({
        message: "nicho_id debe ser entero positivo.",
      });
    }

    const data = await service.listar({ estado, propietario_id, nicho_id });
    return res.json({
      count: data.length,
      data,
    });
  } catch (err) {
    return res.status(500).json({ message: "Error al listar arrendamientos", error: err.message });
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
      return res.status(404).json({ message: "Arrendamiento no encontrado" });
    }

    return res.json(item);
  } catch (err) {
    return res.status(500).json({ message: "Error al obtener arrendamiento", error: err.message });
  }
};

exports.crear = async (req, res) => {
  try {
    const propietario_id = Number(req.body.propietario_id);
    const nicho_id = Number(req.body.nicho_id);
    const recibo_id = req.body.recibo_id !== undefined ? Number(req.body.recibo_id) : undefined;

    const fecha_inicio = req.body.fecha_inicio ? String(req.body.fecha_inicio).trim() : null;
    const fecha_fin = req.body.fecha_fin ? String(req.body.fecha_fin).trim() : null;
    const nombre_difunto = req.body.nombre_difunto ? String(req.body.nombre_difunto).trim() : null;

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
    if (recibo_id !== undefined && !isPosInt(recibo_id)) {
      return res.status(400).json({
        message: "recibo_id debe ser entero positivo si se envía.",
      });
    }

    if (!fecha_inicio || !/^\d{4}-\d{2}-\d{2}$/.test(fecha_inicio)) {
      return res.status(400).json({
        message: "fecha_inicio es obligatoria y debe estar en formato YYYY-MM-DD.",
      });
    }

    if (fecha_fin && !/^\d{4}-\d{2}-\d{2}$/.test(fecha_fin)) {
      return res.status(400).json({
        message: "fecha_fin debe estar en formato YYYY-MM-DD si se envía.",
      });
    }

    const nuevo = await service.crear({
      propietario_id,
      nicho_id,
      recibo_id,
      fecha_inicio,
      fecha_fin,
      nombre_difunto,
    });

    return res.status(201).json(nuevo);
  } catch (err) {
    return res.status(500).json({ message: "Error al crear arrendamiento", error: err.message });
  }
};

exports.renovar = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!isPosInt(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const nueva_fecha_fin = req.body.nueva_fecha_fin ? String(req.body.nueva_fecha_fin).trim() : null;

    if (!nueva_fecha_fin || !/^\d{4}-\d{2}-\d{2}$/.test(nueva_fecha_fin)) {
      return res.status(400).json({
        message: "nueva_fecha_fin es obligatoria y debe estar en formato YYYY-MM-DD.",
      });
    }

    const result = await service.renovar(id, { nueva_fecha_fin });
    if (result.notFound) {
      return res.status(404).json({ message: "Arrendamiento no encontrado" });
    }

    return res.json(result.updated);
  } catch (err) {
    return res.status(500).json({
      message: "Error al renovar arrendamiento",
      error: err.message,
    });
  }
};

exports.cancelar = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!isPosInt(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const result = await service.cancelar(id);
    if (result.notFound) {
      return res.status(404).json({ message: "Arrendamiento no encontrado" });
    }

    return res.json(result.updated);
  } catch (err) {
    return res.status(500).json({
      message: "Error al cancelar arrendamiento",
      error: err.message,
    });
  }
};
