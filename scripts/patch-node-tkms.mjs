import fs from "fs";
import path from "path";

const searchRoot = path.join(process.cwd(), "node_modules", ".pnpm");
const targetSuffix = path.join("node-tkms", "kms_lib.js");
const original = "const { TextEncoder, TextDecoder } = require(`util`);";
const replacement =
  "const TextEncoder = globalThis.TextEncoder; const TextDecoder = globalThis.TextDecoder;";

function findFile(dir) {
  if (!fs.existsSync(dir)) return null;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = findFile(fullPath);
      if (nested) return nested;
    } else if (fullPath.endsWith(targetSuffix)) {
      return fullPath;
    }
  }
  return null;
}

const tkmsFile = findFile(searchRoot);

if (!tkmsFile || !fs.existsSync(tkmsFile)) {
  console.log("node-tkms not found, skipping patch");
  process.exit(0);
}

const content = fs.readFileSync(tkmsFile, "utf8");
if (!content.includes(original)) {
  console.log("node-tkms already patched");
  process.exit(0);
}

fs.writeFileSync(tkmsFile, content.replace(original, replacement), "utf8");
console.log(`Patched node-tkms (${tkmsFile}) for browser compatibility`);
