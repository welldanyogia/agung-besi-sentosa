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
            $table->decimal('retail_price', 10, 2)->nullable()->after('price');
            $table->decimal('wholesale_price', 10, 2)->nullable()->after('retail_price');
            $table->boolean('is_retail')->default(false)->after('wholesale_price');
            $table->string('retail_unit')->nullable()->after('is_retail');
            $table->string('bulk_unit')->nullable()->after('retail_unit');
            $table->text('retail_spec')->nullable()->after('bulk_unit');
            $table->text('bulk_spec')->nullable()->after('retail_spec');

            // Stok dalam satuan grosir
            $table->double('bulk_stock')->default(0)->after('stock');

            // Konversi dari grosir ke eceran (misal: 1 box = 12 pcs)
            $table->integer('retail_conversion')->nullable()->after('bulk_stock');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('items', function (Blueprint $table) {
            $table->dropColumn([
                'retail_price', 'wholesale_price', 'is_retail',
                'retail_unit', 'bulk_unit', 'retail_spec', 'bulk_spec',
                'bulk_stock', 'retail_conversion'
            ]);
        });
    }
};
