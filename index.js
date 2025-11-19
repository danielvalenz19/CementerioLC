require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const { testConnection } = require("./src/config/db");

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./docs/swagger-output.json");
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

const manzanasRouter = require("./src/routes/manzanas.routes");
const nichosRouter = require("./src/routes/nichos.routes");
const propietariosRouter = require("./src/routes/propietarios.routes");
const solicitudesRouter = require("./src/routes/solicitudes.routes");
const arrendamientosRouter = require("./src/routes/arrendamientos.routes");
const traspasosRouter = require("./src/routes/traspasos.routes");
const recibosRouter = require("./src/routes/recibos.routes");
const alertasRouter = require("./src/routes/alertas.routes");
const catalogosRouter = require("./src/routes/catalogos.routes");
const tarifasRouter = require("./src/routes/tarifas.routes");
const reportesRouter = require("./src/routes/reportes.routes");
const auditoriaRouter = require("./src/routes/auditoria.routes");
const usuariosRouter = require("./src/routes/usuarios.routes");

app.get("/health", async (req, res) => {
  try {
    const result = await testConnection();
    res.json({ ok: true, db: result.ok, schema: process.env.DB_NAME });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

const authRoutes = require("./modules/auth/auth.routes");
app.use("/auth", authRoutes);
app.use("/api/manzanas", manzanasRouter);
app.use("/api/nichos", nichosRouter);
app.use("/api/propietarios", propietariosRouter);
app.use("/api/solicitudes", solicitudesRouter);
app.use("/api/arrendamientos", arrendamientosRouter);
app.use("/api/traspasos", traspasosRouter);
app.use("/api/recibos", recibosRouter);
app.use("/api/alertas", alertasRouter);
app.use("/api/catalogos", catalogosRouter);
app.use("/api/tarifas", tarifasRouter);
app.use("/api/reportes", reportesRouter);
app.use("/api/auditoria", auditoriaRouter);
app.use("/api/usuarios", usuariosRouter);

const PORT = process.env.PORT || 3001;

(async () => {
  try {
    await testConnection();
    console.log("✅ Conexión exitosa a MySQL (schema:", process.env.DB_NAME + ")");
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📚 Swagger en http://localhost:${PORT}/docs`);
    });
  } catch (err) {
    console.error("❌ Error al conectar con MySQL:", err.message);
    process.exit(1);
  }
})();
