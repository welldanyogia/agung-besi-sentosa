<?php

use Illuminate\Foundation\Console\ClosureCommand;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    /** @var ClosureCommand $this */
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Menjadwalkan backup setiap hari jam 01:00 pagi
Schedule::command('backup:run')->dailyAt('01:00');

// Menjadwalkan cleanup setiap hari jam 02:00 pagi
Schedule::command('backup:clean')->dailyAt('02:00');

// Menjadwalkan monitoring backup health setiap hari jam 02:30 pagi
Schedule::command('backup:monitor')->dailyAt('02:30');
