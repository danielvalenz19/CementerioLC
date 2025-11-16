const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/catalogos.controller");

router.get("/", (req, res, next) => {
  /*
    #swagger.tags = ['Catálogos']
    #swagger.summary = 'Obtener catálogos'
  */
  return ctrl.obtenerCatalogos(req, res, next);
});

module.exports = router;
