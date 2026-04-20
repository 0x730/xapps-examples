<?php

declare(strict_types=1);

require_once dirname(__DIR__, 4) . '/reference-host-common/backend/reference_host_bootstrap.php';

function xconectb_register_host_page_routes(array &$routes, array $app): void
{
    $hostOptions = is_array($app['hostOptions'] ?? null) ? $app['hostOptions'] : [];
    $allowedOrigins = is_array($hostOptions['allowedOrigins'] ?? null) ? $hostOptions['allowedOrigins'] : [];
    $bootstrap = is_array($hostOptions['bootstrap'] ?? null) ? $hostOptions['bootstrap'] : [];

    xapps_backend_kit_register_embed_sdk_route($routes, $app);

    $routes[] = [
        'method' => 'GET',
        'path' => '/',
        'handler' => static function () use ($app): void {
            xapps_backend_kit_send_file(
                (string) $app['config']['hostPages']['entry'],
                'text/html; charset=utf-8',
                200,
                $app['hostProxyService']->getNoStoreHeaders(),
            );
        },
    ];

    $routes[] = [
        'method' => 'GET',
        'path' => '/marketplace.html',
        'handler' => static function () use ($app): void {
            xapps_backend_kit_send_file(
                (string) $app['config']['hostPages']['marketplace'],
                'text/html; charset=utf-8',
                200,
                $app['hostProxyService']->getNoStoreHeaders(),
            );
        },
    ];

    $routes[] = [
        'method' => 'GET',
        'path' => '/single-xapp.html',
        'handler' => static function () use ($app): void {
            xapps_backend_kit_send_file(
                (string) $app['config']['hostPages']['singleXapp'],
                'text/html; charset=utf-8',
                200,
                $app['hostProxyService']->getNoStoreHeaders(),
            );
        },
    ];

    xapps_reference_register_host_bootstrap_routes($routes, $app, $allowedOrigins, $bootstrap);

    $routes[] = [
        'method' => 'GET',
        'pattern' => '#^/host/(?P<assetName>[^/]+)$#',
        'handler' => static function (array $request) use ($app): void {
            $assetName = (string) ($request['params']['assetName'] ?? '');
            $asset = xconectb_host_asset($app, $assetName);
            if ($asset === null) {
                xapps_backend_kit_send_json(['message' => 'host asset not found'], 404);
                return;
            }
            $contentType = ($asset['type'] ?? '') === 'css'
                ? 'text/css; charset=utf-8'
                : 'application/javascript; charset=utf-8';
            xapps_backend_kit_send_file(
                (string) $asset['filePath'],
                $contentType,
                200,
                $app['hostProxyService']->getNoStoreHeaders(),
            );
        },
    ];
}
