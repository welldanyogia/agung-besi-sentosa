<?php

namespace App\Http\Controllers;

use App\Models\InvoiceItems;
use App\Models\Invoices;
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

        // === REVISI DI SINI ===
        // Pajak Masukan Total dari pembelian
        $pajakMasukanTotal = \App\Models\Pembelian::whereMonth('tanggal_pembelian', $month)
            ->sum('pajak_masukan');

        // Omset, Pajak Luaran, Omset Barang PPN & NonPPN
        $totalOmset = 0;
        $totalPajakLuaran = 0;
        $omsetBarangPPn = 0;
        $omsetBarangNonPPn = 0;

        foreach ($invoiceItems as $item) {
            $itemModel = $item->item;
            $subTotal = $item->sub_total;
            $isTax = $itemModel->is_tax ?? false;

            // Ambil tax rate sesuai price_type
            $taxRate = match ($item->price_type) {
                'retail' => $itemModel->tax_percentage_retail ?? 0,
                'grosir' => $itemModel->tax_percentage_wholesale ?? 0,
                'eceran' => $itemModel->tax_percentage_eceran ?? 0,
                'semi_grosir' => $itemModel->tax_percentage_semi_grosir ?? 0,
                default => 0,
            };

            $totalOmset += $subTotal;

            if ($isTax && $taxRate > 0) {
                $dpp = $subTotal / (1 + $taxRate / 100);
                $ppn = $subTotal - $dpp;

                $omsetBarangPPn += $subTotal;
                $totalPajakLuaran += $ppn;
            } else {
                $omsetBarangNonPPn += $subTotal;
            }
        }
        // === END REVISI ===

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
        $topProducts = InvoiceItems::selectRaw('item_id, price_type, SUM(qty) as total_qty')
            ->whereMonth('created_at', $month)
            ->groupBy('item_id', 'price_type') // karena price_type berpengaruh ke konversi
            ->orderByDesc('total_qty')
            ->with('item:id,item_name,retail_conversion,satuan') // ambil tambahan data untuk konversi
            ->get()
            ->map(function ($item) {
                $itemModel = $item->item;

                // Default qty
                $qty = $item->total_qty;

                // Konversi jika eceran
                if ($item->price_type === 'eceran' && $itemModel->retail_conversion) {
                    $qty = $qty / $itemModel->retail_conversion;
                }

                return [
                    'item_name' => $itemModel->item_name ?? 'N/A',
                    'total_qty' => round($qty, 2),
                    'unit' => $itemModel->satuan ?? '-', // tampilkan satuan utama
                ];
            })
            ->sortByDesc('total_qty')
            ->take(10)
            ->values();


        // Pajak Masukan Total dari pembelian
