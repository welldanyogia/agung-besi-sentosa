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
import React, {useEffect, useState} from "react";
import {Button} from "@/Components/ui/button.jsx";
import {DialogTambahBarang} from "@/Components/Inventory/DialogTambahBarang.jsx";
import {Input} from "@/Components/ui/input.jsx";
import {addDays, format} from "date-fns"
import {
    ArrowDown,
    ArrowRight,
    ArrowUp, CalendarIcon,
    CheckCircle,
    Circle,
    CircleOff,
    HelpCircle,
    Timer,
} from "lucide-react"
import {DataTableFacetedFilter} from "@/Components/Inventory/table/data-table-faceted-filter.jsx";
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/Components/ui/dropdown-menu.jsx";
import {Popover, PopoverContent, PopoverTrigger} from "@/Components/ui/popover.jsx";
import { Calendar } from "@/Components/ui/calendar"
import {cn} from "@/lib/utils.js";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

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
const DataTable = ({columns, data, auth,setError, setSuccess}) => {
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
    const [date, setDate] = React.useState({
        from: addDays(new Date(), -7), // Mulai dari hari ini
        to: new Date() // 20 hari setelahnya
    })
    const [transactions, setTransactions] = useState([]);



    const fetchTransactions = async (startDate, endDate, setTransactions) => {
        try {
            const response = await fetch("/api/transactions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    start_date: startDate,
                    end_date: endDate,
                }),
            });

            const data = await response.json();

            setTransactions(data.transactions); // Sesuaikan dengan response API
            if (response.ok) {
                setTransactions(data.transactions); // Sesuaikan dengan response API
                // console.log("transaction : ", transactions.length)
            } else {
                console.error("Error fetching transactions:", data.message);
            }
        } catch (error) {
            console.error("Error fetching transactions:", error);
        }
    };

    useEffect(() => {
        if (date?.from && date?.to) {
            const startDate = format(date.from, "yyyy-MM-dd");
            const endDate = format(date.to, "yyyy-MM-dd");

            fetchTransactions(startDate, endDate, setTransactions);
        }
    }, [date]);
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

    const sampleTransactions = [
        {
            invoice_code: 'NV-20250324-00001',
            customer_name: 'Pelanggan',
            items: [
                {
                    item: { item_name: 'PIPA GAS 5/8 inch' },
                    qty: 3,
                    price: 100000,
                    sub_total: 300000
                },
                {
                    item: { item_name: 'Test Barang 4' },
                    qty: 2,
                    price: 100000,
                    sub_total: 200000
                }
            ],
            total_price: 500000,
            payment: 'Cash',
            status: 'Berhasil',
            created_by: { name: 'Super Admin Name' },
            tanggal: '2025-03-24'
        }
    ];

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }) + ' ' + date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };


    const downloadInvoicePDF = (transactions, startDate = '2025-03-01', endDate = '2025-03-31') => {
        const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

        // Set font size
        doc.setFontSize(6);

        // Add title - Centered horizontally
        const title = "Daftar Transaksi";
        const periodText = `Periode: ${startDate} s/d ${endDate}`;
        const titleWidth = doc.getTextWidth(title);
        const periodWidth = doc.getTextWidth(periodText);

        doc.text(title, (doc.internal.pageSize.width - titleWidth) / 2, 10);
        doc.text(periodText, (doc.internal.pageSize.width - periodWidth) / 2, 16);

        // Create headers for the main table
        const mainHeaders = [
            'Kode Transaksi',
            'Nama Pelanggan',
            'Nama Barang',
            'QTY',
            'Harga',
            'Sub-Total',
            'Total Harga',
            'Metode Pembayaran',
            'Jumlah Pembayaran',
            'Kembalian',
            'Status',
            'Kasir',
            'Tanggal'
        ];

        // Create rows for the main table
        const allRows = [];
        const itemSummary = {};  // To store item-wise quantities and total sales
        let totalAllPrice = 0; // Track the total amount for all transactions

        transactions.forEach(tx => {
            // Check if transaction has items
            if (!tx.items || tx.items.length === 0) {
                // Handle case when there are no items
                const emptyRow = [
                    tx.invoice_code || '',
                    tx.customer_name || '',
                    'No items',
                    '',
                    '',
                    '',
                    `Rp ${tx.total_price?.toLocaleString() || 0}`,
                    tx.payment || '',
                    tx.status || '',
                    tx.created_by?.name || '',
                    formatDate(tx.created_at) || ''
                ];
                allRows.push(emptyRow);
                // totalAllPrice += tx.total_price || 0;
                return;
            }

            // Process items - now repeating all transaction info for each item
            const numItems = tx.items.length; // Get number of items for rowspan
            tx.items.forEach((itemData, index) => {
                const row = [];

                // Apply rowspan for Invoice Code (only on the first item)
                if (index === 0) {
                    row.push({ rowSpan: numItems, content: tx.invoice_code || '' });
                }

                // Apply rowspan for Customer Name (only on the first item)
                if (index === 0) {
                    row.push({ rowSpan: numItems, content: tx.customer_name || '' });
                }

                // Always display item name in its respective column
                row.push(itemData.item?.item_name || 'Unknown Item');

                // Always display other columns normally (Quantity, Price, Sub-Total)
                row.push(itemData.qty || 0);
                row.push(`Rp ${itemData.price?.toLocaleString() || 0}`);
                row.push(`Rp ${itemData.sub_total?.toLocaleString() || 0}`);

                // Apply rowspan for Total Price (only on the first item)
                if (index === 0) {
                    row.push({ rowSpan: numItems, content: `Rp ${tx.total_price?.toLocaleString() || 0}` });
                }

                // Apply rowspan for Payment (only on the first item)
                if (index === 0) {
                    row.push({ rowSpan: numItems, content: tx.payment || '' });
                }

                // Apply rowspan for Jumlah Pembayaran (only on the first item)
                if (index === 0) {
                    row.push({ rowSpan: numItems, content: `Rp ${tx.bayar?.toLocaleString() || 0}` });
                }

                // Apply rowspan for Kembalian (only on the first item)
                if (index === 0) {
                    row.push({ rowSpan: numItems, content: `Rp ${tx.kembalian?.toLocaleString() || 0}` });
                }

                // Apply rowspan for Status (only on the first item)
                if (index === 0) {
                    const statusFormatted = tx.status === 'cash' ? 'Tunai' : 'Non Tunai';
                    row.push({ rowSpan: numItems, content: statusFormatted });
                }

                // Apply rowspan for Created By (only on the first item)
                if (index === 0) {
                    row.push({ rowSpan: numItems, content: tx.created_by?.name || '' });
                }

                // Apply rowspan for Tanggal (only on the first item)
                if (index === 0) {
                    row.push({ rowSpan: numItems, content: formatDate(tx.created_at) || '' });
                }

                allRows.push(row);

                // Track the item quantities for summary
                const itemName = itemData.item?.item_name || 'Unknown Item';
                if (!itemSummary[itemName]) {
                    itemSummary[itemName] = { qty: 0, subTotal: 0 };
                }
                itemSummary[itemName].qty += itemData.qty;
                itemSummary[itemName].subTotal += itemData.sub_total || 0;
                totalAllPrice += itemData.sub_total || 0;

            });
        });

        // Summary table for total transactions, items sold, and quantity per item
        const summaryHeaders = ['Nama Barang', 'Jumlah Terjual', 'Sub-Total'];

        const summaryRows = Object.keys(itemSummary).map(itemName => [
            itemName,
            itemSummary[itemName].qty,
            `Rp ${itemSummary[itemName].subTotal.toLocaleString() || 0}`
        ]);

        // Add the "Total Semua" row
        summaryRows.push([

            { content: 'Total Semua', colSpan: 1, styles: { fontStyle: 'bold',fillColor: [0, 123, 255] } },
            { content: `Rp ${totalAllPrice.toLocaleString()}`, colSpan: 2,styles: { fontStyle: 'bold'} },
            //
            // `Rp ${totalAllPrice.toLocaleString()}`
        ]);

        // Add the summary table after the main table
        autoTable(doc, {
            head: [summaryHeaders],
            body: summaryRows,
            startY: 22,
            theme: 'grid',
            styles: {
                fontSize: 6,
                cellPadding: 2,
                halign: 'center',
                valign: 'middle'
            },
            columnStyles: {
                0: { cellWidth: 'auto' },  // Item Name column
                1: { cellWidth: 30 }, // Quantity column
                2: { cellWidth: 40 } // Sub-total column
            }
        });

        // Create table with auto table
        autoTable(doc, {
            head: [mainHeaders],
            body: allRows,
            startY: doc.lastAutoTable.finalY + 10,
            theme: 'grid',
            styles: {
                fontSize: 6,
                cellPadding: 2,
                halign: 'center',
                valign: 'middle'
            },
            columnStyles: {
                0: { cellWidth: 20 },  // Invoice Code column
                1: { cellWidth: 20 },  // Customer Name column
                2: { cellWidth: 20 }, // Item Name column
                3: { cellWidth: 10 },
                4: { cellWidth: 20 },
                5: { cellWidth: 20 },
                6: { cellWidth: 20 },
                7: { cellWidth: 20 },
                8: { cellWidth: 20 },
                9: { cellWidth: 30 },
                10: { cellWidth: 30 },
            },
            didDrawPage: function(data) {
                // Add page number - Centered horizontally
                doc.setFontSize(8);
                const pageNumber = `Halaman ${doc.internal.getNumberOfPages()}`;
                const pageWidth = doc.getTextWidth(pageNumber);
                doc.text(pageNumber, (doc.internal.pageSize.width - pageWidth) / 2, doc.internal.pageSize.height - 10);
            }
        });

        // Save the PDF
        const fileName = `invoice_${startDate}_${endDate}.pdf`;
        doc.save(fileName);
    };

    const downloadInvoiceExcel = (transactions, startDate = '2025-03-01', endDate = '2025-03-31') => {
        const wb = XLSX.utils.book_new();
        const wsData = [];

        // Create header for main table with colored cells
        const header = [
            'Kode Transaksi',
            'Nama Pelanggan',
            'Nama Barang',
            'QTY',
            'Harga',
            'Sub-Total',
            'Total Harga',
            'Metode Pembayaran',
            'Jumlah Pembayaran',
            'Kembalian',
            'Status',
            'Kasir',
            'Tanggal'
        ];

        // Apply header color (yellow, for example)
        const headerRow = header.map(cell => ({
            v: cell,
            s: {
                fill: {
                    fgColor: { rgb: 'FFFF00' } // Yellow color
                },
                font: { bold: true },
                alignment: {
                    horizontal: "center",
                    vertical: "center"
                }
            }
        }));
        wsData.push(headerRow);

        // Add data rows
        transactions.forEach(tx => {
            const row = [
                tx.invoice_code || '',
                tx.customer_name || '',
                tx.items.map(item => item.item?.item_name).join(', ') || 'No items',
                tx.items.reduce((sum, item) => sum + item.qty, 0) || 0,
                `Rp ${tx.items.reduce((sum, item) => sum + item.price, 0).toLocaleString() || 0}`,
                `Rp ${tx.items.reduce((sum, item) => sum + item.sub_total, 0).toLocaleString() || 0}`,
                `Rp ${tx.total_price?.toLocaleString() || 0}`,
                tx.payment || '',
                `Rp ${tx.bayar?.toLocaleString() || 0}`,
                `Rp ${tx.kembalian?.toLocaleString() || 0}`,
                tx.status === 'cash' ? 'Tunai' : 'Non Tunai',
                tx.created_by?.name || '',
                formatDate(tx.created_at) || ''
            ];
            wsData.push(row);
        });

        // Create worksheet and apply auto width for all columns
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Adjust column widths to be auto
        const range = XLSX.utils.decode_range(ws['!ref']);
        for (let col = range.s.c; col <= range.e.c; col++) {
            let maxLength = 0;
            for (let row = range.s.r; row <= range.e.r; row++) {
                const cell = ws[XLSX.utils.encode_cell({ r: row, c: col })];
                if (cell && cell.v && cell.v.toString().length > maxLength) {
                    maxLength = cell.v.toString().length;
                }
            }
            ws['!cols'] = ws['!cols'] || [];
            ws['!cols'][col] = { wpx: Math.min(maxLength * 8, 150) }; // Adjust the width to fit content
        }

        // Set alignment for all cells (center horizontally and vertically)
        for (let row = range.s.r; row <= range.e.r; row++) {
            for (let col = range.s.c; col <= range.e.c; col++) {
                const cell = ws[XLSX.utils.encode_cell({ r: row, c: col })];
                if (cell) {
                    cell.s = cell.s || {};
                    cell.s.alignment = { horizontal: 'center', vertical: 'center' };
                }
            }
        }

        // Add the worksheet for transactions to the workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Invoice');

        // Create Summary Sheet
        const summaryHeaders = ['Nama Barang', 'Jumlah Terjual', 'Sub-Total'];
        const itemSummary = {};

        transactions.forEach(tx => {
            tx.items.forEach(itemData => {
                const itemName = itemData.item?.item_name || 'Unknown Item';
                if (!itemSummary[itemName]) {
                    itemSummary[itemName] = { qty: 0, subTotal: 0 };
                }
                itemSummary[itemName].qty += itemData.qty;
                itemSummary[itemName].subTotal += itemData.sub_total || 0;
            });
        });

        const summaryRows = Object.keys(itemSummary).map(itemName => [
            itemName,
            itemSummary[itemName].qty,
            `Rp ${itemSummary[itemName].subTotal.toLocaleString() || 0}`
        ]);

        // Add "Total Semua" row
        const totalAllPrice = Object.values(itemSummary).reduce((sum, item) => sum + item.subTotal, 0);
        summaryRows.push([
            { v: 'Total Semua', s: { font: { bold: true }, fill: { fgColor: { rgb: 'FFFF00' } }, alignment: { horizontal: 'center', vertical: 'center' } } },
            { v: '', s: { font: { bold: true }, alignment: { horizontal: 'center', vertical: 'center' } } },
            { v: `Rp ${totalAllPrice.toLocaleString()}`, s: { font: { bold: true }, alignment: { horizontal: 'center', vertical: 'center' } } }
        ]);

        const summaryWs = XLSX.utils.aoa_to_sheet([summaryHeaders, ...summaryRows]);

        // Adjust column widths for summary sheet
        const summaryRange = XLSX.utils.decode_range(summaryWs['!ref']);
        for (let col = summaryRange.s.c; col <= summaryRange.e.c; col++) {
            let maxLength = 0;
            for (let row = summaryRange.s.r; row <= summaryRange.e.r; row++) {
                const cell = summaryWs[XLSX.utils.encode_cell({ r: row, c: col })];
                if (cell && cell.v && cell.v.toString().length > maxLength) {
                    maxLength = cell.v.toString().length;
                }
            }
            summaryWs['!cols'] = summaryWs['!cols'] || [];
            summaryWs['!cols'][col] = { wpx: Math.min(maxLength * 8, 150) }; // Adjust the width to fit content
        }

        // Set alignment for all cells in summary sheet
        for (let row = summaryRange.s.r; row <= summaryRange.e.r; row++) {
            for (let col = summaryRange.s.c; col <= summaryRange.e.c; col++) {
                const cell = summaryWs[XLSX.utils.encode_cell({ r: row, c: col })];
                if (cell) {
                    cell.s = cell.s || {};
                    cell.s.alignment = { horizontal: 'center', vertical: 'center' };
                }
            }
        }

        // Add the summary sheet to the workbook
        XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

        // Save the Excel file
        const fileName = `invoice_${startDate}_${endDate}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };




    // const downloadPDF = (transactions, startDate, endDate) => {
    //     const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    //
    //     // Ensure the font size is set properly
    //     doc.setFontSize(12); // Set a default font size to avoid undefined errors
    //
    //     // Menambahkan judul
    //     doc.text("Daftar Transaksi", 14, 10);
    //
    //     // Kolom utama untuk tabel
    //     const tableColumn = [
    //         "Invoice Code",
    //         "Customer Name",
    //         "Item", // The "Item" column will be used for the sub-columns of items
    //         "Total Price",
    //         "Payment",
    //         "Status",
    //         "Created By",
    //     ];
    //
    //     // Sub-kolom untuk item (akan dimasukkan di bawah kolom 'Item')
    //     const itemColumns = [
    //         "Item Name",
    //         "Quantity",
    //         "Price",
    //         "Sub Total",
    //     ];
    //
    //     const tableRows = [];
    //
    //     // Menambahkan data transaksi ke dalam tabel
    //     transactions.forEach((tx) => {
    //         // Baris utama untuk transaksi (tanpa detail item, hanya informasi transaksi)
    //         const transactionRow = [
    //             tx.invoice_code,
    //             tx.customer_name,
    //             "", // "Item" column for the main row (empty, will be filled with item details below)
    //             `Rp ${tx.total_price.toLocaleString()}`,
    //             tx.payment || "Pending",
    //             tx.status,
    //             tx.created_by.name,
    //         ];
    //
    //         // Menambahkan baris transaksi utama
    //         tableRows.push(transactionRow);
    //
    //         // Menambahkan sub-kolom untuk item dalam transaksi (akan ditampilkan di bawah kolom 'Item')
    //         tx.items.forEach((item, index) => {
    //             // If the item is the first one, we keep the transaction row's data for this item in the "Item" column
    //             const itemRow = [
    //                 "",  // Leave the first column empty for sub-items
    //                 "",  // Leave the second column empty for sub-items
    //                 item.item.item_name,  // Item name in the "Item" column
    //                 item.qty,
    //                 `Rp ${item.price.toLocaleString()}`,
    //                 `Rp ${item.sub_total.toLocaleString()}`,
    //             ];
    //
    //             tableRows.push(itemRow);
    //         });
    //     });
    //
    //     // Menambahkan tabel ke dalam PDF
    //     autoTable(doc, {
    //         head: [tableColumn], // Main table header
    //         body: tableRows, // Data rows (including items as sub-rows)
    //         startY: 20,
    //         styles: { fontSize: 8 },
    //         theme: 'grid',
    //         columnStyles: {
    //             0: { cellWidth: 'auto' },
    //             1: { cellWidth: 'auto' },
    //             2: { cellWidth: 'auto' },
    //         },
    //         margin: { top: 20 },
    //     });
    //
    //     const fileName = `transaksi_${startDate}_${endDate}.pdf`;
    //
    //     // Menyimpan PDF
    //     doc.save(fileName);
    // };





    useEffect(() => {
        getCategories()
    }, []);


    return (
        <>
            <Card className={'p-6 space-y-2'}>
                <CardTitle>
                    Inventory
                </CardTitle>

                <CardContent>
                    <div className={'flex flex-col space-y-2'}>
                        <div className={'p-2 flex justify-between'}>
                            <div className={'grid gap-2'}>
                                <div className={'flex gap-4'}>
                                    <div className="flex items-center">
                                        <Input
                                            placeholder="Cari berdasarkan Nama atau Kode Barang..."
                                            value={table.getState().globalFilter ?? ""}
                                            onChange={(event) => table.setGlobalFilter(event.target.value)}
                                            className="max-w-sm"
                                        />
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
                            <div className={'flex gap-2 '}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline">Download</Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-auto">
                                        <DropdownMenuLabel>Pilih Rentang Waktu</DropdownMenuLabel>
                                        <DropdownMenuSeparator/>
                                        <div className={cn('grid gap-2')}>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        id='date'
                                                        variant='outline'
                                                        className={cn(
                                                            'w-[300px] justify-start text-left font-normal',
                                                            !date && 'text-muted-foreground'
                                                        )}
                                                    >
                                                        <CalendarIcon className='mr-2 h-4 w-4'/>
                                                        {date?.from ? (
                                                            date.to ? (
                                                                <>
                                                                    {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
                                                                </>
                                                            ) : (
                                                                format(date.from, 'LLL dd, y')
                                                            )
                                                        ) : (
                                                            <span>Pilih Tanggal</span>
                                                        )}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className='w-auto min-w-[350px] p-4'
                                                                align='start'>
                                                    <Calendar
                                                        initialFocus
                                                        mode='range'
                                                        defaultMonth={date?.from}
                                                        selected={date}
                                                        onSelect={setDate}
                                                        numberOfMonths={2}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                        <DropdownMenuSeparator/>
                                        <DropdownMenuLabel>Download Data</DropdownMenuLabel>
                                        <DropdownMenuSeparator/>
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem
                                                // onClick={() => downloadPDF(transactions, format(date.from, "yyyy-MM-dd"), format(date.to, "yyyy-MM-dd"))}
                                                onClick={() => downloadInvoicePDF(transactions, format(date.from, "yyyy-MM-dd"), format(date.to, "yyyy-MM-dd"))}
                                                disabled={ transactions.length ===0}
                                            >
                                                PDF
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => downloadInvoiceExcel(transactions, format(date.from, "yyyy-MM-dd"), format(date.to, "yyyy-MM-dd"))}
                                                // disabled={ transactions !== null}
                                                disabled={ transactions.length ===0}
                                            >
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
