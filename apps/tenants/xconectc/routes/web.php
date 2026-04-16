<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\HostProofController;
use App\Http\Controllers\XappsBackendKitController;

// OIDC Discovery (matching x-api pattern)
Route::get('/.well-known/openid-configuration', array(AuthController::class, 'openidConfiguration'));
Route::get('/.well-known/jwks.json', array(AuthController::class, 'jwks'));

// Auth endpoints
Route::get('/auth/login', array(AuthController::class, 'login'))->name('login');
Route::post('/auth/login', array(AuthController::class, 'login'));
Route::get('/auth/register', array(AuthController::class, 'register'));
Route::post('/auth/register', array(AuthController::class, 'register'));
Route::get('/auth/logout', array(AuthController::class, 'logout')); // Allow GET for simple UI logout
Route::post('/auth/logout', array(AuthController::class, 'logout'));
Route::post('/auth/token', array(AuthController::class, 'token'));

Route::get('/health', function() {
    return response()->json(array('status' => 'ok', 'service' => 'xconectc-laravel'));
});

// Minimal XconectC dashboard (HTML)
Route::get('/', function () {
    return redirect('/dashboard');
});

Route::get('/dashboard', function () {
    $clientId = 'xconectc';
    $user = Auth::user();
    $userEmail = $user ? $user->email : 'daniel.vladescu@gmail.com';

    return view('dashboard', array(
        'clientId' => $clientId,
        'user' => $user,
        'userEmail' => $userEmail,
    ));
});

// XconectC launcher + shared browser-host surfaces.
Route::get('/catalog', array(HostProofController::class, 'entry'));
Route::post('/catalog/api/host-bootstrap', array(HostProofController::class, 'catalogBootstrap'));
Route::get('/marketplace.html', array(HostProofController::class, 'marketplace'));
Route::get('/single-xapp.html', array(HostProofController::class, 'singleXapp'));
Route::get('/embed/sdk/xapps-embed-sdk.esm.js', array(HostProofController::class, 'embedSdk'));
Route::get('/host/proof-config.js', array(HostProofController::class, 'proofConfig'));
Route::get('/host/{assetName}', array(HostProofController::class, 'hostAsset'))->where('assetName', '.*');
Route::get('/tenant-payment.html', function () {
    return response(file_get_contents(public_path('tenant-payment.html')), 200)
        ->header('Content-Type', 'text/html; charset=utf-8');
});

$xappsBackendKitPaths = [
    '/api/reference',
    '/api/host-config',
    '/api/host-bootstrap',
    '/api/resolve-subject',
    '/api/create-catalog-session',
    '/api/catalog-customer-profile',
    '/api/create-widget-session',
    '/api/installations',
    '/api/install',
    '/api/update',
    '/api/uninstall',
    '/api/my-xapps/:xappId/monetization/subscription-contracts/:contractId/refresh-state',
    '/api/my-xapps/:xappId/monetization/subscription-contracts/:contractId/cancel',
    '/api/bridge/token-refresh',
    '/api/bridge/sign',
    '/api/bridge/vendor-assertion',
    '/api/bridge/publisher-session/me',
    '/api/bridge/publisher-session/logout',
    '/api/tenant-payment/session',
    '/api/tenant-payment/complete',
    '/api/tenant-payment/client-settle',
    '/api/payment/return/verify',
    '/guard/subject-profiles/tenant-candidates',
    '/xapps/requests',
];

foreach ($xappsBackendKitPaths as $path) {
    Route::any($path, array(XappsBackendKitController::class, 'dispatch'));
}
