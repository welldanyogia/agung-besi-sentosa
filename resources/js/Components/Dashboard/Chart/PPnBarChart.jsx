import React from "react"
import { TrendingUp } from "lucide-react"
import {
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    LabelList,
    Tooltip,
    ResponsiveContainer,
} from "recharts"

const chartData = [
    { name: "Item A", sold: 120, nominal: 240000 },
    { name: "Item B", sold: 90, nominal: 180000 },
    { name: "Item C", sold: 150, nominal: 300000 },
    { name: "Item D", sold: 60, nominal: 90000 },
    { name: "Item E", sold: 100, nominal: 210000 },
    { name: "Item F", sold: 130, nominal: 270000 },
]

// Fungsi untuk format ke rupiah
function formatRupiah(value) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 2,
    }).format(value)
}

export default function PPnBarChart({month,item,ppn}) {
    const totalNominal = item.reduce((sum, item) => sum + item.nominal, 0)
    const BAR_HEIGHT = 50
    const chartHeight = item.length * BAR_HEIGHT
    return (
        <div className="rounded-xl border bg-white shadow-md p-4">
            <div className="mb-4">
                <h2 className="text-lg font-semibold">Penjualan Barang {ppn ? "PPn" : "Non PPn"}</h2>
                <h3 className="font-semibold">Total : {formatRupiah(totalNominal)}</h3>

                <p className="text-sm text-gray-500">
                    {new Date(new Date().getFullYear(), month - 1).toLocaleString("id-ID", {
                        month: "long",
                        year: "numeric",
                    })}
                </p>

            </div>
            <ResponsiveContainer width="100%" height={item.length * 50}>
                <BarChart
                    data={item}
                    layout="vertical"
                    margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <YAxis
                        dataKey="name"
                        type="category"
                        tickLine={false}
                        tickMargin={2}
                        axisLine={false}
                        tick={{ fontSize: 10 }} // Ubah fontSize sesuai kebutuhan, misalnya 10 atau 12
                    />

                    <XAxis type="number" hide />
                    <Tooltip
                        formatter={(value, name) => [
                            name === "sold" ? `${value} pcs` : formatRupiah(value),
                            name === "sold" ? "Terjual" : "Nominal",
                        ]}
                    />
                    <Bar dataKey="sold" fill="#6366f1" radius={4}>
                        {/* Label name - hanya tampil jika bar cukup panjang */}
                        {/*<LabelList*/}
                        {/*    dataKey="name"*/}
                        {/*    content={({ x, y, width, height, value }) => {*/}
                        {/*        if (width < 60) return null*/}
                        {/*        return (*/}
                        {/*            <text*/}
                        {/*                x={x + 5}*/}
                        {/*                y={y + height / 2 + 4}*/}
                        {/*                fill="#fff"*/}
                        {/*                fontSize={8}*/}
                        {/*                textAnchor="start"*/}
                        {/*            >*/}
                        {/*                {value}*/}
                        {/*            </text>*/}
                        {/*        )*/}
                        {/*    }}*/}
                        {/*/>*/}

                        {/* Label sold - selalu di luar */}
                        <LabelList
                            dataKey="sold"
                            content={({ x, y, width, height, value , index}) => {
                                const unit = item[index]?.unit || ''
                                return(
                                <text
                                    x={x + width + 5}
                                    y={y + height / 2 - 4}
                                    fill="#000"
                                    fontSize={10}
                                    textAnchor="start"

                                >
                                    {value} {unit}
                                </text>
                            )}}
                        />

                        {/* Label nominal - dalam jika panjang cukup, luar jika pendek */}
                        <LabelList
                            dataKey="nominal"
                            content={({ x, y, width, height, value }) => {
                                const barTooShort = width < 80
                                return (
                                    <text
                                        x={barTooShort ? x + width + 5 : x + width - 5}
                                        y={y + height / 2 + 8}
                                        fill={barTooShort ? "#000" : "#fff"}
                                        fontSize={10}
                                        textAnchor={barTooShort ? "start" : "end"}
                                    >
                                        {formatRupiah(value)}
                                    </text>
                                )
                            }}
                        />
                    </Bar>




                </BarChart>
            </ResponsiveContainer>

        </div>
    )
}
