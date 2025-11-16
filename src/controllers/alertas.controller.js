const service = require("../services/alertas.service");

exports.vencimientos = async (req, res) => {
  try {
    const data = await service.vencimientos();
    return res.json({ count: data.length, data });
  } catch (err) {
    return res.status(500).json({ message: "Error en alertas", error: err.message });
  }
};
