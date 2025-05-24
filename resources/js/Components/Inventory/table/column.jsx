'use client';

import {createColumnHelper} from "@tanstack/react-table";
import {MoreHorizontal} from "lucide-react"
import {Button} from "@/Components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"
import {AlertDeleteDialog} from "@/Components/Inventory/AlertDeleteDialog.jsx";
import {AlertEditDialog} from "@/Components/Inventory/AlertEditDialog.jsx";
import {Checkbox} from "@/Components/ui/checkbox"
import {Badge} from "@/Components/ui/badge.jsx";
import {DialogEditBarang} from "@/Components/Inventory/DialogEditBarang.jsx";

const columnHelper = createColumnHelper();

export const columns = [
    {
        id: "select",
        header: ({table}) => (
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
        cell: ({row}) => (
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
        cell: ({row}) => <div className="text-center">{row.index + 1}</div>,
    }),
    columnHelper.accessor("item_code", {
        header: () => <div className="text-center min-w-[100px]">Kode Barang</div>,
        cell: ({getValue}) => <div className="text-center min-w-[100px]">{getValue()}</div>,
    }),
    columnHelper.accessor("item_name", {
        header: () => <div className="text-center min-w-[100px]">Nama Barang</div>,
        cell: ({getValue}) => <div className="text-center min-w-[100px]">{getValue()}</div>,
    }),
    columnHelper.accessor("category.category_name", {
        id: "kategori",
        header: () => <div className="text-center min-w-[100px]">Kategori</div>,
        cell: ({getValue}) => <div className="text-center min-w-[100px]">{getValue()}</div>,
    }),
    columnHelper.accessor("stock", {
        header: () => <div className="text-center min-w-[100px]">Stok Barang</div>,
        cell: ({ getValue }) => {
            const value = getValue();
            const formatted = value !== null ? parseFloat(value).toFixed(2) : '-';
            return <div className="text-center min-w-[100px]">{formatted}</div>;
        },
    }),

columnHelper.accessor("price", {
        header: () => <div className="text-center min-w-[100px]">Harga Modal</div>,
        cell: ({row}) => {
            const price = row.original.price;

            return (
                <div className="text-center min-w-[100px]">
                    {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                    }).format(price)}
                </div>
            );
        },
    }),
    columnHelper.accessor("retail_price", {
        header: () => <div className="text-center min-w-[100px]">Harga Retail</div>,
        cell: ({row}) => {
            const price = row.original.retail_price;

            return (
                <div className="text-center min-w-[100px]">
                    {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                    }).format(price)}
                </div>
            );
        },
    }),
    columnHelper.accessor("wholesale_price", {
        header: () => <div className="text-center min-w-[100px]">Harga Grosir</div>,
        cell: ({row}) => {
            const price = row.original.wholesale_price;

            return (
                <div className="text-center min-w-[100px]">
                    {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                    }).format(price)}
                </div>
            );
        },
    }),
    columnHelper.accessor("eceran_price", {
        header: () => <div className="text-center min-w-[100px]">Harga Eceran</div>,
        cell: ({row}) => {
            const price = row.original.eceran_price;

            return (
                <div className="text-center min-w-[100px]">
                    {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                    }).format(price)}
                </div>
            );
        },
    }),
    columnHelper.accessor("satuan", {
        header: () => <div className="text-center min-w-[100px]">Satuan</div>,
        cell: ({getValue}) => <div className="text-center min-w-[100px]">{getValue()}</div>,
    }),
    columnHelper.accessor("retail_conversion", {
        header: () => <div className="text-center min-w-[100px]">Spesifikasi</div>,
        cell: ({row}) => {
            const conversion = row.original.retail_conversion;
            const satuan = row.original.satuan || 'satuan';
            const satuanEceran = row.original.retail_unit || 'satuan';
            return (
                <div className="text-center min-w-[100px]">
                    1 {satuan} = {conversion} {satuanEceran}
                </div>
            );
        },
    }),

    columnHelper.accessor("is_tax", {
        header: () => <div className="text-center min-w-[100px]">Pajak</div>,
        cell: ({getValue}) => {
            const isTax = getValue();
            return (
                <div className="text-center min-w-[100px]">
                    <Badge variant={isTax ? "destructive" : "secondary"}>
                        {isTax ? "Pajak" : "Non Pajak"}
                    </Badge>
                </div>
            );
        },
    }),
    columnHelper.accessor("tax", {
        header: () => <div className="text-center min-w-[100px]">Nominal Pajak</div>,
        cell: ({ row }) => {
            const price = Number(row.original.price);
            const isTax = row.original.is_tax;
            const rawTax = row.original.tax;

            let tax = 0;

            if (isTax === true || isTax === 1) {
                if (rawTax == null || rawTax === "") {
                    tax = Math.ceil((price * 0.11) / 100) * 100;
                } else {
                    tax = Number(rawTax);
                }
            } else if ((isTax === false || isTax === 0) && price) {
                tax = Math.ceil((price * 0.11) / 100) * 100;
            }

            return (
                <div className="text-center min-w-[100px]">
                    {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                    }).format(tax)}
                </div>
            );
        },
    }),

    columnHelper.accessor("created_at", {
        header: () => <div className="text-center min-w-[100px]">Tanggal Input</div>,
        cell: ({row}) => {
            const date = new Date(row.original.created_at);
            return (
                <div className="text-center min-w-[100px]">
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
        header: () => <div className="text-center min-w-[100px]">Terakhir diupdate</div>,
        cell: ({row}) => {
            const date = new Date(row.original.updated_at);
            return (
                <div className="text-center min-w-[100px]">
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
];
