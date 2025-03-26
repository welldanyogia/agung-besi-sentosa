"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
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
} from "@/components/ui/select"
const chartData = [
    { date: "2024-04-01", paid: 222, unpaid: 150 },
    { date: "2024-04-02", paid: 97, unpaid: 180 },
    { date: "2024-04-03", paid: 167, unpaid: 120 },
    { date: "2024-04-04", paid: 242, unpaid: 260 },
    { date: "2024-04-05", paid: 373, unpaid: 290 },
    { date: "2024-04-06", paid: 301, unpaid: 340 },
    { date: "2024-04-07", paid: 245, unpaid: 180 },
    { date: "2024-04-08", paid: 409, unpaid: 320 },
    { date: "2024-04-09", paid: 59, unpaid: 110 },
    { date: "2024-04-10", paid: 261, unpaid: 190 },
    { date: "2024-04-11", paid: 327, unpaid: 350 },
    { date: "2024-04-12", paid: 292, unpaid: 210 },
    { date: "2024-04-13", paid: 342, unpaid: 380 },
    { date: "2024-04-14", paid: 137, unpaid: 220 },
    { date: "2024-04-15", paid: 120, unpaid: 170 },
    { date: "2024-04-16", paid: 138, unpaid: 190 },
    { date: "2024-04-17", paid: 446, unpaid: 360 },
    { date: "2024-04-18", paid: 364, unpaid: 410 },
    { date: "2024-04-19", paid: 243, unpaid: 180 },
    { date: "2024-04-20", paid: 89, unpaid: 150 },
    { date: "2024-04-21", paid: 137, unpaid: 200 },
    { date: "2024-04-22", paid: 224, unpaid: 170 },
    { date: "2024-04-23", paid: 138, unpaid: 230 },
    { date: "2024-04-24", paid: 387, unpaid: 290 },
    { date: "2024-04-25", paid: 215, unpaid: 250 },
    { date: "2024-04-26", paid: 75, unpaid: 130 },
    { date: "2024-04-27", paid: 383, unpaid: 420 },
    { date: "2024-04-28", paid: 122, unpaid: 180 },
    { date: "2024-04-29", paid: 315, unpaid: 240 },
    { date: "2024-04-30", paid: 454, unpaid: 380 },
    { date: "2024-05-01", paid: 165, unpaid: 220 },
    { date: "2024-05-02", paid: 293, unpaid: 310 },
    { date: "2024-05-03", paid: 247, unpaid: 190 },
    { date: "2024-05-04", paid: 385, unpaid: 420 },
    { date: "2024-05-05", paid: 481, unpaid: 390 },
    { date: "2024-05-06", paid: 498, unpaid: 520 },
    { date: "2024-05-07", paid: 388, unpaid: 300 },
    { date: "2024-05-08", paid: 149, unpaid: 210 },
    { date: "2024-05-09", paid: 227, unpaid: 180 },
    { date: "2024-05-10", paid: 293, unpaid: 330 },
    { date: "2024-05-11", paid: 335, unpaid: 270 },
    { date: "2024-05-12", paid: 197, unpaid: 240 },
    { date: "2024-05-13", paid: 197, unpaid: 160 },
    { date: "2024-05-14", paid: 448, unpaid: 490 },
    { date: "2024-05-15", paid: 473, unpaid: 380 },
    { date: "2024-05-16", paid: 338, unpaid: 400 },
    { date: "2024-05-17", paid: 499, unpaid: 420 },
    { date: "2024-05-18", paid: 315, unpaid: 350 },
    { date: "2024-05-19", paid: 235, unpaid: 180 },
    { date: "2024-05-20", paid: 177, unpaid: 230 },
    { date: "2024-05-21", paid: 82, unpaid: 140 },
    { date: "2024-05-22", paid: 81, unpaid: 120 },
    { date: "2024-05-23", paid: 252, unpaid: 290 },
    { date: "2024-05-24", paid: 294, unpaid: 220 },
    { date: "2024-05-25", paid: 201, unpaid: 250 },
    { date: "2024-05-26", paid: 213, unpaid: 170 },
    { date: "2024-05-27", paid: 420, unpaid: 460 },
    { date: "2024-05-28", paid: 233, unpaid: 190 },
    { date: "2024-05-29", paid: 78, unpaid: 130 },
    { date: "2024-05-30", paid: 340, unpaid: 280 },
    { date: "2024-05-31", paid: 178, unpaid: 230 },
    { date: "2024-06-01", paid: 178, unpaid: 200 },
    { date: "2024-06-02", paid: 470, unpaid: 410 },
    { date: "2024-06-03", paid: 103, unpaid: 160 },
    { date: "2024-06-04", paid: 439, unpaid: 380 },
    { date: "2024-06-05", paid: 88, unpaid: 140 },
    { date: "2024-06-06", paid: 294, unpaid: 250 },
    { date: "2024-06-07", paid: 323, unpaid: 370 },
    { date: "2024-06-08", paid: 385, unpaid: 320 },
    { date: "2024-06-09", paid: 438, unpaid: 480 },
    { date: "2024-06-10", paid: 155, unpaid: 200 },
    { date: "2024-06-11", paid: 92, unpaid: 150 },
    { date: "2024-06-12", paid: 492, unpaid: 420 },
    { date: "2024-06-13", paid: 81, unpaid: 130 },
    { date: "2024-06-14", paid: 426, unpaid: 380 },
    { date: "2024-06-15", paid: 307, unpaid: 350 },
    { date: "2024-06-16", paid: 371, unpaid: 310 },
    { date: "2024-06-17", paid: 475, unpaid: 520 },
    { date: "2024-06-18", paid: 107, unpaid: 170 },
    { date: "2024-06-19", paid: 341, unpaid: 290 },
    { date: "2024-06-20", paid: 408, unpaid: 450 },
    { date: "2024-06-21", paid: 169, unpaid: 210 },
    { date: "2024-06-22", paid: 317, unpaid: 270 },
    { date: "2024-06-23", paid: 480, unpaid: 530 },
    { date: "2024-06-24", paid: 132, unpaid: 180 },
    { date: "2024-06-25", paid: 141, unpaid: 190 },
    { date: "2024-06-26", paid: 434, unpaid: 380 },
    { date: "2024-06-27", paid: 448, unpaid: 490 },
    { date: "2024-06-28", paid: 149, unpaid: 200 },
    { date: "2024-06-29", paid: 103, unpaid: 160 },
    { date: "2024-06-30", paid: 446, unpaid: 400 },
]
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

        // Find if the date already exists in the summary
        let daySummary = transactionSummary.find(item => item.date === date);

        if (!daySummary) {
            // If not found, create a new entry for that date
            daySummary = { date, paid: 0, unpaid: 0 };
            transactionSummary.push(daySummary);
        }

        // Increment the count based on the status of the transaction
        if (status === 'paid') {
            daySummary.paid += 1;
        } else {
            daySummary.unpaid += 1;
        }
    });

    return transactionSummary;
}

// Contoh penggunaan



const chartConfig = {
    visitors: {
        label: "Statys",
    },
    paid: {
        label: "Berhasil",
        color: "hsl(var(--chart-1))",
    },
    unpaid: {
        label: "Gagal",
        color: "hsl(var(--chart-2))",
    },
}

export function SalesChart({data}) {

    const classifiedData = classifyTransactions(data);
    const classifiedDataByDate = classifyTransactionsByDate(data)

    const [timeRange, setTimeRange] = React.useState("7d")

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
                            <linearGradient id="fillunpaid" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-unpaid)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-unpaid)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                                const date = new Date(value)
                                return date.toLocaleDateString("en-US", {
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
                                        return new Date(value).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        })
                                    }}
                                    indicator="dot"
                                />
                            }
                        />
                        <Area
                            dataKey="unpaid"
                            type="natural"
                            fill="url(#fillunpaid)"
                            stroke="var(--color-unpaid)"
                            stackId="a"
                        />
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
