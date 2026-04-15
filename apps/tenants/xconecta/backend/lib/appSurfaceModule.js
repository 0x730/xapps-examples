import fs from "node:fs";
import healthRoutes from "@xapps-platform/backend-kit/backend/routes/health";
import { applyNoStoreHeaders } from "@xapps-platform/backend-kit/backend/routes/gateway/shared";

export function createAppSurfaceModule({
  assets = {},
  branding = {},
  reference = {},
  hostProxyService = null,
  tools = [],
} = {}) {
  const seedLogo =
    assets && typeof assets.seedLogo === "object" && assets.seedLogo ? assets.seedLogo : {};

  return {
    async registerRoutes(fastify) {
      await fastify.register(healthRoutes, { branding, reference, tools });

      if (seedLogo.filePath && seedLogo.routePath) {
        fastify.get(seedLogo.routePath, async (_request, reply) => {
          return applyNoStoreHeaders(reply, hostProxyService)
            .code(200)
            .type(seedLogo.contentType || "image/svg+xml")
            .send(fs.readFileSync(seedLogo.filePath, "utf8"));
        });
      }
    },
  };
}
