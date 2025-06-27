"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Skeleton } from "@/Components/ui/skeleton";

// helper untuk format Rupiah
const formatRupiah = (n) => n?.toLocaleString("id-ID") ?? '0';

export default function ProfitLossReport({ thisMonth }) {
    const today      = new Date();
    const year       = today.getFullYear();
    const monthNum   = thisMonth ? Number(thisMonth) : today.getMonth() + 1;
    const pad        = v => String(v).padStart(2, "0");
    const defaultFrom = `${year}-${pad(monthNum)}-01`;
    const defaultTo   = `${year}-${pad(monthNum)}-${pad(new Date(year, monthNum, 0).getDate())}`;

    const [range, setRange]   = useState({ from: defaultFrom, to: defaultTo });
    const [report, setReport] = useState(null);
    const [loading, setLoad]  = useState(false);

    useEffect(() => {
        setRange({
            from: `${year}-${pad(monthNum)}-01`,
            to: `${year}-${pad(monthNum)}-${pad(new Date(year, monthNum, 0).getDate())}`
        });
    }, [thisMonth]);

    useEffect(() => {
        async function fetchData() {
            setLoad(true);
            try {
                const res = await fetch(`/api/reports/profit-loss?from=${range.from}&to=${range.to}`);
                const data = await res.json();
                setReport(data);
            } catch {
                setReport(null);
            }
            setLoad(false);
        }
        fetchData();
    }, [range]);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Laporan Laba Kotor</CardTitle>
            </CardHeader>
            <CardContent>
                {/* Pilih tanggal */}
                <div className="flex gap-4 mb-4">
                    {["from","to"].map((f) => (
                        <div key={f} className="flex items-center gap-2">
                            <span className="text-sm">{f === "from" ? "Dari" : "Sampai"}</span>
                            <Input
                                type="date"
                                value={range[f]}
                                onChange={e => setRange(r => ({ ...r, [f]: e.target.value }))}
                                className="w-[150px]"
                            />
                        </div>
                    ))}
                </div>

                {/* Loading skeleton */}
                {loading && (
                    <div className="space-y-2">
                        {[...Array(5)].map((_,i) => <Skeleton key={i} className="h-6 w-full" />)}
                    </div>
                )}

                {/* Hasil laporan */}
                {report && !loading && (
                    <div className="space-y-2 bg-muted/50 p-4 rounded-lg border">
                        <div className="flex justify-between">
                            <span>Total Penjualan (Bruto)</span>
                            <span>Rp {formatRupiah(report.total_revenue_gross)}</span>
                        </div>
                        {/*<div className="flex justify-between">*/}
                        {/*    <span>PPN Keluaran</span>*/}
                        {/*    <span>Rp {formatRupiah(report.total_ppn)}</span>*/}
                        {/*</div>*/}
                        {/*<div className="flex justify-between">*/}
                        {/*    <span>Penjualan Bersih (Net Revenue)</span>*/}
                        {/*    <span>Rp {formatRupiah(report.total_revenue_net)}</span>*/}
                        {/*</div>*/}
                        <div className="flex justify-between">
                            <span>Harga Pokok Penjualan (HPP)</span>
                            <span>Rp {formatRupiah(report.total_hpp+report.total_ppn)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t font-bold">
                            <span>Laba Kotor</span>
                            <span>Rp {formatRupiah(report.total_revenue_gross-(report.total_hpp+report.total_ppn))}</span>
                        </div>
                    </div>
                )}

                {/* Fallback jika data kosong */}
                {!loading && !report && (
                    <div className="text-center text-muted-foreground mt-4">
                        Data tidak tersedia untuk rentang tanggal ini.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
