const crypto = require("node:crypto");

const PROFILE_ENV_KEYS = {
  admin: { pin: "PIN_ADMIN", email: "EMAIL_ADMIN" },
  matheus: { pin: "PIN_MATHEUS", email: "EMAIL_MATHEUS" },
  jheni: { pin: "PIN_JHENI", email: "EMAIL_JHENI" },
  lucas: { pin: "PIN_LUCAS", email: "EMAIL_LUCAS" },
  direcao: { pin: "PIN_DIRECAO", email: "EMAIL_DIRECAO" }
};

const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const attemptsByIp = new Map();

function sendJson(res, status, body) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.status(status).json(body);
}

function getClientIp(req) {
  const forwardedFor = req.headers["x-forwarded-for"];
  const forwardedIps = Array.isArray(forwardedFor) ? forwardedFor : forwardedFor?.split(",");
  return (forwardedIps?.at(-1) || req.socket?.remoteAddress || "unknown").trim();
}

function isSameOrigin(req) {
  const origin = req.headers.origin;
  const host = req.headers.host;
  if (!origin || !host) return false;
  try {
    const url = new URL(origin);
    return url.host.toLowerCase() === host.toLowerCase();
  } catch {
    return false;
  }
}

function isRateLimited(ip, now = Date.now()) {
  const attempts = attemptsByIp.get(ip) || [];
  const recentAttempts = attempts.filter(timestamp => now - timestamp < ATTEMPT_WINDOW_MS);
  attemptsByIp.set(ip, recentAttempts);
  return recentAttempts.length >= MAX_ATTEMPTS;
}

function recordFailedAttempt(ip, now = Date.now()) {
  const attempts = attemptsByIp.get(ip) || [];
  attempts.push(now);
  attemptsByIp.set(ip, attempts.filter(timestamp => now - timestamp < ATTEMPT_WINDOW_MS));
  if (attemptsByIp.size > 1000) {
    const oldestIp = attemptsByIp.keys().next().value;
    attemptsByIp.delete(oldestIp);
  }
}

function matchesPin(providedPin, expectedPin) {
  if (typeof providedPin !== "string" || typeof expectedPin !== "string") return false;
  const provided = Buffer.from(providedPin);
  const expected = Buffer.from(expectedPin);
  return provided.length === expected.length && crypto.timingSafeEqual(provided, expected);
}

async function supabaseRequest(path, apiKey, body, serviceRole = false) {
  const headers = {
    apikey: apiKey,
    "Content-Type": "application/json"
  };
  if (serviceRole) headers.Authorization = `Bearer ${apiKey}`;

  const response = await fetch(`${process.env.SUPABASE_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10000)
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    console.error("Supabase authentication request failed", response.status);
    throw new Error("Não foi possível iniciar a sessão.");
  }
  return result;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Método não permitido." });
  }

  if (!isSameOrigin(req)) return sendJson(res, 403, { error: "Origem não autorizada." });

  const contentLength = Number(req.headers["content-length"] || 0);
  if (contentLength > 1024) return sendJson(res, 413, { error: "Requisição muito grande." });

  const body = typeof req.body === "string"
    ? (() => { try { return JSON.parse(req.body); } catch { return null; } })()
    : req.body;
  const profileId = body?.profileId;
  const pin = body?.pin;
  const envKeys = PROFILE_ENV_KEYS[profileId];
  if (!envKeys || typeof pin !== "string" || pin.length > 64) {
    return sendJson(res, 400, { error: "Perfil ou PIN inválido." });
  }

  const ip = getClientIp(req);
  if (isRateLimited(ip)) return sendJson(res, 429, { error: "Muitas tentativas. Aguarde e tente novamente." });

  const expectedPin = process.env[envKeys.pin];
  const email = process.env[envKeys.email];
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!expectedPin || !email || !supabaseUrl || !serviceRoleKey || !anonKey) {
    console.error("PIN login environment is incomplete for profile", profileId);
    return sendJson(res, 503, { error: "O acesso ainda não foi configurado no servidor." });
  }
  if (!/^\d{6,12}$/.test(expectedPin)) {
    console.error("PIN environment value must contain 6 to 12 digits for profile", profileId);
    return sendJson(res, 503, { error: "O PIN deste perfil não está configurado corretamente." });
  }
  if (!matchesPin(pin, expectedPin)) {
    recordFailedAttempt(ip);
    return sendJson(res, 401, { error: "Perfil ou PIN incorreto." });
  }

  try {
    const link = await supabaseRequest(
      "/auth/v1/admin/generate_link",
      serviceRoleKey,
      { type: "magiclink", email },
      true
    );
    if (!link?.hashed_token) throw new Error("Supabase did not return a one-time token.");

    const session = await supabaseRequest(
      "/auth/v1/verify",
      anonKey,
      { type: "magiclink", token_hash: link.hashed_token }
    );
    if (!session?.access_token || !session?.refresh_token || !session?.user) {
      throw new Error("Supabase did not return a valid session.");
    }

    attemptsByIp.delete(ip);
    return sendJson(res, 200, {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      user: session.user
    });
  } catch (error) {
    console.error("PIN login failed", error.message);
    return sendJson(res, 502, { error: "Não foi possível validar o acesso. Tente novamente." });
  }
};
