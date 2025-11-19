const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/usuarios.controller");

router.get("/", ctrl.listar);
router.post("/", ctrl.crear);
router.patch("/:id/estado", ctrl.toggleEstado);
router.delete("/:id", ctrl.eliminar);

module.exports = router;
