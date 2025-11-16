const service = require("../services/reportes.service");

exports.ocupacion = async (req, res) => {
  try {
    const data = await service.ocupacion();
    return res.json({ data });
  } catch (err) {
    return res.status(500).json({ message: "Error", error: err.message });
  }
};

exports.arrendamientos = async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    const data = await service.arrendamientos({ desde, hasta });
    return res.json({ count: data.length, data });
  } catch (err) {
    return res.status(500).json({ message: "Error", error: err.message });
  }
};

exports.cartera = async (req, res) => {
  try {
    const data = await service.cartera();
    return res.json({ count: data.length, data });
  } catch (err) {
    return res.status(500).json({ message: "Error", error: err.message });
  }
};
