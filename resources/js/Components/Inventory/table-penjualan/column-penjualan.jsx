'use client';

import {createColumnHelper} from "@tanstack/react-table";
import {CircleArrowUp,CircleArrowDown} from "lucide-react"
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

export const columns_penjualan = [
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
    columnHelper.accessor("satuan", {
        header: () => <div className="text-center min-w-[100px]">Satuan</div>,
        cell: ({getValue}) => <div className="text-center min-w-[100px]">{getValue()}</div>,
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
        header: () => <div className="text-center min-w-[100px]">Persentase Pajak</div>,
        cell: ({row}) => {
            // Ambil nilai persentase pajak dari data baris
            // const taxPercentageRaw = row.original["tax-percentage"];
            const taxPercentageRaw = row.original.tax;

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



    columnHelper.accessor("price", {
        header: () => <div className="text-center min-w-[100px]">Harga Modal</div>,
        cell: ({row}) => {
            const price = row.original.price;
            const status = row.original.status_perubahan_harga;
            const perubahan_harga = row.original.selisih_perubahan_harga;


            return (
                <div className="text-center min-w-[100px]">
                    {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                    }).format(price)}
                    {
                        (status === 'naik' || status === 'turun') && (
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
                                }).format(perubahan_harga)}
                            </Badge>
                        )
                    }

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
    columnHelper.accessor("pajak_luaran_retail", {
        header: () => <div className="text-center min-w-[100px]">Pajak Luaran Retail</div>,
        cell: ({row}) => {
            const price = row.original.pajak_luaran_retail;

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
    columnHelper.accessor("semi_grosir_price", {
        header: () => <div className="text-center min-w-[100px]">Harga Semi Grosir</div>,
        cell: ({row}) => {
            const price = row.original.semi_grosir_price;


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
    columnHelper.accessor("pajak_luaran_semi_grosir", {
        header: () => <div className="text-center min-w-[100px]">Pajak Luaran Semi Grosir</div>,
        cell: ({row}) => {
            const price = row.original.pajak_luaran_semi_grosir;

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
    columnHelper.accessor("pajak_luaran_whole_sale", {
        header: () => <div className="text-center min-w-[100px]">Pajak Luaran Grosir</div>,
        cell: ({row}) => {
            const price = row.original.pajak_luaran_wholesale;

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
    columnHelper.accessor("pajak_luaran_eceran", {
        header: () => <div className="text-center min-w-[100px]">Pajak Luaran Eceran</div>,
        cell: ({row}) => {
            const price = row.original.pajak_luaran_eceran;

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
