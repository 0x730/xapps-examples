<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// OIDC Discovery
Route::get('/.well-known/openid-configuration', array(AuthController::class, 'openidConfiguration'));
Route::get('/.well-known/jwks.json', array(AuthController::class, 'jwks'));

// Auth endpoints
Route::get('/auth/login', array(AuthController::class, 'login'));
Route::post('/auth/login', array(AuthController::class, 'login'));
Route::get('/auth/register', array(AuthController::class, 'register'));
Route::post('/auth/register', array(AuthController::class, 'register'));
Route::post('/auth/logout', array(AuthController::class, 'logout'));
Route::post('/auth/token', array(AuthController::class, 'token'));

Route::get('/health', function() {
    return response()->json(array('status' => 'ok', 'service' => 'xconectc-laravel'));
});
