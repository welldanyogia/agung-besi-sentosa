<?php

namespace App\Http\Controllers;

use App\Models\InvoiceItems;
use App\Models\Pembelian;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $month = $request->input('month', now()->month);

        // Ambil semua invoice item pada bulan yang dipilih
        $invoiceItems = InvoiceItems::with(['item'])
            ->whereMonth('created_at', $month)
            ->get();

//
        $rekapPerPriceType = $invoiceItems->groupBy('price_type')->map(function ($items, $type) {
            $fill='';
            switch ($type) {
                case 'retail':
                    $type = 'Retail';
                    $fill= "hsl(var(--chart-1))";
                    break;
                case 'grosir':
                    $type = 'Grosir';
                    $fill= "hsl(var(--chart-3))";
                    break;
                case 'semi_grosir':
                    $type = 'Semi Grosir';
                    $fill= "hsl(var(--chart-2))";
                    break;
                case 'eceran':
                    $type = 'Eceran';
                    $fill= "hsl(var(--chart-4))";
                    break;

            }
            return [
                'jenis' => $type,
                'jumlah' => $items->count(),     // jumlah baris transaksi
                'jumlah_item' => $items->sum('qty'),       // total quantity
                'fill' => $fill,
            ];
        })->values();


        // Omset total (bulan)
        $omset = $invoiceItems->sum('sub_total');

        // Total Cost (bulan)
//        $totalCost = $invoiceItems->sum(function ($item) {
//            $itemModel = $item->item;
//            $costPerItem = $itemModel->price;
//            $qty = $item->qty;
//            $total = $costPerItem * $qty;
//
//            Log::info('Calculating cost for item', [
//                'item_id' => $itemModel->id,
//                'item_name' => $itemModel->item_name ?? 'Unknown',
//                'price' => $costPerItem,
//                'qty' => $qty,
//                'total_cost' => $total,
//            ]);
//
//            return $total;
//        });

        // Total Pajak (bulan)
        $taxOutcome = $invoiceItems->sum(function ($item) {
            $itemModel = $item->item;
            if (!$itemModel || !$itemModel->is_tax) {
                return 0;
            }

            $tax = match ($item->price_type) {
                'retail' => $itemModel->pajak_luaran_retail,
                'grosir' => $itemModel->pajak_luaran_wholesale,
                'eceran' => $itemModel->pajak_luaran_eceran,
                'semi_grosir' => $itemModel->pajak_luaran_semi_grosir,
                default => 0,
            };

            return $tax * $item->qty;
        });


        // Total Profit (bulan)
//        $totalProfit = $omset - $totalCost - $taxOutcome;

        // === 🟢 Per Hari Chart Data ===
//        $dailyData = InvoiceItems::with('item')
//            ->whereMonth('created_at', $month)
//            ->get()
//            ->groupBy(function ($item) {
//                return $item->created_at->format('Y-m-d');
//            })
//            ->map(function ($items, $date) {
//                $omset = $items->sum('sub_total');
//
//                $totalCost = $items->sum(function ($item) {
//                    return $item->item->price * $item->qty;
//                });
//
//                $totalTax = $items->sum(function ($item) {
//                    return ($item->item->is_tax && $item->item->tax > 0)
//                        ? $item->item->tax * $item->qty
//                        : 0;
//                });
//
//                $profit = $omset - $totalCost - $totalTax;
//
//                return [
//                    'date' => $date,
//                    'omset' => $omset,
//                    'tax' => $totalTax,
//                    'profit' => $profit,
//                ];
//            })->values(); // agar jadi array indexed

        // Top Produk
        $topProducts = InvoiceItems::selectRaw('item_id, SUM(qty) as total_qty')
            ->whereMonth('created_at', $month)
            ->groupBy('item_id')
            ->orderByDesc('total_qty')
            ->with('item:id,item_name')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'item_name' => $item->item->item_name ?? 'N/A',
                    'total_qty' => $item->total_qty,
                ];
            });

        // Pajak Masukan Total dari pembelian
        $pajakMasukanTotal = \App\Models\Pembelian::whereMonth('tanggal_pembelian', $month)
            ->sum('pajak_masukan');

        $year = $request->input('year', now()->year);

        // Pajak Masukan (group by bulan)
        $inputTaxData = Pembelian::whereYear('tanggal_pembelian', $year)
            ->get()
            ->groupBy(fn($row) => $row->tanggal_pembelian->format('Y-m'))
            ->map(fn($group) => [
                'month' => $group->first()->tanggal_pembelian->format('Y-m'),
                'inputTax' => $group->sum('pajak_masukan'),
            ]);

        // Pajak Luaran (group by bulan)
        $outputTaxData = InvoiceItems::with('item')
            ->whereYear('created_at', $year)
            ->get()
            ->groupBy(fn($item) => $item->created_at->format('Y-m'))
            ->map(function ($group) {
                $month = $group->first()->created_at->format('Y-m');
                $outputTax = $group->sum(function ($item) {
                    $itemModel = $item->item;
                    $taxPerUnit = match ($item->price_type) {
                        'wholesale', 'grosir' => $itemModel->pajak_luaran_wholesale ?? 0,
                        'semi_grosir' => $itemModel->pajak_luaran_semi_grosir ?? 0,
                        'retail' => $itemModel->pajak_luaran_retail ?? 0,
                        'eceran' => $itemModel->pajak_luaran_eceran ?? 0,
                        default => 0,
                    };
                    return $taxPerUnit * $item->qty;
                });

                return [
                    'month' => $month,
                    'outputTax' => $outputTax,
                ];
            });

        // Gabungkan berdasarkan bulan
        $allMonths = $inputTaxData->keys()->merge($outputTaxData->keys())->unique()->sort();

        $rekapPajak = $allMonths->map(function ($month) use ($inputTaxData, $outputTaxData) {
            return [
                'date' => $month,
                'inputTax' => $inputTaxData[$month]['inputTax'] ?? 0,
                'outputTax' => $outputTaxData[$month]['outputTax'] ?? 0,
            ];
        })->values();

        $dailyRekap = InvoiceItems::with('item')
            ->whereMonth('created_at', $month)
            ->get()
            ->groupBy(fn($item) => $item->created_at->format('Y-m-d'))
            ->map(function ($items, $date) {
                $omset = $items->sum('sub_total');

                $tax = $items->sum(function ($item) {
                    $itemModel = $item->item;

                    if (!$itemModel || !$itemModel->is_tax) {
                        return 0;
                    }

                    $taxPerUnit = match ($item->price_type) {
                        'wholesale', 'grosir' => $itemModel->pajak_luaran_wholesale ?? 0,
                        'semi_grosir' => $itemModel->pajak_luaran_semi_grosir ?? 0,
                        'retail' => $itemModel->pajak_luaran_retail ?? 0,
                        'eceran' => $itemModel->pajak_luaran_eceran ?? 0,
                        default => 0,
                    };

                    return $taxPerUnit * $item->qty;
                });

                return [
                    'date' => $date,
                    'omset' => $omset,
                    'tax' => $tax,
                ];
            })->values();



        return Inertia::render('Dashboard/Dashboard', [
            'topProducts' => $topProducts,
            'invoiceItems' => $invoiceItems,
            'omset' => $omset,
            'taxOutcome' => $taxOutcome,
//            'totalProfit' => $totalProfit,
//            'totalCost' => $totalCost,
//            'dailyData' => $dailyData,
            'pajakMasukanTotal' => $pajakMasukanTotal,
            'rekapPerPriceType' => $rekapPerPriceType,
            'rekapPajak' => $rekapPajak,
            'dailyRekap' => $dailyRekap,
        ]);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
