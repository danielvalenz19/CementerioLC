const service = require("../services/traspasos.service");

function isPosInt(n) {
  return Number.isInteger(n) && n > 0;
}

exports.listar = async (req, res) => {
  try {
    const propietario_id = req.query.propietario_id ? Number(req.query.propietario_id) : null;
    const nicho_id = req.query.nicho_id ? Number(req.query.nicho_id) : null;

    const data = await service.listar({ propietario_id, nicho_id });
    return res.json({ count: data.length, data });
  } catch (err) {
    return res.status(500).json({ message: "Error al listar traspasos", error: err.message });
  }
};

exports.obtenerPorId = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!isPosInt(id)) return res.status(400).json({ message: "ID inválido" });

    const item = await service.obtenerPorId(id);
    if (!item) return res.status(404).json({ message: "Traspaso no encontrado" });

    return res.json(item);
  } catch (err) {
    return res.status(500).json({ message: "Error al obtener traspaso", error: err.message });
  }
};

exports.crear = async (req, res) => {
  try {
    const { propietario_anterior_id, nuevo_propietario_id, nicho_id, recibo_id } = req.body || {};

    if (!isPosInt(propietario_anterior_id) || !isPosInt(nuevo_propietario_id) || !isPosInt(nicho_id)) {
      return res.status(400).json({ message: "IDs inválidos" });
    }

    const nuevo = await service.crear({
      propietario_anterior_id,
      nuevo_propietario_id,
      nicho_id,
      recibo_id,
    });

    return res.status(201).json(nuevo);
  } catch (err) {
    return res.status(500).json({ message: "Error al crear traspaso", error: err.message });
  }
};
