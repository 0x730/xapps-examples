<?php

declare(strict_types=1);

namespace App\Http\Controllers;

if (!function_exists('xapps_backend_kit_build_host_bootstrap_result')) {
    $vendorAutoload = dirname(__DIR__, 3) . '/vendor/autoload.php';
    if (is_file($vendorAutoload)) {
        require_once $vendorAutoload;
    }
}
if (!function_exists('xapps_backend_kit_build_host_bootstrap_result')) {
    require_once dirname(__DIR__, 6) . '/packages/xapps-php/src/index.php';
    require_once dirname(__DIR__, 6) . '/packages/xapps-backend-kit-php/src/functions.php';
}

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpFoundation\Response;

class HostProofController extends Controller
{
    private function repoRoot(): string
    {
        return dirname(base_path(), 3);
    }

    private function firstExistingPath(array $candidates, string $fallback): string
    {
        foreach ($candidates as $candidate) {
            if (is_string($candidate) && $candidate !== '' && file_exists($candidate)) {
                return $candidate;
            }
        }

        return $fallback;
    }

    private function commonPublicDir(): string
    {
        return $this->repoRoot() . '/apps/tenants/host-proof-common/public';
    }

    private function commonHostDir(): string
    {
        return $this->repoRoot() . '/apps/tenants/host-proof-common/host';
    }

    private function localHostDir(): string
    {
        return resource_path('host');
    }

    private function browserHostDistDir(): string
    {
        return $this->firstExistingPath([
            $this->repoRoot() . '/node_modules/@xapps-platform/browser-host/dist',
            $this->repoRoot() . '/packages/browser-host/dist',
        ], $this->repoRoot() . '/packages/browser-host/dist');
    }

    private function embedSdkFile(): string
    {
        return $this->firstExistingPath([
            $this->repoRoot() . '/node_modules/@xapps-platform/embed-sdk/dist/xapps-embed-sdk.esm.js',
            $this->repoRoot() . '/dist/sdk/xapps-embed-sdk.esm.js',
            $this->repoRoot() . '/node_modules/@xapps-platform/embed-sdk/dist/xapps-embed-sdk.esm.js',
        ], $this->repoRoot() . '/dist/sdk/xapps-embed-sdk.esm.js');
    }

    private function gatewayUrl(): string
    {
        return rtrim((string) env('XAPPS_GATEWAY_URL', 'http://localhost:3000'), '/');
    }

    private function apiKey(): string
    {
        return trim((string) env('XAPPS_API_KEY', ''));
    }

    private function backendBaseUrl(): string
    {
        return rtrim((string) env('XCONECTC_HOST_BACKEND_BASE_URL', env('APP_URL', 'http://localhost:8001')), '/');
    }

    private function publicBaseUrl(): string
    {
        return rtrim((string) env('XCONECTC_HOST_PUBLIC_BASE_URL', env('APP_URL', 'http://localhost:8001')), '/');
    }

    private function hostBootstrapSigningSecret(): string
    {
        return trim((string) env('XCONECTC_HOST_BOOTSTRAP_SIGNING_SECRET', 'xconectc-host-bootstrap-dev-secret'));
    }

    private function hostBootstrapTtlSeconds(): int
    {
        $ttlSeconds = (int) env('XCONECTC_HOST_BOOTSTRAP_TTL_SECONDS', 300);
        return $ttlSeconds > 0 ? $ttlSeconds : 300;
    }

    private function sendFile(string $filePath, string $contentType): Response
    {
        if (!is_file($filePath)) {
            return response()->json(['message' => 'file not found'], 404);
        }

        return response((string) file_get_contents($filePath), 200)->header('Content-Type', $contentType);
    }

    private function sendHtmlFile(string $filePath, array $replacements = []): Response
    {
        if (!is_file($filePath)) {
            return response()->json(['message' => 'file not found'], 404);
        }

        $body = (string) file_get_contents($filePath);
        foreach ($replacements as $search => $replace) {
            $body = str_replace($search, $replace, $body);
        }

        return response($body, 200)->header('Content-Type', 'text/html; charset=utf-8');
    }

    private function contentTypeForAsset(string $assetName): string
    {
        if (str_ends_with($assetName, '.css')) {
            return 'text/css; charset=utf-8';
        }
        if (str_ends_with($assetName, '.html')) {
            return 'text/html; charset=utf-8';
        }
        if (str_ends_with($assetName, '.json')) {
            return 'application/json; charset=utf-8';
        }

        return 'application/javascript; charset=utf-8';
    }

