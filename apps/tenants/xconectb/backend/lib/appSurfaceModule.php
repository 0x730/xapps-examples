<?php

declare(strict_types=1);

function xconectb_register_app_surface_module_routes(array &$routes, array $app, array $options = []): void
{
    xapps_backend_kit_register_health_routes(
        $routes,
        xapps_backend_kit_read_record($options['branding'] ?? null),
        xapps_backend_kit_read_record($options['reference'] ?? null),
        ['tools' => xapps_backend_kit_read_record($options)['tools'] ?? []],
    );

    $assets = xapps_backend_kit_read_record($options['assets'] ?? null);
    $seedLogo = xapps_backend_kit_read_record($assets['seedLogo'] ?? null);
    $filePath = xapps_backend_kit_read_string($seedLogo['filePath'] ?? null);
    $routePath = xapps_backend_kit_read_string($seedLogo['routePath'] ?? null);
    if ($filePath === '' || $routePath === '') {
        return;
    }

    $contentType = xapps_backend_kit_read_string($seedLogo['contentType'] ?? null, 'image/svg+xml');
    $routes[] = [
        'method' => 'GET',
        'path' => $routePath,
        'handler' => static function () use ($app, $filePath, $contentType): void {
            xapps_backend_kit_send_file(
                $filePath,
                $contentType,
                200,
                $app['hostProxyService']->getNoStoreHeaders(),
            );
        },
    ];
}
