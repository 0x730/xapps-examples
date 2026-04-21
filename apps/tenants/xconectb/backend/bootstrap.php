<?php

declare(strict_types=1);

$vendorAutoload = __DIR__ . '/vendor/autoload.php';
$repoRoot = dirname(__DIR__, 4);
$localXappsPhp = $repoRoot . '/packages/xapps-php/src/index.php';
$localBackendKit = $repoRoot . '/packages/xapps-backend-kit-php/src/functions.php';

if (is_file($localXappsPhp) && is_file($localBackendKit)) {
    require_once $localXappsPhp;
    require_once $localBackendKit;
} elseif (is_file($vendorAutoload)) {
    require_once $vendorAutoload;
} elseif (!class_exists(\Xapps\BackendKit\BackendKit::class)) {
    require_once $localXappsPhp;
    require_once $localBackendKit;
}

require_once __DIR__ . '/lib/config.php';
require_once __DIR__ . '/lib/appSurfaceModule.php';
require_once __DIR__ . '/lib/subjectProfiles/defaultProfiles.php';

require_once __DIR__ . '/routes/host/shared.php';
require_once __DIR__ . '/routes/host/pages.php';

use Xapps\BackendKit\BackendKit;
use Xapps\FilePaymentSessionStore;

function xconectb_bootstrap_backend_kit(array $config, array $options = []): array
{
    return BackendKit::bootstrap($config, $options, [
        'normalizeOptions' => static function (array $input): array {
            return BackendKit::normalizeOptions($input, [
                'normalizeEnabledModes' => 'xapps_backend_kit_normalize_enabled_backend_modes',
            ]);
        },
        'applyGatewayOverrides' => static fn (array $resolvedConfig, array $gateway): array => BackendKit::applyGatewayOverrides($resolvedConfig, $gateway),
        'applyPaymentOverrides' => static fn (array $resolvedConfig, array $payments): array => BackendKit::applyPaymentOverrides($resolvedConfig, $payments),
        'createApp' => static function (array $resolvedConfig, array $normalizedOptions): array {
            return BackendKit::createPlainPhpApp($resolvedConfig, $normalizedOptions, [
                'createHostProxyService' => static fn (array $config, array $options = []): object => BackendKit::createHostProxyService($config, $options),
            ]);
        },
        'attachOptions' => static function (array $app, array $normalizedOptions): array {
            $app = BackendKit::attachBackendOptions($app, $normalizedOptions);
            return BackendKit::attachPaymentRuntime($app, $normalizedOptions, [
                'createPaymentHandler' => static function (array $config, ?object $gatewayClient = null): object {
                    $paymentSessionsFile = (string) (($config['storage']['paymentSessionsFile'] ?? ''));
                    return BackendKit::createPaymentHandler($config, $gatewayClient, [
                        'store' => $paymentSessionsFile !== '' ? new FilePaymentSessionStore($paymentSessionsFile) : null,
                    ]);
                },
            ]);
        },
        'registerModules' => [
            static function (array $app): array {
                BackendKit::registerBackendKitRoutes($app['routes'], $app, [
                    'registerReferenceRoutes' => 'xapps_backend_kit_register_reference_routes',
                    'registerHostPageRoutes' => 'xconectb_register_host_page_routes',
                    'registerHostApiRoutes' => 'xapps_backend_kit_register_host_api_routes',
                    'registerPaymentRoutes' => 'xapps_backend_kit_register_payment_routes',
                    'registerGuardRoutes' => 'xapps_backend_kit_register_guard_routes',
                    'registerSubjectProfileRoutes' => 'xapps_backend_kit_register_subject_profile_routes',
                ]);
                return $app;
            },
        ],
    ]);
}

