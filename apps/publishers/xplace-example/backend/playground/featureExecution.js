function readCreditsRequirement(feature) {
  const amount = Number(feature?.requirements?.credits || 0);
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

export async function executeCreatorClubFeature({
  session,
  feature,
  scopeFields,
  xappId,
  gatewayClient,
}) {
  const creditsToConsume = readCreditsRequirement(feature);
  if (!creditsToConsume) {
    return {
      ok: true,
      execution: {
        type: "access_only",
        credits_consumed: 0,
        feature_key: String(feature?.key || "").trim() || null,
      },
      message: `${feature?.title || "Feature"} completed on the current scope.`,
    };
  }

  const clientId = String(session?.context?.client_id || "").trim();
  if (!clientId) {
    throw new Error("Client context is required for credit-backed feature execution");
  }

  const walletAccountsResult = await gatewayClient.readWalletAccounts({
    xappId: String(xappId || "").trim(),
    scopeFields,
  });
  const walletAccounts = Array.isArray(walletAccountsResult?.items)
    ? walletAccountsResult.items
    : [];

  const walletAccount = walletAccounts.find((item) => {
    const balance = Number(item?.balance_remaining || 0);
    return Number.isFinite(balance) && balance >= creditsToConsume;
  });
  if (!walletAccount) {
    throw new Error(
      `No active wallet with at least ${creditsToConsume} credits is available on the current scope.`,
    );
  }

  const consumed = await gatewayClient.consumeWalletCredits({
    xappId: String(xappId || "").trim(),
    walletAccountId: walletAccount.id,
    amount: String(creditsToConsume),
    sourceRef: `creator_club_feature:${String(feature?.key || "").trim() || "unknown"}`,
    metadata: {
      playground: true,
      feature_key: String(feature?.key || "").trim() || null,
      feature_title: String(feature?.title || "").trim() || null,
      account_id: String(session?.account?.id || "").trim() || null,
    },
  });
  if (!consumed) {
    throw new Error("Could not consume credits for the selected feature");
  }

  return {
    ok: true,
    execution: {
      type: "credits_consumed",
      credits_consumed: creditsToConsume,
      feature_key: String(feature?.key || "").trim() || null,
      wallet_account: consumed.wallet_account,
      wallet_ledger: consumed.wallet_ledger,
    },
    message: `${feature?.title || "Feature"} completed and consumed ${creditsToConsume} credits.`,
  };
}
