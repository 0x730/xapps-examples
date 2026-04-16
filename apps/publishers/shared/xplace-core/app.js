import Fastify from "fastify";
import fs from "node:fs";
import { randomUUID } from "node:crypto";
import { XPLACE_REQUEST_MODES, XPLACE_REQUEST_STATUSES } from "./constants.js";
import {
  insertOrUpdateRequestRecord,
  nowIso,
  sendGatewayComplete,
  sendGatewayProgress,
} from "./runtime.js";

export function createPublisherWorkspaceApp({
  serviceName,
  repo,
  dbKind,
  gatewayBaseUrl,
  toolRegistry,
  previewRegistry,
  listWorkspaceTools,
  requireApiKey,
  requireAdminKey,
  verifyEventWebhook,
  buildPublisherSubjectProfilesEnvelope,
  assets = [],
}) {
  const fastify = Fastify({ logger: true });

  for (const asset of assets) {
    if (!asset?.routePath || !asset?.filePath || !asset?.contentType) continue;
    fastify.get(asset.routePath, async (_request, reply) => {
      return reply.code(200).type(asset.contentType).send(fs.readFileSync(asset.filePath, "utf8"));
    });
  }

  fastify.get("/health", async () => {
    return {
      ok: true,
      service: serviceName,
      db: dbKind,
      requests: await repo.countRequests(),
      tools: listWorkspaceTools(toolRegistry).length,
      time: nowIso(),
    };
  });

  fastify.get("/", async () => ({
    ok: true,
    service: serviceName,
    endpoints: [
      "GET /health",
      "GET /xapps/workspace/tools",
      "POST /xapps/requests",
      "POST /xapps/previews/:previewKey",
      "POST /xapps/subject-profiles/publisher-candidates",
      "POST /guard/subject-profiles/publisher-candidates",
      "POST /webhooks/events",
      "GET /xapps/manual/requests",
      "POST /xapps/manual/requests/:requestId/respond",
    ],
  }));

  fastify.get("/xapps/workspace/tools", async (request, reply) => {
    if (!requireAdminKey(request, reply)) return;
    return reply.send({ ok: true, items: listWorkspaceTools(toolRegistry) });
  });

  fastify.post("/webhooks/events", async (request, reply) => {
    const body = request.body && typeof request.body === "object" ? request.body : {};
    if (typeof verifyEventWebhook === "function") {
      const verification = await verifyEventWebhook({
        request,
        body,
      });
      if (!verification?.ok) {
        return reply.code(Number(verification?.statusCode || 401)).send({
          ok: false,
          error: {
            code: String(verification?.code || "EVENT_WEBHOOK_SIGNATURE_INVALID"),
            message: String(verification?.message || "Invalid event webhook signature"),
          },
        });
      }
    }
    const eventId = String(body.eventId || body.id || "").trim() || null;
    const eventType = String(body.eventType || body.type || "").trim() || null;
    await repo.insertWebhook({
      id: randomUUID(),
      event_id: eventId,
      event_type: eventType,
      payload: body,
      received_at: nowIso(),
    });
    return reply.send({ ok: true });
  });

  fastify.post("/xapps/requests", async (request, reply) => {
    if (!requireApiKey(request, reply)) return;

    const body = request.body && typeof request.body === "object" ? request.body : {};
    const requestId = String(body.requestId || body.request_id || "").trim();
    const toolName = String(body.toolName || body.tool_name || "").trim();
    const payload = body.payload && typeof body.payload === "object" ? body.payload : {};
    const callbackToken = String(body.callbackToken || body.callback_token || "").trim() || null;
    const asyncFlag = Boolean(body.async);
    const subjectId = String(body.subjectId || body.subject_id || "").trim() || null;
    const xappId = String(body.xappId || body.xapp_id || "").trim() || null;
    const clientId = String(body.clientId || body.client_id || "").trim() || null;
    const installationId = String(body.installationId || body.installation_id || "").trim() || null;

    if (!requestId || !toolName) {
      return reply.code(400).send({
        status: "error",
        result: { message: "requestId and toolName are required" },
      });
    }

    const tool =
      toolRegistry[
        String(toolName || "")
          .trim()
          .toLowerCase()
      ];
    if (!tool) {
      return reply.code(400).send({
        status: "error",
        result: { message: `Unsupported tool: ${toolName}` },
      });
    }

    const validation = tool.validate(payload);
    if (!validation.ok) {
      return reply.code(400).send({
        status: "error",
        result: { message: validation.message || "Invalid payload" },
      });
    }

    const createdAt = nowIso();

    if (tool.mode === XPLACE_REQUEST_MODES.MANUAL) {
      let manualPreflight = null;
      if (typeof tool.handle === "function") {
        manualPreflight = await tool.handle({
          payload,
          requestId,
          toolName,
          callbackToken,
          async: asyncFlag,
          subjectId,
          xappId,
          clientId,
          installationId,
          request,
          requestLog: request.log,
        });
        if (String(manualPreflight?.status || "") !== "success") {
          return reply.send(
            manualPreflight || {
              status: "error",
              result: { message: "Manual request preflight failed" },
            },
          );
        }
      }

      await insertOrUpdateRequestRecord(repo, {
        request_id: requestId,
        tool_name: toolName,
        mode: XPLACE_REQUEST_MODES.MANUAL,
        status: callbackToken
          ? XPLACE_REQUEST_STATUSES.PENDING_MANUAL_REVIEW
          : XPLACE_REQUEST_STATUSES.ACCEPTED_SYNC,
        payload,
        callback_token: callbackToken,
        gateway_request_id: requestId,
        subject_id: subjectId,
        result: manualPreflight?.result || {},
        created_at: createdAt,
        updated_at: createdAt,
      });

      if (callbackToken && asyncFlag) {
        await sendGatewayProgress({
          gatewayBaseUrl,
          repo,
          requestId,
          callbackToken,
          eventBody: {
            type: "PUBLISHER_PROGRESS",
            message: `Stored in ${serviceName} for manual review`,
            data: {
              status: XPLACE_REQUEST_STATUSES.PENDING_MANUAL_REVIEW,
              queue: XPLACE_REQUEST_MODES.MANUAL,
              workspace: serviceName,
            },
          },
          requestLog: request.log,
        });
        return reply.send({ status: "accepted", message: "Stored for manual review" });
      }

      return reply.send({
        status: "success",
        result: manualPreflight?.result || {
          status: "accepted",
          requestRef: `XPLC-${Date.now()}`,
          summary: `Request accepted by ${serviceName} (sync mode)`,
        },
      });
    }

    const autoResult = await tool.handle({
      payload,
      requestId,
      toolName,
      callbackToken,
      async: asyncFlag,
      subjectId,
      xappId,
      clientId,
      installationId,
      request,
      requestLog: request.log,
    });

    await insertOrUpdateRequestRecord(repo, {
      request_id: requestId,
      tool_name: toolName,
      mode: XPLACE_REQUEST_MODES.AUTO,
      status:
        String(autoResult?.status || "") === "success"
          ? XPLACE_REQUEST_STATUSES.COMPLETED_SUCCESS
          : XPLACE_REQUEST_STATUSES.COMPLETED_ERROR,
      payload,
      result: autoResult.result || {},
      callback_token: callbackToken,
      gateway_request_id: requestId,
      subject_id: subjectId,
      created_at: createdAt,
      updated_at: nowIso(),
      completed_at: nowIso(),
    });

    if (callbackToken && asyncFlag) {
      const gatewayComplete = await sendGatewayComplete({
        gatewayBaseUrl,
        repo,
        requestId,
        callbackToken,
        body: autoResult,
      });
      if (!gatewayComplete.ok) {
        request.log.warn(
          { requestId, status: gatewayComplete.status, body: gatewayComplete.body },
          `${serviceName} auto handler gateway complete failed`,
        );
        return reply.code(502).send({
          status: "error",
          result: { message: "gateway complete failed", gateway_status: gatewayComplete.status },
        });
      }
      return reply.send({ status: "accepted", message: "Auto-completed via callback" });
    }

    if (String(autoResult?.status || "") !== "success") {
      return reply.code(502).send(autoResult);
    }
    return reply.send(autoResult);
  });

  fastify.post("/xapps/previews/:previewKey", async (request, reply) => {
    if (!requireApiKey(request, reply)) return;
    const previewKey = String(request.params?.previewKey || "")
      .trim()
      .toLowerCase();
    const handler = previewRegistry[previewKey];
    if (!handler) {
      return reply.code(404).send({ message: "Unknown preview endpoint" });
    }
    const body = request.body && typeof request.body === "object" ? request.body : {};
    const payload = body.payload && typeof body.payload === "object" ? body.payload : {};
    const result = await handler.handle({
      payload,
      request,
      requestLog: request.log,
    });
    return reply.code(Number(result.status || 200)).send(result.body || { ok: true });
  });

  fastify.post("/xapps/subject-profiles/publisher-candidates", async (request, reply) => {
    if (!requireApiKey(request, reply)) return;
    const body = request.body && typeof request.body === "object" ? request.body : {};
    const payload = body.payload && typeof body.payload === "object" ? body.payload : body;
    return reply.send(await buildPublisherSubjectProfilesEnvelope(payload, request.log));
  });

  fastify.post("/guard/subject-profiles/publisher-candidates", async (request, reply) => {
    const body = request.body && typeof request.body === "object" ? request.body : {};
    const payload = body.payload && typeof body.payload === "object" ? body.payload : body;
    return reply.send(await buildPublisherSubjectProfilesEnvelope(payload, request.log));
  });

  fastify.get("/xapps/manual/requests", async (request, reply) => {
    if (!requireAdminKey(request, reply)) return;
    const rawStatus = Object.prototype.hasOwnProperty.call(request.query || {}, "status")
      ? request.query?.status
      : XPLACE_REQUEST_STATUSES.PENDING_MANUAL_REVIEW;
    const status = String(rawStatus ?? XPLACE_REQUEST_STATUSES.PENDING_MANUAL_REVIEW).trim();
    const rows = await repo.listRequests({ status, limit: 100 });
    return reply.send({
      ok: true,
      items: rows.map((row) => ({
        request_id: row.request_id,
        tool_name: row.tool_name,
        mode: row.mode || null,
        status: row.status,
        payload: row.payload,
        result: row.result,
        subject_id: row.subject_id || null,
        created_at: row.created_at,
        updated_at: row.updated_at,
        completed_at: row.completed_at || null,
      })),
    });
  });

  fastify.post("/xapps/manual/requests/:requestId/respond", async (request, reply) => {
    if (!requireAdminKey(request, reply)) return;
    const requestId = String(request.params?.requestId || "").trim();
    const body = request.body && typeof request.body === "object" ? request.body : {};
    const status = String(body.status || "success")
      .trim()
      .toLowerCase();
    const result = body.result && typeof body.result === "object" ? body.result : {};

    const row = await repo.getRequestByRequestId(requestId);
    if (!row) {
      return reply.code(404).send({ ok: false, error: { message: "request not found" } });
    }
    if (!row.callback_token) {
      return reply
        .code(400)
        .send({ ok: false, error: { message: "request has no callback token" } });
    }
    if (String(row.mode || XPLACE_REQUEST_MODES.MANUAL) !== XPLACE_REQUEST_MODES.MANUAL) {
      return reply
        .code(400)
        .send({ ok: false, error: { message: "request is not a manual-review item" } });
    }

    let gatewayStatus = 0;
    let gatewayBody = null;
    try {
      const completePayload =
        status === "error"
          ? {
              status: "error",
              result: { message: String(result.message || "Manual review rejected") },
            }
          : {
              status: "success",
              result: {
                status: String(result.status || "accepted"),
                certificateId: String(result.certificateId || `CERT-${Date.now()}`),
                requestRef: String(result.requestRef || `XPLC-${Date.now()}`),
                summary: String(result.summary || `Approved by ${serviceName} manual review`),
              },
            };
      const gatewayComplete = await sendGatewayComplete({
        gatewayBaseUrl,
        repo,
        requestId,
        callbackToken: String(row.callback_token),
        body: completePayload,
      });
      gatewayStatus = gatewayComplete.status;
      gatewayBody = gatewayComplete.body;
      if (!gatewayComplete.ok) {
        request.log.error({ gatewayStatus, gatewayBody }, "gateway complete failed");
        return reply.code(502).send({
          ok: false,
          error: { message: "gateway_complete_failed" },
        });
      }
    } catch (err) {
      request.log.error({ err: err?.message || String(err) }, "gateway complete exception");
      return reply.code(502).send({ ok: false, error: { message: "gateway_complete_failed" } });
    }

    const completedAt = nowIso();
    const nextStatus =
      status === "error"
        ? XPLACE_REQUEST_STATUSES.COMPLETED_ERROR
        : XPLACE_REQUEST_STATUSES.COMPLETED_SUCCESS;
    await repo.updateManualResponse({
      requestId,
      nextStatus,
      resultRecordJson: {
        status,
        result,
        gateway_status: gatewayStatus,
        gateway_body: gatewayBody,
      },
      completedAt,
    });

    return reply.send({
      ok: true,
      status: nextStatus,
      gateway_status: gatewayStatus,
      gateway_body: gatewayBody,
    });
  });

  return fastify;
}
