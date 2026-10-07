const { timingSafeEqual } = require("node:crypto");

const DATA_PATH = "data/database.json";
const GITHUB_API = "https://api.github.com";

function jsonResponse(res, status, body) {
  return res.status(status).json(body);
}

function getConfiguration() {
  const token = process.env.GITHUB_TOKEN;
  const [owner, repository] = (process.env.GITHUB_REPOSITORY || "JheniferFM/InnovaCoins").split("/");
  const branch = process.env.GITHUB_BRANCH || "main";

  if (!token) throw new Error("O segredo GITHUB_TOKEN não está configurado na Vercel.");
  if (!owner || !repository) throw new Error("GITHUB_REPOSITORY deve ter o formato proprietário/repositório.");

  return { token, owner, repository, branch };
}

async function githubRequest(path, configuration, options = {}) {
  return fetch(`${GITHUB_API}${path}`, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${configuration.token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "InnovaCoins-Vercel",
      ...(options.headers || {})
    }
  });
}

function contentEndpoint(configuration) {
  const owner = encodeURIComponent(configuration.owner);
  const repository = encodeURIComponent(configuration.repository);
  const path = DATA_PATH.split("/").map(encodeURIComponent).join("/");
  const branch = encodeURIComponent(configuration.branch);
  return `/repos/${owner}/${repository}/contents/${path}?ref=${branch}`;
}

async function readSharedFile(configuration) {
  const response = await githubRequest(contentEndpoint(configuration), configuration);
  if (!response.ok) {
    if (response.status === 404) throw Object.assign(new Error("O arquivo compartilhado não foi encontrado no GitHub."), { status: 500 });
    throw Object.assign(new Error(`O GitHub não conseguiu ler os dados (HTTP ${response.status}).`), { status: 502 });
  }

  const file = await response.json();
  if (file.size > 900_000) {
    throw Object.assign(new Error("O arquivo compartilhado excede o limite de 900 KB suportado pela API do GitHub."), { status: 413 });
  }
  const contents = Buffer.from(file.content.replace(/\s/g, ""), "base64").toString("utf8");
  const data = JSON.parse(contents);
  if (!Array.isArray(data.profiles) || (data.database !== null && !Array.isArray(data.database?.classes))) {
    throw Object.assign(new Error("O arquivo compartilhado possui um formato inválido."), { status: 500 });
  }

  return { file, data };
}

function isValidPin(profile, pin) {
  if (!profile || typeof profile.pin !== "string" || typeof pin !== "string") return false;
  const expected = Buffer.from(profile.pin);
  const received = Buffer.from(pin);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET" && req.method !== "PUT") {
    res.setHeader("Allow", "GET, PUT");
    return jsonResponse(res, 405, { error: "Método não permitido." });
  }

  let configuration;
  try {
    configuration = getConfiguration();
  } catch (error) {
    console.error("Configuração da API de dados inválida", error.message);
    return jsonResponse(res, 503, { error: "A sincronização ainda não foi configurada na Vercel." });
  }

  try {
    if (req.method === "GET") {
      const { file, data } = await readSharedFile(configuration);
      if (req.headers["if-none-match"]?.replace(/"/g, "") === file.sha) return res.status(304).end();
      res.setHeader("ETag", `"${file.sha}"`);
      return jsonResponse(res, 200, { ...data, revision: file.sha });
    }

    const body = req.body;
    if (!body || typeof body !== "object" || !Array.isArray(body.database?.classes)) {
      return jsonResponse(res, 400, { error: "O banco enviado está inválido." });
    }

    const { file, data } = await readSharedFile(configuration);
    const profile = data.profiles.find(item => item.id === body.profileId);
    if (!isValidPin(profile, body.pin)) {
      return jsonResponse(res, 401, { error: "Perfil ou PIN inválido." });
    }
    if (typeof body.revision !== "string" || body.revision !== file.sha) {
      return jsonResponse(res, 409, { error: "Outro computador salvou dados mais recentes. Os dados compartilhados precisam ser atualizados antes de tentar novamente." });
    }

    const updatedContent = JSON.stringify({ database: body.database, profiles: data.profiles }, null, 2);
    if (Buffer.byteLength(updatedContent, "utf8") > 900_000) {
      return jsonResponse(res, 413, { error: "Os dados excedem o limite de 900 KB para o arquivo compartilhado." });
    }

    const endpoint = contentEndpoint(configuration).split("?")[0];
    const update = await githubRequest(endpoint, configuration, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `InnovaCoins: atualizar dados compartilhados (${new Date().toISOString()})`,
        content: Buffer.from(updatedContent, "utf8").toString("base64"),
        sha: file.sha,
        branch: configuration.branch
      })
    });

    if (update.status === 409 || update.status === 422) {
      return jsonResponse(res, 409, { error: "Outro computador salvou dados mais recentes. Os dados compartilhados precisam ser atualizados antes de tentar novamente." });
    }
    if (!update.ok) {
      console.error("GitHub recusou a gravação do arquivo compartilhado", update.status);
      return jsonResponse(res, 502, { error: `Não foi possível gravar os dados no GitHub (HTTP ${update.status}).` });
    }

    const result = await update.json();
    return jsonResponse(res, 200, { revision: result.content.sha });
  } catch (error) {
    console.error("Falha na API de dados compartilhados", error);
    return jsonResponse(res, error.status || 502, { error: error.message || "Falha ao sincronizar os dados." });
  }
};
