"use client"

import * as React from "react"
import {Area, AreaChart, CartesianGrid, XAxis, YAxis} from "recharts"

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select"
function classifyTransactions(data) {
    const successfulTransactions = [];
    const failedTransactions = [];

    data.forEach(invoice => {
        if (invoice.status === 'paid') {
            successfulTransactions.push(invoice);
        } else {
            failedTransactions.push(invoice);
        }
    });

    return {
        successful: successfulTransactions,
        failed: failedTransactions
    };
}
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear().toString(); // Get last 2 digits of the year
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
    const day = date.getDate().toString().padStart(2, '0'); // Add leading zero for day if needed

    return `${year}-${month}-${day}`;
}
function classifyTransactionsByDate(data) {
    const transactionSummary = [];

    // Group transactions by date
    data.forEach(invoice => {
        const date = formatDate(invoice.created_at);
        const status = invoice.status;
        const totalPrice = invoice.total_price;
        const paymentMethod = invoice.payment_method === "cash" ? "Tunai" : "Non Tunai";

        // Find if the date already exists in the summary
        let daySummary = transactionSummary.find(item => item.date === date);

        if (!daySummary) {
            // If not found, create a new entry for that date
            daySummary = {
                date,
                paid: 0,
                unpaid: 0,
                payment_methods: { "Tunai": 0, "Non Tunai": 0 }
            };
            transactionSummary.push(daySummary);
        }

        // Increment the count based on the status of the transaction
        if (status === 'paid') {
            daySummary.paid += totalPrice;
            daySummary.payment_methods[paymentMethod] += totalPrice;
        } else {
            daySummary.unpaid += 1;
        }
    });

    // Sort by date ascending (oldest to newest)
    transactionSummary.sort((a, b) => new Date(a.date) - new Date(b.date));

    return transactionSummary;
}



// function classifyTransactionsByDate(data) {
//     const transactionSummary = [];
//
//     // Group transactions by date
//     data.forEach(invoice => {
//         const date = formatDate(invoice.created_at);
//         const status = invoice.status;
//         const totalPrice = invoice.total_price;
//
//
//         // Find if the date already exists in the summary
//         let daySummary = transactionSummary.find(item => item.date === date);
//
//         if (!daySummary) {
//             // If not found, create a new entry for that date
//             daySummary = { date, paid: 0, unpaid: 0 };
//             transactionSummary.push(daySummary);
//         }
//
//         // Increment the count based on the status of the transaction
//         if (status === 'paid') {
//             daySummary.paid += totalPrice;
//         } else {
//             daySummary.unpaid += 1;
//         }
//     });
//
//     return transactionSummary;
// }

function classifyTotalTransactionsByDate(data) {
    const transactionSummary = [];

    // Group transactions by date
    data.forEach(invoice => {
        const date = formatDate(invoice.created_at);
        const totalPrice = invoice.total_price;

        // Cari apakah tanggal sudah ada di summary
        let daySummary = transactionSummary.find(item => item.date === date);

        if (!daySummary) {
            // Jika belum ada, buat entri baru untuk tanggal tersebut
            daySummary = { date, total: 0 };
            transactionSummary.push(daySummary);
        }

        // Tambahkan total transaksi
        daySummary.total += totalPrice;
    });

    return transactionSummary;
}


// Contoh penggunaan



const chartConfig = {
    visitors: {
        label: "Statys",
    },
    paid: {
        label: "Total Transaksi",
        color: "hsl(var(--chart-1))",
    },
    // unpaid: {
    //     label: "Gagal",
    //     color: "hsl(var(--chart-2))",
    // },
}

