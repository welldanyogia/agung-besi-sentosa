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
            $table->decimal('semi_grosir_price', 15, 2)->nullable()->after('wholesale_price'); // sesuaikan posisi kolom jika perlu
            $table->decimal('tax_percentage_semi_grosir', 5, 2)->nullable()->after('semi_grosir_price');
            $table->decimal('pajak_luaran_semi_grosir', 12, 2)->nullable()->after('tax_percentage_semi_grosir');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('items', function (Blueprint $table) {
            $table->dropColumn(['semi_grosir_price', 'tax_percentage_semi_grosir','pajak_luaran_semi_grosir']);
        });
    }
};
