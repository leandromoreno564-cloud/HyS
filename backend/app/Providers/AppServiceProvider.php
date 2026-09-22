<?php

namespace App\Providers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Previene consultas N+1 (Lazy Loading) y asignación masiva de campos no permitidos durante el desarrollo
        Model::shouldBeStrict(! $this->app->isProduction());

        // Fuerza el esquema HTTPS en entornos de producción (necesario tras Nginx, Cloudflare o Balanceadores de Carga)
        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }
    }
}