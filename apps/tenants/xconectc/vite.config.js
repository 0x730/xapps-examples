import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import tailwindcss from "@tailwindcss/vite";

const defaultAllowedHosts = ["localhost", "127.0.0.1", "xapps.0x730.com", ".0x730.com"];
const allowedHostsFromEnv = String(process.env.VITE_ALLOWED_HOSTS || "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);

export default defineConfig({
    plugins: [
        laravel({
            input: ["resources/css/app.css", "resources/js/app.js"],
            refresh: true,
        }),
        tailwindcss(),
    ],
    server: {
        allowedHosts: allowedHostsFromEnv.length ? allowedHostsFromEnv : defaultAllowedHosts,
        cors: true,
        watch: {
            ignored: ["**/storage/framework/views/**"],
        },
    },
});
