const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/auditoria.controller");

router.get("/", (req, res, next) => {
  /*
    #swagger.tags = ['Auditoría']
    #swagger.summary = 'Listar auditoría'
  */
  return ctrl.listar(req, res, next);
});

module.exports = router;
