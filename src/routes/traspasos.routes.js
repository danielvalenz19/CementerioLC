const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/traspasos.controller");

router.get("/", (req, res, next) => {
  /*
    #swagger.tags = ['Traspasos']
    #swagger.summary = 'Listar traspasos'
  */
  return ctrl.listar(req, res, next);
});

router.get("/:id", (req, res, next) => {
  /*
    #swagger.tags = ['Traspasos']
    #swagger.summary = 'Obtener traspaso por ID'
  */
  return ctrl.obtenerPorId(req, res, next);
});

router.post("/", (req, res, next) => {
  /*
    #swagger.tags = ['Traspasos']
    #swagger.summary = 'Crear traspaso'
  */
  return ctrl.crear(req, res, next);
});

module.exports = router;
