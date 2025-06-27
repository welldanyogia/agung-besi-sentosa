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
        Schema::create('pembelians', function (Blueprint $table) {
                $table->id();
                $table->string('kode_barang');
                $table->string('nama_barang');
                $table->string('kategori');
                $table->integer('qty');
                $table->string('satuan');
                $table->decimal('harga', 15, 2);
                $table->decimal('pajak', 15, 2);
                $table->decimal('persentase_pajak', 5, 2);
                $table->decimal('pajak_masukan', 15, 2);
                $table->decimal('harga_total', 15, 2);
                $table->date('tanggal_pembelian');
                $table->timestamp('created_at');
                $table->timestamp('updated_at');
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pembelians');
    }
};
