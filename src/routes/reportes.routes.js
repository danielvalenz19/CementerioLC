const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/reportes.controller");

router.get("/ocupacion", (req, res, next) => {
  /*
    #swagger.tags = ['Reportes']
    #swagger.summary = 'Reporte de ocupación de nichos'
  */
  return ctrl.ocupacion(req, res, next);
});

router.get("/arrendamientos", (req, res, next) => {
  /*
    #swagger.tags = ['Reportes']
    #swagger.summary = 'Reporte de arrendamientos'
  */
  return ctrl.arrendamientos(req, res, next);
});

router.get("/cartera", (req, res, next) => {
  /*
    #swagger.tags = ['Reportes']
    #swagger.summary = 'Reporte de cartera (arrendamientos en mora)'
  */
  return ctrl.cartera(req, res, next);
});

module.exports = router;
