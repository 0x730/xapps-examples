import hostGatewayApiRoutes from "@xapps-platform/backend-kit/backend/routes/gateway/hostApi";
import hostPagesRoutes from "./host/pages.js";

export default async function hostRoutes(fastify, options = {}) {
  // Browser-facing host pages/assets.
  await fastify.register(hostPagesRoutes, options);

  // Gateway-backed host API contract.
  await fastify.register(hostGatewayApiRoutes, options);
}
