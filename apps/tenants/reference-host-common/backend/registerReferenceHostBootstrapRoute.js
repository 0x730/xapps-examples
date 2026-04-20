import {
  applyHostApiCorsHeaders,
  buildHostBootstrapResult,
  ensureHostApiOriginAllowed,
  readBodyRecord,
  readRequestOrigin,
  requireHostProxyService,
  requireRequestedHostBootstrapOrigin,
  sendHostApiPreflight,
  sendServiceError,
} from "@xapps-platform/backend-kit/backend/routes/gateway/shared";

function readRequestBaseUrl(request) {
  const forwardedProto = String(request?.headers?.["x-forwarded-proto"] || "")
    .split(",")[0]
    ?.trim()
    .toLowerCase();
  const forwardedHost = String(request?.headers?.["x-forwarded-host"] || "")
    .split(",")[0]
    ?.trim();
  const protocol = String(forwardedProto || request?.protocol || "http")
    .trim()
    .toLowerCase();
  const host = String(forwardedHost || request?.headers?.host || "").trim();
  return host ? `${protocol}://${host}` : "";
}

export async function registerReferenceHostBootstrapRoute(fastify, options = {}) {
  const { allowedOrigins = [], bootstrap = {}, hostProxyService = null } = options;
  const service = requireHostProxyService(hostProxyService);

  fastify.options("/api/reference-host-bootstrap", async (request, reply) => {
    return sendHostApiPreflight(request, reply, allowedOrigins);
  });

  fastify.post("/api/reference-host-bootstrap", async (request, reply) => {
    if (!ensureHostApiOriginAllowed(request, reply, allowedOrigins)) return;
    try {
      const body = readBodyRecord(request.body);
      const requestedSubjectId = String(body.subjectId || "").trim();
      const type = String(body.type || "").trim();
      const identifier =
        body.identifier && typeof body.identifier === "object" && !Array.isArray(body.identifier)
          ? body.identifier
          : null;
      const email = String(body.email || "").trim();
      const name = String(body.name || "").trim();
      const metadata =
        body.metadata && typeof body.metadata === "object" && !Array.isArray(body.metadata)
          ? body.metadata
          : null;
      const origin = requireRequestedHostBootstrapOrigin(
        body.origin || readRequestOrigin(request) || readRequestBaseUrl(request),
        allowedOrigins,
      );
      if (!requestedSubjectId && !email && !identifier) {
        return reply.code(400).send({ message: "subjectId, identifier, or email is required" });
      }
      if (requestedSubjectId && !email && !identifier) {
        return reply
          .code(400)
          .send({ message: "subjectId requires identifier or email for validation" });
      }
      let resolvedSubjectId = requestedSubjectId;
      if (!resolvedSubjectId || email || identifier) {
        const resolved = await service.resolveSubject({
          subjectId: requestedSubjectId || undefined,
          type,
          identifier,
          email,
          name,
          metadata,
        });
        resolvedSubjectId = String(resolved?.subjectId || "").trim();
        if (!resolvedSubjectId) {
          throw new Error("resolve-subject response missing subjectId");
        }
        if (requestedSubjectId && requestedSubjectId !== resolvedSubjectId) {
          return reply.code(400).send({
            message: "subjectId does not match the resolved subject for the provided identity",
          });
        }
      }
      applyHostApiCorsHeaders(reply, request, allowedOrigins);
      return reply.send(
        buildHostBootstrapResult({
          subjectId: resolvedSubjectId,
          email: email || null,
          name: name || null,
          origin,
          signingSecret: bootstrap?.signingSecret,
          signingKeyId: bootstrap?.signingKeyId,
          ttlSeconds: bootstrap?.ttlSeconds,
        }),
      );
    } catch (error) {
      return sendServiceError(request, reply, error, "reference host bootstrap failed");
    }
  });
}
