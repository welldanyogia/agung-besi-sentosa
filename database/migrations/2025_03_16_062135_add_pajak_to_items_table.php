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
            $table->boolean('is_tax')->default(false)->after('satuan'); // Sesuaikan posisi kolom
            $table->decimal('tax', 10, 2)->nullable()->after('is_tax'); // Bisa null jika tidak dikenakan pajak
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('items', function (Blueprint $table) {
            $table->dropColumn(['is_tax', 'tax']);
        });
    }
};
