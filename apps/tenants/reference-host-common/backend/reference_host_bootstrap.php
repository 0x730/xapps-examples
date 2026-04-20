<?php

declare(strict_types=1);

function xapps_reference_register_host_bootstrap_routes(
    array &$routes,
    array $app,
    array $allowedOrigins,
    array $bootstrap
): void {
    $routes[] = [
        'method' => 'OPTIONS',
        'path' => '/api/reference-host-bootstrap',
        'handler' => static function (array $request) use ($allowedOrigins): void {
            xapps_backend_kit_send_host_api_preflight($request, $allowedOrigins);
        },
    ];

    $routes[] = [
        'method' => 'POST',
        'path' => '/api/reference-host-bootstrap',
        'handler' => static function (array $request) use ($app, $allowedOrigins, $bootstrap): void {
            if (!xapps_backend_kit_enforce_host_api_origin($request, $allowedOrigins)) {
                return;
            }
            try {
                $body = xapps_backend_kit_read_record($request['body'] ?? []);
                $requestedSubjectId = xapps_backend_kit_read_string($body['subjectId'] ?? null);
                $type = xapps_backend_kit_read_string($body['type'] ?? null);
                $identifier = is_array($body['identifier'] ?? null) ? $body['identifier'] : null;
                $email = xapps_backend_kit_read_string($body['email'] ?? null);
                $name = xapps_backend_kit_read_string($body['name'] ?? null);
                $metadata = is_array($body['metadata'] ?? null) ? $body['metadata'] : null;
                $origin = xapps_backend_kit_require_requested_host_bootstrap_origin(
                    $body['origin'] ?? xapps_backend_kit_request_origin($request) ?: xapps_backend_kit_request_base_url($request),
                    $allowedOrigins,
                );
                if ($requestedSubjectId === '' && $email === '' && $identifier === null) {
                    xapps_backend_kit_send_json(['message' => 'subjectId, identifier, or email is required'], 400);
                    return;
                }
                if ($requestedSubjectId !== '' && $email === '' && $identifier === null) {
                    xapps_backend_kit_send_json(
                        ['message' => 'subjectId requires identifier or email for validation'],
                        400,
                    );
                    return;
                }
                $resolvedSubjectId = $requestedSubjectId;
                if ($resolvedSubjectId === '' || $email !== '' || $identifier !== null) {
                    $resolved = $app['hostProxyService']->resolveSubject([
                        'subjectId' => $requestedSubjectId !== '' ? $requestedSubjectId : null,
                        'type' => $type !== '' ? $type : null,
                        'identifier' => $identifier,
                        'email' => $email !== '' ? $email : null,
                        'name' => $name !== '' ? $name : null,
                        'metadata' => $metadata,
                    ]);
                    $resolvedSubjectId = xapps_backend_kit_read_string($resolved['subjectId'] ?? null);
                    if ($resolvedSubjectId === '') {
                        throw new RuntimeException('resolve-subject response missing subjectId');
                    }
                    if ($requestedSubjectId !== '' && $requestedSubjectId !== $resolvedSubjectId) {
                        xapps_backend_kit_send_json([
                            'message' => 'subjectId does not match the resolved subject for the provided identity',
                        ], 400);
                        return;
                    }
                }
                xapps_backend_kit_send_json(
                    xapps_backend_kit_build_host_bootstrap_result([
                        'subjectId' => $resolvedSubjectId,
                        'email' => $email !== '' ? $email : null,
                        'name' => $name !== '' ? $name : null,
                        'origin' => $origin,
                        'signingSecret' => $bootstrap['signingSecret'] ?? null,
                        'signingKeyId' => $bootstrap['signingKeyId'] ?? null,
                        'ttlSeconds' => $bootstrap['ttlSeconds'] ?? 300,
                    ]),
                    200,
                    xapps_backend_kit_host_api_cors_headers($request, $allowedOrigins),
                );
            } catch (\Throwable $error) {
                xapps_backend_kit_send_service_error($error, 'reference host bootstrap failed');
            }
        },
    ];
}
