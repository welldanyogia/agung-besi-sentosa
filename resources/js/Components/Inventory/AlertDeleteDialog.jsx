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
import axios from "axios"
import {Inertia} from "@inertiajs/inertia";

export function AlertDeleteDialog({ id, onDeleteSuccess }) {
    const [loading, setLoading] = useState(false)

    console.log(id)
    const handleDelete = async () => {
        setLoading(true)
        try {
            await axios.post(`/api/items/${id.item_code}`)
            onDeleteSuccess?.(id) // Memanggil callback setelah penghapusan sukses
        } catch (error) {
            console.error("Gagal menghapus item:", error)
        } finally {
            Inertia.get("/inventory", {}, { preserveState: true, replace: true });
            setLoading(false)
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={loading}>
                    {loading ? "Menghapus..." : "Hapus"}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tindakan ini tidak dapat dibatalkan. Item akan dihapus secara permanen.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={loading}>
                        {loading ? "Menghapus..." : "Lanjutkan"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
