'use client';

import { createColumnHelper } from "@tanstack/react-table";
import { Button } from "@/Components/ui/button";
import { Checkbox } from "@/Components/ui/checkbox";
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
        cell: ({ getValue, row }) => {
            // Check if price_type is 'eceran'
            const priceType = row.original.price_type; // Assuming you have access to 'price_type' in the row data

            // Conditionally append (Eceran) in bold if price_type is 'eceran'
            const itemName = getValue();
            const displayName = priceType === 'eceran' ? `${itemName} <strong>(Eceran)</strong>` : itemName;

            return <div className="text-center" dangerouslySetInnerHTML={{ __html: displayName }} />;
        },
    }),


    columnHelper.accessor("price", {
        header: () => <div className="text-center">Harga</div>,
        cell: ({ row }) => {
            const item = row.original.item;
            const priceType = row.original.price_type;

            let selectedPrice = 0;

            if (priceType === 'eceran') {
                selectedPrice = item?.eceran_price;
            } else if (priceType === 'retail') {
                selectedPrice = item?.retail_price;
            } else {
                selectedPrice = item?.wholesale_price; // grosir
            }

            return (
                <div className="text-center">
                    {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                    }).format(selectedPrice ?? 0)}
                </div>
            );
        },
    }),


    columnHelper.accessor("item.satuan", {
        header: () => <div className="text-center">Satuan</div>,
        cell: ({ getValue, row }) => {
            // Access the price_type in the row data
            const priceType = row.original.price_type;  // Assuming 'price_type' is available in the row data

            // Use item.retail_unit if price_type is 'eceran', otherwise use item.satuan
            const satuan = priceType === 'eceran' ? row.original.item?.retail_unit : getValue();

            return <div className="text-center">{satuan}</div>;
        },
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
