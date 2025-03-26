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
        Schema::create('items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('item_name')->unique();
            $table->string('item_code')->unique();
            $table->double('stock')->default(0);
            $table->double('price');
            $table->enum('satuan', ['Kg', 'Meter', 'Batang']);
            $table->uuid('category_id');
            $table->uuid('created_by');
            $table->timestamps();

            $table->foreign('category_id')->references('id')->on('categories')->cascadeOnDelete();
            $table->foreign('created_by')->references('id')->on('users')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('items');
    }
};
