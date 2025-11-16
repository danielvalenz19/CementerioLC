const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/propietarios.controller");

router.get("/", (req, res, next) => {
  /*
    #swagger.tags = ['Propietarios']
    #swagger.summary = 'Listar propietarios'
    #swagger.parameters['q'] = { in: 'query', description: 'Búsqueda por nombre, apellido, dpi, teléfono' }
  */
  return ctrl.listar(req, res, next);
});

router.get("/:id", (req, res, next) => {
  /*
    #swagger.tags = ['Propietarios']
    #swagger.summary = 'Obtener propietario por ID'
  */
  return ctrl.obtenerPorId(req, res, next);
});

router.post("/", (req, res, next) => {
  /*
    #swagger.tags = ['Propietarios']
    #swagger.summary = 'Crear propietario'
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { 
            type: 'object',
            required: ['nombres','apellidos'],
            properties: {
              nombres: { type: 'string', example: 'Juan' },
              apellidos: { type: 'string', example: 'Pérez' },
              dpi: { type: 'string', example: '1234567890101' },
              telefono: { type: 'string', example: '55667788' }
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
    #swagger.tags = ['Propietarios']
    #swagger.summary = 'Actualizar propietario'
  */
  return ctrl.actualizar(req, res, next);
});

router.delete("/:id", (req, res, next) => {
  /*
    #swagger.tags = ['Propietarios']
    #swagger.summary = 'Eliminar propietario'
  */
  return ctrl.eliminar(req, res, next);
});

module.exports = router;
