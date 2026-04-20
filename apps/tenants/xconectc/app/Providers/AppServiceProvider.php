<?php

namespace App\Providers;

use App\Support\Xapps\BackendKitBootstrap;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton('xapps.backendKit', static fn (): array => BackendKitBootstrap::app());
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
