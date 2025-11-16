const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/nichos.controller");

router.get("/", (req, res, next) => {
  /*
    #swagger.tags = ['Nichos']
    #swagger.summary = 'Listar nichos'
    #swagger.description = 'Filtros por manzanaId, estado y q; incluye paginación básica.'
    #swagger.parameters['manzanaId'] = { in: 'query', type: 'integer' }
    #swagger.parameters['estado']  = { in: 'query', type: 'string', enum: ['Disponible','Reservado','Ocupado'] }
    #swagger.parameters['q']  = { in: 'query', type: 'string' }
    #swagger.parameters['page']  = { in: 'query', type: 'integer', default: 1 }
    #swagger.parameters['pageSize']  = { in: 'query', type: 'integer', default: 20 }
  */
  return ctrl.listar(req, res, next);
});

router.get("/por-numero", (req, res, next) => {
  /*
    #swagger.tags = ['Nichos']
    #swagger.summary = 'Buscar nicho por número + manzana (id o nombre)'
    #swagger.parameters['numero']    = { in: 'query', required: true, type: 'integer' }
    #swagger.parameters['manzana_id'] = { in: 'query', required: false, type: 'integer' }
    #swagger.parameters['manzana']    = { in: 'query', required: false, type: 'string' }
  */
  return ctrl.obtenerPorNumero(req, res, next);
});

router.get("/por-manzana/:manzanaId", (req, res, next) => {
  /*
    #swagger.tags = ['Nichos']
    #swagger.summary = 'Listar nichos por manzana'
    #swagger.parameters['manzanaId'] = { in: 'path', required: true, type: 'integer', minimum: 1 }
  */
  return ctrl.listarPorManzana(req, res, next);
});

router.get("/disponibles", (req, res, next) => {
  /*
    #swagger.tags = ['Nichos']
    #swagger.summary = 'Listar nichos disponibles'
    #swagger.parameters['manzanaId'] = { in: 'query', required: false, type: 'integer' }
  */
  return ctrl.listarDisponibles(req, res, next);
});

router.get("/:id", (req, res, next) => {
  /*
    #swagger.tags = ['Nichos']
    #swagger.summary = 'Obtener nicho por ID'
    #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer', minimum: 1 }
  */
  return ctrl.obtenerPorId(req, res, next);
});

router.post("/", (req, res, next) => {
  /*
    #swagger.tags = ['Nichos']
    #swagger.summary = 'Crear nicho'
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['numero', 'manzana_id'],
            properties: {
              numero: { type: 'integer', example: 10 },
              manzana_id: { type: 'integer', example: 1 },
              estado: { type: 'string', enum: ['Disponible','Reservado','Ocupado'], example: 'Disponible' }
            }
          }
        }
      }
    }
  */
  return ctrl.crear(req, res, next);
});

router.put("/:id", (req, res, next) => {
  /*
    #swagger.tags = ['Nichos']
    #swagger.summary = 'Actualizar nicho por ID'
    #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer', minimum: 1 }
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              numero: { type: 'integer', example: 11 },
              manzana_id: { type: 'integer', example: 2 },
              estado: { type: 'string', enum: ['Disponible','Reservado','Ocupado'], example: 'Reservado' }
            }
          }
        }
      }
    }
  */
  return ctrl.actualizar(req, res, next);
});

router.delete("/:id", (req, res, next) => {
  /*
    #swagger.tags = ['Nichos']
    #swagger.summary = 'Eliminar nicho por ID'
    #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer', minimum: 1 }
  */
  return ctrl.eliminar(req, res, next);
});

router.patch("/:id/estado", (req, res, next) => {
  /*
    #swagger.tags = ['Nichos']
    #swagger.summary = 'Cambiar estado de un nicho'
    #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer' }
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['nuevo_estado'],
            properties: {
              nuevo_estado: {
                type: 'string',
                enum: ['Disponible','Reservado','Ocupado'],
                example: 'Reservado'
              }
            }
          }
        }
      }
    }
  */
  return ctrl.cambiarEstado(req, res, next);
});

module.exports = router;
