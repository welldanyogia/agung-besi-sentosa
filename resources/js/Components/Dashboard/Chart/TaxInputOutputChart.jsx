"use client"
import * as React from "react"
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
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

// Helper agar date selalu urut
function sortByMonth(a, b) {
    return a.date.localeCompare(b.date)
}

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

export function TaxInputOutputChart({ rekapPajak }) {
    const rekapPajakDummy = [
        { date: "2025-01", inputTax: 5000000,  outputTax: 12000000 },
        { date: "2025-02", inputTax: 7000000,  outputTax: 11000000 },
        { date: "2025-03", inputTax: 4500000,  outputTax: 15000000 },
        { date: "2025-04", inputTax: 6000000,  outputTax: 13000000 },
        { date: "2025-05", inputTax: 0,        outputTax: 10000000 },    // bulan tanpa input tax
        { date: "2025-06", inputTax: 8000000,  outputTax: 17000000 },
        { date: "2025-07", inputTax: 3000000,  outputTax: 9500000 },
        { date: "2025-08", inputTax: 0,        outputTax: 9000000 },     // bulan tanpa input tax
        { date: "2025-09", inputTax: 7500000,  outputTax: 12000000 },
        { date: "2025-10", inputTax: 4000000,  outputTax: 10500000 },
        { date: "2025-11", inputTax: 9000000,  outputTax: 13500000 },
        { date: "2025-12", inputTax: 8500000,  outputTax: 12500000 },
    ]

    // Urutkan bulan ASC
    const sortedData = React.useMemo(() => {
        return [...rekapPajak].sort(sortByMonth)
    }, [rekapPajak])

    // Set null untuk value 0 supaya tidak muncul area dari sumbu X
    const sanitizedData = React.useMemo(() =>
            sortedData.map((d) => ({
                ...d,
                inputTax: d.inputTax === 0 ? null : d.inputTax,
                outputTax: d.outputTax === 0 ? null : d.outputTax,
            })),
        [sortedData]
    );

    return (
        <Card className="pt-0 w-full max-w-3xl mx-auto">
            <CardHeader className="pb-4">
                <CardTitle>Rekap Pajak Bulanan</CardTitle>
                <CardDescription>
                    Akumulasi pajak masukan dan keluaran per bulan
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height={350}>
                        <AreaChart data={sortedData}>
                            <defs>
                                <linearGradient id="fillInputTax" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="fillOutputTax" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={32}
                                tickFormatter={value => {
                                    const [year, month] = value.split("-")
                                    return new Date(Number(year), Number(month) - 1).toLocaleString("id-ID", { month: "short" })
                                }}
                            />
                            <YAxis
                                stroke="var(--muted-foreground)"
                                tickFormatter={value => `Rp${(value / 1000000).toFixed(0)}jt`}
                                axisLine={false}
                                tickLine={false}
                            />
                            <ChartTooltip
                                cursor={true}
                                content={(props) => (
                                    <ChartTooltipContent
                                        {...props}
                                        indicator="dot"
                                        labelFormatter={(value) => {
                                            // value = "2025-06"
                                            const [year, month] = value.split("-");
                                            return new Date(Number(year), Number(month) - 1).toLocaleString("id-ID", {
                                                month: "long",
                                                year: "numeric"
                                            });
                                        }}
                                        formatter={(value, name) => {
                                            let label = "";
                                            if (name === "inputTax") label = "Pajak Masukan:";
                                            if (name === "outputTax") label = "Pajak Keluaran:";
                                            return [
                                                <span
                                                    key="dot"
                                                    style={{
                                                        display: "inline-block",
                                                        width: 10,
                                                        height: 10,
                                                        borderRadius: "50%",
                                                        background: name === "inputTax"
                                                            ? "hsl(var(--chart-1))"
                                                            : "hsl(var(--chart-2))",
                                                        marginRight: 6,
                                                        verticalAlign: "middle"
                                                    }}
                                                />,
                                                <span key="label">{label}</span>,
                                                <span key="value" style={{ marginLeft: 8 }}>
            {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
            }).format(value)}
        </span>
                                            ];
                                        }}

                                    />
                                )}
                            />
                            <Area
                                dataKey="inputTax"
                                type="monotone"
                                stackId={'a'}
                                fill="url(#fillInputTax)"
                                stroke="hsl(var(--chart-1))"
                                // activeDot={{ r: 6 }}
                                // dot={{ r: 4 }}
                                // Tidak perlu stackId kalau tidak mau digabung
                            />
                            <Area
                                dataKey="outputTax"
                                type="monotone"
                                stackId={'a'}
                                fill="url(#fillOutputTax)"
                                stroke="hsl(var(--chart-2))"
                                // activeDot={{ r: 6 }}
                                // dot={{ r: 4 }}
                                // Tidak perlu stackId kalau tidak mau digabung
                            />
                            <ChartLegend content={<ChartLegendContent />} />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
