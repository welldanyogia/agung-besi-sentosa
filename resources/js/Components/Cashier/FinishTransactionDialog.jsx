import {Button} from "@/Components/ui/button";
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
import {useRef, useState} from "react";
import {Input} from "@/Components/ui/input.jsx";
import {Separator} from "@/Components/ui/separator.jsx";
import axios from "axios";
import {jsPDF} from "jspdf";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/Components/ui/select.jsx";
import {Inertia} from "@inertiajs/inertia";

export function FinishTransactionDialog({invoiceItems, setError, invoice_id, setInvoice, setInvoceItems, storeInfo}) {
    const printRef = useRef();
    const [cashPaid, setCashPaid] = useState(0);
    const [kembalian, setKembalian] = useState(0);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [total, setTotal] = useState(
        invoiceItems?.reduce((acc, item) => acc + (item.sub_total || 0), 0)
    );
    const [paymentMethode, setPaymentMethod] = useState('')
    const [customer, setCustomer] = useState('')
    const [isShipment,setIsShipment] = useState(invoice_id?.is_shipment)
    const [shipment,setShipment] = useState('')


    const updateInvoiceStatus = async (invoiceId, is_printed) => {
        try {
            const response = await axios.post(`/api/invoices/${invoiceId}/update-status`, {
                payment: paymentMethode,
                customer_name: customer || "pelanggan", // Default ke "pelanggan" jika null/empty
                is_printed: is_printed,
                bayar: cashPaid,
                total: total,
                is_shipment: isShipment,
                shipment: shipment,
            });

            setInvoice(null);
            setInvoceItems([]);
            setKembalian(0);
            setCashPaid(0);
        } catch (error) {
            console.log(error)
            setError("Gagal menyelesaikan transaksi!!!");
        } finally {
            setDialogOpen(false)
            Inertia.reload()
        }
    };



    // const handlePrint = () => {
    //     const printWindow = window.open('', '',);
    //     printWindow.document.write('<html lang="id"><head><title>Invoice</title><style>');
    //     printWindow.document.write(`
    //     body {
    //         font-family: Arial, Helvetica, sans-serif;
    //         margin: 0;
    //         padding: 0;
    //         font-size: 12px;
    //         display: flex;
    //         justify-content: center;
    //         background-color: #f5f5f5;
    //         width: auto;
    //         font-weight: bold;
    //     }
    //     .invoice {
    //         width: auto;
    //         padding: 10px;
    //         text-align: center;
    //         max-width: 800px;
    //         margin: 0;
    //         background-color: #fff;
    //         font-weight: bold;
    //     }
    //     .invoice-header {
    //         font-size: 16px;
    //         font-weight: bold;
    //         margin-bottom: 5px;
    //         text-transform: uppercase;
    //     }
    //     .invoice-body {
    //         margin-top: 10px;
    //         font-weight: bold;
    //     }
    //     .invoice-footer {
    //         margin-top: 15px;
    //         font-size: 12px;
    //         text-align: center;
    //         padding-top: 10px;
    //     }
    //     .invoice-table {
    //         width: 100%;
    //         border-collapse: collapse;
    //         margin-bottom: 10px;
    //         font-size: 12px;
    //     }
    //     .invoice-table td, .invoice-table th {
    //         border: 0;
    //         padding: 2px;
    //         text-align: left;
    //         font-size: 12px;
    //         font-weight: bold;
    //     }
    //     .invoice-table th {
    //         padding-bottom: 5px;
    //         font-weight: bold;
    //     }
    //     .total {
    //         font-weight: bold;
    //         font-size: 14px;
    //         padding-top: 10px;
    //     }
    //     .small-text {
    //         font-size: 10px;
    //         margin-top: 10px;
    //     }
    //     .invoice-header div {
    //         margin-bottom: 5px;
    //     }
    // `);
    //     printWindow.document.write('</style></head><body>');
    //     printWindow.document.write('<div class="invoice">');
    //     printWindow.document.write(`<div class="invoice-header">${storeInfo?.store_name || 'CV AGUNG BESI SENTOSA'}</div>`);
    //     printWindow.document.write(`<div class="invoice-body">`);
    //     printWindow.document.write(`<div>${storeInfo?.address || 'Store Address'}</div>`);
    //     printWindow.document.write(`<div>Telp: ${storeInfo?.phone_number || 'Store Phone'}</div>`);
    //     printWindow.document.write('<table class="invoice-table">');
    //     printWindow.document.write('<tr><th>Item</th><th>Harga</th><th>Qty</th><th>Sub-Total</th></tr>');
    //
    //     invoiceItems.forEach(item => {
    //         printWindow.document.write(`
    //         <tr class="invoice-table">
    //             <td>${item.item.item_name}</td>
    //             <td>${formatRupiah(item.item.price)}</td>
    //             <td>${item.qty}</td>
    //             <td>${formatRupiah(item.price * item.qty)}</td>
    //         </tr>
    //     `);
    //     });
    //
    //     printWindow.document.write('</table>');
    //     printWindow.document.write('</div>');
    //     printWindow.document.write(`<div class="invoice-footer total">Total: ${formatRupiah(invoiceItems.reduce((acc, item) => acc + ((item.price + (item.item.tax / 100 + item.price)) * item.qty), 0))}</div>`);
    //     printWindow.document.write('<div class="small-text">Terima kasih atas kunjungan Anda!</div>');
    //     printWindow.document.write('<div class="small-text font-bold">`${storeInfo?.store_name || \'CV AGUNG BESI SENTOSA\'}`</div>');
    //     printWindow.document.write('</div>');
    //     printWindow.document.write('</body></html>');
    //     printWindow.document.close();
    //     printWindow.print();
    //     setDialogOpen(false);
    //     updateInvoiceStatus(invoice_id.id);
    // };

//     const handlePrint = () => {
//         let printWindow = window.open('', '', 'width=300,height=400');
//         printWindow.document.write(`
//         <pre>
// ${storeInfo?.store_name || 'CV AGUNG BESI SENTOSA'}
// ${storeInfo?.address || 'Store Address'}
// Telp: ${storeInfo?.phone_number || 'Store Phone'}
//
// -----------------------------------------
// Item         Harga     Qty   Sub-Total
// -----------------------------------------
// ${invoiceItems.map(item =>
//             `${item.item.item_name.padEnd(10)} ${formatRupiah(item.price).padEnd(8)} ${String(item.qty).padEnd(3)} ${formatRupiah(item.price * item.qty)}`).join('\n')}
// -----------------------------------------
// Total: ${formatRupiah(total)}
// Bayar: ${formatRupiah(cashPaid)}
// Kembali: ${formatRupiah(kembalian)}
// -----------------------------------------
// Terima Kasih Atas Kunjungan Anda!
//         </pre>
//     `);
//         printWindow.document.close();
//         printWindow.print();
//         printWindow.close();
//     };

    // const handlePrint = () => {
    //     let printWindow = window.open('', '', 'width=800,height=600');
    //     printWindow.document.write(`
    //     <html lang="id">
    //     <head>
    //       <style>
    //         @media print {
    //           @page { size: 9.5in 11in; margin: 0.2in; }
    //           body { font-family: "Courier New", monospace; font-size: 12px; white-space: pre; text-align: left; }
    //           .header, .footer { text-align: center; }
    //           .line { border-top: 1px dashed black; margin: 5px 0; }
    //           .table { display: flex; justify-content: space-between; font-size: 12px; }
    //           .col { flex: 1; text-align: left; }
    //           .col-right { text-align: right; }
    //         }
    //       </style><title>Invoice</title>
    //     </head>
    //     <body>
    //     <div class="header">
    //       <strong>${storeInfo?.store_name || 'CV AGUNG BESI SENTOSA'}</strong><br>
    //       ${storeInfo?.address || 'Store Address'}<br>
    //       Telp: ${storeInfo?.phone_number || 'Store Phone'}
    //     </div>
    //
    //     <div class="line"></div>
    //
    //     <div class="table">
    //       <div class="col"><strong>Item</strong></div>
    //       <div class="col-right"><strong>Harga</strong></div>
    //       <div class="col-right"><strong>Qty</strong></div>
    //       <div class="col-right"><strong>Subtotal</strong></div>
    //     </div>
    //     <div class="line"></div>
    //
    //     ${invoiceItems.map(item =>
    //         `<div class="table">
    //       <div class="col">${item.item.item_name}</div>
    //       <div class="col-right">${formatRupiah(item.price)}</div>
    //       <div class="col-right">${item.qty}</div>
    //       <div class="col-right">${formatRupiah(item.price * item.qty)}</div>
    //     </div>`).join('')}
    //
    //     <div class="line"></div>
    //
    //     <div class="table">
    //       <div class="col"><strong>Total:</strong></div>
    //       <div class="col-right"><strong>${formatRupiah(total)}</strong></div>
    //     </div>
    //     <div class="table">
    //       <div class="col">Bayar:</div>
    //       <div class="col-right">${formatRupiah(cashPaid)}</div>
    //     </div>
    //     <div class="table">
    //       <div class="col">Kembali:</div>
    //       <div class="col-right">${formatRupiah(kembalian)}</div>
    //     </div>
    //
    //     <div class="line"></div>
    //
    //     <div class="footer">
    //       Terima Kasih Atas Kunjungan Anda!<br>
    //       *** Struk ini adalah bukti pembayaran ***
    //     </div>
    //     </body>
    //     </html>
    // `);
    //     printWindow.document.close();
    //     printWindow.print();
    //     printWindow.close();
    // };

//     const handlePrint = () => {
//         let printWindow = window.open('', '', 'width=800,height=600');
//         printWindow.document.write(`
//         <html>
//         <head>
//           <style>
//             @media print {
//               /*@page { size: 9.5in 11in; margin: 0.2in; }*/
//               @page { size: 8.3in 3.9in; margin: 0.1in; }
//               body { font-family: "Courier New", monospace; font-size: 12px; white-space: pre; text-align: left; }
//               .header, .footer { text-align: center; }
//               .line { border-top: 1px dashed black; margin: 5px 0; }
//               .table { display: flex; justify-content: space-between; font-size: 12px; }
//               .col-item { width: 40%; text-align: left; }
//               .col-price { width: 20%; text-align: right; }
//               .col-qty { width: 15%; text-align: right; }
//               .col-subtotal { width: 25%; text-align: right; }
//             }
//           </style>
//         </head>
//         <body>
//         <div class="header" style="display: flex; justify-content: space-between; text-align: left;">
//   <div>
//     <strong>${storeInfo?.store_name || 'CV AGUNG BESI SENTOSA'}</strong><br>
//     ${storeInfo?.address || 'Store Address'}<br>
//     Telp: ${storeInfo?.phone_number || 'Store Phone'}
//   </div>
//
//   <div style="text-align: right;">
//     <strong>Invoice Code:</strong>INV12345<br>
//     <strong>Kasir:</strong>Kasir Name<br>
//     <strong>Customer:</strong>Customer Name
//   </div>
// </div>
//
//
//         <div class="line"></div>
//
//         <div class="table">
//           <div class="col-item"><strong>Item</strong></div>
//           <div class="col-price"><strong>Harga</strong></div>
//           <div class="col-qty"><strong>Qty</strong></div>
//           <div class="col-subtotal"><strong>Subtotal</strong></div>
//         </div>
//         <div class="line"></div>
//
//         ${invoiceItems.map(item =>
//             `<div class="table">
//           <div class="col-item">${item.item.item_name}</div>
//           <div class="col-price">${formatRupiah(item.price)}</div>
//           <div class="col-qty">${item.qty}</div>
//           <div class="col-subtotal">${formatRupiah(item.price * item.qty)}</div>
//         </div>`).join('')}
//
//         <div class="line"></div>
//
//         <div class="table">
//           <div class="col-item"><strong>Total:</strong></div>
//           <div class="col-subtotal"><strong>${formatRupiah(total)}</strong></div>
//         </div>
//         <div class="table">
//           <div class="col-item">Bayar:</div>
//           <div class="col-subtotal">${formatRupiah(cashPaid)}</div>
//         </div>
//         <div class="table">
//           <div class="col-item">Kembali:</div>
//           <div class="col-subtotal">${formatRupiah(kembalian)}</div>
//         </div>
//
//         <div class="line"></div>
//
//         <div class="footer">
//           Terima Kasih Atas Kunjungan Anda!<br>
//           *** Struk ini adalah bukti pembayaran ***
//         </div>
//         </body>
//         </html>
//     `);
//         printWindow.document.close();
//         printWindow.print();
//         printWindow.close();
//     };

//     const handlePrint = async () => {
//         let printWindow = window.open('', '',);
//         printWindow.document.write(`
// <html>
// <head>
//   <style>
//     @media print {
//       @page {
//         size: A5;
//         margin: 0;
//       }
//
//       body {
//         font-family: "Courier New", monospace;
//         font-size: 14px;
//         white-space: pre;
//         text-align: left;
//       }
//
//       .header, .footer {
//         text-align: left;
//         font-size: 18px;
//         margin-bottom: 5px;
//       }
//
//       .line {
//         border-top: 2px dashed black;
//         margin: 3px 0;
//       }
//
//       .table {
//         display: flex;
//         justify-content: space-between;
//         font-size: 16px;
//         margin-bottom: 3px; /* Mengurangi margin bawah tabel */
//       }
//
//       .col-item {
//         width: 40%;
//         text-align: left;
//       }
//       .col-price {
//         width: 20%;
//         text-align: right;
//       }
//       .col-qty {
//         width: 15%;
//         text-align: right;
//       }
//       .col-subtotal {
//         width: 25%;
//         text-align: right;
//       }
//
//       .footer {
//         font-size: 14px;
//         text-align: center;
//         margin-top: 10px;
//       }
//     }
//   </style>
// </head>
// <body>
//   <div class="header" style="display: flex; justify-content: space-between;">
//     <div>
//       <strong>${storeInfo?.store_name || 'CV AGUNG BESI SENTOSA'}</strong><br>
//       ${storeInfo?.address || 'Store Address'}<br>
//       Telp: ${storeInfo?.phone_number || 'Store Phone'}
//     </div>
//
//     <div style="text-align: right;">
//       <strong>Invoice Code:</strong> ${invoice_id.invoice_code}<br>
//       <strong>Kasir:</strong> ${invoice_id.created_by.name}<br>
//       <strong>Customer:</strong> ${customer}
//     </div>
//   </div>
//
//   <div class="line"></div>
//
//   <div class="table">
//     <div class="col-item"><strong>Item</strong></div>
//     <div class="col-price"><strong>Harga</strong></div>
//     <div class="col-qty"><strong>Qty</strong></div>
//     <div class="col-subtotal"><strong>Subtotal</strong></div>
//   </div>
//   <div class="line"></div>
//
//   ${invoiceItems.map(item =>
//             `<div class="table">
//       <div class="col-item">${item.item.item_name}</div>
//       <div class="col-price">${formatRupiah(item.price)}</div>
//       <div class="col-qty">${item.qty}</div>
//       <div class="col-subtotal">${formatRupiah(item.price * item.qty)}</div>
//     </div>`
//         ).join('')}
//
//   <div class="line"></div>
//
//   <div class="table" style="margin-bottom: 0;">
//     <div class="col-item"><strong>Total:</strong></div>
//     <div class="col-subtotal"><strong>${formatRupiah(total)}</strong></div>
//   </div>
//   <div class="table" style="margin-bottom: 0;">
//     <div class="col-item">Bayar:</div>
//     <div class="col-subtotal">${formatRupiah(cashPaid)}</div>
//   </div>
//   <div class="table" style="margin-bottom: 0;">
//     <div class="col-item">Kembali:</div>
//     <div class="col-subtotal">${formatRupiah(kembalian)}</div>
//   </div>
//
//   <div class="line"></div>
//
//   <div class="footer">
//     Terima Kasih Atas Kunjungan Anda!<br>
//     *** Struk ini adalah bukti pembayaran ***
//   </div>
// </body>
// </html>
// `);
//         // await updateIsPrinted(invoice_id.id, true)
//         await updateInvoiceStatus(invoice_id.id,true)
//         printWindow.document.close();
//         printWindow.print();
//         printWindow.close();
//     };
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

    const handlePrint = async () => {
        let printWindow = window.open('', '');

        printWindow.document.write(`
<html lang="id">
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
    <div><span>Invoice:</span><span>${invoice_id.invoice_code}</span></div>
    <div><span>Kasir:</span><span>${invoice_id.created_by.name}</span></div>
    <div><span>Customer:</span><span>${customer}</span></div>
    <div><span>Waktu:</span><span>${formatWaktuIndonesia(invoice_id.created_at)}</span></div>
  </div>

  <div class="line"></div>

  <div class="table-head">
    <div class="col-item">Item</div>
    <div class="col-price">Harga</div>
    <div class="col-qty">Qty</div>
    <div class="col-subtotal">Subtotal</div>
  </div>

  ${invoiceItems.map(item => {
            let selectedPrice = 0;
            if (item.price_type === 'eceran') {
                selectedPrice = item.item.eceran_price;
            } else if (item.price_type === 'retail') {
                selectedPrice = item.item.retail_price;
            } else {
                selectedPrice = item.item.wholesale_price; // grosir
            }

            return `
    <div class="table-row">
      <div class="col-item">${item.item.item_name} ${item.price_type === 'eceran' ? '(Eceran)' : ''}</div>
      <div class="col-price">${formatRupiah(selectedPrice)}</div>
      <div class="col-qty">${item.qty}</div>
      <div class="col-subtotal">${formatRupiah(item.sub_total)}</div>
    </div>`;
        }).join('')}


  <div class="line"></div>

  <div class="totals">
     ${isShipment ? `
    <div class="table-row">
      <div class="col-item">Biaya Layanan Pengiriman</div>
      <div class="col-subtotal">${formatRupiah(shipment || 0)}</div>
    </div>
    ` : ''}
     <div class="table-row">
      <div class="col-item">Total</div>
      <div class="col-subtotal">${
            formatRupiah(
                invoiceItems?.reduce((acc, item) => acc + (item.sub_total || 0), 0) +
                (isShipment ? (shipment || 0) : 0))
        }</div>

    </div>
    <div class="table-row">
      <div class="col-item">Bayar</div>
      <div class="col-subtotal">${formatRupiah(cashPaid)}</div>
    </div>
    <div class="table-row">
      <div class="col-item">Kembali</div>
      <div class="col-subtotal">${formatRupiah(kembalian)}</div>
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
        await updateInvoiceStatus(invoice_id.id, true);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
    };


    //   const handlePrint = () => {
  //       let printWindow = window.open('', '', 'width=800,height=600');
  //       printWindow.document.write(`
  //   <html>
  //   <head>
  //     <style>
  //       @media print {
  //         @page {
  //           size: 9.5in 11in;
  //           margin: 10mm;
  //         }
  //
  //         body {
  //           font-family: "Courier New", monospace;
  //           font-size: 12px;
  //           white-space: pre-wrap;
  //           text-align: left;
  //           min-height: 100vh;
  //           display: flex;
  //           flex-direction: column;
  //           justify-content: center; /* Posisi konten di tengah */
  //           align-items: center;
  //         }
  //
  //         .container {
  //           height: 50%; /* Setengah dari panjang kertas */
  //           width: 100%;
  //           display: flex;
  //           flex-direction: column;
  //           justify-content: center;
  //           align-items: flex-start;
  //         }
  //
  //         .header {
  //           text-align: left;
  //           font-size: 12px;
  //         }
  //
  //         .line {
  //           border-top: 1px dashed black;
  //           margin: 10px 0;
  //         }
  //
  //         .content {
  //           width: 100%;
  //         }
  //
  //         .table {
  //           display: flex;
  //           justify-content: space-between;
  //           font-size: 12px;
  //           margin-bottom: 10px;
  //         }
  //
  //         .col-item { width: 40%; text-align: left; }
  //         .col-price { width: 20%; text-align: right; }
  //         .col-qty { width: 15%; text-align: right; }
  //         .col-subtotal { width: 25%; text-align: right; }
  //
  //         .footer {
  //           font-size: 10px;
  //           text-align: center;
  //           margin-top: 20px;
  //         }
  //       }
  //     </style>
  //   </head>
  //   <body>
  //     <div class="container">
  //       <div class="header">
  //         <strong>${storeInfo?.store_name || 'CV AGUNG BESI SENTOSA'}</strong><br>
  //         ${storeInfo?.address || 'Store Address'}<br>
  //         Telp: ${storeInfo?.phone_number || 'Store Phone'}
  //       </div>
  //
  //       <div class="line"></div>
  //
  //       <div class="content">
  //         <div class="table">
  //           <div class="col-item"><strong>Item</strong></div>
  //           <div class="col-price"><strong>Harga</strong></div>
  //           <div class="col-qty"><strong>Qty</strong></div>
  //           <div class="col-subtotal"><strong>Subtotal</strong></div>
  //         </div>
  //         <div class="line"></div>
  //
  //         ${invoiceItems.map(item =>
  //           `<div class="table">
  //               <div class="col-item">${item.item.item_name}</div>
  //               <div class="col-price">${formatRupiah(item.price)}</div>
  //               <div class="col-qty">${item.qty}</div>
  //               <div class="col-subtotal">${formatRupiah(item.price * item.qty)}</div>
  //             </div>`
  //       ).join('')}
  //
  //         <div class="line"></div>
  //
  //         <div class="table">
  //           <div class="col-item"><strong>Total:</strong></div>
  //           <div class="col-subtotal"><strong>${formatRupiah(total)}</strong></div>
  //         </div>
  //         <div class="table">
  //           <div class="col-item">Bayar:</div>
  //           <div class="col-subtotal">${formatRupiah(cashPaid)}</div>
  //         </div>
  //         <div class="table">
  //           <div class="col-item">Kembali:</div>
  //           <div class="col-subtotal">${formatRupiah(kembalian)}</div>
  //         </div>
  //       </div>
  //
  //       <div class="line"></div>
  //
  //       <div class="footer">
  //         Terima Kasih Atas Kunjungan Anda!<br>
  //         *** Struk ini adalah bukti pembayaran ***
  //       </div>
  //     </div>
  //   </body>
  //   </html>
  // `);
  //       printWindow.document.close();
  //       printWindow.print();
  //       printWindow.close();
  //   };




    const handleDownloadPDF = () => {
        const doc = new jsPDF({
            unit: 'pt',
            format: [227.56, 300]  // 80mm width, initial height of 300 points
        });

        // Set font to Courier
        doc.setFont('Courier', 'normal');

        // Store Information (Header)
        doc.setFontSize(12);
        doc.text(storeInfo?.store_name || 'CV AGUNG BESI SENTOSA', 113.78, 20, {align: 'center'});
        doc.setFontSize(12);
        doc.text(storeInfo?.address || 'Store Address', 113.78, 30, {align: 'center'});
        doc.text(`Telp: ${storeInfo?.phone_number || 'Store Phone'}`, 113.78, 40, {align: 'center'});

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
        doc.text(`Total: ${formatRupiah(invoiceItems.reduce((acc, item) => acc + ((item.price + (item.item.tax / 100 + item.price)) * item.qty), 0))}`, 113.78, y, {align: 'center'});

        // Footer (add some space before footer)
        y += 20;  // Space before footer
        doc.setFontSize(10);
        doc.text('Terima kasih atas kunjungan Anda!', 113.78, y, {align: 'center'});
        doc.text(storeInfo?.store_name || 'CV AGUNG BESI SENTOSA', 113.78, y + 10, {align: 'center'});

        // Set the final height dynamically
        const totalHeight = y + 30;  // Adding some margin at the bottom
        if (totalHeight > 300) {
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
    const updateIsPrinted = async (invoiceId, isPrinted) => {
        try {
            const response = await axios.post(`/api/invoices/${invoiceId}/update-is-printed`, {
                is_printed: isPrinted
            });

            return response.data; // Mengembalikan data response
        } catch (error) {
            console.error("Gagal update status is_printed:", error.response?.data || error.message);
            throw error;
        }
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

        // const totalAmount = invoiceItems.reduce((acc, item) => {
        //     let selectedPrice = 0;
        //
        //     if (item.price_type === 'eceran') {
        //         selectedPrice = item.item?.eceran_price || 0;
        //     } else if (item.price_type === 'retail') {
        //         selectedPrice = item.item?.retail_price || 0;
        //     } else {
        //         selectedPrice = item.item?.price || 0;
        //     }
        //
        //     const tax = (item.item?.tax || 0) / 100;
        //     const totalWithTax = selectedPrice * item.qty;
        //
        //     return acc + totalWithTax;
        // }, 0);
        //
        // setTotal(totalAmount);
        const totalWithShipment = invoiceItems?.reduce((acc, item) => acc + (item.sub_total || 0), 0) +
            (isShipment ? (shipment || 0) : 0);

        setKembalian(value >= totalWithShipment ? value - totalWithShipment : 0);

    };

    const handleShipmentChange = (event) => {
        let value = event.target.value.replace(/[^\d]/g, ''); // Remove non-numeric characters

        // If the input is empty, set value to 0
        if (value === '') {
            setShipment(0);
            // setKembalian(0); // Reset the change as well
            return;
        }

        // Check if the value is a valid number
        if (!value || isNaN(value)) {
            setShipment(0)
            return; // Do nothing if the value is invalid or NaN
        }

        value = parseInt(value, 10); // Convert to a number

        setShipment(value);

    };


    const handleCustomerChange = (e) => {
        e.preventDefault()
        setCustomer(e.target.value)
    }
    const handlePaymentChange = (value) => {
        setPaymentMethod(value);

        // Jika metode pembayaran berubah ke non tunai, reset nominal pembayaran
        if (value !== "tunai") {
            setCashPaid("");
        }
    };
    const handleIsShipmentChange = (value) => {
        setIsShipment(value);
    };



    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className={'w-full text-white bg-[#45C13A]'}
                        disabled={invoiceItems?.length === 0} onClick={() => {
                    if (invoiceItems.length === 0) {
                        setError("Tambahkan barang terlebih dahulu!!!");
                    }
                }}>Selesaikan Transaksi</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] md:max-w-[800px] max-sm:max-w-[80vh] max-h-[90vh] overflow-auto max-sm:text-xs">
                <DialogHeader>
                    <DialogTitle>Finish Transaction</DialogTitle>
                    <DialogDescription>
                        Preview and print your invoice before finalizing the transaction.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <div className="invoice-preview" ref={printRef}>
                        <div className="max-h-[calc(2.5rem*5)] overflow-y-auto">
                            <Table className="invoice-table">
                                <TableHeader className="bg-indigo-200 sticky top-0 z-10">
                                    <TableRow>
                                        <TableHead>Item</TableHead>
                                        <TableHead>Satuan</TableHead>
                                        <TableHead>Harga</TableHead>
                                        <TableHead>Qty</TableHead>
                                        <TableHead>Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoiceItems?.map((item) => (
                                        <TableRow key={item?.id}>
                                            <TableCell className="w-auto">
                                                {item?.item?.item_name} {item?.price_type === 'eceran' ? '(Eceran)' : ''}
                                            </TableCell>
                                            <TableCell>
                                                {item?.price_type === 'eceran' ? item?.item?.retail_unit : item?.item?.satuan}
                                            </TableCell>
                                            <TableCell>
                                                {item?.price_type === 'eceran'
                                                    ? formatRupiah(item?.item?.eceran_price)
                                                    : item?.price_type === 'retail'
                                                        ? formatRupiah(item?.item?.retail_price)
                                                        : formatRupiah(item?.item?.wholesale_price)}
                                            </TableCell>
                                            <TableCell>{item?.qty}</TableCell>
                                            <TableCell>{formatRupiah(item?.sub_total)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="invoice-footer total font-bold max-sm:text-lg">
                            Total: {formatRupiah(
                            invoiceItems?.reduce((acc, item) => acc + (item.sub_total || 0), 0) +
                            (isShipment ? (shipment || 0) : 0)
                        )}
                        </div>

                        <div className="mt-4 gap-2 flex flex-col">
                            <div className={'flex gap-4 items-center justify-between w-full max-sm:w-full'}>
                                <label htmlFor="customer" className="block text-sm font-bold max-sm:text-xs">Nama
                                    Customer</label>
                                <Input
                                    type="text"
                                    id="customer"
                                    className="w-1/3 p-2 mt-2 border rounded max-sm:text-xs max-sm:w-2/3"
                                    value={customer}
                                    onChange={handleCustomerChange}
                                    placeholder="Masukkan nama customer"
                                />
                            </div>
                            <div className={'flex gap-4 items-center justify-between w-full max-sm:w-full'}>
                                <label htmlFor="payment" className="block text-sm font-bold max-sm:text-xs">Metode
                                    Pembayaran</label>
                                <Select value={paymentMethode} onValueChange={handlePaymentChange}>
                                    <SelectTrigger className="w-1/3 max-sm:text-xs max-sm:w-2/3">
                                        <SelectValue placeholder="Pilih Metode Pembayaran"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Metode Pembayaran</SelectLabel>
                                            <SelectItem value="tunai">Tunai</SelectItem>
                                            <SelectItem value="non-tunai">Non Tunai</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>

                            </div>
                            <div className={'flex gap-4 items-center justify-between w-full max-sm:w-full'}>
                                <label htmlFor="is_shipment" className="block text-sm font-bold max-sm:text-xs">Layanan
                                    Pengiriman</label>
                                <Select value={isShipment} onValueChange={handleIsShipmentChange}>
                                    <SelectTrigger className="w-1/3 max-sm:text-xs max-sm:w-2/3">
                                        <SelectValue placeholder="Pilih Layanan Pengiriman"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Layanan Pengiriman</SelectLabel>
                                            <SelectItem value={true}>YA</SelectItem>
                                            <SelectItem value={false}>TIDAK</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>

                            </div>
                            {
                                isShipment === true && (
                                    <div className={'flex gap-4 items-center justify-between w-full max-sm:w-full'}>
                                        <label htmlFor="shipment" className="block text-sm font-bold max-sm:text-xs">
                                            Biaya Layanan Pengiriman
                                        </label>
                                        <Input
                                            type="text"
                                            id="shipemnt"
                                            className="w-1/3 p-2 mt-2 border rounded max-sm:text-xs max-sm:w-2/3"
                                            value={formatRupiah(shipment)}
                                            onChange={handleShipmentChange}
                                            placeholder="Masukkan biaya pengiriman"
                                        />
                                    </div>
                                )
                            }
                            <div className={'flex gap-4 items-center justify-between w-full max-sm:w-full'}>
                                <label htmlFor="cash-paid" className="block text-sm font-bold max-sm:text-xs">Nominal
                                    Pembayaran
                                    (Cash)</label>
                                <Input
                                    type="text"
                                    id="cash-paid"
                                    className="w-1/3 p-2 mt-2 border rounded max-sm:text-xs max-sm:w-2/3"
                                    value={formatRupiah(cashPaid)}
                                    onChange={handleCashPaidChange}
                                    placeholder="Masukkan jumlah uang"
                                    disabled={paymentMethode !== "tunai"}
                                />
                            </div>
                            <div className="mt-2 max-sm:text-lg">
                                <strong>Kembalian: {formatRupiah(kembalian)}</strong>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className={'gap-2'}>
                    <Button onClick={async () => {
                        await updateInvoiceStatus(invoice_id.id, false)
                    }}>
                        Selesai
                    </Button>
                    <Button variant="outline" className={'w-full'} onClick={handlePrint}>
                        Print Invoice
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
