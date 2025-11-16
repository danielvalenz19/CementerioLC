const service = require("../services/recibos.service");

function isPosInt(n) {
  return Number.isInteger(n) && n > 0;
}

exports.listar = async (req, res) => {
  try {
    const desde = req.query.desde || null;
    const hasta = req.query.hasta || null;

    const data = await service.listar({ desde, hasta });

    return res.json({ count: data.length, data });
  } catch (err) {
    return res.status(500).json({ message: "Error al listar recibos", error: err.message });
  }
};

exports.obtenerPorId = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!isPosInt(id)) return res.status(400).json({ message: "ID inválido" });

    const item = await service.obtenerPorId(id);
    if (!item) return res.status(404).json({ message: "Recibo no encontrado" });

    return res.json(item);
  } catch (err) {
    return res.status(500).json({ message: "Error al obtener recibo", error: err.message });
  }
};

exports.crear = async (req, res) => {
  try {
    const { monto, fecha_pago, numero_recibo } = req.body || {};

    if (!monto || !fecha_pago || !numero_recibo) {
      return res.status(400).json({ message: "monto, fecha_pago y numero_recibo son obligatorios" });
    }

    const nuevo = await service.crear({ monto, fecha_pago, numero_recibo });
    return res.status(201).json(nuevo);
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "El número de recibo ya existe" });
    }
    return res.status(500).json({ message: "Error al crear recibo", error: err.message });
  }
};
