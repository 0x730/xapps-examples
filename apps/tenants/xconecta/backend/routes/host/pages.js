import { hostAssets, hostPages, sendCssFile, sendHtmlFile, sendJsFile } from "./shared.js";

export default async function hostPagesRoutes(fastify, { hostProxyService = null } = {}) {
  fastify.get("/", async (_request, reply) =>
    sendHtmlFile(reply, hostPages.entry, hostProxyService),
  );

  fastify.get("/marketplace.html", async (_request, reply) =>
    sendHtmlFile(reply, hostPages.marketplace, hostProxyService),
  );

  fastify.get("/single-xapp.html", async (_request, reply) =>
    sendHtmlFile(reply, hostPages.singleXapp, hostProxyService),
  );

  fastify.get("/host/:assetName", async (request, reply) => {
    const assetName = String(request.params?.assetName || "").trim();
    const asset = hostAssets[assetName];
    if (!asset) return reply.code(404).send({ message: "host asset not found" });
    return asset.type === "css"
      ? sendCssFile(reply, asset.filePath, hostProxyService)
      : sendJsFile(reply, asset.filePath, hostProxyService);
  });
}