export function SalesChart({data}) {

    const classifiedData = classifyTransactions(data);
    const classifiedTotalTransactionData = classifyTotalTransactionsByDate(data);
    const classifiedDataByDate = classifyTransactionsByDate(data)

    const getDefaultTimeRange = (data) => {
        const now = new Date();

        const hasDataInLastDays = (days) => {
            const startDate = new Date(now);
            startDate.setDate(now.getDate() - days);
            return data.some(item => new Date(item.date) >= startDate);
        };

        if (hasDataInLastDays(7)) return "7d";
        if (hasDataInLastDays(30)) return "30d";
        return "90d";
    };
    const [timeRange, setTimeRange] = React.useState(getDefaultTimeRange(classifiedDataByDate));

    const filteredData = classifiedDataByDate.filter((item) => {
        const date = new Date(item.date);

        // Set referenceDate to today's date
        const referenceDate = new Date();

        let daysToSubtract = 90;
        if (timeRange === "30d") {
            daysToSubtract = 30;
        } else if (timeRange === "7d") {
            daysToSubtract = 7;
        }

        const startDate = new Date(referenceDate);
        startDate.setDate(startDate.getDate() - daysToSubtract);

        // Format startDate to yyyy-mm-dd
        const formattedStartDate = startDate.toISOString().split('T')[0]; // Get the date in 'yyyy-mm-dd' format


        return date >= new Date(formattedStartDate);
    });

    console.log(data)



    return (
        <Card>
            <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                <div className="grid flex-1 gap-1 text-center sm:text-left">
                    <CardTitle>Laporan Penjualan</CardTitle>
                    <CardDescription>
                        Showing total sales for the last 3 months
                    </CardDescription>
                </div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger
                        className="w-[160px] rounded-lg sm:ml-auto"
                        aria-label="Select a value"
                    >
                        <SelectValue placeholder="Last 3 months" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        <SelectItem value="90d" className="rounded-lg">
                            Last 3 months
                        </SelectItem>
                        <SelectItem value="30d" className="rounded-lg">
                            Last 30 days
                        </SelectItem>
                        <SelectItem value="7d" className="rounded-lg">
                            Last 7 days
                        </SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[250px] w-full"
                >
                    <AreaChart data={filteredData}>
                        <defs>
                            <linearGradient id="fillpaid" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-paid)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-paid)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                            {/*<linearGradient id="fillunpaid" x1="0" y1="0" x2="0" y2="1">*/}
                            {/*    <stop*/}
                            {/*        offset="5%"*/}
                            {/*        stopColor="var(--color-unpaid)"*/}
                            {/*        stopOpacity={0.8}*/}
                            {/*    />*/}
                            {/*    <stop*/}
                            {/*        offset="95%"*/}
                            {/*        stopColor="var(--color-unpaid)"*/}
                            {/*        stopOpacity={0.1}*/}
                            {/*    />*/}
                            {/*</linearGradient>*/}
                        </defs>
                        <CartesianGrid vertical={false} />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            width={100}
                            tickFormatter={(value) =>
                                new Intl.NumberFormat("id-ID", {
                                    style: "currency",
                                    currency: "IDR",
                                    minimumFractionDigits: 0
                                }).format(value)
                            }
                        />

                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                                const date = new Date(value)
                                return date.toLocaleDateString("id-ID", {
                                    month: "short",
                                    day: "numeric",
                                })
                            }}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    labelFormatter={(value) => {
                                        return new Date(value).toLocaleDateString("id-ID", {
                                            month: "short",
                                            day: "numeric",
                                        });
                                    }}
                                    indicator="dot"
                                    formatter={(value) => {
                                        return [
                                            "Total :",
                                            new Intl.NumberFormat("id-ID", {
                                                style: "currency",
                                                currency: "IDR",
                                            }).format(value)
                                        ];
                                    }}
                                />
                            }
                        />


                        {/*<Area*/}
                        {/*    dataKey="unpaid"*/}
                        {/*    type="natural"*/}
                        {/*    fill="url(#fillunpaid)"*/}
                        {/*    stroke="var(--color-unpaid)"*/}
                        {/*    stackId="a"*/}
                        {/*/>*/}
                        <Area
                            dataKey="paid"
                            type="natural"
                            fill="url(#fillpaid)"
                            stroke="var(--color-paid)"
                            stackId="a"
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
