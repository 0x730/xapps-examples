<?php

use Illuminate\Support\Facades\Route;

Route::get('/health', function() {
    return response()->json(array('status' => 'ok', 'service' => 'xconectc-host-laravel'));
});