//        $pajakMasukanTotal = \App\Models\Pembelian::whereMonth('tanggal_pembelian', $month)
//            ->sum('pajak_masukan');

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
//        $outputTaxData = InvoiceItems::with('item')
//            ->whereYear('created_at', $year)
//            ->get()
//            ->groupBy(fn($item) => $item->created_at->format('Y-m'))
//            ->map(function ($group) {
//                $month = $group->first()->created_at->format('Y-m');
//                $outputTax = $group->sum(function ($item) {
//                    $itemModel = $item->item;
//                    $taxPerUnit = match ($item->price_type) {
//                        'wholesale', 'grosir' => $itemModel->pajak_luaran_wholesale ?? 0,
//                        'semi_grosir' => $itemModel->pajak_luaran_semi_grosir ?? 0,
//                        'retail' => $itemModel->pajak_luaran_retail ?? 0,
//                        'eceran' => $itemModel->pajak_luaran_eceran ?? 0,
//                        default => 0,
//                    };
//                    return $taxPerUnit * $item->qty;
//                });
//
//                return [
//                    'month' => $month,
//                    'outputTax' => $outputTax,
//                ];
//            });

        $outputTaxData = InvoiceItems::with('item')
            ->whereYear('created_at', $year)
            ->get()
            ->groupBy(fn($item) => $item->created_at->format('Y-m'))
            ->map(function ($group) {
                $month = $group->first()->created_at->format('Y-m');
                $outputTax = $group->sum(function ($item) {
                    $itemModel = $item->item;
                    $isTax = $itemModel->is_tax ?? false;

                    // Ambil tarif pajak sesuai price_type
                    $taxRate = match ($item->price_type) {
                        'retail' => $itemModel->tax_percentage_retail ?? 0,
                        'grosir' => $itemModel->tax_percentage_wholesale ?? 0,
                        'eceran' => $itemModel->tax_percentage_eceran ?? 0,
                        'semi_grosir' => $itemModel->tax_percentage_semi_grosir ?? 0,
                        default => 0,
                    };

                    if ($isTax && $taxRate > 0) {
                        $subTotal = $item->sub_total;
                        $dpp = $subTotal / (1 + $taxRate / 100);
                        $ppn = $subTotal - $dpp;
                        return $ppn;
                    } else {
                        return 0;
                    }
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

        $rekapPerItem = $invoiceItems->groupBy('item_id')->map(function ($items, $itemId) {
            $itemModel = $items->first()->item;
            $priceType = $items->first()->price_type;

            $totalQty = $items->sum(function ($item) use ($itemModel) {
                if ($item->price_type === 'eceran') {
                    // konversi eceran ke satuan utama
                    return $item->qty / ($itemModel->retail_conversion ?: 1); // hindari division by zero
                }
                return $item->qty;
            });

            // satuan utamanya selalu kolom 'satuan'
            $unit = $itemModel->satuan ?? '-';

            return [
                'name' => $itemModel->item_name ?? 'N/A',
                'sold' => round($totalQty, 2),
                'nominal' => $items->sum('sub_total'),
                'unit' => $unit,
                'is_tax' => $itemModel->is_tax,
            ];
        })->sortByDesc('sold')->values();

        $itemsWithTax = $rekapPerItem->filter(fn($item) => $item['is_tax'])->values();
        $itemsWithoutTax = $rekapPerItem->filter(fn($item) => !$item['is_tax'])->values();



        return Inertia::render('Dashboard/Dashboard', [
            'topProducts' => $topProducts,
            'invoiceItems' => $invoiceItems,
            'omset' => $totalOmset,
            'taxOutcome' => $totalPajakLuaran,
//            'totalProfit' => $totalProfit,
//            'totalCost' => $totalCost,
//            'dailyData' => $dailyData,
            'pajakMasukanTotal' => $pajakMasukanTotal,
            'rekapPerPriceType' => $rekapPerPriceType,
            'rekapPajak' => $rekapPajak,
            'dailyRekap' => $dailyRekap,
            'itemsWithTax' => $itemsWithTax,
            'itemsWithoutTax' => $itemsWithoutTax,
            'totalNominalNonPPN' => $omsetBarangNonPPn,
            'totalNominalPPN' => $omsetBarangPPn,
        ]);
    }

//    public function profitLossReport(Request $request)
//    {
//        $from = $request->input('from');
//        $to = $request->input('to');
//
//        $invoices = Invoices::with(['items.item'])
//            ->whereBetween('created_at', [$from, $to])
//            ->get();
//
//        $totalRevenueGross = 0;
//        $totalRevenueNet = 0;
//        $totalPPN = 0;
//        $totalHpp = 0;
//
//        foreach ($invoices as $invoice) {
//            foreach ($invoice->items as $invoiceItem) {
//                $item = $invoiceItem->item;
//                $qty = $invoiceItem->qty;
//                $price = $invoiceItem->price;
//                $subTotalPenjualan = $invoiceItem->sub_total; // Omzet penjualan (sudah termasuk PPN)
//                $subTotalHPP = $invoiceItem->subTotal;        // HPP per transaksi
//
//                // --- Pilih tax_percentage sesuai price_type
//                switch ($invoiceItem->price_type) {
//                    case 'retail':
//                        $ppnRate = $item->tax_percentage_retail ?? 0;
//                        break;
//                    case 'grosir':
//                        $ppnRate = $item->tax_percentage_wholesale ?? 0;
//                        break;
//                    case 'eceran':
//                        $ppnRate = $item->tax_percentage_eceran ?? 0;
//                        break;
//                    case 'semi_grosir':
//                        $ppnRate = $item->tax_percentage_semi_grosir ?? 0;
//                        break;
//                    default:
//                        $ppnRate = 0;
//                }
//
//                // --- Hitung omzet bersih & PPN
//                if ($ppnRate > 0) {
//                    $net = $subTotalPenjualan / (1 + ($ppnRate / 100));
//                    $ppn = $subTotalPenjualan - $net;
//                } else {
//                    $net = $subTotalPenjualan;
//                    $ppn = 0;
//                }
//
//                $totalRevenueGross += $subTotalPenjualan;
//                $totalRevenueNet += $net;
//                $totalPPN += $ppn;
//
//                // --- HPP langsung dari subTotal InvoiceItems
//                $totalHpp += $subTotalHPP;
//            }
//        }
//
//        $grossProfit = $totalRevenueNet - $totalHpp;
//
//        return response()->json([
//            'total_revenue_gross' => round($totalRevenueGross),
//            'total_revenue_net' => round($totalRevenueNet),
//            'total_ppn' => round($totalPPN),
//            'total_hpp' => round($totalHpp),
//            'gross_profit' => round($grossProfit),
//        ]);
//    }

    public function profitLossReport(Request $request)
    {
        // 1. Tentukan periode
        $from = $request->input('from');
        $to   = $request->input('to');
        if (! $from || ! $to) {
            $dt   = Carbon::create(
                $request->input('year', now()->year),
                $request->input('month', now()->month),
                1
            );
            $from = $dt->startOfMonth()->toDateString();
            $to   = $dt->endOfMonth()->toDateString();
        }

        // 2. Hitung agregat lewat Eloquent
        $row = InvoiceItems::query()
            ->join('invoices', 'invoice_items.invoice_id', '=', 'invoices.id')
            ->join('items',    'invoice_items.item_id',    '=', 'items.id')
            ->where('invoices.status', 'paid')
            ->whereDate('invoices.created_at', '>=', $from)
            ->whereDate('invoices.created_at', '<=', $to)
            ->selectRaw(implode("\n", [
                'ROUND(SUM(invoice_items.sub_total)) AS total_revenue_gross',
                ', ROUND(SUM( CASE',
                '    WHEN items.is_tax = 1',
                '         AND (CASE invoice_items.price_type',
                "             WHEN 'retail'      THEN COALESCE(items.tax_percentage_retail,0)",
                "             WHEN 'grosir'      THEN COALESCE(items.tax_percentage_wholesale,0)",
                "             WHEN 'eceran'      THEN COALESCE(items.tax_percentage_eceran,0)",
                "             WHEN 'semi_grosir' THEN COALESCE(items.tax_percentage_semi_grosir,0)",
                '             ELSE 0 END) > 0',
                '      THEN invoice_items.sub_total / (1 +',
                '           (CASE invoice_items.price_type',
                "               WHEN 'retail'      THEN COALESCE(items.tax_percentage_retail,0)",
                "               WHEN 'grosir'      THEN COALESCE(items.tax_percentage_wholesale,0)",
                "               WHEN 'eceran'      THEN COALESCE(items.tax_percentage_eceran,0)",
                "               WHEN 'semi_grosir' THEN COALESCE(items.tax_percentage_semi_grosir,0)",
                '               ELSE 0 END) / 100)',
                '    ELSE invoice_items.sub_total',
                'END )) AS total_revenue_net',
                ', ROUND(SUM( CASE',
                '    WHEN items.is_tax = 1',
                '         AND (CASE invoice_items.price_type',
                "             WHEN 'retail'      THEN COALESCE(items.tax_percentage_retail,0)",
                "             WHEN 'grosir'      THEN COALESCE(items.tax_percentage_wholesale,0)",
                "             WHEN 'eceran'      THEN COALESCE(items.tax_percentage_eceran,0)",
                "             WHEN 'semi_grosir' THEN COALESCE(items.tax_percentage_semi_grosir,0)",
                '             ELSE 0 END) > 0',
                '      THEN invoice_items.sub_total - (invoice_items.sub_total / (1 +',
                '           (CASE invoice_items.price_type',
                "               WHEN 'retail'      THEN COALESCE(items.tax_percentage_retail,0)",
                "               WHEN 'grosir'      THEN COALESCE(items.tax_percentage_wholesale,0)",
                "               WHEN 'eceran'      THEN COALESCE(items.tax_percentage_eceran,0)",
                "               WHEN 'semi_grosir' THEN COALESCE(items.tax_percentage_semi_grosir,0)",
                '               ELSE 0 END) / 100))',
                '    ELSE 0',
                'END )) AS total_ppn',
                ', ROUND(SUM( CASE',
                "    WHEN invoice_items.price_type = 'eceran' AND COALESCE(items.retail_conversion,0) > 0",
                '      THEN (items.price / items.retail_conversion) * invoice_items.qty',
                '    ELSE items.price * invoice_items.qty',
                'END )) AS total_hpp',
            ]))
            ->first();

        // 3. Hitung gross profit
        $grossProfit = round($row->total_revenue_net - $row->total_hpp);

        // 4. Kembalikan response JSON
        return response()->json([
            'total_revenue_gross' => (int) $row->total_revenue_gross,
            'total_revenue_net'   => (int) $row->total_revenue_net,
            'total_ppn'           => (int) $row->total_ppn,
            'total_hpp'           => (int) $row->total_hpp,
            'gross_profit'        => $grossProfit,
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
