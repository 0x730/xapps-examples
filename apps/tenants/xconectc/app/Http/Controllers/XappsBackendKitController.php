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

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\Cookie;
use Xapps\BackendKit\BackendKit;

class XappsBackendKitController extends Controller
{
    public function dispatch(Request $request): Response
    {
        $status = 200;
        $responseHeaders = [];
        $responseBody = '';

        if (function_exists('header_remove')) {
            // BackendKit dispatch may emit raw header() calls. Clear PHP's header buffer before
            // and after capture so the Laravel response only reflects the dispatch result.
            @header_remove();
        }
        http_response_code(200);

        ob_start();
        BackendKit::dispatch(app('xapps.backendKit'), $this->requestContext($request), [
            'sendJson' => static function (array $payload, int $statusCode = 200, array $headers = []) use (&$status, &$responseHeaders, &$responseBody): void {
                $status = $statusCode;
                foreach ($headers as $name => $value) {
                    if (is_array($value)) {
                        foreach ($value as $entry) {
                            self::appendCapturedHeader($responseHeaders, (string) $name, (string) $entry);
                        }
                        continue;
                    }
                    self::appendCapturedHeader($responseHeaders, (string) $name, (string) $value);
                }
                self::appendCapturedHeader(
                    $responseHeaders,
                    'Content-Type',
                    'application/json; charset=utf-8',
                );
                $responseBody = (string) json_encode($payload, JSON_UNESCAPED_SLASHES);
            },
        ]);
        $echoedBody = (string) ob_get_clean();

        $phpStatus = http_response_code() ?: 0;
        if ($responseBody === '' && $echoedBody !== '') {
            $status = $phpStatus ?: $status;
        }
        foreach (headers_list() as $headerLine) {
            $idx = strpos($headerLine, ':');
            if ($idx === false) {
                continue;
            }
            $name = trim(substr($headerLine, 0, $idx));
            $value = trim(substr($headerLine, $idx + 1));
            if ($name !== '') {
                self::appendCapturedHeader($responseHeaders, $name, $value);
            }
        }
        if (function_exists('header_remove')) {
            @header_remove();
        }

        $body = $responseBody !== '' ? $responseBody : $echoedBody;
        $response = response($body, $status);
        foreach ($responseHeaders as $header) {
            $name = (string) ($header['name'] ?? '');
            $value = (string) ($header['value'] ?? '');
            if ($name === '' || $value === '') {
                continue;
            }
            if (strcasecmp($name, 'Set-Cookie') === 0) {
                $response->headers->setCookie(Cookie::fromString($value));
                continue;
            }
            $response->headers->set($name, $value);
        }

        return $response;
    }

    private static function appendCapturedHeader(array &$responseHeaders, string $name, string $value): void
    {
        $name = trim($name);
        if ($name === '') {
            return;
        }

        if (strcasecmp($name, 'Content-Type') === 0) {
            $responseHeaders = array_values(array_filter(
                $responseHeaders,
                static fn (array $header): bool => strcasecmp((string) ($header['name'] ?? ''), 'Content-Type') !== 0,
            ));
        }

        $responseHeaders[] = [
            'name' => $name,
            'value' => $value,
        ];
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