    public function catalogBootstrap(Request $request): Response
    {
        if ($this->apiKey() === '') {
            return response()->json(['message' => 'XAPPS_API_KEY not configured'], 500);
        }

        $email = trim((string) $request->input('email', ''));
        $name = trim((string) $request->input('name', ''));
        $origin = trim((string) $request->input('origin', ''));
        if ($origin === '') {
            $origin = trim((string) $request->headers->get('origin', ''));
        }
        if ($origin === '') {
            $origin = $this->publicBaseUrl();
        }

        if ($email === '') {
            return response()->json(['message' => 'email is required'], 400);
        }

        $resolveResponse = Http::withHeaders([
            'Content-Type' => 'application/json',
            'X-API-Key' => $this->apiKey(),
        ])->post($this->gatewayUrl() . '/v1/subjects/resolve', [
            'type' => 'user',
            'identifier' => [
                'idType' => 'email',
                'value' => $email,
                'hint' => $email,
            ],
            'email' => $email,
        ]);

        $resolveData = $resolveResponse->json();
        if (!$resolveResponse->ok()) {
            return response()->json(
                is_array($resolveData) ? $resolveData : ['message' => 'subject resolution failed'],
                $resolveResponse->status(),
            );
        }

        $subjectId = trim((string) ($resolveData['subjectId'] ?? $resolveData['subject_id'] ?? ''));
        if ($subjectId === '') {
            return response()->json(['message' => 'resolve-subject response missing subjectId'], 502);
        }

        return response()->json(xapps_backend_kit_build_host_bootstrap_result([
            'subjectId' => $subjectId,
            'email' => $email,
            'name' => $name !== '' ? $name : null,
            'origin' => $origin,
            'signingSecret' => $this->hostBootstrapSigningSecret(),
            'ttlSeconds' => $this->hostBootstrapTtlSeconds(),
        ]));
    }

    public function marketplace(): Response
    {
        return $this->sendHtmlFile($this->commonPublicDir() . '/marketplace.html', [
            'Hosted Marketplace Workspace' => 'XconectC Marketplace',
            'href="/"' => 'href="/catalog"',
            'Back to launcher' => 'Back to workspace',
        ]);
    }

    public function singleXapp(): Response
    {
        return $this->sendHtmlFile($this->commonPublicDir() . '/single-xapp.html', [
            'Hosted Single Xapp Workspace' => 'XconectC Single Xapp',
            'href="/"' => 'href="/catalog"',
            'Back to launcher' => 'Back to workspace',
        ]);
    }

    public function embedSdk(): Response
    {
        return $this->sendFile($this->embedSdkFile(), 'application/javascript; charset=utf-8');
    }

    public function proofConfig(): Response
    {
        $body = implode("\n", [
            'export const BACKEND_BASE_URL = ' . json_encode($this->backendBaseUrl()) . ';',
            'export const PUBLIC_BASE_URL = ' . json_encode($this->publicBaseUrl()) . ';',
            'export const PROOF_NAME = "XconectC";',
            'export const WORKSPACE_KEY = "xconectc";',
            'export const STACK_LABEL = "laravel-12";',
            'export const IDENTITY_STORAGE_KEY = "xconectc-proof-identity";',
            'export const SDK_PATH = "/embed/sdk/xapps-embed-sdk.esm.js";',
        ]);

        return response($body, 200)->header('Content-Type', 'application/javascript; charset=utf-8');
    }

    public function hostAsset(string $assetName): Response
    {
        $assetName = trim($assetName);
        $localFile = $this->localHostDir() . '/' . $assetName;
        if (is_file($localFile)) {
            return $this->sendFile($localFile, $this->contentTypeForAsset($assetName));
        }

        $sharedFile = $this->commonHostDir() . '/' . $assetName;
        if (is_file($sharedFile)) {
            return $this->sendFile($sharedFile, $this->contentTypeForAsset($assetName));
        }

        $browserHostFile = $this->browserHostDistDir() . '/' . $assetName;
        if (is_file($browserHostFile)) {
            return $this->sendFile($browserHostFile, $this->contentTypeForAsset($assetName));
        }

        return response()->json(['message' => 'host asset not found'], 404);
    }
}
