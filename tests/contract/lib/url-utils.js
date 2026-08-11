function normalizeUrl(url) {
  if (!url) {
    return url;
  }
  return String(url).trim().replace(/\/+$/, '');
}

/** When nginx on :5173 strips Authorization, try direct gateway on :3000. */
function deriveDirectApiUrl(frontendUrl) {
  const normalized = normalizeUrl(frontendUrl);
  if (!normalized || !normalized.includes(':5173')) {
    return null;
  }
  return normalized.replace(':5173', ':3000');
}

module.exports = { normalizeUrl, deriveDirectApiUrl };
