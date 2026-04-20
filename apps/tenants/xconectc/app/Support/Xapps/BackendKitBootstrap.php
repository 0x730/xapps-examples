<?php

declare(strict_types=1);

namespace App\Support\Xapps;

$vendorAutoload = dirname(__DIR__, 3) . '/vendor/autoload.php';
if (is_file($vendorAutoload)) {
    require_once $vendorAutoload;
} else {
    require_once dirname(__DIR__, 6) . '/packages/xapps-php/src/index.php';
    require_once dirname(__DIR__, 6) . '/packages/xapps-backend-kit-php/src/BackendKit.php';
    require_once dirname(__DIR__, 6) . '/packages/xapps-backend-kit-php/src/functions.php';
}

use Xapps\BackendKit\BackendKit;
use Xapps\FilePaymentSessionStore;

final class BackendKitBootstrap
{
    private static ?array $app = null;

    public static function app(): array
    {
        if (self::$app === null) {
            self::$app = self::bootstrap();
        }

        return self::$app;
    }

    private static function repoRoot(): string
    {
        return dirname(__DIR__, 6);
    }

    private static function firstExistingPath(array $candidates, string $fallback): string
    {
        foreach ($candidates as $candidate) {
            if (is_string($candidate) && $candidate !== '' && file_exists($candidate)) {
                return $candidate;
            }
        }

        return $fallback;
    }

    private static function appUrl(): string
    {
        return rtrim((string) env('APP_URL', 'http://localhost:8001'), '/');
    }

    private static function hostPublicUrl(): string
    {
        return rtrim((string) env('XCONECTC_HOST_PUBLIC_BASE_URL', 'http://localhost:8002'), '/');
    }

    private static function envString(string $key, string $fallback = ''): string
    {
        $value = trim((string) env($key, ''));
        return $value !== '' ? $value : $fallback;
    }

    private static function envJsonRecord(string $key, string $fallback = ''): array
    {
        $raw = self::envString($key, $fallback);
        if ($raw === '') {
            return [];
        }
        $parsed = json_decode($raw, true);
        return is_array($parsed) ? $parsed : [];
    }

    private static function appendOrigin(string $origins, string $origin): string
    {
        $items = array_values(array_filter(array_map(
            static fn ($value): string => trim((string) $value),
            explode(',', $origins),
        )));
        if (!in_array($origin, $items, true)) {
            $items[] = $origin;
        }
        return implode(',', $items);
    }

    private static function addLoopbackOriginVariants(string $origins): string
    {
        $items = array_values(array_filter(array_map(
            static fn ($value): string => trim((string) $value),
            explode(',', $origins),
        )));
        $extra = [];
        foreach ($items as $origin) {
            $parts = parse_url($origin);
            if (!is_array($parts)) {
                continue;
            }
            $scheme = (string) ($parts['scheme'] ?? '');
            $host = (string) ($parts['host'] ?? '');
            $port = isset($parts['port']) ? ':' . $parts['port'] : '';
            if ($scheme === '' || $host === '') {
                continue;
            }
            if ($host === '127.0.0.1') {
                $extra[] = $scheme . '://localhost' . $port;
            } elseif ($host === 'localhost') {
                $extra[] = $scheme . '://127.0.0.1' . $port;
            }
        }
        foreach ($extra as $origin) {
            if (!in_array($origin, $items, true)) {
                $items[] = $origin;
            }
        }
        return implode(',', $items);
    }

