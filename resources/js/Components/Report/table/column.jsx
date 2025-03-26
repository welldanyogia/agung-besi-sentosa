'use client';

import { createColumnHelper } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/Components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"
import { AlertDeleteDialog } from "@/Components/Report/AlertDeleteDialog.jsx";
import { AlertEditDialog } from "@/Components/Report/AlertEditDialog.jsx";
import { Checkbox } from "@/Components/ui/checkbox"
import { Badge } from "@/Components/ui/badge.jsx";
import {DialogEditBarang} from "@/Components/Report/DialogEditBarang.jsx";

const columnHelper = createColumnHelper();

export const columns = [
    columnHelper.accessor("no", {
        id: 'no',
        header: () => <div className="text-center">No</div>,
        cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
    }),
    columnHelper.accessor("invoice_code", {
        header: () => <div className="text-center">Kode Invoice</div>,
        cell: ({ getValue }) => <div className="text-center">{getValue()}</div>,
    }),
    columnHelper.accessor("customer_name", {
        header: () => <div className="text-center">Nama Pelanggan</div>,
        cell: ({ getValue }) => <div className="text-center">{getValue()}</div>,
    }),
    columnHelper.accessor("payment", {
        header: () => <div className="text-center">Metode Pembayaran</div>,
        cell: ({ getValue }) => <div className="text-center capitalize">{getValue()}</div>,
    }),
    columnHelper.accessor("total_price", {
        // id: "kategori",
        header: () => <div className="text-center">Total Harga</div>,
        cell: ({ row }) => {
            const price = row.original.total_price;
            return (
                <div className="text-center">
                    {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        maximumFractionDigits: 0
                    }).format(price)}
                </div>
            );
        },
    }),
    columnHelper.accessor("bayar", {
        header: () => <div className="text-center">Pembayaran</div>,
        cell: ({ row }) => {
            const price = row.original.bayar;
            return (
                <div className="text-center">
                    {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        maximumFractionDigits: 0
                    }).format(price)}
                </div>
            );
        },
    }),
    columnHelper.accessor("items", {
        header: () => <div className="text-center">Total Barang</div>,
        cell: ({ getValue }) => <div className="text-center">{getValue().length}</div>,
    }),
    columnHelper.accessor("created_by", {
        header: () => <div className="text-center">Kasir</div>,
        cell: ({ getValue }) => {
            const isTax = getValue();
            return (
                <div className="text-center">
                    {/*<Badge variant={isTax ? "destructive" : "secondary"}>*/}
                        {getValue().name}
                    {/*</Badge>*/}
                </div>
            );
        },
    }),
    columnHelper.accessor("status", {
        header: () => <div className="text-center">Status</div>,
        cell: ({ getValue }) => {
            const status = getValue();
            const isPaid = status === "paid";
            const badgeVariant = isPaid ? "bg-teal-500" : status === "tax" ? "destructive" : "secondary";
            const statusText = isPaid ? "Berhasil" : status;

            return (
                <div className="text-center">
                    <Badge variant={badgeVariant} className={badgeVariant}>{statusText}</Badge>
                </div>
            );
        },
    }),

    columnHelper.accessor("created_at", {
        header: () => <div className="text-center">Tanggal Transaksi</div>,
        cell: ({ row }) => {
            const date = new Date(row.original.created_at);
            return (
                <div className="text-center">
                    {date.toLocaleString('id-ID', {
                        timeZone: 'Asia/Jakarta',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                    })}
                </div>
            );
        },
    }),
    // columnHelper.accessor("updated_at", {
    //     header: () => <div className="text-center">Terakhir diupdate</div>,
    //     cell: ({ row }) => {
    //         const date = new Date(row.original.updated_at);
    //         return (
    //             <div className="text-center">
    //                 {date.toLocaleString('id-ID', {
    //                     timeZone: 'Asia/Jakarta',
    //                     year: 'numeric',
    //                     month: 'long',
    //                     day: 'numeric',
    //                     hour: 'numeric',
    //                     minute: 'numeric',
    //                 })}
    //             </div>
    //         );
    //     },
    // }),
    {
        id: "actions",
        header: () => <div className="text-center">Detail Transaksi</div>,
        cell: ({ row }) => (
            <div className="flex justify-center gap-2">
                <DialogEditBarang barang={row.original}/>
            </div>
        ),
    },
];
