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
        Schema::create('invoices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('invoice_code');
            $table->string('customer_name')->nullable();
            $table->double('total_price');
            $table->string('payment')->nullable();
            $table->double('bayar');
            $table->double('kembalian');
            $table->enum('status', ['pending', 'paid', 'canceled'])->default('pending');
            $table->uuid('created_by');
            $table->timestamps();

            $table->foreign('created_by')->references('id')->on('users')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
