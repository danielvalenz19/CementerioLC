const { pool } = require("../../src/config/db");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const REFRESH_TTL_DAYS = Number(process.env.REFRESH_TOKEN_TTL_DAYS || 30);

function nowUtc() {
  return new Date();
}

function addDays(date, n) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + n);
  return d;
}

function isBcryptHash(s = "") {
  return /^\$2[aby]\$/.test(s);
}

async function safeCompareRaw(a = "", b = "") {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

exports.comparePassword = async (plain, dbValue) => {
  if (!dbValue) return false;
  if (isBcryptHash(dbValue)) {
    try {
      return await bcrypt.compare(plain, dbValue);
    } catch {
      return false;
    }
  }
  return safeCompareRaw(plain, dbValue);
};

function toB64Url(buf) {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function sha256(s) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

function newRefreshToken() {
  const raw = toB64Url(crypto.randomBytes(48));
  const hash = sha256(raw);
  return { raw, hash };
}

exports.getActiveUserByCorreo = async (correo) => {
  const [rows] = await pool.execute(
    `SELECT u.id,
            u.nombre_completo,
            u.correo,
            u.password,
            u.rol_id,
            u.activo,
            r.nombre AS rol_nombre
     FROM usuarios u
     LEFT JOIN roles r ON r.id = u.rol_id
     WHERE u.correo = ? AND u.activo = 1
     LIMIT 1`,
    [correo]
  );
  return rows[0];
};

exports.getUserById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT u.id,
            u.nombre_completo,
            u.correo,
            u.password,
            u.rol_id,
            u.activo,
            r.nombre AS rol_nombre
     FROM usuarios u
     LEFT JOIN roles r ON r.id = u.rol_id
     WHERE u.id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0];
};

exports.issueRefreshToken = async (user_id) => {
  const { raw, hash } = newRefreshToken();
  const created = nowUtc();
  const expires = addDays(created, REFRESH_TTL_DAYS);

  await pool.execute(
    `INSERT INTO refresh_tokens (user_id, token, revoked, created_at, expires_at)
     VALUES (?, ?, 0, ?, ?)`,
    [user_id, hash, created, expires]
  );

  return { raw, hash, expires_at: expires };
};

exports.findValidRefresh = async (rawToken) => {
  const hash = sha256(String(rawToken));
  const [rows] = await pool.execute(
    `SELECT id AS token_id, user_id, token, revoked, expires_at
       FROM refresh_tokens
       WHERE token = ?
       LIMIT 1`,
    [hash]
  );
  const row = rows[0];
  if (!row) return null;
  if (row.revoked) return null;
  if (new Date(row.expires_at) <= nowUtc()) return null;
  return row;
};

exports.rotateRefreshToken = async (rawToken) => {
  const row = await exports.findValidRefresh(rawToken);
  if (!row) throw new Error("Refresh token inválido o expirado.");

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.execute(`UPDATE refresh_tokens SET revoked = 1 WHERE id = ?`, [row.token_id]);

    const [userRows] = await conn.execute(
      `SELECT u.id,
              u.nombre_completo,
              u.correo,
              u.password,
              u.rol_id,
              u.activo,
              r.nombre AS rol_nombre
       FROM usuarios u
       LEFT JOIN roles r ON r.id = u.rol_id
       WHERE u.id = ?
       LIMIT 1`,
      [row.user_id]
    );
    const user = userRows[0];
    if (!user || (user.activo !== 1 && user.activo !== true)) {
      throw new Error("Usuario inactivo o inexistente.");
    }

    const { raw, hash } = newRefreshToken();
    const created = nowUtc();
    const expires = addDays(created, REFRESH_TTL_DAYS);

    await conn.execute(
      `INSERT INTO refresh_tokens (user_id, token, revoked, created_at, expires_at)
       VALUES (?, ?, 0, ?, ?)`,
      [user.id, hash, created, expires]
    );

    await conn.commit();
    return { user, rotated: { raw, hash, expires_at: expires } };
  } catch (e) {
    try {
      await conn.rollback();
    } catch {}
    throw e;
  } finally {
    conn.release();
  }
};

exports.revokeOne = async (rawToken) => {
  const row = await exports.findValidRefresh(rawToken);
  if (!row) return;
  await pool.execute(`UPDATE refresh_tokens SET revoked = 1 WHERE id = ?`, [row.token_id]);
};

exports.revokeAllForUser = async (user_id) => {
  await pool.execute(
    `UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ? AND revoked = 0`,
    [user_id]
  );
};
