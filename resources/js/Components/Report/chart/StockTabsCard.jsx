"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/Components/ui/tabs"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/Components/ui/chart"
import {BarChart, Bar, CartesianGrid, LabelList, XAxis, YAxis, ResponsiveContainer, Tooltip} from "recharts"
import { Calendar } from "@/Components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/Components/ui/popover"
import { Button } from "@/Components/ui/button"
import { format } from "date-fns"

const chartConfig = {
    label: {
        color: "hsl(var(--chart-2))",
    },
    desktop: {
        label: "Qty",
        color: "hsl(var(--chart-2))",
    },
}

const dummyMasuk = [
    { name: "Produk A", qty: 150 },
    { name: "Produk B", qty: 120 },
    { name: "Produk C", qty: 110 },
    { name: "Produk D", qty: 90 },
    { name: "Produk E", qty: 80 },
    { name: "Produk F", qty: 70 },
    { name: "Produk G", qty: 65 },
    { name: "Produk H", qty: 60 },
    { name: "Produk I", qty: 55 },
    { name: "Produk J", qty: 50 },
];

const dummyKeluar = [
    { name: "Produk X", qty: 160 },
    { name: "Produk Y", qty: 130 },
    { name: "Produk Z", qty: 100 },
    { name: "Produk W", qty: 95 },
    { name: "Produk V", qty: 85 },
    { name: "Produk U", qty: 60 }, // ini juga scroll
    { name: "Produk A", qty: 150 },
    { name: "Produk B", qty: 120 },
    { name: "Produk C", qty: 110 },
    { name: "Produk D", qty: 90 },
    { name: "Produk E", qty: 80 },
    { name: "Produk F", qty: 70 },
    { name: "Produk G", qty: 65 },
    { name: "Produk H", qty: 60 },
    { name: "Produk I", qty: 55 },
    { name: "Produk J", qty: 50 },
]

export default function StockChartTabs({date,setDate,barangMasuk,barangKeluar}) {
    const [activeTab, setActiveTab] = useState("masuk")


    return (
        <Card className="w-1/3 h-full">
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle>Grafik Barang</CardTitle>
                    <CardDescription>
                        Menampilkan barang masuk dan keluar terbanyak
                    </CardDescription>
                </div>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="text-sm font-normal">
                            {date ? format(date, "PPP") : format(new Date(), "PPP")}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </CardHeader>

            <CardContent>
                <Tabs defaultValue="masuk" onValueChange={setActiveTab}>
                    <TabsList className="w-full justify-between mb-4">
                        <TabsTrigger value="masuk" className={'w-full'}>Barang Masuk</TabsTrigger>
                        <TabsTrigger value="keluar" className={'w-full'}>Barang Keluar</TabsTrigger>
                    </TabsList>

                    {/* Wrap chart with scrollable div if data.length > 5 */}
                    <TabsContent value="masuk">
                        {/*<div className="max-h-[400px] overflow-y-auto pr-2">*/}
                            <ChartContainer config={chartConfig}>
                                <div className="max-h-[200px] overflow-y-auto scrollbar-hidden  pr-2">
                                    <ResponsiveContainer width="100%" height={barangMasuk.length * 50}>
                                        <BarChart
                                            data={barangMasuk}
                                            layout="vertical"
                                            margin={{top: 10, bottom: 10, left: 10, right: 10}}
                                        >
                                            <CartesianGrid horizontal={false}/>
                                            <XAxis type="number" hide/>
                                            <YAxis
                                                dataKey="name"
                                                type="category"
                                                tickLine={false}
                                                axisLine={false}
                                                tickMargin={8}
                                                fontSize={10}
                                            />
                                            <ChartTooltip
                                                cursor={false}
                                                content={({ active, payload, label }) => {
                                                    if (!active || !payload || payload.length === 0) return null;

                                                    const item = payload[0];
                                                    const name = item.name || 'Barang';
                                                    const value = item.value ?? 0;
                                                    const satuan = item.payload?.satuan || '';

                                                    return (
                                                        <div className="bg-white border rounded shadow px-3 py-2 text-xs">
                                                            <div className="font-semibold">{name.toUpperCase()}</div>
                                                            <div>{`${value.toFixed(2)} ${satuan}`}</div>
                                                            <div className="text-gray-400 text-xs mt-1">{label}</div>
                                                        </div>
                                                    );
                                                }}
                                            />
                                            <Bar dataKey="qty" fill="var(--color-desktop)">
                                                <LabelList dataKey="qty" position="right"/>
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </ChartContainer>
                        {/*</div>*/}
                    </TabsContent>

                    <TabsContent value="keluar">
                        {/*<div className="max-h-[300px] overflow-y-auto pr-2">*/}
                        <ChartContainer config={chartConfig}>
                            <div className="max-h-[200px] overflow-y-auto scrollbar-hidden  pr-2">
                                <ResponsiveContainer width="100%" height={barangKeluar.length * 50}>
                                    <BarChart
                                        data={barangKeluar}
                                        layout="vertical"
                                        margin={{top: 0, right: 20, left: 0, bottom: 0}}
                                    >
                                        <CartesianGrid horizontal={false}/>
                                        <XAxis type="number" hide/>
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            tickLine={false}
                                            tickMargin={10}
                                            axisLine={false}
                                            fontSize={10}
                                        />
                                        <ChartTooltip
                                            cursor={false}
                                            content={({ active, payload, label }) => {
                                                if (!active || !payload || payload.length === 0) return null;

                                                const item = payload[0];
                                                const name = item.name || 'Barang';
                                                const value = item.value ?? 0;
                                                const satuan = item.payload?.satuan || '';

                                                return (
                                                    <div className="bg-white border rounded shadow px-3 py-2 text-xs">
                                                        <div className="font-semibold">{name.toUpperCase()}</div>
                                                        <div>{`${value.toFixed(2)} ${satuan}`}</div>
                                                        <div className="text-gray-400 text-xs mt-1">{label}</div>
                                                    </div>
                                                );
                                            }}
                                        />


                                        <Bar dataKey="qty" fill="var(--color-desktop)" radius={4}>
                                            <LabelList dataKey="qty" position="right" fontSize={12}
                                                       className="fill-foreground"/>
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </ChartContainer>
                        {/*</div>*/}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
