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
} from "@/Components/ui/alert-dialog"
import { Button } from "@/Components/ui/button"
import { useState } from "react"
import {Inertia} from "@inertiajs/inertia";

export function AlertDeleteDialog({ invoice, onDeleted,getData,setSuccess,setError }) {
    const [isLoading, setIsLoading] = useState(false)

    const handleDelete = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`api/invoices/${invoice.id}`, {
                method: 'POST', // karena kamu pakai POST
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            })


            if (!response.ok) {
                setError('Gagal menghapus invoice')
                // console.log(response)
                // throw new Error('Gagal menghapus invoice')
            }

            // console.log(response)
            // toast.success("Invoice berhasil dihapus")
            setSuccess("Invoice berhasil dihapus")
            if (onDeleted) {
                onDeleted(invoice.id)
            }
        } catch (error) {
            console.error(error)
            setError("Terjadi kesalahan saat menghapus invoice")
        } finally {
            setIsLoading(false)
            // Inertia.reload({ only: [''], preserveScroll: true, preserveState: true })
            getData()
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive">Hapus</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Apakah kamu yakin?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tindakan ini tidak dapat dibatalkan. Ini akan secara permanen menghapus data invoice dari sistem.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
                        {isLoading ? 'Menghapus...' : 'Lanjutkan'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
