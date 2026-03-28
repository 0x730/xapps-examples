<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpFoundation\Response;

class HostProofController extends Controller
{
    private function firstExistingPath(array $candidates, string $fallback): string
    {
        foreach ($candidates as $candidate) {
            if (is_string($candidate) && $candidate !== '' && file_exists($candidate)) {
                return $candidate;
            }
        }

        return $fallback;
    }

    private function repoRoot(): string
    {
        return dirname(base_path(), 3);
    }

    private function commonPublicDir(): string
    {
        return $this->repoRoot() . '/apps/tenants/host-proof-common/public';
    }

    private function commonHostDir(): string
    {
        return $this->repoRoot() . '/apps/tenants/host-proof-common/host';
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

    private function backendBaseUrl(): string
    {
        return rtrim((string) env('XCONECTC_HOST_BACKEND_BASE_URL', 'http://localhost:8001'), '/');
    }

    private function bootstrapBackendBaseUrl(): string
    {
        return rtrim((string) env('XCONECTC_HOST_BOOTSTRAP_BACKEND_BASE_URL', $this->backendBaseUrl()), '/');
    }

    private function publicBaseUrl(): string
    {
        return rtrim((string) env('XCONECTC_HOST_PUBLIC_BASE_URL', env('APP_URL', 'http://localhost:8002')), '/');
    }

    private function bootstrapApiKey(): string
    {
        return trim((string) env('XCONECTC_HOST_BOOTSTRAP_API_KEY', ''));
    }

    private function sendFile(string $filePath, string $contentType): Response
    {
        if (!is_file($filePath)) {
            return response()->json(['message' => 'file not found'], 404);
        }

        return response((string) file_get_contents($filePath), 200)->header('Content-Type', $contentType);
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

    public function health(): Response
    {
        return response()->json([
            'ok' => true,
            'service' => 'xconectc-host-laravel',
            'backendBaseUrl' => $this->backendBaseUrl(),
            'bootstrapBackendBaseUrl' => $this->bootstrapBackendBaseUrl(),
            'publicBaseUrl' => $this->publicBaseUrl(),
        ]);
    }

    public function entry(): Response
    {
        return $this->sendFile($this->commonPublicDir() . '/index.html', 'text/html; charset=utf-8');
    }

    public function marketplace(): Response
    {
        return $this->sendFile($this->commonPublicDir() . '/marketplace.html', 'text/html; charset=utf-8');
    }

    public function singleXapp(): Response
    {
        return $this->sendFile($this->commonPublicDir() . '/single-xapp.html', 'text/html; charset=utf-8');
    }

    public function hostBootstrap(Request $request): Response
    {
        if ($this->bootstrapApiKey() === '') {
            return response()->json(['message' => 'Host bootstrap api key is not configured'], 500);
        }

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'X-API-Key' => $this->bootstrapApiKey(),
        ])->post($this->bootstrapBackendBaseUrl() . '/api/host-bootstrap', [
            'email' => trim((string) $request->input('email', '')),
            'name' => trim((string) $request->input('name', '')),
            'origin' => $this->publicBaseUrl(),
        ]);

        return response($response->body(), $response->status())
            ->header('Content-Type', (string) $response->header('Content-Type', 'application/json; charset=utf-8'));
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
            'export const HOST_BOOTSTRAP_URL = "/api/host-bootstrap";',
            'export const DASHBOARD_HREF = "/dashboard";',
            'export const DASHBOARD_LABEL = "Back to dashboard";',
            'export const PROOF_NAME = "XconectC Host";',
            'export const WORKSPACE_KEY = "xconectc-host";',
            'export const STACK_LABEL = "laravel-12";',
            'export const IDENTITY_STORAGE_KEY = "xconectc-host-proof-identity";',
            'export const SDK_PATH = "/embed/sdk/xapps-embed-sdk.esm.js";',
        ]);

        return response($body, 200)->header('Content-Type', 'application/javascript; charset=utf-8');
    }

    public function hostAsset(string $assetName): Response
    {
        $assetName = trim($assetName);
        $localFile = $this->commonHostDir() . '/' . $assetName;
        if (is_file($localFile)) {
            return $this->sendFile($localFile, $this->contentTypeForAsset($assetName));
        }

        $sharedFile = $this->browserHostDistDir() . '/' . $assetName;
        if (is_file($sharedFile)) {
            return $this->sendFile($sharedFile, $this->contentTypeForAsset($assetName));
        }

        return response()->json(['message' => 'host asset not found'], 404);
    }
}
