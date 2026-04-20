<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Symfony\Component\HttpFoundation\Request as SymfonyRequest;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // xapps_host_session is already a signed backend-kit token. Laravel must not wrap it in
        // its own cookie encryption layer or the host-session verifier will only see ciphertext.
        $middleware->encryptCookies(except: array(
            'xapps_host_session',
        ));

        // Behind Nginx TLS (especially on non-443 ports like :8000), we must trust forwarded
        // headers so Laravel generates correct absolute URLs (https + port) and redirects.
        // This is safe in our deployment because the app is only reachable via the trusted
        // reverse proxy (services bind to 127.0.0.1).
        $middleware->trustProxies(
            at: '*',
            headers: SymfonyRequest::HEADER_X_FORWARDED_FOR |
                SymfonyRequest::HEADER_X_FORWARDED_HOST |
                SymfonyRequest::HEADER_X_FORWARDED_PORT |
                SymfonyRequest::HEADER_X_FORWARDED_PROTO |
                SymfonyRequest::HEADER_X_FORWARDED_PREFIX,
        );

        $middleware->validateCsrfTokens(except: array(
            'auth/*',
            'api/auth/*',
            'api/*',
            'guard/*',
            // The launcher/browser-host pages call these endpoints via `fetch()` from browser JS
            // (not a Blade form post), so CSRF would otherwise return 419.
            'xapps/*',
        ));
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
