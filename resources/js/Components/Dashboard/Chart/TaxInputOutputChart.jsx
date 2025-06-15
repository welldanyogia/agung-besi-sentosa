"use client"

import * as React from "react"
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card"
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/Components/ui/chart"

const chartData = [
    { date: "2024-04-01", inputTax: 1200000, outputTax: 900000 },
    { date: "2024-04-05", inputTax: 1850000, outputTax: 1400000 },
    { date: "2024-04-10", inputTax: 980000, outputTax: 760000 },
    { date: "2024-04-15", inputTax: 2000000, outputTax: 1700000 },
    { date: "2024-04-20", inputTax: 1300000, outputTax: 1000000 },
    { date: "2024-05-01", inputTax: 1500000, outputTax: 1200000 },
    { date: "2024-05-10", inputTax: 2200000, outputTax: 2000000 },
    { date: "2024-05-20", inputTax: 1750000, outputTax: 1500000 },
    { date: "2024-05-30", inputTax: 1100000, outputTax: 900000 },
    { date: "2024-06-01", inputTax: 1950000, outputTax: 1800000 },
    { date: "2024-06-10", inputTax: 2400000, outputTax: 2100000 },
    { date: "2024-06-20", inputTax: 1350000, outputTax: 1100000 },
    { date: "2024-06-30", inputTax: 2500000, outputTax: 2300000 },
]

const chartConfig = {
    inputTax: {
        label: "Pajak Masukan",
        color: "hsl(var(--chart-1))",
    },
    outputTax: {
        label: "Pajak Keluaran",
        color: "hsl(var(--chart-2))",
    },
}

function groupDataMonthly(data) {
    const result = []

    data.forEach((item) => {
        const date = new Date(item.date)
        const monthKey = `${date.getFullYear()}-${String(
            date.getMonth() + 1
        ).padStart(2, "0")}`

        const existing = result.find((r) => r.month === monthKey)
        if (existing) {
            existing.inputTax += item.inputTax
            existing.outputTax += item.outputTax
        } else {
            result.push({
                month: monthKey,
                inputTax: item.inputTax,
                outputTax: item.outputTax,
            })
        }
    })

    return result
}

function formatRupiah(value) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(value)
}

export function TaxInputOutputChart({rekapPajak}) {
    const monthlyData = groupDataMonthly(rekapPajak)
    console.log(rekapPajak)

    return (
        <Card className="pt-0 w-2/3">
            <CardHeader className="pb-4">
                <CardTitle>Rekap Pajak Bulanan</CardTitle>
                <CardDescription>
                    Akumulasi pajak masukan dan keluaran per bulan
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer className="aspect-auto h-[250px] w-full" config={chartConfig}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={rekapPajak}>
                            <defs>
                                <linearGradient id="colorInput" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={chartConfig.inputTax.color} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={chartConfig.inputTax.color} stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={chartConfig.outputTax.color} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={chartConfig.outputTax.color} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="date"
                                stroke="var(--muted-foreground)"
                                tickFormatter={(month) => {
                                    const [year, monthNumber] = month.split("-");
                                    const date = new Date(Number(year), Number(monthNumber) - 1);
                                    return date.toLocaleString("id-ID", { month: "long" }); // "April"
                                }}
                            />


                            <YAxis
                                stroke="var(--muted-foreground)"
                                tickFormatter={(value) => `Rp${value / 1000000}jt`}
                            />
                            <CartesianGrid strokeDasharray="3 3" />
                            <ChartTooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent
                                        labelFormatter={(value) =>
                                            new Date(value).toLocaleDateString("id-ID", {
                                                month: "long",
                                            })
                                        }
                                        indicator="dot"
                                        formatter={(value, name) => {
                                            let label = "";
                                            if (name === "inputTax") label = "Pajak Masukan:";
                                            if (name === "outputTax") label = "Pajak Keluaran:";

                                            const formattedValue = new Intl.NumberFormat("id-ID", {
                                                style: "currency",
                                                currency: "IDR",
                                            }).format(value);

                                            // Gabungkan dengan jarak menggunakan spasi atau element array
                                            return [
                                                label,
                                                <span style={{ marginLeft: 8 }}>{formattedValue}</span>,
                                            ];
                                        }}
                                    />
                                }
                            />

                            <Area
                                type="monotone"
                                dataKey="inputTax"
                                stroke={chartConfig.inputTax.color}
                                fillOpacity={1}
                                fill="url(#colorInput)"
                            />
                            <Area
                                type="monotone"
                                dataKey="outputTax"
                                stroke={chartConfig.outputTax.color}
                                fillOpacity={1}
                                fill="url(#colorOutput)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                    <ChartLegend content={<ChartLegendContent />} />

                </ChartContainer>
            </CardContent>
        </Card>
    )
}
