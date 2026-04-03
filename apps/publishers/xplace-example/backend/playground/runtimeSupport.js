import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { createPublisherApiClient } from "../../../../../packages/server-sdk/dist/index.js";
import { listCreatorClubFeaturesFromManifest } from "../../shared/creatorClubManifestConfig.js";
import { evaluatePlaygroundFeatures } from "./featureRules.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PLAYGROUND_SESSION_HEADER = "x-xplace-playground-session";

function readPlaygroundSessionToken(request) {
  const direct = String(request.headers[PLAYGROUND_SESSION_HEADER] || "").trim();
  if (direct) return direct;
  const authHeader = String(request.headers.authorization || "").trim();
  if (authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }
  return "";
}

function buildPublisherLinkStatusClient({ gatewayBaseUrl, widgetToken }) {
  return createPublisherApiClient({
    baseUrl: gatewayBaseUrl,
    token: widgetToken,
  });
}

export async function readPublisherLinkStatus({ gatewayBaseUrl, widgetToken }) {
  return buildPublisherLinkStatusClient({
    gatewayBaseUrl,
    widgetToken,
  }).getLinkStatus();
}

export function sanitizePlaygroundSession(session) {
  if (!session) return null;
  return {
    context: session.context,
    account: session.account,
    issued_at: session.issued_at,
    expires_at: session.expires_at,
  };
}

export function samePlaygroundContext(current, expected) {
  if (!current || !expected) return false;
  return (
    String(current.installation_id || "") === String(expected.installation_id || "") &&
    String(current.client_id || "") === String(expected.client_id || "") &&
    String(current.xapp_id || "") === String(expected.xapp_id || "") &&
    String(current.subject_id || "") === String(expected.subject_id || "") &&
    String(current.host_origin || "") === String(expected.host_origin || "")
  );
}

export async function bundlePlaygroundApp({ apiBaseRoute }) {
  const entryPath = path.resolve(__dirname, "..", "..", "frontend", "creator-club", "App.jsx");
  const result = await build({
    entryPoints: [entryPath],
    bundle: true,
    write: false,
    outfile: "creator-club.app.js",
    format: "iife",
    platform: "browser",
    target: ["es2020"],
    jsx: "automatic",
    define: {
      __PLAYGROUND_API_BASE__: JSON.stringify(apiBaseRoute),
    },
  });
  const jsOutput =
    result.outputFiles.find((item) => item.path.endsWith(".js")) || result.outputFiles[0] || null;
  if (!jsOutput) {
    throw new Error("Monetization playground bundle did not produce a JS output");
  }
  return jsOutput.text;
}

export function requirePlaygroundSession(request, reply, sessionStore) {
  const token = readPlaygroundSessionToken(request);
  const session = sessionStore.readSession(token);
  if (!session) {
    reply.code(401).send({ ok: false, error: { message: "Playground session required" } });
    return null;
  }
  return { token, session };
}

export function sendPublisherLinkError(reply, error, fallbackMessage) {
  const status = Number(error?.status);
  return reply.code(Number.isInteger(status) && status >= 400 && status < 600 ? status : 502).send({
    ok: false,
    error: {
      message:
        String(error?.message || "").trim() || String(fallbackMessage || "Publisher link failed"),
    },
  });
}

export async function completePublisherLinkForAccount({
  publisherLinkClient,
  account,
  subjectId,
  xappId,
  installationId,
  clientId,
}) {
  if (!subjectId || !xappId) {
    return { linked: false };
  }
  const result = await publisherLinkClient.completeLink({
    subjectId,
    xappId,
    publisherUserId: account.id,
    metadata: {
      publisherUserId: account.id,
      email: account.email,
      displayName: account.display_name,
      clientId: clientId || undefined,
      installationId: installationId || undefined,
    },
  });
  return { linked: true, result };
}

export async function bindLinkedAccountToSession({
  sessionStore,
  session,
  sessionToken,
  gatewayBaseUrl,
  widgetToken,
  accountsRepo,
}) {
  if (!session || !sessionToken || session.account || !widgetToken) {
    return session;
  }
  try {
    const status = await buildPublisherLinkStatusClient({
      gatewayBaseUrl,
      widgetToken,
    }).getLinkStatus();
    if (!status?.linked) {
      return session;
    }
    const accountById = status.publisherUserId
      ? await accountsRepo.findAccountById(status.publisherUserId)
      : null;
    const accountByEmail =
      !accountById && status.publisherUserEmail
        ? await accountsRepo.findAccountByEmail(status.publisherUserEmail)
        : null;
    const account = accountById || accountByEmail || null;
    if (!account) {
      return session;
    }
    return sessionStore.bindAccount(sessionToken, account) || session;
  } catch {
    return session;
  }
}

export async function readPlaygroundState({
  gatewayClient,
  session,
  scopeKind,
  realmRef,
  intentId,
}) {
  const xappId = String(session?.context?.xapp_id || "").trim();
  if (!xappId) {
    throw new Error("Xapp context is missing for the monetization playground");
  }
  const xappDetail = await gatewayClient.readXappDetail({ xappId });
  const manifest =
    xappDetail?.manifest && typeof xappDetail.manifest === "object" ? xappDetail.manifest : {};
  const featureDefinitions = listCreatorClubFeaturesFromManifest(manifest);
  const state = await gatewayClient.readState({
    xappId,
    context: session.context,
    scopeKind,
    realmRef,
    intentId,
  });
  return {
    ...state,
    feature_definitions: featureDefinitions,
    features: evaluatePlaygroundFeatures({
      featureDefinitions,
      accessProjection: state.access_projection,
      currentSubscription: state.current_subscription,
    }),
  };
}
