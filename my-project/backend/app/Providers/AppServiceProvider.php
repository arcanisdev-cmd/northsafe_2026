<?php

namespace App\Providers;

use Illuminate\Support\Facades\File;
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
        if (! $this->isServeCommand()) {
            return;
        }

        $tempDirectory = base_path('storage/tmp');
        File::ensureDirectoryExists($tempDirectory);

        ini_set('upload_tmp_dir', $tempDirectory);
        ini_set('sys_temp_dir', $tempDirectory);

        putenv('UPLOAD_TMP_DIR='.$tempDirectory);
        putenv('TMP='.$tempDirectory);
        putenv('TEMP='.$tempDirectory);
        putenv('TMPDIR='.$tempDirectory);
    }

    private function isServeCommand(): bool
    {
        return app()->runningInConsole()
            && isset($_SERVER['argv'][1])
            && $_SERVER['argv'][1] === 'serve';
    }
}
