"use client";
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Skeleton } from "@/Components/ui/skeleton";

// Helper: Dapatkan tanggal awal & akhir dari bulan ini
function getMonthStartEnd(year, month) {
    // month: 1-12
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    const to2 = v => v < 10 ? "0" + v : v;
    return {
        from: `${start.getFullYear()}-${to2(start.getMonth() + 1)}-01`,
        to: `${end.getFullYear()}-${to2(end.getMonth() + 1)}-${to2(end.getDate())}`,
    };
}

export default function ProfitLossReport({ thisMonth }) {
    const today = new Date();
    const thisYear = today.getFullYear();
    // Jika thisMonth tidak diberikan, fallback ke bulan sekarang
    const bulanSekarang = thisMonth ? Number(thisMonth) : today.getMonth() + 1;
    const { from: defaultFrom, to: defaultTo } = getMonthStartEnd(thisYear, bulanSekarang);

    const [dateRange, setDateRange] = useState({
        from: defaultFrom,
        to: defaultTo
    });
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);

    // Jika thisMonth berubah, reset range default sesuai bulan itu
    useEffect(() => {
        const { from, to } = getMonthStartEnd(thisYear, Number(thisMonth || bulanSekarang));
        setDateRange({ from, to });
    }, [thisMonth]);

    // Fetch data saat dari/ke berubah
    useEffect(() => {
        if (dateRange.from && dateRange.to) fetchReport(dateRange.from, dateRange.to);
        // eslint-disable-next-line
    }, [dateRange.from, dateRange.to]);

    const fetchReport = async (from, to) => {
        setLoading(true);
        setReport(null);
        try {
            const res = await fetch(`/api/reports/profit-loss?from=${from}&to=${to}`);
            const data = await res.json();
            setReport(data);
        } catch (e) {
            setReport(null);
        }
        setLoading(false);
    };

    return (
        <Card className="w-full mx-auto">
            <CardHeader>
                <CardTitle>Laporan Laba/Rugi</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap items-center gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        <span className="text-sm">Dari</span>
                        <Input
                            type="date"
                            value={dateRange.from}
                            onChange={e => setDateRange(dr => ({ ...dr, from: e.target.value }))}
                            className="w-[150px]"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm">Sampai</span>
                        <Input
                            type="date"
                            value={dateRange.to}
                            onChange={e => setDateRange(dr => ({ ...dr, to: e.target.value }))}
                            className="w-[150px]"
                        />
                    </div>
                </div>
                {loading && (
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                )}
                {report && (
                    <div className="w-full bg-muted/50 rounded-lg px-3 py-2 space-y-2 border">
                        <div className="flex justify-between py-1">
                            <span>Total Penjualan (Bruto / Termasuk PPN)</span>
                            <span className="font-medium">Rp {report.total_revenue_gross?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-1">
                            <span>PPN Keluaran</span>
                            <span className="font-medium">Rp {report.total_ppn?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-1">
                            <span>Penjualan Bersih (Omzet, sebelum PPN)</span>
                            <span className="font-medium">Rp {report.total_revenue_net?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-1">
                            <span>Total HPP</span>
                            <span className="font-medium">Rp {report.total_hpp?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-2 border-t font-bold">
                            <span>Laba Kotor</span>
                            <span>Rp {report.gross_profit?.toLocaleString()}</span>
                        </div>
                    </div>
                )}
                {!loading && !report && (
                    <div className="text-center text-muted-foreground mt-4">
                        Data tidak tersedia untuk rentang tanggal ini.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
