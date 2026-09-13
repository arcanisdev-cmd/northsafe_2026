<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class WipeReportsCommand extends Command
{
    protected $signature = 'reports:wipe
                            {--force : Skip the confirmation prompt}';

    protected $description = 'Delete all hazard reports and their related data';

    public function handle(): int
    {
        $reportIds = DB::table('hazard_reports')->pluck('id');
        $reportCount = $reportIds->count();

        if ($reportCount === 0) {
            $this->info('No hazard reports found.');
            return self::SUCCESS;
        }

        if (! $this->option('force') && ! $this->confirm(
            "This will permanently delete {$reportCount} hazard report(s), related records, and stored report images. Continue?"
        )) {
            $this->info('Wipe cancelled.');
            return self::SUCCESS;
        }

        $imagePaths = DB::table('report_images')
            ->whereIn('report_id', $reportIds)
            ->pluck('image_url')
            ->filter()
            ->map(function (string $imageUrl): string {
                $path = parse_url($imageUrl, PHP_URL_PATH) ?: $imageUrl;
                return ltrim(str_replace('/storage/', '', $path), '/');
            });

        DB::transaction(function () use ($reportIds): void {
            DB::table('notifications')->whereIn('report_id', $reportIds)->delete();
            DB::table('reward_transactions')->whereIn('report_id', $reportIds)->delete();
            DB::table('report_images')->whereIn('report_id', $reportIds)->delete();
            DB::table('ai_classifications')->whereIn('report_id', $reportIds)->delete();
            DB::table('comments')->whereIn('report_id', $reportIds)->delete();
            DB::table('report_votes')->whereIn('report_id', $reportIds)->delete();
            DB::table('report_status_history')->whereIn('report_id', $reportIds)->delete();
            DB::table('weather_data')->whereIn('report_id', $reportIds)->delete();
            DB::table('hazard_reports')->whereIn('id', $reportIds)->delete();
        });

        if ($imagePaths->isNotEmpty()) {
            Storage::disk('public')->delete($imagePaths->all());
        }

        $this->info("Deleted {$reportCount} hazard report(s) and related data.");
        $this->info('Users, admin accounts, and reward balances were left unchanged.');

        return self::SUCCESS;
    }
}
