const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/alertas.controller");

router.get("/vencimientos", (req, res, next) => {
  /*
    #swagger.tags = ['Alertas']
    #swagger.summary = 'Alertas de arrendamientos próximos a vencer'
  */
  return ctrl.vencimientos(req, res, next);
});

module.exports = router;
