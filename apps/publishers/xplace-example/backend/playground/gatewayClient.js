import { createGatewayApiClient } from "../../../../../packages/server-sdk/dist/index.js";
import {
  activateXappPurchaseReference,
  consumeXappWalletCredits,
  finalizeXappHostedPurchase,
  resolveXappMonetizationScope,
  readXappMonetizationSnapshot,
  startXappHostedPurchase,
} from "../../../../../packages/backend-kit/dist/index.js";

const PLAYGROUND_SOURCE_REF = "xplace-example-playground";
const PLAYGROUND_PAYMENT_LANE = "publisher_rendered_playground";

function readTrimmedString(value) {
  return String(value || "").trim();
}

function buildEmptyRecentPurchaseActivity() {
  return {
    recent_purchase_intent: null,
    recent_transactions: [],
  };
}

function resolvePlaygroundScopeFields({ context, scopeKind, realmRef }) {
  const resolvedScope = resolveXappMonetizationScope({ scopeKind, context, realmRef });
  return {
    scopeKind: resolvedScope.scope_kind,
    scopeFields: resolvedScope.scope_fields || {},
  };
}

function buildScopeQuery(scopeFields) {
  const fields = scopeFields && typeof scopeFields === "object" ? scopeFields : {};
  return {
    ...(readTrimmedString(fields.subject_id)
      ? { subject_id: readTrimmedString(fields.subject_id) }
      : {}),
    ...(readTrimmedString(fields.installation_id)
      ? { installation_id: readTrimmedString(fields.installation_id) }
      : {}),
    ...(readTrimmedString(fields.realm_ref)
      ? { realm_ref: readTrimmedString(fields.realm_ref) }
      : {}),
  };
}

function buildPlaygroundSnapshotPayload({
  scopeKind,
  scopeFields,
  snapshot,
  recentPurchaseActivity,
}) {
  return {
    scope_kind: scopeKind,
    scope_fields: scopeFields,
    access_projection: snapshot?.access_projection || null,
    current_subscription: snapshot?.current_subscription || null,
    wallet_accounts: Array.isArray(snapshot?.wallet_accounts) ? snapshot.wallet_accounts : [],
    wallet_ledger: Array.isArray(snapshot?.wallet_ledger) ? snapshot.wallet_ledger : [],
    ...recentPurchaseActivity,
  };
}

