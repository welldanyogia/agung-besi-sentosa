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
import { AlertDeleteDialog } from "@/Components/Inventory/AlertDeleteDialog.jsx";
import { AlertEditDialog } from "@/Components/Inventory/AlertEditDialog.jsx";
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/Components/ui/badge.jsx";
import {DialogEditBarang} from "@/Components/Inventory/DialogEditBarang.jsx";

const columnHelper = createColumnHelper();

export const columns = [
    {
        id: "select",
        header: ({ table }) => (
            <div className="text-center">
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            </div>
        ),
        cell: ({ row }) => (
            <div className="text-center">
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
    columnHelper.accessor("no", {
        id: 'no',
        header: () => <div className="text-center">No</div>,
        cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
    }),
    columnHelper.accessor("item_code", {
        header: () => <div className="text-center">Kode Barang</div>,
        cell: ({ getValue }) => <div className="text-center">{getValue()}</div>,
    }),
    columnHelper.accessor("item_name", {
        header: () => <div className="text-center">Nama Barang</div>,
        cell: ({ getValue }) => <div className="text-center">{getValue()}</div>,
    }),
    columnHelper.accessor("category.category_name", {
        id: "kategori",
        header: () => <div className="text-center">Kategori</div>,
        cell: ({ getValue }) => <div className="text-center">{getValue()}</div>,
    }),
    columnHelper.accessor("stock", {
        header: () => <div className="text-center">Stok Barang</div>,
        cell: ({ getValue }) => <div className="text-center">{getValue()}</div>,
    }),
    columnHelper.accessor("price", {
        header: () => <div className="text-center">Harga</div>,
        cell: ({ row }) => {
            const price = row.original.price;
            const tax = row.original.tax; // Assuming you have the 'tax' value in the row data

            // Calculate price with tax (e.g., if tax is 10%, price * 1.1)
            const priceWithTax = tax ? (price * (tax / 100))+price : price;

            return (
                <div className="text-center">
                    {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                    }).format(priceWithTax)}
                </div>
            );
        },
    }),
    columnHelper.accessor("satuan", {
        header: () => <div className="text-center">Satuan</div>,
        cell: ({ getValue }) => <div className="text-center">{getValue()}</div>,
    }),
    columnHelper.accessor("is_tax", {
        header: () => <div className="text-center">Pajak</div>,
        cell: ({ getValue }) => {
            const isTax = getValue();
            return (
                <div className="text-center">
                    <Badge variant={isTax ? "destructive" : "secondary"}>
                        {isTax ? "Pajak" : "Non Pajak"}
                    </Badge>
                </div>
            );
        },
    }),
    columnHelper.accessor("created_at", {
        header: () => <div className="text-center">Tanggal Input</div>,
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
    columnHelper.accessor("updated_at", {
        header: () => <div className="text-center">Terakhir diupdate</div>,
        cell: ({ row }) => {
            const date = new Date(row.original.updated_at);
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
    {
        id: "actions",
        header: () => <div className="text-center">Aksi</div>,
        cell: ({ row }) => (
            <div className="flex justify-center gap-2">
                <DialogEditBarang barang={row.original}/>
                <AlertDeleteDialog />
            </div>
        ),
    },
];
