const service = require("../services/nichos.service");

const ESTADOS_VALIDOS = service.ESTADOS_VALIDOS;

function isPosInt(n) {
  return Number.isInteger(n) && n > 0;
}

exports.listar = async (req, res) => {
  try {
    const manzanaId = req.query.manzanaId ? Number(req.query.manzanaId) : null;
    const estado = req.query.estado ? String(req.query.estado).trim() : null;
    const q = req.query.q ? String(req.query.q).trim() : null;
    const page = Math.max(1, Number(req.query.page || 1));
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize || 20)));

    if (manzanaId !== null && !isPosInt(manzanaId)) {
      return res.status(400).json({ message: "'manzanaId' debe ser entero positivo" });
    }
    if (estado && !ESTADOS_VALIDOS.includes(estado)) {
      return res.status(400).json({
        message: `Estado inválido. Use: ${ESTADOS_VALIDOS.join(", ")}`,
      });
    }

    const result = await service.listar({ manzanaId, estado, q, page, pageSize });
    return res.json({
      page,
      pageSize,
      count: result.total,
      data: result.data,
    });
  } catch (err) {
    return res.status(500).json({ message: "Error al listar nichos", error: err.message });
  }
};

exports.obtenerPorId = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!isPosInt(id)) {
      return res.status(400).json({ message: "Id inválido" });
    }
    const item = await service.obtenerPorId(id);
    if (!item) return res.status(404).json({ message: "Nicho no encontrado" });
    return res.json(item);
  } catch (err) {
    return res.status(500).json({ message: "Error al obtener nicho", error: err.message });
  }
};

exports.obtenerPorNumero = async (req, res) => {
  try {
    const numero = Number(req.query.numero);
    const manzana_id = req.query.manzana_id ? Number(req.query.manzana_id) : undefined;
    const manzana = req.query.manzana;

    if (!isPosInt(numero)) {
      return res.status(400).json({ message: "'numero' debe ser entero positivo" });
    }
    if (!manzana_id && !manzana) {
      return res.status(400).json({
        message: "Debes enviar 'manzana_id' o 'manzana'.",
      });
    }
    if (manzana_id !== undefined && !isPosInt(manzana_id)) {
      return res.status(400).json({ message: "'manzana_id' debe ser entero positivo" });
    }

    const row = await service.obtenerPorNumero({ numero, manzana_id, manzana });
    if (!row) return res.status(404).json({ message: "Nicho no encontrado" });

    return res.json(row);
  } catch (err) {
    return res.status(500).json({ message: "Error al buscar nicho", error: err.message });
  }
};

exports.crear = async (req, res) => {
  try {
    const numero = Number(req.body.numero);
    const manzana_id = Number(req.body.manzana_id);
    const estado = (req.body.estado || "Disponible").trim();

    if (!isPosInt(numero)) {
      return res.status(400).json({ message: "'numero' debe ser entero positivo." });
    }
    if (!isPosInt(manzana_id)) {
      return res.status(400).json({ message: "'manzana_id' debe ser entero positivo." });
    }
    if (!ESTADOS_VALIDOS.includes(estado)) {
      return res.status(400).json({
        message: `'estado' inválido. Use: ${ESTADOS_VALIDOS.join(", ")}.`,
      });
    }

    const created = await service.crear({ numero, estado, manzana_id });
    return res.status(201).json(created);
  } catch (err) {
    return res.status(500).json({ message: "Error al crear nicho", error: err.message });
  }
};

exports.actualizar = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!isPosInt(id)) {
      return res.status(400).json({ message: "Id inválido" });
    }

    const dto = {};
    if (req.body.numero !== undefined) {
      const n = Number(req.body.numero);
      if (!isPosInt(n)) {
        return res.status(400).json({ message: "'numero' debe ser entero positivo." });
      }
      dto.numero = n;
    }
    if (req.body.manzana_id !== undefined) {
      const m = Number(req.body.manzana_id);
      if (!isPosInt(m)) {
        return res.status(400).json({ message: "'manzana_id' debe ser entero positivo." });
      }
      dto.manzana_id = m;
    }
    if (req.body.estado !== undefined) {
      const e = String(req.body.estado).trim();
      if (!ESTADOS_VALIDOS.includes(e)) {
        return res.status(400).json({
          message: `'estado' inválido. Use: ${ESTADOS_VALIDOS.join(", ")}.`,
        });
      }
      dto.estado = e;
    }

    if (Object.keys(dto).length === 0) {
      return res.status(400).json({ message: "No hay campos para actualizar." });
    }

    const ok = await service.actualizar(id, dto);
    if (!ok) {
      return res.status(404).json({ message: "Nicho no encontrado para actualizar" });
    }

    return res.status(204).end();
  } catch (err) {
    return res.status(500).json({ message: "Error al actualizar nicho", error: err.message });
  }
};

exports.eliminar = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!isPosInt(id)) {
      return res.status(400).json({ message: "Id inválido" });
    }

    try {
      const ok = await service.eliminar(id);
      if (!ok) {
        return res.status(404).json({ message: "Nicho no encontrado para eliminar" });
      }
    } catch (err) {
      if (err.code === "FK_CONFLICT") {
        return res.status(409).json({
          message: "No se puede eliminar el nicho porque tiene registros asociados (arrendamientos, solicitudes, etc.)",
        });
      }
      throw err;
    }

    return res.status(204).end();
  } catch (err) {
    return res.status(500).json({ message: "Error al eliminar nicho", error: err.message });
  }
};

exports.cambiarEstado = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const nuevo_estado = String(req.body.nuevo_estado || "").trim();

    if (!isPosInt(id)) {
      return res.status(400).json({ message: "Id inválido" });
    }
    if (!ESTADOS_VALIDOS.includes(nuevo_estado)) {
      return res.status(400).json({
        message: `Estado inválido. Use: ${ESTADOS_VALIDOS.join(", ")}`,
      });
    }

    const updated = await service.cambiarEstado(id, nuevo_estado);
    if (!updated) {
      return res.status(404).json({ message: "Nicho no encontrado para cambiar estado" });
    }

    return res.json(updated);
  } catch (err) {
    if (err.code === "BAD_STATE") {
      return res.status(400).json({ message: err.message });
    }
    return res.status(500).json({ message: "Error al cambiar estado del nicho", error: err.message });
  }
};

exports.listarPorManzana = async (req, res) => {
  try {
    const manzanaId = Number(req.params.manzanaId);
    if (!isPosInt(manzanaId)) {
      return res.status(400).json({ message: "manzanaId inválido" });
    }

    const page = 1;
    const pageSize = 5000;
    const result = await service.listar({
      manzanaId,
      estado: null,
      q: null,
      page,
      pageSize,
    });

    return res.json({
      manzanaId,
      count: result.total,
      data: result.data,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error al listar nichos por manzana", error: err.message });
  }
};

exports.listarDisponibles = async (req, res) => {
  try {
    const manzanaId = req.query.manzanaId ? Number(req.query.manzanaId) : null;
    if (manzanaId !== null && !isPosInt(manzanaId)) {
      return res.status(400).json({ message: "manzanaId inválido" });
    }

    const page = 1;
    const pageSize = 5000;
    const result = await service.listar({
      manzanaId,
      estado: "Disponible",
      q: null,
      page,
      pageSize,
    });

    return res.json({
      manzanaId,
      count: result.total,
      data: result.data,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error al listar nichos disponibles", error: err.message });
  }
};
