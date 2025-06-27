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
            $table->decimal('pajak_luaran_retail', 12, 2)->nullable()->after('eceran_price');
            $table->decimal('pajak_luaran_wholesale', 12, 2)->nullable()->after('pajak_luaran_retail');
            $table->decimal('pajak_luaran_eceran', 12, 2)->nullable()->after('pajak_luaran_wholesale');

            $table->decimal('tax_percentage_retail', 5, 2)->nullable()->after('pajak_luaran_eceran');
            $table->decimal('tax_percentage_wholesale', 5, 2)->nullable()->after('tax_percentage_retail');
            $table->decimal('tax_percentage_eceran', 5, 2)->nullable()->after('tax_percentage_wholesale');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('items', function (Blueprint $table) {
            $table->dropColumn([
                'pajak_luaran_retail',
                'pajak_luaran_wholesale',
                'pajak_luaran_eceran',
                'tax_percentage_retail',
                'tax_percentage_wholesale',
                'tax_percentage_eceran',
            ]);
        });
    }
};