function xconectb_backend_kit_options(array $config): array
{
    $hostBootstrapReplayConsumer = BackendKit::createFileHostBootstrapReplayConsumer([
        'replayFile' => (string) (($config['storage']['hostBootstrapReplayFile'] ?? '')),
    ]);
    $hostSessionStore = BackendKit::createFileHostSessionStore([
        'stateFile' => (string) (($config['storage']['hostSessionStateFile'] ?? '')),
        'revocationsFile' => (string) (($config['storage']['hostSessionRevocationsFile'] ?? '')),
    ]);

    return [
        'gateway' => [
            'baseUrl' => (string) ($config['gatewayUrl'] ?? ''),
            'apiKey' => (string) ($config['gatewayApiKey'] ?? ''),
        ],
        'branding' => [
            'tenantName' => 'XconectB',
            'serviceName' => 'xconectb-tenant-backend',
            'stackLabel' => 'plain-php-8.5',
        ],
        'assets' => [
            'seedLogo' => [
                'filePath' => (string) ($config['tenantSeedLogoFile'] ?? ''),
                'routePath' => '/assets/xconectb-seed-logo.svg',
                'contentType' => 'image/svg+xml',
            ],
            'paymentPage' => [
                'filePath' => (string) (($config['hostPages']['tenantPayment'] ?? '')),
            ],
        ],
        'host' => [
            'enableReference' => true,
            'enableLifecycle' => true,
            'enableBridge' => true,
            'allowedOrigins' => (string) ($config['allowedOrigins'] ?? ''),
            'bootstrap' => [
                'apiKeys' => (string) ($config['hostBootstrapApiKeys'] ?? ''),
                'signingSecret' => (string) ($config['hostBootstrapSigningSecret'] ?? ''),
                'signingKeyId' => (string) ($config['hostBootstrapSigningKeyId'] ?? ''),
                'verifierKeys' => is_array($config['hostBootstrapVerifierKeys'] ?? null)
                    ? $config['hostBootstrapVerifierKeys']
                    : [],
                'ttlSeconds' => 300,
                'consumeJti' => $hostBootstrapReplayConsumer,
            ],
            'session' => [
                'signingSecret' => (string) ($config['hostSessionSigningSecret'] ?? ''),
                'signingKeyId' => (string) ($config['hostSessionSigningKeyId'] ?? ''),
                'verifierKeys' => is_array($config['hostSessionVerifierKeys'] ?? null)
                    ? $config['hostSessionVerifierKeys']
                    : [],
                'cookieName' => 'xapps_host_session',
                'absoluteTtlSeconds' => 1800,
                'idleTtlSeconds' => 900,
                'cookiePath' => '/api',
                'cookieSameSite' => 'auto',
                'cookieSecure' => 'auto',
                'store' => $hostSessionStore,
            ],
        ],
        'payments' => [
            'enabledModes' => ['gateway_managed', 'tenant_delegated', 'publisher_delegated', 'owner_managed'],
            'paymentUrl' => (string) ($config['tenantPaymentUrl'] ?? ''),
            'returnSecret' => (string) ($config['tenantPaymentReturnSecret'] ?? ''),
            'returnSecretRef' => (string) ($config['tenantPaymentReturnSecretRef'] ?? ''),
            'returnUrlAllowlist' => (string) ($config['tenantPaymentReturnUrlAllowlist'] ?? ''),
        ],
        'reference' => [
            'tenant' => 'xconectb',
            'workspace' => 'xconectb',
            'stack' => 'plain-php-8.5',
            'mode' => 'reference-marketplace-tenant-php',
            'tenantPolicySlugs' => [
                'xconect-tenant-payment-policy',
                'xconect-tenant-payment-policy-stripe-gateway',
                'xconect-tenant-payment-policy-stripe-delegated',
                'xconect-tenant-subject-profile-policy',
            ],
            'proofSources' => ['/api/reference', '/api/host-config', '/api/installations?subjectId=...'],
            'sdkPaths' => [
                'node' => '@xapps-platform/server-sdk',
                'php' => 'xapps-platform/xapps-php',
                'browser' => 'xapps-embed-sdk',
            ],
            'embedSdkCandidateFiles' => $config['embedSdkCandidateFiles'] ?? [],
            'hostSurfaces' => [
                ['key' => 'single-panel', 'label' => 'Single panel', 'recommended_for_first_lane' => true],
                ['key' => 'split-panel', 'label' => 'Split panel', 'recommended_for_first_lane' => false],
                ['key' => 'single-xapp', 'label' => 'Single xapp', 'recommended_for_first_lane' => false],
            ],
            'referenceAssets' => [
                'endpoints' => [
                    ['method' => 'GET', 'path' => '/', 'purpose' => 'Entry page for the xconectb marketplace host reference.'],
                    ['method' => 'GET', 'path' => '/marketplace.html', 'purpose' => 'Marketplace host shell with single-panel and split-panel embed modes.'],
                    ['method' => 'GET', 'path' => '/single-xapp.html', 'purpose' => 'Focused single-xapp host surface using the same shared host/runtime contract.'],
                    ['method' => 'GET', 'path' => '/embed/sdk/xapps-embed-sdk.esm.js', 'purpose' => 'Serves the embed SDK bundle used by the local reference host surfaces.'],
                    ['method' => 'GET', 'path' => '/host/xconectb-marketplace-host.js', 'purpose' => 'Browser bootstrap for the marketplace host reference.'],
                    ['method' => 'GET', 'path' => '/host/xconectb-single-xapp-host.js', 'purpose' => 'Browser bootstrap for the single-xapp host reference.'],
                    ['method' => 'GET', 'path' => '/host/xconectb-host-shell.js', 'purpose' => 'Tenant-specific host-shell wrapper over the shared tenant host implementation.'],
                    ['method' => 'GET', 'path' => '/host/xconectb-host-runtime.js', 'purpose' => 'xconectb runtime/theme configuration over the shared browser SDK contract.'],
                ],
            ],
        ],
        'subjectProfiles' => [
            'workspace' => 'xconectb',
            'source' => 'tenant_subject_profile',
            'defaultProfiles' => xconectb_default_subject_profiles_catalog(),
        ],
    ];
}

function xconectb_bootstrap(): array
{
    $config = xconectb_load_config();
    $options = xconectb_backend_kit_options($config);
    $app = xconectb_bootstrap_backend_kit($config, $options);
    xconectb_register_app_surface_module_routes($app['routes'], $app, [
        'branding' => $app['brandingOptions'] ?? [],
        'reference' => $app['referenceOptions'] ?? [],
        'assets' => $app['assetOptions'] ?? [],
        'tools' => ['evaluate_tenant_payment_policy'],
    ]);
    return $app;
}

return xconectb_bootstrap();
