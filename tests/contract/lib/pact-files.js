const fs = require('fs');
const path = require('path');

/** Consumer-generated pact JSON only (excludes temporary .verify-* copies). */
function isConsumerPactFile(filename) {
  return filename.endsWith('.json') && !filename.startsWith('.verify-');
}

function listConsumerPactFiles(pactsDir) {
  const resolved = path.resolve(process.cwd(), pactsDir);
  if (!fs.existsSync(resolved)) {
    return [];
  }

  return fs
    .readdirSync(resolved)
    .filter(isConsumerPactFile)
    .map((file) => path.join(resolved, file));
}

function listConsumerPactBasenames(pactsDir) {
  return listConsumerPactFiles(pactsDir).map((file) => path.basename(file));
}

function clearPactArtifacts(pactsDir) {
  const resolved = path.resolve(process.cwd(), pactsDir);
  if (!fs.existsSync(resolved)) {
    return;
  }

  for (const file of fs.readdirSync(resolved)) {
    if (file.endsWith('.json')) {
      fs.unlinkSync(path.join(resolved, file));
    }
  }
}

module.exports = {
  isConsumerPactFile,
  listConsumerPactFiles,
  listConsumerPactBasenames,
  clearPactArtifacts,
};
