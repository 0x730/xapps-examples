import path from "node:path";
import { fileURLToPath } from "node:url";
import { startHostProofServer } from "../host-proof-common/server.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

await startHostProofServer({
  appDir: __dirname,
  envFileVar: "XCONECTA_HOST_ENV_FILE",
  envPortVar: "XCONECTA_HOST_PORT",
  envBackendBaseUrlVar: "XCONECTA_HOST_BACKEND_BASE_URL",
  envBootstrapBackendBaseUrlVar: "XCONECTA_HOST_BOOTSTRAP_BACKEND_BASE_URL",
  envPublicBaseUrlVar: "XCONECTA_HOST_PUBLIC_BASE_URL",
  envBootstrapApiKeyVar: "XCONECTA_HOST_BOOTSTRAP_API_KEY",
  defaultPort: 3414,
  defaultBackendBaseUrl: "http://localhost:3314",
  defaultBootstrapBackendBaseUrl: "http://localhost:3314",
  defaultPublicBaseUrl: "http://localhost:3414",
  proofName: "xconecta-host",
  workspaceKey: "xconecta",
  stackLabel: "frontend proof -> Node + Fastify backend",
  identityStorageKey: "xconecta_host_proof_identity_v1",
  logScope: "xconecta-host-proof",
});
