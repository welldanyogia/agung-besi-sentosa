<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('items', function (Blueprint $table) {
            $table->string('status_perubahan_harga')->nullable()->after('price');
            $table->decimal('selisih_perubahan_harga', 15, 2)->nullable()->after('status_perubahan_harga');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('items', function (Blueprint $table) {
            $table->dropColumn(['status_perubahan_harga', 'selisih_perubahan_harga']);
        });
    }
};
