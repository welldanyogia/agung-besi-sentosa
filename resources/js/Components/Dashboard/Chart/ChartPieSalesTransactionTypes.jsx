"use client"

import {LabelList, Pie, PieChart} from "recharts"
import {
    Card,
    CardContent,
    CardDescription, CardFooter,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card"
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent, ChartTooltip, ChartTooltipContent,
} from "@/Components/ui/chart"
import {TrendingUp} from "lucide-react"

const chartData = [
    {jenis: "Retail", jumlah: 320, fill: "hsl(var(--chart-1))"},
    {jenis: "Semi Grosir", jumlah: 240, fill: "hsl(var(--chart-2))"},
    {jenis: "Grosir", jumlah: 180, fill: "hsl(var(--chart-3))"},
    {jenis: "Eceran", jumlah: 120, fill: "hsl(var(--chart-4))"},
]

const chartConfig = {
    jumlah: {
        label: "Jumlah Penjualan",
    },
    Retail: {
        label: "Retail",
        color: "hsl(var(--chart-1))",
    },
    "Semi Grosir": {
        label: "Semi Grosir",
        color: "hsl(var(--chart-2))",
    },
    Grosir: {
        label: "Grosir",
        color: "hsl(var(--chart-3))",
    },
    Eceran: {
        label: "Eceran",
        color: "hsl(var(--chart-4))",
    },
}

export default function ChartPieSalesTransactionTypes({month,rekapPerPriceType}) {
    return (
        <Card className="flex flex-col w-1/3">
            <CardHeader className="items-center pb-0">
                <CardTitle>Pie Chart - Jenis Penjualan</CardTitle>
                <CardDescription>{new Date(0, month - 1).toLocaleString("id-ID", {month: "long"})}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[300px]"
                >
                    <PieChart>
                        <ChartTooltip
                            content={<ChartTooltipContent nameKey="jenis"/>}
                        />
                        <Pie data={rekapPerPriceType} dataKey="jumlah" nameKey="jenis">
                            <LabelList
                                dataKey="jenis"
                                className="fill-background"
                                stroke="none"
                                fontSize={12}
                            />
                        </Pie>
                        <ChartLegend
                            content={<ChartLegendContent nameKey="jenis"/>}
                            className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
                        />
                    </PieChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
                {/*<div className="flex items-center gap-2 leading-none font-medium">*/}
                {/*    Naik 5.2% bulan ini <TrendingUp className="h-4 w-4" />*/}
                {/*</div>*/}
                <div className="text-muted-foreground leading-none">
                    <CardDescription>Menampilkan total penjualan
                        bulan {new Date(0, month - 1).toLocaleString("id-ID", {month: "long"})}</CardDescription>
                </div>
            </CardFooter>
        </Card>
    )
}
