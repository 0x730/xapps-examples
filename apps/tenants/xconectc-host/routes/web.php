<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HostProofController;

Route::get('/health', function() {
    return app(HostProofController::class)->health();
});

// Minimal XconectC Host dashboard (HTML)
Route::get('/', function () {
    return app(HostProofController::class)->entry();
});

Route::get('/dashboard', function () {
    return view('dashboard', array(
        'clientId' => 'xconectc-host',
    ));
});

Route::get('/marketplace.html', array(HostProofController::class, 'marketplace'));
Route::get('/single-xapp.html', array(HostProofController::class, 'singleXapp'));
Route::post('/api/browser/host-bootstrap', array(HostProofController::class, 'hostBootstrap'));
Route::get('/embed/sdk/xapps-embed-sdk.esm.js', array(HostProofController::class, 'embedSdk'));
Route::get('/host/starter-config.js', array(HostProofController::class, 'starterConfig'));
Route::get('/host/proof-config.js', array(HostProofController::class, 'proofConfig'));
Route::get('/host/{assetName}', array(HostProofController::class, 'hostAsset'))->where('assetName', '.*');
