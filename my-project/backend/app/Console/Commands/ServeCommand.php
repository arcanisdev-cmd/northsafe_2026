<?php

namespace App\Console\Commands;

use Illuminate\Foundation\Console\ServeCommand as BaseServeCommand;
use Illuminate\Support\Collection;
use Symfony\Component\Process\Process;

class ServeCommand extends BaseServeCommand
{
    /**
     * The console command name.
     *
     * @var string
     */
    protected $name = 'serve';

    /**
     * Start a new server process.
     *
     * @param  bool  $hasEnvironment
     * @return \Symfony\Component\Process\Process
     */
    protected function startProcess($hasEnvironment)
    {
        $tempDirectory = base_path('storage/tmp');

        $environment = (new Collection($_ENV))->mapWithKeys(function ($value, $key) use ($hasEnvironment) {
            if ($this->option('no-reload') || ! $hasEnvironment) {
                return [$key => $value];
            }

            return $this->shouldPassThroughEnvironmentVariable($key) ? [$key => $value] : [$key => false];
        })->merge([
            'PHP_CLI_SERVER_WORKERS' => $this->phpServerWorkers,
            'TMP' => $tempDirectory,
            'TEMP' => $tempDirectory,
            'TMPDIR' => $tempDirectory,
            'UPLOAD_TMP_DIR' => $tempDirectory,
            'PHP_UPLOAD_TMP_DIR' => $tempDirectory,
        ])->all();

        $process = new Process($this->serverCommand(), public_path(), $environment);

        $this->trap(fn () => [SIGTERM, SIGINT, SIGHUP, SIGUSR1, SIGUSR2, SIGQUIT], function ($signal) use ($process) {
            if ($process->isRunning()) {
                $process->stop(10, $signal);
            }

            exit;
        });

        $process->start($this->handleProcessOutput());

        return $process;
    }
}