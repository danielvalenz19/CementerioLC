const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/recibos.controller");

router.get("/", (req, res, next) => {
  /*
    #swagger.tags = ['Recibos']
    #swagger.summary = 'Listar recibos'
  */
  return ctrl.listar(req, res, next);
});

router.get("/:id", (req, res, next) => {
  /*
    #swagger.tags = ['Recibos']
    #swagger.summary = 'Obtener recibo por ID'
  */
  return ctrl.obtenerPorId(req, res, next);
});

router.post("/", (req, res, next) => {
  /*
    #swagger.tags = ['Recibos']
    #swagger.summary = 'Crear recibo'
  */
  return ctrl.crear(req, res, next);
});

module.exports = router;
