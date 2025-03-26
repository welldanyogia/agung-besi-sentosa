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
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/Components/ui/badge.jsx";
import {DialogEditBarang} from "@/Components/Report/DialogEditBarang.jsx";

const columnHelper = createColumnHelper();

export const columns = [
    columnHelper.accessor("no", {
        id: 'no',
        header: () => <div className="text-center">No</div>,
        cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
    }),
    columnHelper.accessor("item.item_name", {
        header: () => <div className="text-center">Nama Barang</div>,
        cell: ({ getValue }) => <div className="text-center">{getValue()}</div>,
    }),
    columnHelper.accessor("qty", {
        header: () => <div className="text-center">QTY</div>,
        cell: ({ getValue }) => <div className="text-center">{getValue()}</div>,
    }),
    columnHelper.accessor("price", {
        // id: "kategori",
        header: () => <div className="text-center">Harga</div>,
        cell: ({ row }) => {
            const price = row.original.price;
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
    columnHelper.accessor("sub_total", {
        // id: "kategori",
        header: () => <div className="text-center">Total Harga</div>,
        cell: ({ row }) => {
            const price = row.original.sub_total;
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
    // columnHelper.accessor("items", {
    //     header: () => <div className="text-center">Total Barang</div>,
    //     cell: ({ getValue }) => <div className="text-center">{getValue().length}</div>,
    // }),
    // columnHelper.accessor("created_by", {
    //     header: () => <div className="text-center">Kasir</div>,
    //     cell: ({ getValue }) => {
    //         const isTax = getValue();
    //         return (
    //             <div className="text-center">
    //                 <Badge variant={isTax ? "destructive" : "secondary"}>
    //                     {getValue().name}
    //                 </Badge>
    //             </div>
    //         );
    //     },
    // }),
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
];
