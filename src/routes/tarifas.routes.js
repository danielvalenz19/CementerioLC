const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/tarifas.controller");

router.get("/", (req, res, next) => {
  /*
    #swagger.tags = ['Tarifas']
    #swagger.summary = 'Listar tarifas'
  */
  return ctrl.listar(req, res, next);
});

router.post("/", (req, res, next) => {
  /*
    #swagger.tags = ['Tarifas']
    #swagger.summary = 'Crear tarifa'
  */
  return ctrl.crear(req, res, next);
});

router.put("/:id", (req, res, next) => {
  /*
    #swagger.tags = ['Tarifas']
    #swagger.summary = 'Actualizar tarifa'
  */
  return ctrl.actualizar(req, res, next);
});

router.delete("/:id", (req, res, next) => {
  /*
    #swagger.tags = ['Tarifas']
    #swagger.summary = 'Eliminar tarifa'
  */
  return ctrl.eliminar(req, res, next);
});

module.exports = router;
