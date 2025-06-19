'use client';

import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    getPaginationRowModel,
    getFilteredRowModel
} from '@tanstack/react-table';
import {Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow} from '@/Components/ui/table';
import {Button} from "@/Components/ui/button.jsx";
import {Input} from "@/Components/ui/input.jsx";
import {useState} from "react";
import {columns} from "@/Components/Cashier/table/column.jsx";
import axios from "axios";
import {Inertia} from "@inertiajs/inertia";
import {router} from "@inertiajs/react";

const DataTable = ({auth,invoice,item,data, setInvoiceItems,setError,setSuccess,getItems,getInvoice}) => {
    const [rowSelection, setRowSelection] = useState({});
    const [columnFilters, setColumnFilters] = useState([]);
    const [isDeleting, setIsDeleting] = useState(false);


    const table = useReactTable({
        data: data ?? [],
        columns,
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        getCoreRowModel: getCoreRowModel(),
        // getPaginationRowModel: getPaginationRowModel(),
        onRowSelectionChange: setRowSelection,
        state: {rowSelection, columnFilters},
    });


    const handleMin = async (item) => {
        const step = ["ornamen"].includes(item.item.category?.category_name.toLowerCase()) ? 1 : 0.5;

        try {
            // Tentukan jumlah pengurangan berdasarkan price_type
            const quantityReduction = item.price_type === "eceran"
                ? (1/item.item.retail_conversion || 1)  // Gunakan item.item.retail_conversion jika tersedia, default ke 1
                : 1;

            // Kirim permintaan untuk memperbarui stok
            const response = await axios.post("/api/cashier/restore-stock", {
                invoice_id: item.invoice_id,
                item_id: item.item_id,
                quantity: step, // Gunakan jumlah yang sudah dihitung
                user_id: auth.user.id
            });

            setSuccess("Berhasil memperbarui QTY");

            // Perbarui state invoiceItems
            setInvoiceItems((prevItems) =>
                prevItems.map((i) =>
                    i.item_id === item.item_id
                        ? { ...i, quantity: i.quantity - step }
                        : i
                )
            );

            // Ambil ulang data
            getItems();
            getInvoice()
        } catch (error) {
            // console.log(error)
            setError("Gagal memperbarui QTY!!!");
            getItems();
            getInvoice();
        } finally {
            getInvoice()
            // Inertia.get("/cashier", {}, { preserveState: true, replace: true });
            // Inertia.get("/cashier", {}, { preserveState: true, replace: true });
            getItems();
            // getInvoice();

        }
    };

    const handlePlus = async (item) => {
        const step = ["ornamen"].includes(item.item.category?.category_name.toLowerCase()) ? 1 : 0.5;
        try {
            // Kirim semua permintaan update stok dalam satu batch

            const response= await axios.post("/api/cashier/update-stock", {
                price_type: item.price_type,
                // invoice_id : item.invoice_id,
                item_id : item.item_id,
                quantity : step,
                user_id : auth.user.id
            })

            setSuccess("memperbarui QTY");
            setInvoiceItems((prevItems) =>
                prevItems.map((i) =>
                    i.item_id === item.item_id
                        ? { ...i, quantity: i.quantity - step }
                        : i
                )
            );
            // setInvoiceItems([]);
            getItems();
            // Inertia.get("/cashier", {}, { preserveState: true, replace: true });

            getInvoice();
        } catch (error) {
            // console.log(error)
            setError("Gagal memperbarui QTY!!!");
            getItems();
            // Inertia.get("/cashier", {}, { preserveState: true, replace: true });

            getInvoice();
        }finally {
            // Inertia.get("/cashier", {}, { preserveState: true, replace: true });
            getItems();
            // Inertia.get("/cashier", {}, { preserveState: true, replace: true });

            getInvoice();
        }
    };

    // Increment and Decrement handlers
    const handleIncrement = (product) => {
        const step = ["ornamen"].includes(product.item.category?.category_name.toLowerCase()) ? 1 : 0.5;
        // console.log(product)
        handlePlus(product)
        setInvoiceItems((prevItems) => {
            return prevItems.map((item) =>
                item.id === product.id ? {...item, qty: item.qty + step} : item
            );
        });
    };

    const handleDecrement = (product) => {
        const step = ["ornamen"].includes(product.item.category?.category_name.toLowerCase()) ? 1 : 0.5;
        // console.log(["ornamen"].includes(product.item.category?.category_name.toLowerCase()))
        handleMin(product)
        setInvoiceItems((prevItems) => {
            return prevItems
                .map((item) =>
                    item.id === product.id ? {...item, qty: item.qty - step} : item
                )
                .filter((item) => item.qty > 0); // Remove item if qty = 0
        });
    };

    const handleDeleteSelected = async () => {
        const selectedItems = Object.keys(rowSelection).map((key) => data[key]);
        const itemIds = selectedItems.map(item => item.item_id);

        setIsDeleting(true); // mulai loading

        try {
            await axios.post("/api/cashier/delete-items", {
                invoice_id: invoice.id,
                item_ids: itemIds,
                user_id: auth.user.id
            });
            setSuccess("Berhasil menghapus item");
            getItems();
        } catch (error) {
            setError("Gagal menghapus item");
        } finally {
            getInvoice()
            setIsDeleting(false); // selesai loading
            router.get("/cashier",{},{preserveState:true, replace:true})
        }
    };


    return (
        <div>
            <Table className={'max-sm:text-xs'}>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id}>
                                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                </TableHead>
                            ))}
                            <TableHead className={'text-center'}>QTY</TableHead>
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                                {/* Increment and Decrement buttons */}
                                <TableCell>
                                    <div className="text-center flex gap-2">
                                        <Button
                                            size="sm"
                                            className="rounded-full"
                                            onClick={() => handleDecrement(row.original)}
                                            disabled={
                                                ['ornamen'].includes(row.original.item?.category?.category_name.toLowerCase())
                                                    ? row.original.qty <= 1
                                                    : row.original.qty <= 0.5
                                            }                                        >
                                            -
                                        </Button>
                                        <Input
                                            value={row.original.price_type === 'eceran'
                                                ? (row.original.qty || 1)
                                                : row.original.qty}
                                            readOnly={true}
                                            className="w-12 text-center"
                                        />

                                        <Button
                                            size="sm"
                                            className="rounded-full"
                                            disabled={row.original.item?.stock===0}
                                            onClick={() => handleIncrement(row.original)}
                                        >
                                            +
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>

            </Table>
            {table.getFilteredSelectedRowModel().rows.length > 0 && (
                <div
                    className="flex justify-between items-center w-full px-4 py-2 bg-gray-100 rounded-lg sm:flex-row flex-col">
                    {/* Add any other footer content here if needed */}
                    <Button
                        variant={'destructive'}
                        className="w-full sm:w-auto mt-2 sm:mt-0"
                        onClick={handleDeleteSelected}
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Menghapus..." : "Hapus"}
                    </Button>

                </div>
            )}
        </div>
    );
};

export default DataTable;
