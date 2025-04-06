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
import {useEffect, useState} from "react";
import {Button} from "@/Components/ui/button.jsx";

import {
    Printer
} from "lucide-react"
import {usePage} from "@inertiajs/react";
import axios from "axios";
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
const DataTable = ({columns, data, auth, setError, setSuccess, invoice}) => {
    const { storeInfo } = usePage().props;

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

    function formatWaktuIndonesia(timestamp) {
        return new Date(timestamp).toLocaleString("id-ID", {
            weekday: "long",  // Nama hari (Senin, Selasa, dll.)
            year: "numeric",  // Tahun (2024)
            month: "long",  // Nama bulan (Januari, Februari, dll.)
            day: "numeric",  // Tanggal (1, 2, 3, dll.)
            hour: "2-digit",  // Jam (24 jam format)
            minute: "2-digit",  // Menit
            second: "2-digit",  // Detik
            timeZone: "Asia/Jakarta"  // WIB (Waktu Indonesia Barat)
        });
    }

    const updateIsPrinted = async (invoiceId, isPrinted) => {
        try {
            const response = await axios.post(`/api/invoices/${invoiceId}/update-is-printed`, {
                is_printed: isPrinted
            });

            console.log("Berhasil update status is_printed:", response.data);
            return response.data; // Mengembalikan data response
        } catch (error) {
            console.error("Gagal update status is_printed:", error.response?.data || error.message);
            throw error;
        }
    };

    const formatRupiah = (number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }).format(number);
    };

    const handlePrint = async () => {
        let printWindow = window.open('', '');

        printWindow.document.write(`
<html>
<head>
  <style>
    @media print {

      /*@page {*/
      /*  size: A4;*/
      /*  margin: 1cm;*/
      /*}*/
      @page {
  margin: 0;
}


      body {
        font-family: "Courier New", monospace;
        font-size: 12px;
        color: #000;
        margin-top: 50px;
        /*margin-left: 2px;*/
        /*margin-right: 2px;*/
      }

      .header, .footer {
        text-align: center;
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 4px;
        margin-top: 4px;
      }

      .info {
        margin-bottom: 6px;
        margin-left: 20px;
        margin-right: 20px;
      }

      .info div {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
      }

      .line {
        border-top: 1px dashed #000;
        margin: 4px 0;
      }

      .table-head,
      .table-row {
        display: flex;
        justify-content: space-between;
        font-size: 15px;
      }

      .table-head {
        font-weight: bold;
        border-bottom: 1px solid #000;
        padding-bottom: 4px;
      }

      .col-item { width: 40%; text-align: left; margin-left: 10px }
      .col-price { width: 20%; text-align: right; }
      .col-qty { width: 15%; text-align: right; }
      .col-subtotal { width: 25%; text-align: center; }

      .totals {
        margin-top: 6px;
      }

      .totals .table-row {
        font-weight: bold;
      }

      .footer {
        margin-top: 8px;
        font-size: 14px;
        text-align: center;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    ${storeInfo?.store_name || 'CV AGUNG BESI SENTOSA'}<br>
    ${storeInfo?.address || 'Store Address'}<br>
    Telp: ${storeInfo?.phone_number || 'Store Phone'}
  </div>
<!--  <div class="info">-->
<!--    <div><span></span></div>-->
<!--    <div><span></span></div>-->
<!--  </div>-->

  <div class="info">
    <div><span>Invoice:</span><span>${invoice.invoice_code}</span></div>
    <div><span>Kasir:</span><span>${invoice.created_by.name}</span></div>
    <div><span>Customer:</span><span>${invoice.customer_name}</span></div>
  </div>

  <div class="line"></div>

  <div class="table-head">
    <div class="col-item">Item</div>
    <div class="col-price">Harga</div>
    <div class="col-qty">Qty</div>
    <div class="col-subtotal">Subtotal</div>
  </div>

  ${data.map(item =>
            `<div class="table-row">
      <div class="col-item">${item.item.item_name}</div>
      <div class="col-price">${formatRupiah(item.price)}</div>
      <div class="col-qty">${item.qty}</div>
      <div class="col-subtotal">${formatRupiah(item.price * item.qty)}</div>
    </div>`
        ).join('')}

  <div class="line"></div>

  <div class="totals">
    <div class="table-row">
      <div class="col-item">Total</div>
      <div class="col-subtotal">${formatRupiah(invoice.total_price)}</div>
    </div>
    <div class="table-row">
      <div class="col-item">Bayar</div>
      <div class="col-subtotal">${formatRupiah(invoice.bayar)}</div>
    </div>
    <div class="table-row">
      <div class="col-item">Kembali</div>
      <div class="col-subtotal">${formatRupiah(invoice.kembalian)}</div>
    </div>
  </div>

  <div class="line"></div>

  <div class="footer">
    Terima Kasih Atas Kunjungan Anda!<br>
    *** Struk ini adalah bukti pembayaran ***
  </div>
</body>
</html>
`);
        await updateIsPrinted(invoice.id, true);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
    };


    return (
        <>
            <Card className={'p-6 space-y-2'}>

                <CardContent>
                    <div className={'flex flex-col space-y-2'}>
                        <div className={'p-2 flex justify-between'}>
                            <div className={'grid gap-2 w-full'}>
                                <div className="flex items-center w-full justify-between ">
                                    <div><strong>TOTAL :</strong> {new Intl.NumberFormat('id-ID', {
                                        style: 'currency',
                                        currency: 'IDR',
                                        maximumFractionDigits: 0
                                    }).format(totalHarga)}
                                    </div>
                                    <div>
                                        <strong>Kasir :</strong> {invoice.created_by.name}
                                    </div>
                                </div>
                                <div className="flex items-center w-full justify-between">
                                    <div><strong>Kasir :</strong> {invoice.created_by.name}</div>
                                    <div><strong>Waktu : </strong>{formatWaktuIndonesia(invoice.created_at)}</div>
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
                <CardFooter className={'flex flex-col gap-2'}>
                    <DataTablePagination table={table}/>
                    <div className={'justify-end w-full flex'}>
                        <Button onClick={handlePrint}>
                            <Printer/>
                            Print
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </>
    );
};

export default DataTable;
