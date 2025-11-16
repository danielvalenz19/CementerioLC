const service = require("../services/auditoria.service");

exports.listar = async (req, res) => {
  try {
    const { usuario_id, desde, hasta } = req.query;

    const data = await service.listar({
      usuario_id: usuario_id ? Number(usuario_id) : null,
      desde,
      hasta,
    });

    return res.json({ count: data.length, data });
  } catch (err) {
    return res.status(500).json({ message: "Error al listar auditoría", error: err.message });
  }
};
