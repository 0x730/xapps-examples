<?php

declare(strict_types=1);

function xconectb_register_host_page_routes(array &$routes, array $app): void
{
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
