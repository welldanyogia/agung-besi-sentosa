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
            $table->decimal('reseller_price', 15, 2)->nullable()->after('semi_grosir_price');
            $table->decimal('tax_percentage_reseller', 5, 2)->nullable()->after('reseller_price');
            $table->decimal('pajak_luaran_reseller', 12, 2)->nullable()->after('tax_percentage_reseller');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('items', function (Blueprint $table) {
            $table->dropColumn([
                'reseller_price',
                'tax_percentage_reseller',
                'pajak_luaran_reseller',
            ]);
        });
    }
};
