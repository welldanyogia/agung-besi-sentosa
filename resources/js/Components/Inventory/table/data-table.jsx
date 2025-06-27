'use client';

import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    getPaginationRowModel,
    getFilteredRowModel
} from '@tanstack/react-table';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/Components/ui/table';
import {Card, CardContent, CardFooter, CardTitle} from "@/Components/ui/card.jsx";
import {DataTablePagination} from "@/Components/Inventory/table/data-table-pagination.jsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/Components/ui/select.jsx";
import {DataTableViewOptions} from "@/Components/Inventory/table/data-table-view-option.jsx";
import {useEffect, useState} from "react";
import {Button} from "@/Components/ui/button.jsx";
import {DialogTambahBarang} from "@/Components/Inventory/DialogTambahBarang.jsx";
import {Input} from "@/Components/ui/input.jsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import {saveAs} from "file-saver";
import React from "react";

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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuShortcut, DropdownMenuSub,
    DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger
} from "@/Components/ui/dropdown-menu.jsx";
import {DialogTambahPembelian} from "@/Components/Inventory/DialogTambahPembelian.jsx";
import {DialogEditPembelian} from "@/Components/Inventory/DialogEditPembelian.jsx";
import {AlertDeletePembelianDialog} from "@/Components/Inventory/AlertDeletePembelianDialog.jsx";

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
    // {
    //     value: 0,
    //     label: "Non Pajak",
    //     // icon: Circle,
    // },
]
const DataTable = ({setTabValue,columns, data, auth, setError, setSuccess, getData, satuan, tab,itemCodes,items}) => {
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

    const columnTranslations = {
        "no": "No",
        "item_code": "Kode Barang",
        "item_name": "Nama Barang",
        "category.category_name": "Kategori",
        "stock": "Stok",
        "price": "Harga Modal",
        "retail_price": "Harga Retail",
        "wholesale_price": "Harga Grosir",
        "eceran_price": "Harga Eceran",
        "satuan": "Satuan",
        "is_tax": "Pajak",
        "created_at": "Dibuat Pada",
        "updated_at": "Diperbarui Pada"
    };
    const extractText = (element) => {
        if (typeof element === "string") return element; // Jika sudah string, langsung kembalikan
        if (React.isValidElement(element)) return extractText(element.props.children); // Ambil children jika React element
        return "";
    };
    const formatTimestamp = (timestamp) => {
        if (!timestamp) return "-";
        const date = new Date(timestamp);
        return date.toLocaleString("id-ID", {
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit", second: "2-digit"
        });
    };
    const formatUppercase = (string) => {
        return typeof string === 'string' ? string.toUpperCase() : '';
    };


    const formatRupiah = (amount) => {
        if (!amount) return "-";
        return new Intl.NumberFormat('id-ID', {style: 'currency', currency: 'IDR'}).format(amount);
    };

    const downloadPDF = (columns, data) => {
        if (!Array.isArray(columns) || !Array.isArray(data)) {
            console.error("Columns atau data tidak valid:", {columns, data});
            return;
        }

        const doc = new jsPDF({orientation: "landscape", unit: "mm", format: "a4"});
        doc.text("Inventory Data", 14, 10);

        try {
            // Ubah urutan kolom: pindahkan Satuan setelah Stok dan abaikan kolom 'select' dan 'actions'
            const newColumns = columns.filter(col => col.id !== 'select' && col.id !== 'actions') // Mengabaikan kolom select dan actions
                .map(col => col.accessorKey);

            const stockIndex = newColumns.indexOf("stock");
            const satuanIndex = newColumns.indexOf("satuan");

            // Jika kolom Satuan ditemukan, pindahkan setelah Stok
            if (stockIndex > -1 && satuanIndex > -1) {
                newColumns.splice(stockIndex + 1, 0, newColumns.splice(satuanIndex, 1)[0]);
            }

            // Ambil teks header dari `accessorKey` lalu ubah ke bahasa Indonesia
            const tableColumn = newColumns
                .map(col => columnTranslations[col] || col); // Ubah ke Indonesia jika ada

            // Ambil data berdasarkan `accessorKey`
            const tableRows = data.map((row, index) =>
                newColumns.map(col => {
                    if (col === "no") return index + 1; // Tambahkan nomor urut
                    if (col === "is_tax") return row[col] ? "Pajak" : "Tanpa Pajak"; // Ubah 1/0 menjadi Pajak/Tanpa Pajak
                    if (col === "category.category_name") return formatUppercase(data[index].category?.category_name);
                    if (col === "created_at" || col === "updated_at") return formatTimestamp(row[col]); // Format timestamp
                    if (["price", "retail_price", "wholesale_price", "eceran_price"].includes(col)) return formatRupiah(row[col]); // Format harga menjadi rupiah
                    return row[col] || "-"; // Isi data atau "-"
                })
            );

            // Mendapatkan waktu saat download dilakukan
            const currentTime = new Date().toISOString().replace(/[-:.]/g, ""); // Menghapus karakter yang tidak valid dalam nama file
            const fileName = `stok_barang_cv_agung_besi_sentosa_${currentTime}.pdf`;

            // Menggunakan autoTable untuk mendownload PDF
            autoTable(doc, {
                startY: 20,
                head: [tableColumn],
                body: tableRows,
                margin: {top: 20, bottom: 10, left: 10, right: 10},
                styles: {fontSize: 8, cellPadding: 1, overflow: 'linebreak'},
                columnStyles: {0: {cellWidth: 20}, 1: {cellWidth: 40}, 2: {cellWidth: 'auto'}},
                pageBreak: 'auto',
                didDrawPage: function () {
                    doc.text("Inventory Data", 14, 10);
                }
            });

            // Menyimpan file dengan nama yang telah disesuaikan
            doc.save(fileName);
        } catch (error) {
            console.error("Error saat generate PDF:", error);
        }
    };


    const downloadExcel = (columns, data) => {
        if (!Array.isArray(columns) || !Array.isArray(data)) {
            console.error("Columns atau data tidak valid:", {columns, data});
            return;
        }

        try {
            // Ubah urutan kolom: pindahkan Satuan setelah Stok dan abaikan kolom 'select' dan 'actions'
            const newColumns = columns.filter(col => col.id !== 'select' && col.id !== 'actions') // Mengabaikan kolom select dan actions
                .map(col => col.accessorKey);

            const stockIndex = newColumns.indexOf("stock");
            const satuanIndex = newColumns.indexOf("satuan");

            // Jika kolom Satuan ditemukan, pindahkan setelah Stok
            if (stockIndex > -1 && satuanIndex > -1) {
                newColumns.splice(stockIndex + 1, 0, newColumns.splice(satuanIndex, 1)[0]);
            }

            // Ambil teks header dari `accessorKey` lalu ubah ke bahasa Indonesia
            const tableColumn = newColumns
                .map(col => columnTranslations[col] || col); // Ubah ke Indonesia jika ada

            // Ambil data berdasarkan `accessorKey`
            const tableRows = data.map((row, index) =>
                newColumns.map(col => {
                    // console.log(col)
                    if (col === "no") return index + 1; // Tambahkan nomor urut
                    if (col === "is_tax") return row[col] ? "Pajak" : "Tanpa Pajak"; // Ubah 1/0 menjadi Pajak/Tanpa Pajak
                    if (col === "category.category_name") return formatUppercase(data[index].category?.category_name);

                    // return row[col]; // Format timestamp
                    if (col === "created_at" || col === "updated_at") return formatTimestamp(row[col]); // Format timestamp
                    if (["price", "retail_price", "wholesale_price", "eceran_price"].includes(col)) return formatRupiah(row[col]); // Format harga menjadi rupiah
                    return row[col] || "-"; // Isi data atau "-"
                })
            );

            // Mendapatkan waktu saat download dilakukan
            const currentTime = new Date().toISOString().replace(/[-:.]/g, ""); // Menghapus karakter yang tidak valid dalam nama file
            const fileName = `stok_barang_cv_agung_besi_sentosa_${currentTime}.xlsx`;

            // Membuat worksheet dan workbook untuk Excel
            const ws = XLSX.utils.aoa_to_sheet([tableColumn, ...tableRows]);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Inventory Data");

            // Menyimpan file Excel dengan nama yang telah disesuaikan
            XLSX.writeFile(wb, fileName);
        } catch (error) {
            console.error("Error saat generate Excel:", error);
        }
    };

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


    return (
        <>
            <Card className={'p-6 space-y-2 max-sm:text-sm'}>
                <CardTitle className={'uppercase'}>
                    {tab}
                </CardTitle>

                <CardContent>
                    <div className={'flex flex-col space-y-2'}>
                        <div className={'p-2 flex gap-2 w-full lg:justify-between max-md:grid'}>
                            <div
                                className={'grid gap-2 max-md:w-full max-md:grid-cols-2 max-sm:grid-cols-1'}>
                                {
                                    table.getFilteredSelectedRowModel().rows.length > 0 && (
                                        <div className={''}>
                                            <Button variant={'destructive'} size={'sm'} className="lg:flex">
                                                Hapus Data Yang Dipilih
                                            </Button>
                                        </div>
                                    )
                                }
                                <div className={'flex gap-4 max-md:w-full max-md:col-span-2 max-sm:grid'}>
                                    <div className="flex items-center w-full">
                                        <Input
                                            placeholder="Cari berdasarkan Nama atau Kode Barang..."
                                            value={table.getState().globalFilter ?? ""}
                                            onChange={(event) => table.setGlobalFilter(event.target.value)}
                                            className="w-auto"
                                        />
                                    </div>
                                    <div className={'flex gap-2'}>
                                        <DataTableFacetedFilter column={table.getColumn("kategori")}
                                                                options={categories}
                                                                title={"Kategori"}/>
                                        <DataTableFacetedFilter column={table.getColumn("pajak")} options={statuses}
                                                                title={"Pajak"}/>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 ">
                                    <p className="text-sm font-medium">Rows per page</p>
                                    <Select
                                        value={`${table.getState().pagination.pageSize}`}
                                        onValueChange={(value) => {
                                            table.setPageSize(Number(value))
                                        }}
                                    >
                                        <SelectTrigger className="h-8 w-[70px]">
                                            <SelectValue placeholder={table.getState().pagination.pageSize}/>
                                        </SelectTrigger>
                                        <SelectContent side="top">
                                            {[10, 20, 30, 40, 50].map((pageSize) => (
                                                <SelectItem key={pageSize} value={`${pageSize}`}>
                                                    {pageSize}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className={'flex gap-2'}>

                                <DialogTambahPembelian auth={auth} getData={getData} setSuccess={setSuccess}
                                                    setError={setError} dataSatuan={satuan} itemCodes={itemCodes} items={items}/>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline">Download</Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56">
                                        <DropdownMenuLabel>Download Data</DropdownMenuLabel>
                                        <DropdownMenuSeparator/>
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem
                                                onClick={() => downloadPDF(columns, data)}>
                                                PDF
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => downloadExcel(columns, data)}>
                                                Excel
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <DataTableViewOptions table={table}/>
                            </div>
                        </div>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader className={'bg-accent text-white border-2'}>
                                    {table.getHeaderGroups().map(headerGroup => (
                                        <TableRow key={headerGroup.id}>
                                            {headerGroup.headers.map(header => (
                                                <TableHead key={header.id}>
                                                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                                </TableHead>
                                            ))}
                                            <TableHead
                                                className="sticky sm:right-0 text-center bg-indigo-400"
                                                style={{zIndex: 1}}
                                            >
                                                Aksi
                                            </TableHead>
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
                                                <TableCell
                                                    className="sticky sm:right-0 flex gap-2 items-center bg-white"
                                                    style={{zIndex: 1}}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {/*<EditAlatKerjaDialog data={row.original} projects={projects}/>*/}
                                                    {/*<DeleteAlatKerjaDialog data={row}/>*/}
                                                    <DialogEditPembelian setTabValue={setTabValue} pembelian={row.original} dataSatuan={satuan}
                                                                      setError={setError} setSuccess={setSuccess}/>
                                                    <AlertDeletePembelianDialog id={row.original}/>
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