async function readJsonSafe(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function fetchGatewayJson({
  gatewayBaseUrl,
  gatewayClientApiKey,
  path,
  method = "GET",
  body,
}) {
  const url = new URL(path, `${String(gatewayBaseUrl || "").replace(/\/+$/, "")}/`);
  const response = await fetch(url, {
    method,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "x-api-key": gatewayClientApiKey,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const json = await readJsonSafe(response);
  if (!response.ok) {
    throw new Error(
      String(json?.message || json?.error?.message || "").trim() ||
        `Gateway request failed for ${method} ${path}`,
    );
  }
  return json;
}

export function createPlaygroundGatewayClient({ gatewayBaseUrl, gatewayClientApiKey }) {
  const gateway = createGatewayApiClient({
    baseUrl: gatewayBaseUrl,
    apiKey: gatewayClientApiKey,
    fetchImpl: globalThis.fetch,
  });

  async function readRecentPurchaseActivity({ xappId, intentId }) {
    const resolvedIntentId = readTrimmedString(intentId);
    if (!resolvedIntentId) {
      return buildEmptyRecentPurchaseActivity();
    }
    try {
      const [intent, transactions] = await Promise.all([
        gateway.getXappPurchaseIntent({
          xappId: readTrimmedString(xappId),
          intentId: resolvedIntentId,
        }),
        gateway.listXappPurchaseTransactions({
          xappId: readTrimmedString(xappId),
          intentId: resolvedIntentId,
        }),
      ]);
      return {
        recent_purchase_intent:
          intent?.prepared_intent && typeof intent.prepared_intent === "object"
            ? intent.prepared_intent
            : null,
        recent_transactions:
          transactions && Array.isArray(transactions.items) ? transactions.items : [],
      };
    } catch {
      return buildEmptyRecentPurchaseActivity();
    }
  }

  return {
    async listCatalog({ xappId }) {
      return gateway.getXappMonetizationCatalog(readTrimmedString(xappId));
    },

    async readXappDetail({ xappId }) {
      return fetchGatewayJson({
        gatewayBaseUrl,
        gatewayClientApiKey,
        path: `/v1/xapps/${encodeURIComponent(readTrimmedString(xappId))}`,
      });
    },

    async readState({ xappId, context, scopeKind, realmRef, intentId }) {
      const resolvedXappId = readTrimmedString(xappId);
      const { scopeKind: resolvedScopeKind, scopeFields } = resolvePlaygroundScopeFields({
        context,
        scopeKind,
        realmRef,
      });
      const [snapshot, recentPurchaseActivity] = await Promise.all([
        readXappMonetizationSnapshot(gateway, {
          xappId: resolvedXappId,
          subject_id: scopeFields.subject_id || undefined,
          installation_id: scopeFields.installation_id || undefined,
          realm_ref: scopeFields.realm_ref || undefined,
          includeWalletLedger: true,
        }),
        readRecentPurchaseActivity({
          xappId: resolvedXappId,
          intentId,
        }),
      ]);
      return buildPlaygroundSnapshotPayload({
        scopeKind: resolvedScopeKind,
        scopeFields,
        snapshot,
        recentPurchaseActivity,
      });
    },

    async readWalletAccounts({ xappId, scopeFields }) {
      const query = new URLSearchParams(buildScopeQuery(scopeFields)).toString();
      return fetchGatewayJson({
        gatewayBaseUrl,
        gatewayClientApiKey,
        path: `/v1/xapps/${encodeURIComponent(readTrimmedString(xappId))}/monetization/wallet-accounts${query ? `?${query}` : ""}`,
      });
    },

    async consumeWalletCredits({ xappId, walletAccountId, amount, sourceRef, metadata }) {
      return consumeXappWalletCredits(gateway, {
        xappId: readTrimmedString(xappId),
        walletAccountId: readTrimmedString(walletAccountId),
        amount: String(amount || "").trim(),
        source_ref: sourceRef,
        metadata,
      });
    },

    async referenceActivate({
      xappId,
      context,
      scopeKind,
      realmRef,
      offeringId,
      packageId,
      priceId,
    }) {
      const scopeFields = resolveXappMonetizationScope({
        scopeKind,
        context,
        realmRef,
      }).scope_fields;
      return activateXappPurchaseReference(gateway, {
        xappId: readTrimmedString(xappId),
        offering_id: offeringId,
        package_id: packageId,
        price_id: priceId,
        ...scopeFields,
        source_kind: "owner_managed_external",
        source_ref: PLAYGROUND_SOURCE_REF,
        payment_lane: "reference_activation",
        provider_ref: PLAYGROUND_SOURCE_REF,
        evidence_ref: PLAYGROUND_SOURCE_REF,
      });
    },

    async createPaymentSession({
      xappId,
      context,
      scopeKind,
      realmRef,
      offeringId,
      packageId,
      priceId,
      paymentGuardRef,
      returnUrl,
      cancelUrl,
      pageUrl,
      issuer = "gateway",
      scheme = "",
      metadata,
    }) {
      const scopeFields = resolveXappMonetizationScope({
        scopeKind,
        context,
        realmRef,
      }).scope_fields;
      return startXappHostedPurchase(gateway, {
        xappId: readTrimmedString(xappId),
        offering_id: offeringId,
        package_id: packageId,
        price_id: priceId,
        ...scopeFields,
        source_kind: "owner_managed_external",
        source_ref: PLAYGROUND_SOURCE_REF,
        payment_lane: PLAYGROUND_PAYMENT_LANE,
        return_url: returnUrl,
        cancel_url: cancelUrl || undefined,
        page_url: pageUrl || undefined,
        payment_guard_ref: readTrimmedString(paymentGuardRef) || undefined,
        issuer,
        scheme: readTrimmedString(scheme) || undefined,
        metadata: {
          ...((metadata && typeof metadata === "object" && !Array.isArray(metadata)
            ? metadata
            : {}) || {}),
          playground: true,
          app: PLAYGROUND_SOURCE_REF,
        },
      });
    },

    async reconcilePaymentSession({ xappId, intentId }) {
      return finalizeXappHostedPurchase(gateway, {
        xappId: readTrimmedString(xappId),
        intentId: readTrimmedString(intentId),
      });
    },
  };
}
