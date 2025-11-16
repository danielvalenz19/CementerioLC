const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/arrendamientos.controller");

router.get("/", (req, res, next) => {
  /*
    #swagger.tags = ['Arrendamientos']
    #swagger.summary = 'Listar arrendamientos'
    #swagger.parameters['estado'] = {
      in: 'query',
      required: false,
      schema: { type: 'string', enum: ['Vigente','Vencido'] }
    }
    #swagger.parameters['propietario_id'] = {
      in: 'query',
      required: false,
      schema: { type: 'integer' }
    }
    #swagger.parameters['nicho_id'] = {
      in: 'query',
      required: false,
      schema: { type: 'integer' }
    }
  */
  return ctrl.listar(req, res, next);
});

router.get("/:id", (req, res, next) => {
  /*
    #swagger.tags = ['Arrendamientos']
    #swagger.summary = 'Obtener arrendamiento por ID'
  */
  return ctrl.obtenerPorId(req, res, next);
});

router.post("/", (req, res, next) => {
  /*
    #swagger.tags = ['Arrendamientos']
    #swagger.summary = 'Crear arrendamiento'
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['propietario_id','nicho_id','fecha_inicio'],
            properties: {
              propietario_id: { type: 'integer', example: 1 },
              nicho_id: { type: 'integer', example: 10 },
              recibo_id: { type: 'integer', example: 5 },
              fecha_inicio: { type: 'string', format: 'date', example: '2025-11-01' },
              fecha_fin: { type: 'string', format: 'date', example: '2026-11-01' },
              nombre_difunto: { type: 'string', example: 'Juan Pérez' }
            }
          }
        }
      }
    }
  */
  return ctrl.crear(req, res, next);
});

router.post("/:id/renovar", (req, res, next) => {
  /*
    #swagger.tags = ['Arrendamientos']
    #swagger.summary = 'Renovar arrendamiento (actualizar fecha_fin)'
    #swagger.parameters['id'] = {
      in: 'path',
      required: true,
      schema: { type: 'integer', minimum: 1 }
    }
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['nueva_fecha_fin'],
            properties: {
              nueva_fecha_fin: {
                type: 'string',
                format: 'date',
                example: '2027-11-01'
              }
            }
          }
        }
      }
    }
  */
  return ctrl.renovar(req, res, next);
});

router.post("/:id/cancelar", (req, res, next) => {
  /*
    #swagger.tags = ['Arrendamientos']
    #swagger.summary = 'Cancelar arrendamiento (poner fecha_fin = hoy y liberar nicho)'
    #swagger.parameters['id'] = {
      in: 'path',
      required: true,
      schema: { type: 'integer', minimum: 1 }
    }
  */
  return ctrl.cancelar(req, res, next);
});

module.exports = router;
