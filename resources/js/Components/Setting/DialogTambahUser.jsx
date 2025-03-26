import { useEffect, useState } from "react";
import axios from "axios";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/Components/ui/select.jsx";
import { Popover, PopoverContent, PopoverTrigger } from "@/Components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/Components/ui/command";
import { cn } from "@/lib/utils.js";
import { Inertia } from "@inertiajs/inertia";

export function DialogTambahUser({ auth, setError, setSuccess }) {
    const [open, setOpen] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [data, setData] = useState({
        name: "",
        username: "",
        email: "",  // Added email field
        role: "",
        phone_number: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [loadingCategory, setLoadingCategory] = useState(false);

    const roles = [
        { label: "Super Admin", role: "superadmin", value: "superadmin" },
        { label: "Admin", role: "admin", value: "admin" },
        { label: "Karyawan", role: "employee", value: "employee" }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const payload = {
            name: data.name,
            username: data.username,
            email: data.email,  // Include email in the payload
            role: data.role,
            phone_number: data.phone_number,
            password: data.password,
            created_by: auth.user.id,
        };

        try {
            const response = await axios.post("/users", payload);

            setSuccess(response.data.message);

            // Reset form after success
            resetForm();
            // Menggunakan Inertia untuk memanggil halaman yang sama dan memperbarui data
            Inertia.get("/setting", {}, { preserveState: true, replace: true });
        } catch (err) {
            console.error("Terjadi kesalahan:", err);
            setError("Terjadi kesalahan Saat Menambahkan User");
        } finally {
            setOpenDialog(false);
            setLoading(false);
        }
    };

    const resetForm = () => {
        setData({
            name: "",
            username: "",
            email: "",  // Reset email field
            role: "",
            phone_number: "",
            password: "",
        });
        setInputValue(""); // Reset inputValue for role search
        setSearchTerm(""); // Reset searchTerm
    };

    return (
        <Dialog open={openDialog} onOpenChange={(openDialog) => { setOpenDialog(openDialog); if (!openDialog) resetForm(); }}>
            <DialogTrigger asChild>
                <Button>Tambah User</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Tambah User</DialogTitle>
                    <DialogDescription>
                        Isi data user dengan lengkap. Klik tambah untuk menyimpan.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Nama
                        </Label>
                        <Input id="name" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className="text-right">
                            Username
                        </Label>
                        <Input id="username" value={data.username} onChange={(e) => setData({ ...data, username: e.target.value })} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                            Email
                        </Label>
                        <Input id="email" type="email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">
                            Role
                        </Label>
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="col-span-3 justify-between"
                                >
                                    {data.role
                                        ? roles.find((role) => role.value === data.role)?.label
                                        : "Pilih role..."}
                                    <ChevronsUpDown className="opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="col-span-3 p-0">
                                <Command>
                                    <CommandInput
                                        placeholder="Search or create role..."
                                        className="h-9"
                                        value={inputValue}
                                        onValueChange={setInputValue}
                                    />
                                    <CommandList>
                                        <CommandEmpty>
                                            Role <strong>{inputValue}</strong> tidak ditemukan.
                                        </CommandEmpty>
                                        <CommandGroup>
                                            {roles
                                                .filter(role => role.label.toLowerCase().includes(searchTerm.toLowerCase())) // Filter based on search
                                                .map((role) => (
                                                    <CommandItem
                                                        key={role.value}
                                                        value={role.value}
                                                        onSelect={(currentValue) => {
                                                            setData((prevData) => ({
                                                                ...prevData,
                                                                role: currentValue === prevData.role ? "" : currentValue,
                                                            }));
                                                            setOpen(false);
                                                        }}
                                                    >
                                                        {role.label}
                                                        <Check
                                                            className={cn(
                                                                "ml-auto",
                                                                data.role === role.value ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                    </CommandItem>
                                                ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="phone_number" className="text-right">
                            No. HP
                        </Label>
                        <Input id="phone_number" type="tel" value={data.phone_number} onChange={(e) => setData({ ...data, phone_number: e.target.value })} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="password" className="text-right">
                            Password
                        </Label>
                        <Input id="password" type="password" value={data.password} onChange={(e) => setData({ ...data, password: e.target.value })} className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? "Memproses..." : "Simpan"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
