const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

function requireAuth(req, res, next) {
  const authHeader = req.headers["authorization"] || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    return res.status(401).json({ message: "Token requerido." });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.auth = {
      sub: payload.sub,
      correo: payload.correo,
      rol_id: payload.rol_id,
      rol: payload.rol,
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido o expirado." });
  }
}

module.exports = { requireAuth };
