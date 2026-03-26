import path from "node:path";
import { fileURLToPath } from "node:url";
import { startHostProofServer } from "../host-proof-common/server.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

await startHostProofServer({
  appDir: __dirname,
  envFileVar: "XCONECTB_HOST_ENV_FILE",
  envPortVar: "XCONECTB_HOST_PORT",
  envBackendBaseUrlVar: "XCONECTB_HOST_BACKEND_BASE_URL",
  envBootstrapBackendBaseUrlVar: "XCONECTB_HOST_BOOTSTRAP_BACKEND_BASE_URL",
  envPublicBaseUrlVar: "XCONECTB_HOST_PUBLIC_BASE_URL",
  envBootstrapApiKeyVar: "XCONECTB_HOST_BOOTSTRAP_API_KEY",
  defaultPort: 3413,
  defaultBackendBaseUrl: "http://localhost:3313",
  defaultBootstrapBackendBaseUrl: "http://localhost:3313",
  defaultPublicBaseUrl: "http://localhost:3413",
  proofName: "xconectb-host",
  workspaceKey: "xconectb",
  stackLabel: "frontend proof -> Plain PHP backend",
  identityStorageKey: "xconectb_host_proof_identity_v1",
  logScope: "xconectb-host-proof",
});
