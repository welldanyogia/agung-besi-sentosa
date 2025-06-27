'use client';

import React, { useState } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
} from '@tanstack/react-table';
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from '@/Components/ui/tabs'; // Sesuaikan path impor dengan proyek Anda

// Definisi kolom Penjualan
const columnsPenjualan = [
    { accessorKey: 'no', header: 'No' },
    { accessorKey: 'kodeBarang', header: 'Kode Barang' },
    { accessorKey: 'namaBarang', header: 'Nama Barang' },
    { accessorKey: 'kategori', header: 'Kategori' },
    { accessorKey: 'stokBarang', header: 'Stok Barang' },
    { accessorKey: 'satuan', header: 'Satuan' },
    { accessorKey: 'spesifikasi', header: 'Spesifikasi' },
    {
        accessorKey: 'hargaModal',
        header: 'Harga Modal',
        cell: info => `Rp ${info.getValue().toLocaleString()}`,
    },
    {
        accessorKey: 'hargaRetail',
        header: 'Harga Retail',
        cell: info => `Rp ${info.getValue().toLocaleString()}`,
    },
    {
        accessorKey: 'hargaGrosir',
        header: 'Harga Grosir',
        cell: info => `Rp ${info.getValue().toLocaleString()}`,
    },
    {
        accessorKey: 'hargaEceran',
        header: 'Harga Eceran',
        cell: info => `Rp ${info.getValue().toLocaleString()}`,
    },
    { accessorKey: 'tanggalInput', header: 'Tanggal Input' },
    { accessorKey: 'terakhirDiupdate', header: 'Terakhir diupdate' },
];

// Definisi kolom Pembelian
const columnsPembelian = [
    { accessorKey: 'no', header: 'No' },
    { accessorKey: 'kodeBarang', header: 'Kode Barang' },
    { accessorKey: 'namaBarang', header: 'Nama Barang' },
    { accessorKey: 'kategori', header: 'Kategori' },
    { accessorKey: 'qty', header: 'QTY' },
    { accessorKey: 'satuan', header: 'Satuan' },
    { accessorKey: 'spesifikasi', header: 'Spesifikasi' },
    {
        accessorKey: 'harga',
        header: 'Harga',
        cell: info => `Rp ${info.getValue().toLocaleString()}`,
    },
    {
        accessorKey: 'pajak',
        header: 'Pajak',
        cell: info => `Rp ${info.getValue().toLocaleString()}`,
    },
    {
        accessorKey: 'persentasePajak',
        header: 'Persentase Pajak',
        cell: info => `${info.getValue()}%`,
    },
    {
        accessorKey: 'pajakMasukan',
        header: 'Pajak Masukan',
        cell: info => `Rp ${info.getValue().toLocaleString()}`,
    },
    {
        accessorKey: 'hargaTotal',
        header: 'Harga Total',
        cell: info => `Rp ${info.getValue().toLocaleString()}`,
    },
    { accessorKey: 'tanggalInput', header: 'Tanggal Input' },
    { accessorKey: 'terakhirDiupdate', header: 'Terakhir diupdate' },
];

// Dummy data Penjualan
const dataPenjualan = [
    {
        no: 1,
        kodeBarang: 'KB001',
        namaBarang: 'Produk A',
        kategori: 'Elektronik',
        stokBarang: 50,
        satuan: 'pcs',
        spesifikasi: 'Spesifikasi A',
        hargaModal: 30000,
        hargaRetail: 45000,
        hargaGrosir: 40000,
        hargaEceran: 47000,
        tanggalInput: '2025-06-01',
        terakhirDiupdate: '2025-06-05',
    },
    {
        no: 2,
        kodeBarang: 'KB002',
        namaBarang: 'Produk B',
        kategori: 'Peralatan',
        stokBarang: 30,
        satuan: 'pcs',
        spesifikasi: 'Spesifikasi B',
        hargaModal: 20000,
        hargaRetail: 35000,
        hargaGrosir: 32000,
        hargaEceran: 36000,
        tanggalInput: '2025-06-02',
        terakhirDiupdate: '2025-06-05',
    },
];

// Dummy data Pembelian
const dataPembelian = [
    {
        no: 1,
        kodeBarang: 'KB001',
        namaBarang: 'Produk A',
        kategori: 'Elektronik',
        qty: 100,
        satuan: 'pcs',
        spesifikasi: 'Spesifikasi A',
        harga_beli: 28000,
        pajak: 2800,
        persentasePajak: 10,
        pajakMasukan: 2800,
        hargaTotal: 30800,
        tanggalInput: '2025-05-25',
        terakhirDiupdate: '2025-06-01',
    },
    {
        no: 2,
        kodeBarang: 'KB003',
        namaBarang: 'Produk C',
        kategori: 'Peralatan',
        qty: 50,
        satuan: 'pcs',
        spesifikasi: 'Spesifikasi C',
        harga_beli: 15000,
        pajak: 1500,
        persentasePajak: 10,
        pajakMasukan: 1500,
        hargaTotal: 16500,
        tanggalInput: '2025-05-26',
        terakhirDiupdate: '2025-06-02',
    },
];

// Komponen tabel reusable
function InventoryTable({ data, columns }) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="overflow-x-auto rounded-md border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                            <th
                                key={header.id}
                                className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                            >
                                {header.isPlaceholder
                                    ? null
                                    : flexRender(header.column.columnDef.header, header.getContext())}
                            </th>
                        ))}
                    </tr>
                ))}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {table.getRowModel().rows.length === 0 && (
                    <tr>
                        <td colSpan={columns.length} className="text-center py-4 text-gray-500">
                            Tidak ada data
                        </td>
                    </tr>
                )}
                {table.getRowModel().rows.map(row => (
                    <tr key={row.id} className="hover:bg-gray-50">
                        {row.getVisibleCells().map(cell => (
                            <td
                                key={cell.id}
                                className="px-4 py-2 whitespace-nowrap text-sm text-gray-700"
                            >
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

// Komponen utama dengan Tabs
export default function InventoryTabs() {
    const [tabValue, setTabValue] = useState('penjualan');

    return (
        <div className="w-full max-w-7xl mx-auto p-4">
            <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
                <TabsList>
                    <TabsTrigger value="penjualan">Penjualan</TabsTrigger>
                    <TabsTrigger value="pembelian">Pembelian</TabsTrigger>
                </TabsList>

                <TabsContent value="penjualan" className="mt-4">
                    <InventoryTable data={dataPenjualan} columns={columnsPenjualan} />
                </TabsContent>

                <TabsContent value="pembelian" className="mt-4">
                    <InventoryTable data={dataPembelian} columns={columnsPembelian} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
