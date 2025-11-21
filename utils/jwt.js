const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";

function signAccessToken(user) {
  const payload = {
    sub: user.id,
    correo: user.correo,
    rol_id: user.rol_id,
    rol: user.rol_nombre || null,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  const decoded = jwt.decode(token);
  const nowSec = Math.floor(Date.now() / 1000);
  const expiresInSec = (decoded?.exp || nowSec) - nowSec;

  return { token, expiresInSec };
}

module.exports = { signAccessToken };
