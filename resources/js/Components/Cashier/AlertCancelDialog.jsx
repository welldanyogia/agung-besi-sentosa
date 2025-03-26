import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/Components/ui/alert-dialog";
import {Button} from "@/Components/ui/button";
import axios from "axios";

export function AlertCancelDialog({setInvoiceItems,invoiceItems,setError,setSuccess,getItems}) {
    const handleCancel = async () => {
        if (invoiceItems.length === 0) {
            setError("Tambahkan barang terlebih dahulu!!!");
            return;
        }

        try {
            // Kirim semua permintaan update stok dalam satu batch
            await Promise.all(
                invoiceItems.map(item =>
                    axios.post("/api/cashier/restore-stock", {
                        id: item.id,
                        quantity: item.qty
                    })
                )
            );

            setSuccess("Stok berhasil dikembalikan untuk semua barang.");
            setInvoiceItems([]);
            getItems();
        } catch (error) {
            console.error("Error restoring stock:", error);
            setError("Gagal mengembalikan stok barang!!!");
            getItems();
        }
    };
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full" disabled={invoiceItems.length === 0} onClick={() => {
                    if (invoiceItems.length === 0) {
                        setError("Tambahkan barang terlebih dahulu!!!")
                    }
                }}
                >
                    Batalkan Transaksi
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Apakah Anda yakin ingin membatalkan transaksi?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tindakan ini tidak dapat dibatalkan. Transaksi akan dihapus secara permanen dan tidak dapat
                        dipulihkan.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancel}>Lanjutkan</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