    private static function config(): array
    {
        $repoRoot = self::repoRoot();

        return [
            'gatewayUrl' => rtrim(self::envString('XAPPS_GATEWAY_URL', 'http://localhost:3000'), '/'),
            'gatewayApiKey' => self::envString('XAPPS_API_KEY', ''),
            'guardIngestApiKey' => self::envString(
                'XCONECTC_GUARD_INGEST_API_KEY',
                'xconectc-tenant-guard-dev-key',
            ),
            'tenantPaymentUrl' => rtrim(
                self::envString('XCONECTC_TENANT_PAYMENT_URL', self::appUrl() . '/tenant-payment.html'),
                '/',
            ),
            'tenantPaymentReturnSecret' => self::envString(
                'XCONECTC_TENANT_PAYMENT_RETURN_SECRET',
                'xconectc-dev-tenant-payment-return-secret',
            ),
            'tenantPaymentReturnSecretRef' => self::envString('XCONECTC_TENANT_PAYMENT_RETURN_SECRET_REF', ''),
            'tenantPaymentReturnUrlAllowlist' => self::addLoopbackOriginVariants(
                self::appendOrigin(
                    self::appendOrigin(
                        self::envString('XCONECTC_TENANT_PAYMENT_RETURN_URL_ALLOWLIST', self::appUrl()),
                        self::appUrl(),
                    ),
                    self::hostPublicUrl(),
                ),
            ),
            'allowedOrigins' => self::addLoopbackOriginVariants(
                self::appendOrigin(
                    self::appendOrigin(
                        self::envString('XCONECTC_ALLOWED_ORIGINS', self::appUrl()),
                        self::appUrl(),
                    ),
                    self::hostPublicUrl(),
                ),
            ),
            'hostBootstrapApiKeys' => self::envString(
                'XCONECTC_HOST_BOOTSTRAP_API_KEYS',
                '',
            ),
            'hostBootstrapSigningSecret' => self::envString(
                'XCONECTC_HOST_BOOTSTRAP_SIGNING_SECRET',
                '',
            ),
            'hostBootstrapSigningKeyId' => self::envString(
                'XCONECTC_HOST_BOOTSTRAP_SIGNING_KEY_ID',
                '',
            ),
            'hostBootstrapVerifierKeys' => self::envJsonRecord(
                'XCONECTC_HOST_BOOTSTRAP_VERIFIER_KEYS_JSON',
                self::envString('XCONECTC_HOST_BOOTSTRAP_VERIFIER_KEYS', ''),
            ),
            'hostSessionSigningSecret' => self::envString(
                'XCONECTC_HOST_SESSION_SIGNING_SECRET',
                '',
            ),
            'hostSessionSigningKeyId' => self::envString(
                'XCONECTC_HOST_SESSION_SIGNING_KEY_ID',
                '',
            ),
            'hostSessionVerifierKeys' => self::envJsonRecord(
                'XCONECTC_HOST_SESSION_VERIFIER_KEYS_JSON',
                self::envString('XCONECTC_HOST_SESSION_VERIFIER_KEYS', ''),
            ),
            'storage' => [
                'paymentSessionsFile' => storage_path('app/xconectc-payment-sessions.json'),
                'hostBootstrapReplayFile' => storage_path('app/xconectc-host-bootstrap-replay.json'),
                'hostSessionRevocationsFile' => storage_path('app/xconectc-host-session-revocations.json'),
                'hostSessionStateFile' => storage_path('app/xconectc-host-session-state.json'),
            ],
            'hostPages' => [
                'tenantPayment' => public_path('tenant-payment.html'),
            ],
            'embedSdkCandidateFiles' => [
                $repoRoot . '/dist/sdk/xapps-embed-sdk.esm.js',
                $repoRoot . '/node_modules/@xapps-platform/embed-sdk/dist/xapps-embed-sdk.esm.js',
                $repoRoot . '/node_modules/@xapps-platform/embed-sdk/dist/xapps-embed-sdk.esm.js',
            ],
        ];
    }

    private static function options(array $config): array
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
                'tenantName' => 'XconectC',
                'serviceName' => 'xconectc-laravel',
                'stackLabel' => 'laravel-12',
            ],
            'assets' => [
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
                    'cookiePath' => '/',
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
                'ownerIssuer' => 'tenant',
            ],
            'reference' => [
                'tenant' => 'xconectc',
                'workspace' => 'xconectc',
                'stack' => 'laravel-12',
                'mode' => 'reference-marketplace-tenant-laravel',
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
            ],
            'subjectProfiles' => [
                'workspace' => 'xconectc',
                'source' => 'tenant_subject_profile',
                'defaultProfiles' => SubjectProfiles::catalog(),
            ],
        ];
    }

    private static function bootstrap(): array
    {
        $config = self::config();
        $options = self::options($config);

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
                        'registerHostPageRoutes' => static function (array &$routes, array $app): void {
                        },
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

}
