const Joi = require("joi");
const manzanasService = require("../services/manzanas.service");

const listSchema = Joi.object({
  search: Joi.string().allow("", null),
});

const createSchema = Joi.object({
  nombre: Joi.string().trim().min(1).max(50).required(),
});

const updateSchema = Joi.object({
  nombre: Joi.string().trim().min(1).max(50),
}).min(1);

async function listar(req, res, next) {
  try {
    const { value, error } = listSchema.validate(req.query || {});
    if (error) {
      return res.status(400).json({ error: "BadRequest", message: error.message });
    }

    const rows = await manzanasService.listar(value);
    return res.json(rows);
  } catch (e) {
    next(e);
  }
}

async function obtenerPorId(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!id || id <= 0) {
      return res.status(400).json({ error: "BadRequest", message: "ID inválido" });
    }

    const row = await manzanasService.obtenerPorId(id);
    if (!row) {
      return res.status(404).json({ error: "NotFound", message: "Manzana no encontrada" });
    }

    return res.json(row);
  } catch (e) {
    next(e);
  }
}

async function crear(req, res, next) {
  try {
    const { value, error } = createSchema.validate(req.body || {});
    if (error) {
      return res.status(400).json({ error: "BadRequest", message: error.message });
    }

    const nueva = await manzanasService.crear(value);
    return res.status(201).json(nueva);
  } catch (e) {
    next(e);
  }
}

async function actualizar(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!id || id <= 0) {
      return res.status(400).json({ error: "BadRequest", message: "ID inválido" });
    }

    const { value, error } = updateSchema.validate(req.body || {});
    if (error) {
      return res.status(400).json({ error: "BadRequest", message: error.message });
    }

    const ok = await manzanasService.actualizar(id, value);
    if (!ok) {
      return res.status(404).json({ error: "NotFound", message: "Manzana no encontrada" });
    }

    return res.status(204).end();
  } catch (e) {
    next(e);
  }
}

async function eliminar(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!id || id <= 0) {
      return res.status(400).json({ error: "BadRequest", message: "ID inválido" });
    }

    const ok = await manzanasService.eliminar(id);
    if (!ok) {
      return res.status(404).json({ error: "NotFound", message: "Manzana no encontrada" });
    }

    return res.status(204).end();
  } catch (e) {
    next(e);
  }
}

module.exports = {
  listar,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
};
