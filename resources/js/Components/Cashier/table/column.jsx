'use client';

import { createColumnHelper } from "@tanstack/react-table";
import { Button } from "@/Components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/Components/ui/input.jsx";

const columnHelper = createColumnHelper();

export const columns = [
    {
        id: "select",
        header: ({ table }) => (
            <div className="text-center">
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
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
    columnHelper.accessor("item.item_name", {
        header: () => <div className="text-center">Nama Barang</div>,
        cell: ({ getValue }) => <div className="text-center">{getValue()}</div>,
    }),
    columnHelper.accessor("price", {
        header: () => <div className="text-center">Harga</div>,
        cell: ({ row }) => {
            const price = row.original.price;
            const tax = row.original.item?.tax; // Assuming you have the 'tax' value in the row data

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

    columnHelper.accessor("item.satuan", {
        header: () => <div className="text-center">Satuan</div>,
        cell: ({ getValue }) => <div className="text-center">{getValue()}</div>,
    }),
    // columnHelper.accessor("qty", {
    //     header: () => <div className="text-center">QTY</div>,
    //     cell: ({ getValue }) => (
    //         <div className="text-center flex gap-2">
    //             <Button size={'sm'} className={'rounded-full'}>-</Button>
    //             <Input value={getValue()} readOnly={true}/>
    //             <Button size={'sm'} className={'rounded-full'}>+</Button>
    //         </div>
    //     ),
    // }),
];
