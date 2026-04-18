<?php

declare(strict_types=1);

function xconectb_env_or_default(string $name, string $default = ''): string
{
    $value = getenv($name);
    if ($value === false) {
        return $default;
    }
    $trimmed = trim((string) $value);
    return $trimmed !== '' ? $trimmed : $default;
}

function xconectb_load_env_file(string $filePath): void
{
    if (!is_file($filePath)) {
        return;
    }
    $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if (!is_array($lines)) {
        return;
    }
    foreach ($lines as $line) {
        $trimmed = trim((string) $line);
        if ($trimmed === '' || str_starts_with($trimmed, '#')) {
            continue;
        }
        $idx = strpos($trimmed, '=');
        if ($idx === false || $idx <= 0) {
            continue;
        }
        $key = trim(substr($trimmed, 0, $idx));
        $value = trim(substr($trimmed, $idx + 1));
        $value = trim($value, "\"'");
        if ($key !== '' && getenv($key) === false) {
            putenv($key . '=' . $value);
            $_ENV[$key] = $value;
            $_SERVER[$key] = $value;
        }
    }
}

function xconectb_load_config(): array
{
    $backendDir = dirname(__DIR__);
    $repoRoot = dirname($backendDir, 4);
    $explicitEnv = xconectb_env_or_default('XCONECTB_ENV_FILE', xconectb_env_or_default('ENV_FILE', ''));
    if ($explicitEnv !== '') {
        xconectb_load_env_file($explicitEnv);
    }
    $envDev = $backendDir . '/.env.dev';
    $envDefault = $backendDir . '/.env';
    xconectb_load_env_file(is_file($envDev) ? $envDev : $envDefault);

    $xconectbHostDir = dirname($backendDir, 1) . '/host';
    $xconectHostDir = dirname($backendDir, 2) . '/xconect/host';
    $referenceHostCommonDir = $repoRoot . '/apps/tenants/reference-host-common/host';
    $browserHostDirCandidates = [
        $repoRoot . '/packages/browser-host/dist',
        $repoRoot . '/node_modules/@xapps-platform/browser-host/dist',
    ];
    $browserHostDir = xconectb_first_existing_path($browserHostDirCandidates, $repoRoot . '/packages/browser-host/dist');

    return [
        'backendDir' => $backendDir,
        'port' => (int) xconectb_env_or_default('XCONECTB_PORT', '3313'),
        'gatewayUrl' => rtrim(
            xconectb_env_or_default(
                'XAPPS_GATEWAY_URL',
                xconectb_env_or_default('GATEWAY_BASE_URL', 'http://localhost:3000'),
            ),
            '/',
        ),
        'gatewayApiKey' => xconectb_env_or_default(
            'XCONECTB_GATEWAY_API_KEY',
            xconectb_env_or_default('XAPPS_API_KEY', ''),
        ),
        'guardIngestApiKey' => xconectb_env_or_default(
            'XCONECTB_GUARD_INGEST_API_KEY',
            'xconectb-tenant-guard-dev-key',
        ),
        'tenantPaymentUrl' => rtrim(
            xconectb_env_or_default('XCONECTB_TENANT_PAYMENT_URL', 'http://localhost:3313/tenant-payment.html'),
            '/',
        ),
        'tenantPaymentReturnUrlAllowlist' => xconectb_env_or_default(
            'XCONECTB_TENANT_PAYMENT_RETURN_URL_ALLOWLIST',
            'http://localhost:3313,http://127.0.0.1:3313',
        ),
        'allowedOrigins' => xconectb_env_or_default('XCONECTB_ALLOWED_ORIGINS', ''),
        'hostBootstrapApiKeys' => xconectb_env_or_default(
            'XCONECTB_HOST_BOOTSTRAP_API_KEYS',
            xconectb_env_or_default(
                'XCONECTB_TENANT_API_KEY',
                xconectb_env_or_default(
                    'XCONECTB_GATEWAY_API_KEY',
                    xconectb_env_or_default('XAPPS_API_KEY', ''),
                ),
            ),
        ),
        'hostBootstrapSigningSecret' => xconectb_env_or_default('XCONECTB_HOST_BOOTSTRAP_SIGNING_SECRET', ''),
        'tenantPaymentReturnSecret' => xconectb_env_or_default('XCONECTB_TENANT_PAYMENT_RETURN_SECRET', ''),
        'tenantPaymentReturnSecretRef' => xconectb_env_or_default(
            'XCONECTB_TENANT_PAYMENT_RETURN_SECRET_REF',
            '',
        ),
        'tenantSubjectProfileCandidatesJson' => xconectb_env_or_default(
            'XCONECTB_SUBJECT_PROFILE_CANDIDATES_JSON',
            '',
        ),
        'hostPages' => [
            'entry' => $xconectbHostDir . '/index.html',
            'marketplace' => $xconectbHostDir . '/marketplace.html',
            'singleXapp' => $xconectbHostDir . '/single-xapp.html',
            'tenantPayment' => $xconectbHostDir . '/tenant-payment.html',
        ],
        'storage' => [
            'paymentSessionsFile' => $backendDir . '/storage/payment-sessions.json',
        ],
        'embedSdkCandidateFiles' => [
            $repoRoot . '/dist/sdk/xapps-embed-sdk.esm.js',
            $repoRoot . '/node_modules/@xapps-platform/embed-sdk/dist/xapps-embed-sdk.esm.js',
            $repoRoot . '/node_modules/@xapps-platform/embed-sdk/dist/xapps-embed-sdk.esm.js',
        ],
        'hostAssets' => [
            'host-shell-core.js' => ['type' => 'js', 'filePath' => $referenceHostCommonDir . '/host-shell-core.js'],
            'launcher-core.js' => ['type' => 'js', 'filePath' => $browserHostDir . '/launcher-core.js'],
            'embed-surface.js' => ['type' => 'js', 'filePath' => $browserHostDir . '/embed-surface.js'],
            'page-utils.js' => ['type' => 'js', 'filePath' => $referenceHostCommonDir . '/page-utils.js'],
            'standard-runtime.js' => ['type' => 'js', 'filePath' => $browserHostDir . '/standard-runtime.js'],
            'marketplace-runtime.js' => ['type' => 'js', 'filePath' => $browserHostDir . '/marketplace-runtime.js'],
            'backend-base.js' => ['type' => 'js', 'filePath' => $browserHostDir . '/backend-base.js'],
            'reference-runtime.js' => ['type' => 'js', 'filePath' => $xconectbHostDir . '/xconectb-host-runtime.js'],
            'reference-launcher-page.js' => ['type' => 'js', 'filePath' => $referenceHostCommonDir . '/reference-launcher-page.js'],
            'reference-marketplace-page.js' => ['type' => 'js', 'filePath' => $referenceHostCommonDir . '/reference-marketplace-page.js'],
            'reference-single-xapp-page.js' => ['type' => 'js', 'filePath' => $referenceHostCommonDir . '/reference-single-xapp-page.js'],
            'reference-shell.js' => ['type' => 'js', 'filePath' => $xconectbHostDir . '/xconectb-host-shell.js'],
            'reference-config.js' => ['type' => 'js', 'filePath' => $xconectbHostDir . '/xconectb-reference-config.js'],
            'xconectb-host-base.css' => ['type' => 'css', 'filePath' => $xconectHostDir . '/xconect-host-base.css'],
            'xconectb-host-entry.css' => ['type' => 'css', 'filePath' => $xconectHostDir . '/xconect-host-entry.css'],
            'xconectb-host-marketplace.css' => ['type' => 'css', 'filePath' => $xconectHostDir . '/xconect-host-marketplace.css'],
            'xconectb-marketplace-host.js' => ['type' => 'js', 'filePath' => $referenceHostCommonDir . '/reference-marketplace-page.js'],
            'xconectb-single-xapp-host.js' => ['type' => 'js', 'filePath' => $referenceHostCommonDir . '/reference-single-xapp-page.js'],
            'xconectb-host-shell.js' => ['type' => 'js', 'filePath' => $xconectbHostDir . '/xconectb-host-shell.js'],
            'xconectb-host-runtime.js' => ['type' => 'js', 'filePath' => $xconectbHostDir . '/xconectb-host-runtime.js'],
        ],
    ];
}

function xconectb_first_existing_path(array $candidates, string $fallback): string
{
    foreach ($candidates as $candidate) {
        if (is_string($candidate) && $candidate !== '' && file_exists($candidate)) {
            return $candidate;
        }
    }

    return $fallback;
}
