const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/manzanas.controller");

router.get("/", (req, res, next) => {
  /*
    #swagger.tags = ['Manzanas']
    #swagger.summary = 'Listar manzanas'
    #swagger.parameters['search'] = {
      in: 'query',
      description: 'Filtro por nombre (LIKE)',
      schema: { type: 'string' }
    }
    #swagger.responses[200] = {
      description: 'Lista de manzanas',
      content: {
        "application/json": {
          schema: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 1 },
                nombre: { type: 'string', example: 'A' }
              }
            }
          }
        }
      }
    }
  */
  return ctrl.listar(req, res, next);
});

router.get("/:id", (req, res, next) => {
  /*
    #swagger.tags = ['Manzanas']
    #swagger.summary = 'Obtener manzana por ID'
    #swagger.parameters['id'] = {
      in: 'path',
      required: true,
      schema: { type: 'integer', minimum: 1 }
    }
    #swagger.responses[200] = {
      description: 'Manzana encontrada',
      content: {
        "application/json": {
          schema: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              nombre: { type: 'string', example: 'A' }
            }
          }
        }
      }
    }
    #swagger.responses[404] = { description: 'No encontrada' }
  */
  return ctrl.obtenerPorId(req, res, next);
});

router.post("/", (req, res, next) => {
  /*
    #swagger.tags = ['Manzanas']
    #swagger.summary = 'Crear manzana'
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: 'object',
            required: ['nombre'],
            properties: {
              nombre: { type: 'string', example: 'C' }
            }
          }
        }
      }
    }
    #swagger.responses[201] = {
      description: 'Creada',
      content: {
        "application/json": {
          schema: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 3 },
              nombre: { type: 'string', example: 'C' }
            }
          }
        }
      }
    }
    #swagger.responses[400] = { description: 'Error de validación' }
  */
  return ctrl.crear(req, res, next);
});

router.put("/:id", (req, res, next) => {
  /*
    #swagger.tags = ['Manzanas']
    #swagger.summary = 'Actualizar manzana'
    #swagger.parameters['id'] = {
      in: 'path',
      required: true,
      schema: { type: 'integer', minimum: 1 }
    }
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: 'object',
            properties: {
              nombre: { type: 'string', example: 'B' }
            }
          }
        }
      }
    }
    #swagger.responses[204] = { description: 'Actualizada (sin contenido)' }
    #swagger.responses[400] = { description: 'Error de validación' }
    #swagger.responses[404] = { description: 'Manzana no encontrada' }
  */
  return ctrl.actualizar(req, res, next);
});

router.delete("/:id", (req, res, next) => {
  /*
    #swagger.tags = ['Manzanas']
    #swagger.summary = 'Eliminar manzana'
    #swagger.parameters['id'] = {
      in: 'path',
      required: true,
      schema: { type: 'integer', minimum: 1 }
    }
    #swagger.responses[204] = { description: 'Eliminada' }
    #swagger.responses[404] = { description: 'Manzana no encontrada' }
  */
  return ctrl.eliminar(req, res, next);
});

module.exports = router;
