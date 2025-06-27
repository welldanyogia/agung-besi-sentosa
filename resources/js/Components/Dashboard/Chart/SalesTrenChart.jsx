import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/Components/ui/card.jsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/Components/ui/select.jsx";
import {router} from "@inertiajs/react";
import {ChartContainer, ChartTooltip, ChartTooltipContent} from "@/Components/ui/chart.jsx";
import {Bar, BarChart, CartesianGrid, XAxis, YAxis} from "recharts";
import {useState} from "react";

export function SalesTrenChart({topProducts,selectedMonth, setSelectedMonth}) {
    // const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // default bulan ini
    const chartConfig = {
        running: {
            label: "Produk Terjual",
            color: "hsl(var(--chart-1))",
        },
        // swimming: {
        //     label: "Swimming",
        //     color: "hsl(var(--chart-2))",
        // },
    }

    const handleMonthChange = (e) => {
        const month = e.target.value;
        setSelectedMonth(month);
        router.get(route('dashboard'), {month}, {preserveState: true});
    };
    return (
        <Card>
            <CardHeader
                className={'flex items-center justify-between gap-2 space-y-0 border-b py-5 sm:flex-row'}>
                <div className={'grid flex-1 gap-1 text-center sm:text-left'}>
                    <CardTitle className={'text-xl'}>Tren Penjualan
                        Bulan {new Date(0, selectedMonth - 1).toLocaleString("id-ID", {month: "long"})}</CardTitle>
                    <CardDescription>10 produk dengan penjualan teratas.</CardDescription>
                </div>
                {/*<div className="flex justify-end mb-4 w-fit">*/}
                {/*    <Select*/}
                {/*        value={String(selectedMonth)}*/}
                {/*        onValueChange={(value) => {*/}
                {/*            setSelectedMonth(Number(value));*/}
                {/*            router.get(route("dashboard"), {month: value}, {preserveState: true});*/}
                {/*        }}*/}
                {/*    >*/}
                {/*        <SelectTrigger className="w-[200px]">*/}
                {/*            <SelectValue placeholder="Pilih Bulan"/>*/}
                {/*        </SelectTrigger>*/}
                {/*        <SelectContent>*/}
                {/*            {Array.from({length: 12}, (_, i) => i + 1).map((month) => (*/}
                {/*                <SelectItem key={month} value={String(month)}>*/}
                {/*                    {new Date(0, month - 1).toLocaleString("id-ID", {month: "long"})}*/}
                {/*                </SelectItem>*/}
                {/*            ))}*/}
                {/*        </SelectContent>*/}
                {/*    </Select>*/}
                {/*</div>*/}

            </CardHeader>
            <CardContent className={'px-2 pt-4 sm:px-6 sm:pt-6'}>
                <ChartContainer config={chartConfig} className="w-full h-[250px] overflow-x-auto">
                    <BarChart accessibilityLayer data={topProducts}>
                        <XAxis
                            dataKey="item_name"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            interval={0}
                            tick={({x, y, payload}) => (
                                <text
                                    x={x}
                                    y={y + 10}
                                    textAnchor="middle"
                                    fontSize={10}
                                    fill="#666"
                                    // transform={`rotate(-40, ${x}, ${y + 10})`}
                                >
                                    {payload.value}
                                </text>
                            )}
                        />
                        <YAxis
                            tickLine={true}
                            axisLine={false}
                            tickMargin={10}
                            fontSize={12}
                        />
                        <CartesianGrid strokeDasharray="3 3" />

                        <Bar
                            dataKey="total_qty"
                            stackId="a"
                            fill="var(--color-running)"
                            radius={[0, 0, 4, 4]}
                        />
                        {/*<Bar*/}
                        {/*    dataKey="swimming"*/}
                        {/*    stackId="a"*/}
                        {/*    fill="var(--color-swimming)"*/}
                        {/*    radius={[4, 4, 0, 0]}*/}
                        {/*/>*/}
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    formatter={(value, name, props) => {
                                        const unit = props?.payload?.unit || '';
                                        return [
                                            <span style={{ fontWeight: 'bold' }}>Produk Terjual</span>,
                                            `${value} ${unit}`
                                        ];
                                    }}
                                />
                            }
                            cursor={false}
                            defaultIndex={1}
                        />


                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
