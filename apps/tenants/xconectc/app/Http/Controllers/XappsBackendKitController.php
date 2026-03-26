<?php

declare(strict_types=1);

namespace App\Http\Controllers;

if (!class_exists(\Xapps\BackendKit\BackendKit::class)) {
    $vendorAutoload = dirname(__DIR__, 3) . '/vendor/autoload.php';
    if (is_file($vendorAutoload)) {
        require_once $vendorAutoload;
    }
}
if (!class_exists(\Xapps\BackendKit\BackendKit::class)) {
    require_once dirname(__DIR__, 6) . '/packages/xapps-backend-kit-php/src/BackendKit.php';
}

use App\Support\Xapps\BackendKitBootstrap;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Xapps\BackendKit\BackendKit;

class XappsBackendKitController extends Controller
{
    public function dispatch(Request $request): Response
    {
        $status = 200;
        $responseHeaders = [];
        $responseBody = '';

        if (function_exists('header_remove')) {
            @header_remove();
        }
        http_response_code(200);

        ob_start();
        BackendKit::dispatch(BackendKitBootstrap::app(), $this->requestContext($request), [
            'sendJson' => static function (array $payload, int $statusCode = 200, array $headers = []) use (&$status, &$responseHeaders, &$responseBody): void {
                $status = $statusCode;
                $responseHeaders = array_merge($responseHeaders, $headers, [
                    'Content-Type' => 'application/json; charset=utf-8',
                ]);
                $responseBody = (string) json_encode($payload, JSON_UNESCAPED_SLASHES);
            },
        ]);
        $echoedBody = (string) ob_get_clean();

        $status = http_response_code() ?: $status;
        foreach (headers_list() as $headerLine) {
            $idx = strpos($headerLine, ':');
            if ($idx === false) {
                continue;
            }
            $name = trim(substr($headerLine, 0, $idx));
            $value = trim(substr($headerLine, $idx + 1));
            if ($name !== '') {
                $responseHeaders[$name] = $value;
            }
        }
        if (function_exists('header_remove')) {
            @header_remove();
        }

        $body = $responseBody !== '' ? $responseBody : $echoedBody;
        $response = response($body, $status);
        foreach ($responseHeaders as $name => $value) {
            $response->headers->set((string) $name, (string) $value);
        }

        return $response;
    }

    private function requestContext(Request $request): array
    {
        $headers = [];
        foreach ($request->headers->all() as $name => $values) {
            $headers[strtolower((string) $name)] = is_array($values)
                ? implode(', ', array_map(static fn ($value): string => (string) $value, $values))
                : (string) $values;
        }

        $body = $request->all();

        return [
            'method' => strtoupper($request->method()),
            'path' => $request->getPathInfo() ?: '/',
            'query' => $request->query(),
            'body' => is_array($body) ? $body : [],
            'headers' => $headers,
            'server' => $request->server->all(),
            'params' => array_filter(
                $request->route()?->parameters() ?? [],
                static fn ($value): bool => is_scalar($value) || $value === null,
            ),
        ];
    }
}
