import Fastify from "fastify";
import {
  createEmbedHostProxyService as createEmbedHostProxyServiceSdk,
  createGatewayApiClient as createGatewayApiClientSdk,
} from "@xapps-platform/server-sdk";
import {
  createGatewayExecutionModule as createGatewayExecutionModuleBase,
  createHostReferenceModule as createHostReferenceModuleBase,
  createReferenceSurfaceModule as createReferenceSurfaceModuleBase,
  createBackendKit as createBackendKitBase,
  createHostProxyService as createHostProxyServiceBase,
  normalizeBackendKitOptions as normalizeBackendKitOptionsBase,
} from "@xapps-platform/backend-kit";
import paymentRoutesBase from "@xapps-platform/backend-kit/backend/routes/gateway/payment";
import guardRoutesBase from "@xapps-platform/backend-kit/backend/routes/gateway/guard";
import subjectProfileRoutesBase from "@xapps-platform/backend-kit/backend/routes/gateway/subjectProfiles";
import {
  PORT,
  EMBED_SDK_ESM_CANDIDATE_FILES,
  TENANT_PAYMENT_URL,
  TENANT_PAYMENT_RETURN_SECRET,
  TENANT_PAYMENT_RETURN_SECRET_REF,
  TENANT_PAYMENT_RETURN_URL_ALLOWLIST,
  TENANT_SEED_LOGO_FILE,
  TENANT_PAYMENT_PAGE_FILE,
  GATEWAY_URL,
  GATEWAY_API_KEY,
  GUARD_INGEST_API_KEY,
  ALLOWED_ORIGINS,
  HOST_BOOTSTRAP_API_KEYS,
  HOST_BOOTSTRAP_SIGNING_SECRET,
} from "./lib/config.js";
import { createAppSurfaceModule } from "./lib/appSurfaceModule.js";
import { DEFAULT_SUBJECT_PROFILES } from "./lib/subjectProfiles/defaultProfiles.js";
import { normalizeEnabledBackendModes } from "./modes/index.js";
import hostRoutes from "./routes/host.js";
import referenceRoutesBase from "@xapps-platform/backend-kit/backend/routes/reference";

function normalizeBackendKitOptions(input = {}) {
  return normalizeBackendKitOptionsBase(input, {
    normalizeEnabledModes: normalizeEnabledBackendModes,
    defaults: {
      gateway: {
        baseUrl: GATEWAY_URL,
        apiKey: GATEWAY_API_KEY,
      },
      payments: {
        paymentUrl: TENANT_PAYMENT_URL,
        returnSecret: TENANT_PAYMENT_RETURN_SECRET,
        returnSecretRef: TENANT_PAYMENT_RETURN_SECRET_REF,
        returnUrlAllowlist: TENANT_PAYMENT_RETURN_URL_ALLOWLIST,
      },
    },
  });
}

async function createBackendKit(input = {}) {
  return createBackendKitBase(input, {
    normalizeOptions: normalizeBackendKitOptions,
    createGatewayClient: ({ baseUrl, apiKey }) => createGatewayApiClientSdk({ baseUrl, apiKey }),
    createReferenceSurfaceModule: (options) =>
      createReferenceSurfaceModuleBase(options, {
        registerReferenceRoutes: (fastify, referenceOptions) =>
          fastify.register(referenceRoutesBase, referenceOptions),
      }),
    createHostReferenceModule: (options) =>
      createHostReferenceModuleBase(options, {
        createHostProxyService: ({ gateway, reference }) =>
          createHostProxyServiceBase(
            { gateway, reference },
            {
              createGatewayClient: ({ baseUrl, apiKey }) =>
                createGatewayApiClientSdk({ baseUrl, apiKey }),
              createEmbedHostProxyService: ({ gatewayClient, gatewayUrl, hostModes }) =>
                createEmbedHostProxyServiceSdk({ gatewayClient, gatewayUrl, hostModes }),
            },
          ),
        registerHostRoutes: (fastify, hostOptions) => fastify.register(hostRoutes, hostOptions),
      }),
    createGatewayExecutionModule: (options) =>
      createGatewayExecutionModuleBase(options, {
        registerPaymentRoutes: (fastify, routeOptions) =>
          fastify.register(paymentRoutesBase, routeOptions),
        registerGuardRoutes: (fastify, routeOptions) =>
          fastify.register(guardRoutesBase, {
            ...routeOptions,
            guardApiKey: GUARD_INGEST_API_KEY,
            logScope: "xconect",
          }),
        registerSubjectProfileRoutes: (fastify, routeOptions) =>
          fastify.register(subjectProfileRoutesBase, routeOptions),
      }),
  });
}

