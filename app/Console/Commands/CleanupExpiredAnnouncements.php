<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CleanupExpiredAnnouncements extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'announcements:cleanup';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Supprime les annonces expirées (plus de 7 jours)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $deletedCount = \App\Models\Announcement::where('expires_at', '<=', now())->delete();
        
        $this->info("Suppression terminée : {$deletedCount} annonces expirées supprimées.");
        
        return 0;
    }
}
