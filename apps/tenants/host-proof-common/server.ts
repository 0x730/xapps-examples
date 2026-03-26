import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../../..");
const commonPublicDir = path.join(__dirname, "public");
const commonHostDir = path.join(__dirname, "host");

function firstExistingPath(candidates: string[], fallback: string) {
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return fallback;
}

const browserHostDistDir = firstExistingPath(
  [
    path.join(repoRoot, "node_modules/@xapps-platform/browser-host/dist"),
    path.join(repoRoot, "packages/browser-host/dist"),
  ],
  path.join(repoRoot, "packages/browser-host/dist"),
);
const embedSdkEsmFile = firstExistingPath(
  [
    path.join(repoRoot, "node_modules/@xapps-platform/embed-sdk/dist/xapps-embed-sdk.esm.js"),
    path.join(repoRoot, "dist/sdk/xapps-embed-sdk.esm.js"),
    path.join(repoRoot, "node_modules/@xapps-platform/embed-sdk/dist/xapps-embed-sdk.esm.js"),
  ],
  path.join(repoRoot, "dist/sdk/xapps-embed-sdk.esm.js"),
);

function sendFile(reply: any, filePath: string, contentType: string) {
  if (!fs.existsSync(filePath)) {
    return reply.code(404).type("application/json").send({ message: "file not found" });
  }
  return reply.code(200).type(contentType).send(fs.readFileSync(filePath, "utf8"));
}

function contentTypeForAsset(assetName: string) {
  if (assetName.endsWith(".css")) return "text/css; charset=utf-8";
  if (assetName.endsWith(".html")) return "text/html; charset=utf-8";
  if (assetName.endsWith(".json")) return "application/json; charset=utf-8";
  return "application/javascript; charset=utf-8";
}

export type HostProofServerConfig = {
  appDir: string;
  envFileVar: string;
  envPortVar: string;
  envBackendBaseUrlVar: string;
  envBootstrapBackendBaseUrlVar?: string;
  envPublicBaseUrlVar: string;
  envBootstrapApiKeyVar: string;
  defaultPort: number;
  defaultBackendBaseUrl: string;
  defaultBootstrapBackendBaseUrl?: string;
  defaultPublicBaseUrl: string;
  proofName: string;
  workspaceKey: string;
  stackLabel: string;
  identityStorageKey: string;
  logScope: string;
};

export async function startHostProofServer(config: HostProofServerConfig) {
  const explicitEnvPath = process.env[config.envFileVar] || process.env.ENV_FILE;
  if (explicitEnvPath) {
    dotenv.config({ path: explicitEnvPath });
  }

  const envDevPath = path.join(config.appDir, ".env.dev");
  const envPath = fs.existsSync(envDevPath) ? envDevPath : path.join(config.appDir, ".env");
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }

  const port = Number(process.env[config.envPortVar] || config.defaultPort);
  const backendBaseUrl = String(
    process.env[config.envBackendBaseUrlVar] || config.defaultBackendBaseUrl,
  )
    .trim()
    .replace(/\/+$/, "");
  const bootstrapBackendBaseUrl = String(
    (config.envBootstrapBackendBaseUrlVar
      ? process.env[config.envBootstrapBackendBaseUrlVar]
      : "") ||
      config.defaultBootstrapBackendBaseUrl ||
      backendBaseUrl,
  )
    .trim()
    .replace(/\/+$/, "");
  const publicBaseUrl = String(
    process.env[config.envPublicBaseUrlVar] || config.defaultPublicBaseUrl,
  )
    .trim()
    .replace(/\/+$/, "");
  const bootstrapApiKey = String(process.env[config.envBootstrapApiKeyVar] || "").trim();

  const fastify = Fastify({ logger: true });

  await fastify.register(fastifyStatic, {
    root: commonPublicDir,
    prefix: "/",
    wildcard: false,
  });

  fastify.get("/health", async () => ({
    ok: true,
    service: config.logScope,
    backendBaseUrl,
    bootstrapBackendBaseUrl,
    publicBaseUrl,
  }));

  fastify.post("/api/host-bootstrap", async (request, reply) => {
    if (!bootstrapApiKey) {
      return reply.code(500).send({ message: "Host bootstrap api key is not configured" });
    }
    const body =
      request.body && typeof request.body === "object" && !Array.isArray(request.body)
        ? (request.body as Record<string, unknown>)
        : {};
    const response = await fetch(`${bootstrapBackendBaseUrl}/api/host-bootstrap`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": bootstrapApiKey,
      },
      body: JSON.stringify({
        email: String(body.email || "").trim(),
        name: String(body.name || "").trim(),
        origin: publicBaseUrl,
      }),
    });
    const text = await response.text();
    const payload = (() => {
      try {
        return text ? JSON.parse(text) : {};
      } catch {
        return { message: text || "host bootstrap failed" };
      }
    })();
    return reply.code(response.status).send(payload);
  });

  fastify.get("/embed/sdk/xapps-embed-sdk.esm.js", async (_request, reply) =>
    sendFile(reply, embedSdkEsmFile, "application/javascript; charset=utf-8"),
  );

  fastify.get("/host/proof-config.js", async (_request, reply) => {
    const body = [
      `export const BACKEND_BASE_URL = ${JSON.stringify(backendBaseUrl)};`,
      `export const PUBLIC_BASE_URL = ${JSON.stringify(publicBaseUrl)};`,
      `export const PROOF_NAME = ${JSON.stringify(config.proofName)};`,
      `export const WORKSPACE_KEY = ${JSON.stringify(config.workspaceKey)};`,
      `export const STACK_LABEL = ${JSON.stringify(config.stackLabel)};`,
      `export const IDENTITY_STORAGE_KEY = ${JSON.stringify(config.identityStorageKey)};`,
      `export const SDK_PATH = "/embed/sdk/xapps-embed-sdk.esm.js";`,
    ].join("\n");
    return reply.code(200).type("application/javascript; charset=utf-8").send(body);
  });

  fastify.get("/host/:assetName", async (request, reply) => {
    const assetName = String((request.params as any)?.assetName || "").trim();
    const localFile = path.join(commonHostDir, assetName);
    if (fs.existsSync(localFile)) {
      return sendFile(reply, localFile, contentTypeForAsset(assetName));
    }
    const sharedFile = path.join(browserHostDistDir, assetName);
    if (fs.existsSync(sharedFile)) {
      return sendFile(reply, sharedFile, contentTypeForAsset(assetName));
    }
    return reply.code(404).type("application/json").send({ message: "host asset not found" });
  });

  await fastify.listen({ port, host: "0.0.0.0" });
  fastify.log.info(
    {
      port,
      backendBaseUrl,
      bootstrapBackendBaseUrl,
      publicBaseUrl,
      workspaceKey: config.workspaceKey,
    },
    `[${config.logScope}] listening`,
  );
}