const BACKEND_KIT_OPTIONS = normalizeBackendKitOptions({
  gateway: {
    baseUrl: GATEWAY_URL,
    apiKey: GATEWAY_API_KEY,
  },
  branding: {
    tenantName: "Xconect",
    serviceName: "xconect-tenant-backend",
    stackLabel: "node-fastify",
  },
  assets: {
    seedLogo: {
      filePath: TENANT_SEED_LOGO_FILE,
      routePath: "/assets/xconect-seed-logo.svg",
      contentType: "image/svg+xml",
    },
    paymentPage: {
      filePath: TENANT_PAYMENT_PAGE_FILE,
    },
  },
  host: {
    enableReference: true,
    enableLifecycle: true,
    enableBridge: true,
    allowedOrigins: ALLOWED_ORIGINS,
    bootstrap: {
      apiKeys: HOST_BOOTSTRAP_API_KEYS,
      signingSecret: HOST_BOOTSTRAP_SIGNING_SECRET,
      ttlSeconds: 300,
    },
  },
  payments: {
    enabledModes: ["gateway_managed", "tenant_delegated", "publisher_delegated", "owner_managed"],
    paymentUrl: TENANT_PAYMENT_URL,
    returnSecret: TENANT_PAYMENT_RETURN_SECRET,
    returnSecretRef: TENANT_PAYMENT_RETURN_SECRET_REF,
    returnUrlAllowlist: TENANT_PAYMENT_RETURN_URL_ALLOWLIST,
  },
  reference: {
    tenant: "xconect",
    workspace: "xconect",
    stack: "node-fastify",
    mode: "reference-marketplace-tenant",
    tenantPolicySlugs: [
      "xconect-tenant-payment-policy",
      "xconect-tenant-payment-policy-stripe-gateway",
      "xconect-tenant-payment-policy-stripe-delegated",
      "xconect-tenant-subject-profile-policy",
    ],
    proofSources: ["/api/reference", "/api/host-config", "/api/installations?subjectId=..."],
    sdkPaths: {
      node: "@xapps-platform/server-sdk",
      php: "xapps-platform/xapps-php",
      browser: "xapps-embed-sdk",
    },
    embedSdkCandidateFiles: EMBED_SDK_ESM_CANDIDATE_FILES,
    hostSurfaces: [
      { key: "single-panel", label: "Single panel", recommended_for_first_lane: true },
      { key: "split-panel", label: "Split panel", recommended_for_first_lane: false },
      { key: "single-xapp", label: "Single xapp", recommended_for_first_lane: false },
    ],
    referenceAssets: {
      endpoints: [
        {
          method: "GET",
          path: "/",
          purpose: "Entry page for the xconect marketplace host reference.",
        },
        {
          method: "GET",
          path: "/marketplace.html",
          purpose: "Marketplace host shell with single-panel and split-panel embed modes.",
        },
        {
          method: "GET",
          path: "/single-xapp.html",
          purpose: "Focused single-xapp host surface using the same shared host/runtime contract.",
        },
        {
          method: "GET",
          path: "/embed/sdk/xapps-embed-sdk.esm.js",
          purpose: "Serves the embed SDK bundle used by the local reference host surfaces.",
        },
        {
          method: "GET",
          path: "/host/xconect-marketplace-host.js",
          purpose: "Browser bootstrap for the marketplace host reference.",
        },
        {
          method: "GET",
          path: "/host/xconect-single-xapp-host.js",
          purpose: "Browser bootstrap for the single-xapp host reference.",
        },
        {
          method: "GET",
          path: "/host/xconect-host-shell.js",
          purpose: "Shared host-shell rendering helpers for marketplace and single-xapp surfaces.",
        },
        {
          method: "GET",
          path: "/host/xconect-host-runtime.js",
          purpose: "xconect runtime/theme configuration over the shared browser SDK contract.",
        },
        {
          method: "GET",
          path: "/host/host-status.js",
          purpose: "Shared host proof/status renderer used by xconect and xconectb host surfaces.",
        },
        {
          method: "GET",
          path: "/assets/xconect-seed-logo.svg",
          purpose: "Local reference branding asset.",
        },
      ],
    },
  },
  subjectProfiles: {
    workspace: "xconect",
    source: "tenant_subject_profile",
    defaultProfiles: DEFAULT_SUBJECT_PROFILES,
  },
});

const fastify = Fastify({ logger: true, bodyLimit: 1_048_576 });
const hostProxyService = createHostProxyServiceBase(
  {
    gateway: BACKEND_KIT_OPTIONS.gateway,
    reference: BACKEND_KIT_OPTIONS.reference,
  },
  {
    createGatewayClient: ({ baseUrl, apiKey }) => createGatewayApiClientSdk({ baseUrl, apiKey }),
    createEmbedHostProxyService: ({ gatewayClient, gatewayUrl, hostModes }) =>
      createEmbedHostProxyServiceSdk({ gatewayClient, gatewayUrl, hostModes }),
  },
);
const backendKitOptions = {
  ...BACKEND_KIT_OPTIONS,
  overrides: {
    ...(BACKEND_KIT_OPTIONS.overrides || {}),
    hostProxyService,
  },
};
const appSurfaceModule = createAppSurfaceModule({
  assets: backendKitOptions.assets,
  branding: backendKitOptions.branding,
  reference: backendKitOptions.reference,
  hostProxyService,
  tools: ["evaluate_tenant_payment_policy"],
});
const backendKit = await createBackendKit(backendKitOptions);

if (!TENANT_PAYMENT_RETURN_SECRET) {
  fastify.log.warn(
    "[xconect] XCONECT_TENANT_PAYMENT_RETURN_SECRET is not set. Payment evidence HMAC verification is disabled. Set this secret for production use.",
  );
}

await appSurfaceModule.registerRoutes(fastify);
await backendKit.registerRoutes(fastify);
backendKit.applyNotFoundHandler(fastify);

// Graceful shutdown
for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, () => {
    fastify.log.info({ signal }, "shutting down");
    fastify.close().then(() => process.exit(0));
  });
}

try {
  await fastify.listen({ port: PORT, host: "0.0.0.0" });
  fastify.log.info(
    {
      port: PORT,
      paymentUrl: TENANT_PAYMENT_URL,
      hasPaymentReturnSecret: Boolean(TENANT_PAYMENT_RETURN_SECRET),
    },
    "xconect tenant backend running",
  );
} catch (err) {
  fastify.log.error(err, "failed to start");
  process.exit(1);
}
