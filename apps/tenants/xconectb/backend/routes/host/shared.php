<?php

declare(strict_types=1);

function xconectb_host_asset(array $app, string $assetName): ?array
{
    $assets = $app['config']['hostAssets'] ?? [];
    return is_array($assets) && isset($assets[$assetName]) && is_array($assets[$assetName])
        ? $assets[$assetName]
        : null;
}
