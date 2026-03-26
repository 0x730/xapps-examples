<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\HostProofController;
use Illuminate\Support\Facades\DB;

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

// Data endpoints
Route::get('/projects', array(ProjectController::class, 'index'));
Route::get('/profile', array(ProjectController::class, 'profile'));
Route::get('/billing', array(ProjectController::class, 'billing'));
Route::get('/issues', array(ProjectController::class, 'issues'));

Route::get('/inventory', array(InventoryController::class, 'index'));
Route::get('/inventory/{id}', array(InventoryController::class, 'show'));
Route::post('/inventory', array(InventoryController::class, 'store'));

Route::get('/health', function() {
    return app(HostProofController::class)->health();
});

// Minimal XconectC Host dashboard (HTML)
Route::get('/', function () {
    return app(HostProofController::class)->entry();
});

Route::get('/dashboard', function () {
    $clientId = 'xconectc-host';
    $user = Auth::user();
    $userEmail = $user ? $user->email : 'daniel.vladescu@gmail.com';

    $projectsCount = DB::table('projects')->where('client_id', $clientId)->where('user_email', $userEmail)->count();
    $issuesCount = DB::table('issues')->where('client_id', $clientId)->where('user_email', $userEmail)->count();
    $inventoryCount = DB::table('inventory_items')->where('client_id', $clientId)->where('user_email', $userEmail)->count();

    return view('dashboard', array(
        'clientId' => $clientId,
        'user' => $user,
        'userEmail' => $userEmail,
        'projectsCount' => $projectsCount,
        'issuesCount' => $issuesCount,
        'inventoryCount' => $inventoryCount,
    ));
});

Route::get('/catalog', array(HostProofController::class, 'entry'));
Route::get('/marketplace.html', array(HostProofController::class, 'marketplace'));
Route::get('/single-xapp.html', array(HostProofController::class, 'singleXapp'));
Route::post('/api/host-bootstrap', array(HostProofController::class, 'hostBootstrap'));
Route::get('/embed/sdk/xapps-embed-sdk.esm.js', array(HostProofController::class, 'embedSdk'));
Route::get('/host/proof-config.js', array(HostProofController::class, 'proofConfig'));
Route::get('/host/{assetName}', array(HostProofController::class, 'hostAsset'))->where('assetName', '.*');
