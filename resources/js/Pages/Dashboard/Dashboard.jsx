import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {Head, router} from '@inertiajs/react';
import {ChartContainer, ChartTooltip, ChartTooltipContent} from "@/Components/ui/chart.jsx";
import {Bar, BarChart, CartesianGrid, XAxis, YAxis} from "recharts";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/Components/ui/card.jsx";
import {useState} from "react";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/Components/ui/select.jsx";
import {SalesTrenChart} from "@/Components/Dashboard/Chart/SalesTrenChart.jsx";
import {TaxOmsetProfitChart} from "@/Components/Dashboard/Chart/TaxOmsetProfitChart.jsx";
import {TaxInputOutputChart} from "@/Components/Dashboard/Chart/TaxInputOutputChart.jsx";
import ChartPieSalesTransactionTypes from "@/Components/Dashboard/Chart/ChartPieSalesTransactionTypes.jsx";
import PPnBarChart from "@/Components/Dashboard/Chart/PPnBarChart.jsx";
import ProfitLossReport from "@/Components/Dashboard/ProfitLossReport.jsx";


export default function Dashboard({
                                      auth,
                                      topProducts,
                                      omset,
                                      taxOutcome,
                                      pajakMasukanTotal,
                                      rekapPerPriceType,
                                      rekapPajak,
                                      dailyRekap,
                                      itemsWithTax,
                                      itemsWithoutTax,
                                  }) {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // default bulan ini
    const topProductsDummy = [
        {
            date: "2024-06-01",
            omset: 1200000,
            tax: 120000,
            profit: 300000,
        },
        {
            date: "2024-06-02",
            omset: 1000000,
            tax: 100000,
            profit: 250000,
        },
        {
            date: "2024-06-03",
            omset: 1500000,
            tax: 150000,
            profit: 400000,
        },
        {
            date: "2024-06-04",
            omset: 900000,
            tax: 90000,
            profit: 200000,
        },
        {
            date: "2024-06-05",
            omset: 1700000,
            tax: 170000,
            profit: 500000,
        },
        {
            date: "2024-06-06",
            omset: 1300000,
            tax: 130000,
            profit: 330000,
        },
        {
            date: "2024-06-07",
            omset: 1100000,
            tax: 110000,
            profit: 290000,
        },
        {
            date: "2024-06-08",
            omset: 1600000,
            tax: 160000,
            profit: 450000,
        },
        {
            date: "2024-06-09",
            omset: 1400000,
            tax: 140000,
            profit: 380000,
        },
        {
            date: "2024-06-10",
            omset: 1800000,
            tax: 180000,
            profit: 520000,
        },
    ]
    const totalNominalNonPPN = itemsWithoutTax.reduce((sum, item) => sum + item.nominal, 0)
    const totalNominalPPN = itemsWithTax.reduce((sum, item) => sum + item.nominal, 0)
    // const totalNominalNonPPN = itemsWithoutTax
    // const totalNominalPPN = itemsWithTax


    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(angka)
    }
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl flex justify-between font-semibold leading-tight text-gray-800">
                    Dashboard
                    <div className="flex justify-end mb-4 w-fit">
                        <Select
                            value={String(selectedMonth)}
                            onValueChange={(value) => {
                                setSelectedMonth(Number(value));
                                router.get(route("dashboard"), {month: value}, {preserveState: true});
                            }}
                        >
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Pilih Bulan"/>
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({length: 12}, (_, i) => i + 1).map((month) => (
                                    <SelectItem key={month} value={String(month)}>
                                        {new Date(0, month - 1).toLocaleString("id-ID", {month: "long"})}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </h2>
            }
        >
            <Head title="Dashboard"/>

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden space-y-6 px-6 shadow-sm sm:rounded-lg">
                        <div className="flex flex-wrap gap-6 w-full max-sm:flex-col">
                            {[ // Array of all card data
                                {
                                    title: "Omset",
                                    desc: "Total uang masuk dari penjualan.",
                                    value: formatRupiah(omset),
                                },
                                {
                                    title: "Pajak Masukan",
                                    desc: "Pajak yang dibayar saat beli barang.",
                                    value: formatRupiah(pajakMasukanTotal),
                                },
                                {
                                    title: "Pajak Luaran",
                                    desc: "Pajak yang ditarik saat jual barang.",
                                    value: formatRupiah(taxOutcome),
                                },
                                {
                                    title: "Barang Non PPn",
                                    desc: "Omset dari barang tanpa pajak (non-PPn).",
                                    value: formatRupiah(totalNominalNonPPN),
                                },
                                {
                                    title: "Omset Barang PPn",
                                    desc: "Omset dari barang kena pajak (PPn).",
                                    value: formatRupiah(totalNominalPPN),
                                },
                            ].map((card, index) => (
                                <Card key={index} className="flex-1 basis-[calc(33.333%-1rem)] p-4 min-w-[280px]">
                                    <div className="text-xl">
                                        <div className="font-bold">{card.title}</div>
                                        <span className="text-sm">{card.desc}</span>
                                    </div>
                                    <div className="text-2xl font-bold">{card.value}</div>
                                </Card>
                            ))}
                        </div>

                        <div className={'flex gap-2'}>
                            <ProfitLossReport thisMonth={selectedMonth}/>

                        </div>
                        <div className={'flex gap-2'}>
                            <TaxInputOutputChart rekapPajak={rekapPajak}/>
                            <ChartPieSalesTransactionTypes month={selectedMonth} rekapPerPriceType={rekapPerPriceType}/>
                        </div>
                        <SalesTrenChart topProducts={topProducts} setSelectedMonth={setSelectedMonth}
                                        selectedMonth={selectedMonth}/>
                        <TaxOmsetProfitChart topProducts={dailyRekap} setSelectedMonth={setSelectedMonth}
                                             selectedMonth={selectedMonth}/>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <PPnBarChart month={selectedMonth} item={itemsWithTax} ppn={true}/>
                            </div>
                            <div className="flex-1">
                                <PPnBarChart month={selectedMonth} item={itemsWithoutTax} ppn={false}/>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
