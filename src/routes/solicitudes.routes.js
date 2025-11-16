const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/solicitudes.controller");

router.get("/", (req, res, next) => {
  /*
    #swagger.tags = ['Solicitudes']
    #swagger.summary = 'Listar solicitudes de compra'
    #swagger.parameters['estado'] = {
      in: 'query',
      required: false,
      schema: { type: 'string', enum: ['Pendiente','Aprobada','Rechazada'] }
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
    #swagger.tags = ['Solicitudes']
    #swagger.summary = 'Obtener detalle de solicitud'
    #swagger.parameters['id'] = {
      in: 'path',
      required: true,
      schema: { type: 'integer', minimum: 1 }
    }
  */
  return ctrl.obtenerPorId(req, res, next);
});

router.post("/", (req, res, next) => {
  /*
    #swagger.tags = ['Solicitudes']
    #swagger.summary = 'Crear solicitud de compra de nicho'
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['propietario_id','nicho_id'],
            properties: {
              propietario_id: { type: 'integer', example: 1 },
              nicho_id: { type: 'integer', example: 10 },
              fecha_solicitud: {
                type: 'string',
                format: 'date',
                example: '2025-11-16',
                description: 'Opcional, si se omite usa la fecha actual del servidor'
              }
            }
          }
        }
      }
    }
  */
  return ctrl.crear(req, res, next);
});

router.post("/:id/aprobar", (req, res, next) => {
  /*
    #swagger.tags = ['Solicitudes']
    #swagger.summary = 'Aprobar solicitud de compra'
    #swagger.description = 'Solo se pueden aprobar solicitudes en estado Pendiente.'
    #swagger.parameters['id'] = {
      in: 'path',
      required: true,
      schema: { type: 'integer', minimum: 1 }
    }
    #swagger.requestBody = {
      required: false,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              recibo_id: { 
                type: 'integer',
                example: 5,
                description: 'Opcional, si se envía se asocia el recibo a la solicitud'
              }
            }
          }
        }
      }
    }
  */
  return ctrl.aprobar(req, res, next);
});

router.post("/:id/rechazar", (req, res, next) => {
  /*
    #swagger.tags = ['Solicitudes']
    #swagger.summary = 'Rechazar solicitud de compra'
    #swagger.description = 'Solo se pueden rechazar solicitudes en estado Pendiente.'
    #swagger.parameters['id'] = {
      in: 'path',
      required: true,
      schema: { type: 'integer', minimum: 1 }
    }
  */
  return ctrl.rechazar(req, res, next);
});

module.exports = router;
