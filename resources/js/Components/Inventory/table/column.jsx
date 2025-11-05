'use client';

import {createColumnHelper} from "@tanstack/react-table";
import {CircleArrowUp, CircleArrowDown} from "lucide-react"
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
    columnHelper.accessor("kode_barang", {
        header: () => <div className="text-center min-w-[100px]">Kode Barang</div>,
        cell: ({getValue}) => <div className="text-center min-w-[100px]">{getValue()}</div>,
    }),
    columnHelper.accessor("nama_barang", {
        header: () => <div className="text-center min-w-[100px]">Nama Barang</div>,
        cell: ({getValue}) => <div className="text-center min-w-[100px]">{getValue()}</div>,
    }),
    columnHelper.accessor("category.category_name", {
        id: "kategori",
        header: () => <div className="text-center min-w-[100px]">Kategori</div>,
        cell: ({getValue}) => <div className="text-center min-w-[100px]">{getValue()}</div>,
    }),
    columnHelper.accessor("qty", {
        header: () => <div className="text-center min-w-[100px]">QTY</div>,
        cell: ({getValue}) => {
            const value = getValue();
            const formatted = value !== null ? parseFloat(value).toFixed(0) : '-';
            return <div className="text-center min-w-[100px]">{formatted}</div>;
        },
    }),
    columnHelper.accessor("satuan", {
        header: () => <div className="text-center min-w-[100px]">Satuan</div>,
        cell: ({getValue}) => <div className="text-center min-w-[100px]">{getValue()}</div>,
    }),

    columnHelper.accessor("harga", {
        header: () => <div className="text-center min-w-[100px]">Harga</div>,
        cell: ({row}) => {
            const price = row.original.harga;
            const status = row.original.item?.status_perubahan_harga;
            const selisih = row.original.item?.selisih_perubahan_harga;

            return (
                <div className="text-center min-w-[100px]">
                    {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                    }).format(parseFloat(price))}
                    {(status === 'naik' || status === 'turun') && (
                        <Badge
                            className={`flex gap-2 text-xs ${status === 'naik' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                        >
                            {status === 'naik' ? (
                                <CircleArrowUp size={12} />
                            ) : (
                                <CircleArrowDown size={12} />
                            )}
                            {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                            }).format(selisih)}
                        </Badge>
                    )}
                </div>
            );
        },
    }),
    columnHelper.accessor("pajak", {
        header: () => <div className="text-center min-w-[100px]">Pajak</div>,
        cell: ({getValue}) => {
            const isTax = getValue();
            // console.log(isTax)
            return (
                <div className="text-center min-w-[100px]">
                    <Badge variant={isTax ? "destructive" : "secondary"}>
                        {isTax === 1 ? "Pajak" : "Non Pajak"}
                    </Badge>
                </div>
            );
        },
    }),
    columnHelper.accessor("persentase_pajak", {
        header: () => <div className="text-center min-w-[100px]">Persentase Pajak</div>,
        cell: ({row}) => {
            // Ambil nilai persentase pajak dari data baris
            // const taxPercentageRaw = row.original["tax-percentage"];
            const taxPercentageRaw = row.original.persentase_pajak;

            // Jika nilai berupa angka persentase (misal 10), ubah ke desimal (0.1)
            const taxDecimal = taxPercentageRaw / 100;

            return (
                <div className="text-center min-w-[100px]">
                    {new Intl.NumberFormat('id-ID', {
                        style: 'percent',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                    }).format(taxDecimal)}
                </div>
            );
        },
    }),


    columnHelper.accessor("pajak_masukan", {
        header: () => <div className="text-center min-w-[100px]">Pajak Masukan</div>,
        cell: ({row}) => {

            return (
                <div className="text-center min-w-[100px]">
                    {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        maximumFractionDigits: 2
                    }).format(row.original.pajak_masukan)}
                </div>
            );
        },
    }),


    columnHelper.accessor("harga_total", {
        header: () => <div className="text-center min-w-[100px]">Harga Sebelum Pajak</div>,
        cell: ({row}) => {
            const price = row.original.harga_total;

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
    columnHelper.accessor("tanggal_pembelian", {
        header: () => <div className="text-center min-w-[100px]">Tanggal Pembelian</div>,
        cell: ({row}) => {
            const date = new Date(row.original.tanggal_pembelian);
            return (
                <div className="text-center min-w-[100px]">
                    {date.toLocaleString('id-ID', {
                        timeZone: 'Asia/Jakarta',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}
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
];
