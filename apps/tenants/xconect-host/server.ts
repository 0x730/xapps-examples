import path from "node:path";
import { fileURLToPath } from "node:url";
import { startHostProofServer } from "../host-proof-common/server.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

await startHostProofServer({
  appDir: __dirname,
  envFileVar: "XCONECT_HOST_ENV_FILE",
  envPortVar: "XCONECT_HOST_PORT",
  envBackendBaseUrlVar: "XCONECT_HOST_BACKEND_BASE_URL",
  envBootstrapBackendBaseUrlVar: "XCONECT_HOST_BOOTSTRAP_BACKEND_BASE_URL",
  envPublicBaseUrlVar: "XCONECT_HOST_PUBLIC_BASE_URL",
  envBootstrapApiKeyVar: "XCONECT_HOST_BOOTSTRAP_API_KEY",
  defaultPort: 3412,
  defaultBackendBaseUrl: "http://localhost:3312",
  defaultBootstrapBackendBaseUrl: "http://localhost:3312",
  defaultPublicBaseUrl: "http://localhost:3412",
  proofName: "xconect-host",
  workspaceKey: "xconect",
  stackLabel: "frontend proof -> Node + Fastify backend",
  identityStorageKey: "xconect_host_proof_identity_v1",
  logScope: "xconect-host-proof",
});
