import { cp, mkdir, mkdtemp, readFile, rename, rm, stat } from "node:fs/promises";
import { constants } from "node:fs";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let cleanParent = path.dirname(projectRoot);
while (cleanParent.includes("'") || cleanParent.includes('"')) cleanParent = path.dirname(cleanParent);
const temporaryBase = process.platform === "linux" ? path.join(cleanParent, ".gearnest-builds") : tmpdir();
await mkdir(temporaryBase, { recursive: true });
const temporaryRoot = await mkdtemp(path.join(temporaryBase, "gearnest-cloudflare-"));
const temporaryProject = path.join(temporaryRoot, "client");
const artifacts = path.join(projectRoot, ".open-next");
const pendingArtifacts = path.join(projectRoot, ".open-next-pending");
const excluded = new Set([".git", "node_modules", ".next", ".wrangler", "coverage", "playwright-report", "test-results"]);

function includeSource(source) {
  const name = path.basename(source);
  return !excluded.has(name) && !name.startsWith(".open-next") && !name.startsWith(".env") && !name.startsWith(".dev.vars") && !name.endsWith(".tsbuildinfo");
}

function run(command, args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { ...options, stdio: "inherit", shell: false });
    child.once("error", reject);
    child.once("exit", (code, signal) => code === 0 ? resolve() : reject(new Error(`Cloudflare build failed (${signal ?? code}).`)));
  });
}

try {
  // OpenNext currently interpolates cache-handler paths into single-quoted code.
  if (temporaryProject.includes("'") || temporaryProject.includes('"')) throw new Error("The temporary build directory must not contain quote characters.");
  await cp(projectRoot, temporaryProject, { recursive: true, filter: includeSource });
  // Turbopack deliberately refuses dependencies symlinked outside its workspace.
  if (process.platform === "linux") {
    // Dependencies are read-only during builds; hard links avoid duplicating them.
    const sameDevice = (await stat(projectRoot)).dev === (await stat(temporaryRoot)).dev;
    await run("cp", [sameDevice ? "-al" : "-a", ...(sameDevice ? [] : ["--reflink=auto"]), path.join(projectRoot, "node_modules"), path.join(temporaryProject, "node_modules")], { cwd: projectRoot });
  } else {
    await cp(path.join(projectRoot, "node_modules"), path.join(temporaryProject, "node_modules"), { recursive: true, mode: constants.COPYFILE_FICLONE, verbatimSymlinks: true });
  }
  const packageJson = JSON.parse(await readFile(path.join(projectRoot, "node_modules/@opennextjs/cloudflare/package.json"), "utf8"));
  const cli = path.join(temporaryProject, "node_modules/@opennextjs/cloudflare", packageJson.bin["opennextjs-cloudflare"]);
  const environment = { ...process.env, NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "https://api.gearnest.sraboni.dev", NODE_ENV: "production", NEXT_TELEMETRY_DISABLED: "1", WRANGLER_SEND_METRICS: "false" };
  for (const key of ["MONGODB_URI", "BETTER_AUTH_SECRET", "GOOGLE_CLIENT_SECRET", "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "IMGBB_API_KEY"]) delete environment[key];
  console.log("Building Cloudflare artifacts in a temporary directory without project secrets.");
  await run(process.execPath, [cli, "build"], { cwd: temporaryProject, env: environment });
  await rm(pendingArtifacts, { recursive: true, force: true });
  await cp(path.join(temporaryProject, ".open-next"), pendingArtifacts, { recursive: true });
  await rm(artifacts, { recursive: true, force: true });
  await rename(pendingArtifacts, artifacts);
  console.log("Cloudflare artifacts are ready in .open-next/.");
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
  await rm(pendingArtifacts, { recursive: true, force: true });
}
