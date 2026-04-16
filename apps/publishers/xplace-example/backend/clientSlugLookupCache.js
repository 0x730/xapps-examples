function normalizeClientSlugMap(listed) {
  return Object.fromEntries(
    (Array.isArray(listed?.items) ? listed.items : [])
      .map((item) => ({
        id: String(item?.id || "").trim(),
        slug: String(item?.slug || "")
          .trim()
          .toLowerCase(),
      }))
      .filter((item) => item.id && item.slug)
      .map((item) => [item.id, item.slug]),
  );
}

export function createClientSlugLookupCache({
  listClients,
  ttlMs = 30_000,
  now = () => Date.now(),
  onError = () => {},
} = {}) {
  if (typeof listClients !== "function") {
    throw new TypeError("listClients is required");
  }

  const normalizedTtlMs = Math.max(250, Number(ttlMs || 30_000));
  let clientSlugById = {};
  let lastRefreshStartedAt = 0;
  let refreshPromise = null;

  async function refresh() {
    if (refreshPromise) return refreshPromise;
    lastRefreshStartedAt = now();
    refreshPromise = (async () => {
      try {
        const listed = await listClients();
        clientSlugById = normalizeClientSlugMap(listed);
      } catch (error) {
        onError(error);
      } finally {
        refreshPromise = null;
      }
      return clientSlugById;
    })();
    return refreshPromise;
  }

  function scheduleRefresh() {
    const currentTime = now();
    if (
      refreshPromise ||
      (lastRefreshStartedAt > 0 && currentTime - lastRefreshStartedAt < normalizedTtlMs)
    ) {
      return;
    }
    void refresh();
  }

  return {
    async hydrate() {
      return refresh();
    },

    getSlugById(clientId) {
      const normalizedClientId = String(clientId || "").trim();
      if (!normalizedClientId) return "";
      const cachedSlug = String(clientSlugById[normalizedClientId] || "")
        .trim()
        .toLowerCase();
      if (cachedSlug) {
        if (now() - lastRefreshStartedAt >= normalizedTtlMs) {
          scheduleRefresh();
        }
        return cachedSlug;
      }
      scheduleRefresh();
      return "";
    },

    snapshot() {
      return { ...clientSlugById };
    },
  };
}
