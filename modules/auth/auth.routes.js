const express = require("express");
const router = express.Router();
const ctrl = require("./auth.controller");
const { requireAuth } = require("../../middlewares/auth");

router.post("/login", (req, res, next) => {
  /*
    #swagger.tags = ['Auth']
    #swagger.summary = 'Login'
    #swagger.description = 'Autentica por correo + password.'
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: '#/components/schemas/LoginRequest' },
          example: { "correo": "admin@demo.com", "password": "Secreta123" }
        }
      }
    }
    #swagger.responses[200] = {
      description: 'OK',
      content: { "application/json": { schema: { $ref: '#/components/schemas/LoginResponse' } } }
    }
    #swagger.responses[401] = { description: 'Credenciales inválidas' }
  */
  return ctrl.login(req, res, next);
});

router.post("/refresh", (req, res, next) => {
  /*
    #swagger.tags = ['Auth']
    #swagger.summary = 'Refresh token'
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: '#/components/schemas/RefreshRequest' },
          example: { "refresh_token": "<refresh_token>" }
        }
      }
    }
  */
  return ctrl.refresh(req, res, next);
});

router.post("/logout", requireAuth, (req, res, next) => {
  /*
    #swagger.tags = ['Auth']
    #swagger.summary = 'Logout'
    #swagger.requestBody = {
      required: false,
      content: {
        "application/json": {
          schema: { $ref: '#/components/schemas/LogoutRequest' },
          examples: {
            soloEste: { value: { "refresh_token": "<refresh_token>" } },
            todosMisDispositivos: { value: { "allDevices": true } }
          }
        }
      }
    }
  */
  return ctrl.logout(req, res, next);
});

router.get("/me", requireAuth, (req, res, next) => {
  /*
    #swagger.tags = ['Auth']
    #swagger.summary = 'Usuario autenticado'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.responses[200] = {
      description: 'OK',
      content: { "application/json": { schema: { $ref: '#/components/schemas/MeUser' } } }
    }
    #swagger.responses[401] = { description: 'No autorizado' }
  */
  return ctrl.me(req, res, next);
});

module.exports = router;
