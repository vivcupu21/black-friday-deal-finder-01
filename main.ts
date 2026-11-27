// SPDX-License-Identifier: MIT
// DealHound entrypoint (Node 22, standard library only).
// Copies app/ and screenshots/ from this repository into the output
// directory and writes dossier.json there with make.fun's dossier
// library, so the hand-in is exactly what the library computes.
// The build fails loudly (non-zero exit, no dossier written) if a
// required input is missing or the dossier it produces is invalid,
// so a broken hand-in can never be submitted by accident.
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

function fail(message) {
  console.error(`DealHound build failed: ${message}`);
  process.exit(1);
}

// --- Verify inputs before touching the output directory. ---
const appIndex = join(repoRoot, "app", "index.html");
if (!existsSync(appIndex)) fail(`missing required file: ${appIndex}`);
const screenshotDir = join(repoRoot, "screenshots");
const screenshots = existsSync(screenshotDir)
  ? readdirSync(screenshotDir).filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
  : [];
if (screenshots.length === 0) {
  fail(`no screenshots found in ${screenshotDir}`);
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
cpSync(join(repoRoot, "app"), join(outDir, "app"), { recursive: true });
cpSync(join(repoRoot, "screenshots"), join(outDir, "screenshots"), {
  recursive: true,
});

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 3, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});

// --- Verify the hand-in before writing it out. ---
// buildDossier returns canonical JSON *bytes* (a Uint8Array), not a
// string: validate the bytes, but write them out untouched so the
// dossier stays byte-identical to what the scorer recomputes.
if (!dossier || dossier.length === 0) {
  fail("buildDossier returned an empty dossier");
}
let parsed;
try {
  parsed = JSON.parse(new TextDecoder().decode(dossier));
} catch {
  fail("dossier.json is not valid JSON");
}
if (!parsed || typeof parsed !== "object") {
  fail("dossier.json did not parse to an object");
}
if (!existsSync(join(outDir, "app", "index.html"))) {
  fail("output is missing app/index.html");
}
const outShots = readdirSync(join(outDir, "screenshots")).length;
if (outShots === 0) fail("output is missing screenshots");

writeFileSync(join(outDir, "dossier.json"), dossier);
const appFiles = readdirSync(join(outDir, "app")).length;
console.log(
  `DealHound dossier written to ${join(outDir, "dossier.json")} (${dossier.length} bytes; ${appFiles} app files, ${outShots} screenshots)`
);
