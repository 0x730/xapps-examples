import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, "../../../../");
const TSX_CLI = path.resolve(REPO_ROOT, "node_modules/tsx/dist/cli.mjs");

export function runRootScript(scriptPath, options = {}) {
    const useTsx = options.useTsx !== false;
    const extraArgs = Array.isArray(options.args) ? options.args : process.argv.slice(2);
    const resolvedScript = path.resolve(REPO_ROOT, scriptPath);
    const command = useTsx
        ? [process.execPath, TSX_CLI, resolvedScript, ...extraArgs]
        : [process.execPath, resolvedScript, ...extraArgs];
    const result = spawnSync(command[0], command.slice(1), {
        cwd: REPO_ROOT,
        env: process.env,
        stdio: "inherit",
    });
    if (result.error) throw result.error;
    process.exit(result.status ?? 1);
}
