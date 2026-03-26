<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\InventoryController;

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

// Data endpoints
Route::get('/projects', array(ProjectController::class, 'index'));
Route::post('/projects', array(ProjectController::class, 'createProject'));
Route::get('/projects/{id}', array(ProjectController::class, 'getProject'));
Route::patch('/projects/{id}', array(ProjectController::class, 'updateProject'));
Route::get('/profile', array(ProjectController::class, 'profile'));
Route::get('/billing', array(ProjectController::class, 'billing'));
Route::get('/issues', array(ProjectController::class, 'issues'));
Route::post('/issues', array(ProjectController::class, 'createIssue'));
Route::get('/issues/{id}', array(ProjectController::class, 'getIssue'));
Route::patch('/issues/{id}', array(ProjectController::class, 'updateIssue'));
Route::get('/issues/{id}/comments', array(ProjectController::class, 'listComments'));
Route::post('/issues/{id}/comments', array(ProjectController::class, 'createComment'));

Route::get('/inventory', array(InventoryController::class, 'index'));
Route::get('/inventory/{id}', array(InventoryController::class, 'show'));
Route::post('/inventory', array(InventoryController::class, 'store'));

Route::get('/health', function() {
    return response()->json(array('status' => 'ok', 'service' => 'xconectc-host-laravel'));
});
