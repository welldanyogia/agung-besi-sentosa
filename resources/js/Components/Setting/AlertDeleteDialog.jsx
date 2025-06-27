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
import {useState} from "react";
import {router} from "@inertiajs/react";

export function AlertDeleteDialog({userId,onDeleted,setSuccess,setError}) {
    const [isLoading, setIsLoading] = useState(false)
    const handleDelete = async () => {
        // console.log(`Mulai menghapus user dengan ID: ${userId}`)
        setIsLoading(true)

        try {
            const response = await axios.delete(`/user/${userId}`, {
                headers: {
                    'Accept': 'application/json',
                },
            })

            // console.log("Response berhasil:", response.data)
            setSuccess("Akun berhasil dihapus")

            // Reload daftar users setelah berhasil

        } catch (error) {
            // console.error("Terjadi kesalahan saat menghapus:", error)
            setError("Gagal menghapus akun")

            // Optional: bisa tampilkan error spesifik jika dari server
            if (error.response) {
                // console.error("Detail error:", error.response.data)
            }

        } finally {
            setIsLoading(false)
            router.reload({ only: ['users'], preserveScroll: true, preserveState: true })
            // console.log("Selesai proses handleDelete")
        }
    }
                // router.reload({
                //     only: ['users'],
                //     preserveScroll: true,
                //     preserveState: true,
                // })
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
