<?php

declare(strict_types=1);

$rawAllowedOrigins = trim((string) env(
    'XCONECTC_ALLOWED_ORIGINS',
    implode(',', array_filter([
        env('APP_URL'),
        env('XCONECTC_HOST_PUBLIC_BASE_URL'),
    ])),
));

$allowedOrigins = array_values(array_filter(array_map(
    static fn (string $origin): string => trim($origin),
    preg_split('/[,\n]/', $rawAllowedOrigins) ?: [],
)));

return [
    // Keep this aligned with the browser-facing host/API routes mounted in routes/web.php.
    // If a new public prefix is added there, it must be added here too for credentialed CORS.
    'paths' => ['api/*', 'guard/*', 'xapps/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => $allowedOrigins,
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
