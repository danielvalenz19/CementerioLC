require("dotenv").config();
const swaggerAutogen = require("swagger-autogen")({ openapi: "3.0.0" });

const doc = {
  info: {
    title: "Cementerio Nichos API",
    version: "1.0.0",
    description: "Módulo de autenticación (login, refresh, logout, me)",
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 3001}`,
      description: "Local",
    },
  ],
  tags: [
    { name: "Auth", description: "Autenticación y tokens" },
    { name: "Manzanas", description: "Gestión de manzanas del cementerio" },
    { name: "Nichos", description: "Gestión y estado de nichos" },
    { name: "Propietarios", description: "Administración de propietarios" },
    { name: "Solicitudes", description: "Solicitudes de compra de nichos" },
    { name: "Arrendamientos", description: "Arrendamientos de nichos" },
    { name: "Traspasos", description: "Traspasos de nichos" },
    { name: "Recibos", description: "Gestión de recibos" },
    { name: "Alertas", description: "Alertas y recordatorios" },
    { name: "Catálogos", description: "Catálogos estáticos" },
    { name: "Tarifas", description: "Tarifario vigente" },
    { name: "Reportes", description: "Reportes operativos" },
    { name: "Auditoría", description: "Registro de auditoría" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      LoginRequest: {
        type: "object",
        properties: {
          correo: { type: "string", example: "admin@demo.com" },
          password: { type: "string", example: "Secreta123" },
        },
        required: ["correo", "password"],
      },
      LoginResponse: {
        type: "object",
        properties: {
          token_type: { type: "string", example: "Bearer" },
          access_token: { type: "string" },
          expires_in: { type: "integer", example: 900 },
          refresh_token: { type: "string" },
          user: {
            type: "object",
            properties: {
              id: { type: "integer" },
              nombre_completo: { type: "string" },
              correo: { type: "string" },
              rol_id: { type: "integer" },
              rol: { type: "string" },
            },
          },
        },
      },
      RefreshRequest: {
        type: "object",
        properties: {
          refresh_token: { type: "string" },
        },
        required: ["refresh_token"],
      },
      RefreshResponse: { $ref: "#/components/schemas/LoginResponse" },
      LogoutRequest: {
        type: "object",
        properties: {
          refresh_token: { type: "string", nullable: true },
          allDevices: { type: "boolean", nullable: true },
        },
      },
      MeUser: {
        type: "object",
        properties: {
          id: { type: "integer" },
          nombre_completo: { type: "string" },
          correo: { type: "string" },
          rol_id: { type: "integer" },
          rol: { type: "string" },
          activo: { type: "boolean" },
        },
      },
      Manzana: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          nombre: { type: "string", example: "A" },
        },
      },
      ManzanaList: {
        type: "array",
        items: { $ref: "#/components/schemas/Manzana" },
      },
      Nicho: {
        type: "object",
        properties: {
          id: { type: "integer" },
          numero: { type: "integer" },
          estado: { type: "string", enum: ["Disponible", "Reservado", "Ocupado"] },
          manzana_id: { type: "integer" },
          manzana: { type: "string" },
        },
      },
      Propietario: {
        type: "object",
        properties: {
          id: { type: "integer" },
          nombres: { type: "string" },
          apellidos: { type: "string" },
          dpi: { type: "string" },
          telefono: { type: "string" },
        },
      },
      SolicitudCompra: {
        type: "object",
        properties: {
          id: { type: "integer" },
          propietario_id: { type: "integer" },
          nombres: { type: "string" },
          apellidos: { type: "string" },
          nicho_id: { type: "integer" },
          numero_nicho: { type: "integer" },
          manzana_id: { type: "integer" },
          recibo_id: { type: "integer", nullable: true },
          numero_recibo: { type: "string", nullable: true },
          recibo_monto: { type: "number", nullable: true },
          recibo_fecha_pago: { type: "string", format: "date", nullable: true },
          estado: { type: "string", enum: ["Pendiente", "Aprobada", "Rechazada"] },
          fecha_solicitud: { type: "string", format: "date" },
        },
      },
      Arrendamiento: {
        type: "object",
        properties: {
          id: { type: "integer" },
          propietario_id: { type: "integer" },
          nombres: { type: "string" },
          apellidos: { type: "string" },
          nicho_id: { type: "integer" },
          numero_nicho: { type: "integer" },
          manzana_id: { type: "integer" },
          recibo_id: { type: "integer", nullable: true },
          numero_recibo: { type: "string", nullable: true },
          recibo_monto: { type: "number", nullable: true },
          recibo_fecha_pago: { type: "string", format: "date", nullable: true },
          fecha_inicio: { type: "string", format: "date" },
          fecha_fin: { type: "string", format: "date", nullable: true },
          nombre_difunto: { type: "string", nullable: true },
          estado_virtual: { type: "string", enum: ["Vigente", "Vencido"] },
        },
      },
      Traspaso: {
        type: "object",
        properties: {
          id: { type: "integer" },
          propietario_anterior_id: { type: "integer" },
          anterior_nombres: { type: "string" },
          anterior_apellidos: { type: "string" },
          nuevo_propietario_id: { type: "integer" },
          nuevo_nombres: { type: "string" },
          nuevo_apellidos: { type: "string" },
          nicho_id: { type: "integer" },
          numero_nicho: { type: "integer" },
          manzana_id: { type: "integer" },
          recibo_id: { type: "integer", nullable: true },
          numero_recibo: { type: "string", nullable: true },
          recibo_monto: { type: "number", nullable: true },
          fecha_traspaso: { type: "string", format: "date" },
        },
      },
      Recibo: {
        type: "object",
        properties: {
          id: { type: "integer" },
          monto: { type: "number" },
          fecha_pago: { type: "string", format: "date" },
          numero_recibo: { type: "string" },
        },
      },
      AlertaVencimiento: {
        type: "object",
        properties: {
          arrendamiento_id: { type: "integer" },
          nombres: { type: "string" },
          apellidos: { type: "string" },
          numero_nicho: { type: "integer" },
          manzana_id: { type: "integer" },
          fecha_fin: { type: "string", format: "date" },
          dias_restantes: { type: "integer" },
        },
      },
      Tarifa: {
        type: "object",
        properties: {
          id: { type: "integer" },
          concepto: { type: "string" },
          alcance: { type: "string" },
          monto: { type: "number" },
          moneda: { type: "string" },
          vigencia_desde: { type: "string", format: "date" },
          vigencia_hasta: { type: "string", format: "date", nullable: true },
        },
      },
    },
  },
};

const outputFile = "./docs/swagger-output.json";
const endpointsFiles = ["./index.js"];

swaggerAutogen(outputFile, endpointsFiles, doc);
