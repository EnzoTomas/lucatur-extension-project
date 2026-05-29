'use strict';

exports.handler = async function (event) {
  if (event.httpMethod !== 'GET') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  const currentVersion = event.queryStringParameters?.version ?? '0.0.0';

  try {
    const latest = await fetchLatestRelease();

    if (!latest) {
      return jsonResponse(200, { update_available: false });
    }

    const latestVersion = latest.tag_name.replace(/^v/, '');

    return jsonResponse(200, {
      update_available: isNewerVersion(latestVersion, currentVersion),
      latest_version:  latestVersion,
      current_version: currentVersion,
      release_name:    latest.name,
      published_at:    latest.published_at,
      // URL de download não é retornada aqui — solicitada via endpoint separado
    });
  } catch (err) {
    console.error('[check-update]', err.message);
    return jsonResponse(500, { error: 'Erro ao verificar atualização.' });
  }
};

async function fetchLatestRelease() {
  const token = process.env.GITHUB_RELEASE_TOKEN;
  const owner = process.env.GITHUB_REPO_OWNER;
  const repo  = process.env.GITHUB_REPO_NAME;

  if (!token) throw new Error('GITHUB_RELEASE_TOKEN não configurado.');

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/releases/latest`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'LucaTur-UpdateChecker/1.0',
      },
    }
  );

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub API: ${res.status}`);

  return res.json();
}

function isNewerVersion(a, b) {
  const parse = (v) => v.split('.').map(Number);
  const [aMaj, aMin, aPat] = parse(a);
  const [bMaj, bMin, bPat] = parse(b);

  if (aMaj !== bMaj) return aMaj > bMaj;
  if (aMin !== bMin) return aMin > bMin;
  return aPat > bPat;
}

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}
