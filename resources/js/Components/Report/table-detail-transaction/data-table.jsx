'use client';

import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    getPaginationRowModel,
    getFilteredRowModel
} from '@tanstack/react-table';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/Components/ui/table';
import {Card, CardContent, CardDescription, CardFooter, CardTitle} from "@/Components/ui/card.jsx";
import {DataTablePagination} from "@/Components/Inventory/table/data-table-pagination.jsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/Components/ui/select.jsx";
import {DataTableViewOptions} from "@/Components/Inventory/table/data-table-view-option.jsx";
import {useEffect, useState} from "react";
import {Button} from "@/Components/ui/button.jsx";
import {DialogTambahBarang} from "@/Components/Inventory/DialogTambahBarang.jsx";
import {Input} from "@/Components/ui/input.jsx";

import {
    ArrowDown,
    ArrowRight,
    ArrowUp,
    CheckCircle,
    Circle,
    CircleOff,
    HelpCircle,
    Timer,
} from "lucide-react"
import {DataTableFacetedFilter} from "@/Components/Inventory/table/data-table-faceted-filter.jsx";

export const labels = [
    {
        value: "bug",
        label: "Bug",
    },
    {
        value: "feature",
        label: "Feature",
    },
    {
        value: "documentation",
        label: "Documentation",
    },
]

export const statuses = [
    {
        value: 1,
        label: "Pajak",
        // icon: Tax,
    },
    {
        value: 0,
        label: "Non Pajak",
        // icon: Circle,
    },
]
const DataTable = ({columns, data, auth,setError, setSuccess,invoice}) => {
    const [rowSelection, setRowSelection] = useState({})
    const [columnFilters, setColumnFilters] = useState(
        []
    )
    const table = useReactTable({
        data,
        columns,
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onRowSelectionChange: setRowSelection,
        state: {
            rowSelection,
            columnFilters,
        },
    });
    const [categories, setCategories] = useState([])

    const getCategories = async () => {
        try {
            const response = await axios.post('/api/categories/');

            // Format ulang data agar sesuai dengan priorities
            const formattedCategories = response.data.categories.map(category => ({
                label: category.category_name,
                value: category.category_name,
                icon: null, // Jika ingin menambahkan ikon, bisa diganti dengan komponen yang sesuai
            }));

            setCategories(formattedCategories);
        } catch (error) {
        }
    };

    useEffect(() => {
        getCategories()
    }, []);

    const totalHarga = data.reduce((sum, item) => sum + item.sub_total, 0);
    return (
        <>
            <Card className={'p-6 space-y-2'}>

                <CardContent>
                    <div className={'flex flex-col space-y-2'}>
                        <div className={'p-2 flex justify-between'}>
                            <div className={'grid gap-2'}>
                                <div className="flex items-center space-x-2 ">
                                    <strong>TOTAL : {new Intl.NumberFormat('id-ID', {
                                        style: 'currency',
                                        currency: 'IDR',
                                        maximumFractionDigits: 0
                                    }).format(totalHarga)}</strong>
                                </div>
                                <div className="flex items-center space-x-2 ">
                                    <strong>Kasir : {invoice.created_by.name}</strong>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    {table.getHeaderGroups().map(headerGroup => (
                                        <TableRow key={headerGroup.id}>
                                            {headerGroup.headers.map(header => (
                                                <TableHead key={header.id}>
                                                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableHeader>
                                <TableBody>
                                    {table.getRowModel().rows.length ? (
                                        table.getRowModel().rows.map(row => (
                                            <TableRow key={row.id}
                                                      data-state={row.getIsSelected() ? 'selected' : undefined}>
                                                {row.getVisibleCells().map(cell => (
                                                    <TableCell key={cell.id}>
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </TableCell>
                                                ))}
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
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <DataTablePagination table={table}/>
                </CardFooter>
            </Card>
        </>
    );
};

export default DataTable;
