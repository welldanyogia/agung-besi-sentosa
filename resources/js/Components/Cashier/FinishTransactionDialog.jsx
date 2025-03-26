import { Button } from "@/Components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/dialog";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/Components/ui/table";
import { useRef, useState } from "react";
import { Input } from "@/Components/ui/input.jsx";
import { Separator } from "@/Components/ui/separator.jsx";
import axios from "axios";
import { jsPDF } from "jspdf";

export function FinishTransactionDialog({ invoiceItems, setError, invoice_id, setInvoice, setInvoceItems, storeInfo }) {
    const printRef = useRef();
    const [cashPaid, setCashPaid] = useState(0);
    const [kembalian, setKembalian] = useState(0);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [total, setTotal] = useState(invoiceItems.reduce((acc, item) => acc + (item.price + ((item?.item?.tax / 100) * item.price)) * item.qty, 0));

    const updateInvoiceStatus = async (invoiceId) => {
        try {
            const response = await axios.post(`/api/invoices/${invoiceId}/update-status`, {
                bayar: cashPaid,
                total: total
            });

            setInvoice(null);
            setInvoceItems([]);
            setKembalian(0);
            setCashPaid(0);
        } catch (error) {
            setError("Gagal menambahkan barang!!!");
        }
    };

    const handlePrint = () => {
        const printWindow = window.open('', '',);
        printWindow.document.write('<html lang="id"><head><title>Invoice</title><style>');
        printWindow.document.write(`
        body {
            font-family: Arial, Helvetica, sans-serif;
            margin: 0;
            padding: 0;
            font-size: 12px;
            display: flex;
            justify-content: center;
            background-color: #f5f5f5;
            width: auto;
            font-weight: bold;
        }
        .invoice {
            width: auto;
            padding: 10px;
            text-align: center;
            max-width: 800px;
            margin: 0;
            background-color: #fff;
            font-weight: bold;
        }
        .invoice-header {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
            text-transform: uppercase;
        }
        .invoice-body {
            margin-top: 10px;
            font-weight: bold;
        }
        .invoice-footer {
            margin-top: 15px;
            font-size: 12px;
            text-align: center;
            padding-top: 10px;
        }
        .invoice-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
            font-size: 12px;
        }
        .invoice-table td, .invoice-table th {
            border: 0;
            padding: 2px;
            text-align: left;
            font-size: 12px;
            font-weight: bold;
        }
        .invoice-table th {
            padding-bottom: 5px;
            font-weight: bold;
        }
        .total {
            font-weight: bold;
            font-size: 14px;
            padding-top: 10px;
        }
        .small-text {
            font-size: 10px;
            margin-top: 10px;
        }
        .invoice-header div {
            margin-bottom: 5px;
        }
    `);
        printWindow.document.write('</style></head><body>');
        printWindow.document.write('<div class="invoice">');
        printWindow.document.write(`<div class="invoice-header">${storeInfo?.store_name || 'CV AGUNG BESI SENTOSA'}</div>`);
        printWindow.document.write(`<div class="invoice-body">`);
        printWindow.document.write(`<div>${storeInfo?.address || 'Store Address'}</div>`);
        printWindow.document.write(`<div>Telp: ${storeInfo?.phone_number || 'Store Phone'}</div>`);
        printWindow.document.write('<table class="invoice-table">');
        printWindow.document.write('<tr><th>Item</th><th>Harga</th><th>Qty</th><th>Sub-Total</th></tr>');

        invoiceItems.forEach(item => {
            printWindow.document.write(`
            <tr class="invoice-table">
                <td>${item.item.item_name}</td>
                <td>${formatRupiah(item.item.price)}</td>
                <td>${item.qty}</td>
                <td>${formatRupiah(item.price * item.qty)}</td>
            </tr>
        `);
        });

        printWindow.document.write('</table>');
        printWindow.document.write('</div>');
        printWindow.document.write(`<div class="invoice-footer total">Total: ${formatRupiah(invoiceItems.reduce((acc, item) => acc + ((item.price + (item.item.tax / 100 + item.price)) * item.qty), 0))}</div>`);
        printWindow.document.write('<div class="small-text">Terima kasih atas kunjungan Anda!</div>');
        printWindow.document.write('<div class="small-text font-bold">`${storeInfo?.store_name || \'CV AGUNG BESI SENTOSA\'}`</div>');
        printWindow.document.write('</div>');
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
        setDialogOpen(false);
        updateInvoiceStatus(invoice_id.id);
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF({
            unit: 'pt',
            format: [227.56, 300]  // 80mm width, initial height of 300 points
        });

        // Set font to Courier
        doc.setFont('Courier', 'normal');

        // Store Information (Header)
        doc.setFontSize(12);
        doc.text(storeInfo?.store_name || 'CV AGUNG BESI SENTOSA', 113.78, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.text(storeInfo?.address || 'Store Address', 113.78, 30, { align: 'center' });
        doc.text(`Telp: ${storeInfo?.phone_number || 'Store Phone'}`, 113.78, 40, { align: 'center' });

        // Add dashed line below the phone number
        doc.text('-----------------------------------', 20, 50);

        // Table Header
        doc.setFontSize(8);
        doc.text('Item', 20, 60);
        doc.text('Harga', 75, 60);
        doc.text('Qty', 125, 60);
        doc.text('Sub-Total', 175, 60);

        // Table Body (dynamically calculate y position)
        let y = 70;  // Start position for the first row
        const maxWidth = 227.56 - 20; // Maximum width (80mm minus left margin)
        const itemNameMaxWidth = 55; // Maximum width for item name (in mm)

        invoiceItems.forEach((item) => {
            let itemName = item.item.item_name;
            let itemNameWidth = doc.getTextWidth(itemName);
            let wrappedItemName = [];

            // If item name is too wide, wrap it
            if (itemNameWidth > itemNameMaxWidth) {
                wrappedItemName = doc.splitTextToSize(itemName, itemNameMaxWidth);
                doc.text(wrappedItemName, 20, y);
                y += wrappedItemName.length * 10;  // Increment y for wrapped text
            } else {
                doc.text(itemName, 20, y);
                y += 10;  // Move to the next line for item name
            }

            // Harga (Price)
            const harga = formatRupiah(item?.price + ((item?.item?.tax / 100) * item?.price));
            const hargaWidth = doc.getTextWidth(harga);
            let hargaY = y;

            if (hargaWidth > 50) {
                const wrappedHarga = doc.splitTextToSize(harga, 50);
                doc.text(wrappedHarga, 75, hargaY);
                hargaY += wrappedHarga.length * 10;
            } else {
                doc.text(harga, 75, y);
            }

            // Qty
            const qty = item.qty.toString();
            const qtyWidth = doc.getTextWidth(qty);
            let qtyY = y;

            if (qtyWidth > 40) {
                const wrappedQty = doc.splitTextToSize(qty, 40);
                doc.text(wrappedQty, 125, qtyY);
                qtyY += wrappedQty.length * 10;
            } else {
                doc.text(qty, 125, y);
            }

            // Sub-Total
            const subTotal = formatRupiah((item?.price + ((item?.item?.tax / 100) * item?.price)) * item?.qty);
            const subTotalWidth = doc.getTextWidth(subTotal);
            let subTotalY = y;

            if (subTotalWidth > 50) {
                const wrappedSubTotal = doc.splitTextToSize(subTotal, 50);
                doc.text(wrappedSubTotal, 175, subTotalY);
                subTotalY += wrappedSubTotal.length * 10;
            } else {
                doc.text(subTotal, 175, y);
            }

            // Update y position for the next row
            y = Math.max(y, hargaY, qtyY, subTotalY) + 10;  // Adding margin after each row
        });

        // Total (add some space before displaying the total)
        y += 10;  // Space before the total
        doc.setFontSize(14);
        doc.text(`Total: ${formatRupiah(invoiceItems.reduce((acc, item) => acc + ((item.price + (item.item.tax / 100 + item.price)) * item.qty), 0))}`, 113.78, y, { align: 'center' });

        // Footer (add some space before footer)
        y += 20;  // Space before footer
        doc.setFontSize(10);
        doc.text('Terima kasih atas kunjungan Anda!', 113.78, y, { align: 'center' });
        doc.text(storeInfo?.store_name || 'CV AGUNG BESI SENTOSA', 113.78, y + 10, { align: 'center' });

        // Set the final height dynamically
        const totalHeight = y + 30;  // Adding some margin at the bottom
        if (totalHeight>300){
            doc.internal.pageSize.height = totalHeight;
        }

        // Adjust the page size to fit all content

        // Save the PDF (ensure the page size can accommodate dynamic content)
        doc.save('invoice.pdf');
        // setDialogOpen(false);
        // updateInvoiceStatus(invoice_id.id);
    };








    const formatRupiah = (number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }).format(number);
    };

    const handleCashPaidChange = (event) => {
        let value = event.target.value.replace(/[^\d]/g, ''); // Remove non-numeric characters

        // If the input is empty, set value to 0
        if (value === '') {
            setCashPaid(0);
            setKembalian(0); // Reset the change as well
            return;
        }

        // Check if the value is a valid number
        if (!value || isNaN(value)) {
            return; // Do nothing if the value is invalid or NaN
        }

        value = parseInt(value, 10); // Convert to a number

        setCashPaid(value);

        const totalAmount = invoiceItems.reduce((acc, item) => acc + (item.price + ((item.item.tax / 100) * item.price)) * item.qty, 0);
        setTotal(totalAmount);
        setKembalian(value >= totalAmount ? value - totalAmount : 0);
    };

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className={'w-full text-white bg-[#45C13A]'} disabled={invoiceItems.length === 0} onClick={() => {
                    if (invoiceItems.length === 0) {
                        setError("Tambahkan barang terlebih dahulu!!!");
                    }
                }}>Selesaikan Transaksi</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] md:max-w-[800px] lg:max-w-[1000px]">
                <DialogHeader>
                    <DialogTitle>Finish Transaction</DialogTitle>
                    <DialogDescription>
                        Preview and print your invoice before finalizing the transaction.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <div className="invoice-preview" ref={printRef}>
                        <div className="w-full justify-center flex flex-col">
                            <div className={'mx-auto'}>{storeInfo?.store_name || 'Store Name'}</div>
                            <div className={'mx-auto'}>{storeInfo?.address || 'Store Address'}</div>
                            <div className={'mx-auto'}>Telp: {storeInfo?.phone_number || 'Store Phone'}</div>
                            <Separator />
                        </div>
                        <div className="">
                            <Table className="invoice-table">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item</TableHead>
                                        <TableHead>Qty</TableHead>
                                        <TableHead>Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoiceItems.map((item) => (
                                        <TableRow key={item?.id}>
                                            <TableCell>{item?.item?.item_name}</TableCell>
                                            <TableCell>{item?.qty}</TableCell>
                                            <TableCell>{formatRupiah((item?.price + ((item?.item?.tax / 100) * item?.price)) * item?.qty)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="invoice-footer total font-bold">
                            Total: {formatRupiah(invoiceItems.reduce((acc, item) => acc + ((item.price + ((item?.item?.tax / 100) * item.price)) * item.qty), 0))}
                        </div>
                        <div className="mt-4">
                            <label htmlFor="cash-paid" className="block text-sm">Nominal Pembayaran (Cash)</label>
                            <Input
                                type="text"
                                id="cash-paid"
                                className="w-1/3 p-2 mt-2 border rounded"
                                value={formatRupiah(cashPaid)}
                                onChange={handleCashPaidChange}
                                placeholder="Masukkan jumlah uang"
                            />
                            {cashPaid > 0 && (
                                <div className="mt-2">
                                    <strong>Kembalian: {formatRupiah(kembalian)}</strong>
                                </div>
                            )}
                        </div>
                        <div className="small-text mt-4">Terima kasih atas kunjungan Anda!</div>
                        <div className="small-text">Berlaku S&K</div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handlePrint}>
                        Print Invoice
                    </Button>
                    <Button variant="outline" className={'w-full'} onClick={handleDownloadPDF}>
                        Download Invoice as PDF
                    </Button>
                    <Button onClick={() => { setDialogOpen(false); }}>Cancel</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
