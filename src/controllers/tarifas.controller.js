const service = require("../services/tarifas.service");

exports.listar = async (req, res) => {
  try {
    const data = await service.listar();
    return res.json({ count: data.length, data });
  } catch (err) {
    return res.status(500).json({ message: "Error al listar tarifas", error: err.message });
  }
};

exports.crear = async (req, res) => {
  try {
    const nuevo = await service.crear(req.body || {});
    return res.status(201).json(nuevo);
  } catch (err) {
    return res.status(500).json({ message: "Error al crear tarifa", error: err.message });
  }
};

exports.actualizar = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const ok = await service.actualizar(id, req.body || {});
    if (!ok) return res.status(404).json({ message: "Tarifa no encontrada" });

    return res.status(204).end();
  } catch (err) {
    return res.status(500).json({ message: "Error al actualizar tarifa", error: err.message });
  }
};
