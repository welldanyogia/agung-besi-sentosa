<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SatuanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $satuans = [
            ['id' => Str::uuid(), 'name' => 'Kg'],
            ['id' => Str::uuid(), 'name' => 'Meter'],
            ['id' => Str::uuid(), 'name' => 'Batang'],
        ];

        DB::table('satuans')->insert($satuans);
    }
}
