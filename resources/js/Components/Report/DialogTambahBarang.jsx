import { useEffect, useState } from "react";
import axios from "axios";
import { Check, ChevronsUpDown } from "lucide-react";
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
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Switch } from "@/Components/ui/switch";
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

export function DialogTambahBarang({ auth,setError,setSuccess }) {
    const [open, setOpen] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [data, setData] = useState({
        kode_barang: "",
        nama_barang: "",
        kategori: "",
        stok: "",
        satuan: "",
        harga: "",
        is_tax: false,
        tax: ""
    });

    const [loading, setLoading] = useState(false);
    const [loadingCategory, setLoadingCategory] = useState(false);
    const [categories, setCategories] = useState([]);

    const getCategories = async () => {
        try {
            const response = await axios.post("/api/categories/");

            // Format ulang data agar sesuai dengan priorities
            const formattedCategories = response.data.categories.map(category => ({
                id: category.id,
                label: category.category_name,
                value: category.category_name,
                icon: null, // Jika ingin menambahkan ikon, bisa diganti dengan komponen yang sesuai
            }));

            setCategories(formattedCategories);
        } catch (error) {
            console.error("Error fetching inventory data:", error);
        }
    };

    const handleSubmitCategory = async (e) => {
        e.preventDefault();
        setLoadingCategory(true);
        setError(null);

        const payload = {
            category_name: inputValue,
        };


        try {
            const response = await axios.post("/api/categories/store", payload);

            setSuccess(response.data.message)

            // Reset form setelah berhasil
            // resetForm();
            // getCategories()
        } catch (err) {
            setError(err.message || "Terjadi kesalahan");
        } finally {
            getCategories()
            setLoadingCategory(false);
        }
    };

    useEffect(() => {
        getCategories();
    }, []);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setData((prevData) => ({
            ...prevData,
            [id]: value,
        }));
    };

    const handleSwitchChange = (checked) => {
        setData((prevData) => ({
            ...prevData,
            is_tax: checked,
            tax: checked ? prevData.tax : "" // Reset tax jika is_tax dimatikan
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const payload = {
            item_code: data.kode_barang,
            item_name: data.nama_barang,
            category_name: data.kategori,
            stock: data.stok,
            satuan: data.satuan,
            price: data.harga,
            is_tax: data.is_tax,
            tax: data.is_tax ? data.tax : null,
            created_by: auth.user.id
        };


        try {
            const response = await axios.post("/api/inventory/store", payload);


            // Reset form setelah berhasil
            setSuccess(response.data.message)
            resetForm();
        } catch (err) {
            console.error("Terjadi kesalahan:", err);
            setError("Terjadi kesalahan Saat Menambahkan Barang");
        } finally {
            setOpenDialog(false)
            setLoading(false);
        }
    };

    const resetForm = () => {
        setData({
            kode_barang: "",
            nama_barang: "",
            kategori: "",
            stok: "",
            satuan: "",
            harga: "",
            is_tax: false,
            tax: ""
        });
        setInputValue(""); // Reset inputValue untuk pencarian kategori
        setSearchTerm(""); // Reset searchTerm
    };

    return (
        <Dialog open={openDialog} onOpenChange={(openDialog) => { setOpenDialog(openDialog); if (!openDialog) resetForm(); }}>
            <DialogTrigger asChild>
                <Button>Tambah Barang</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Tambah Barang</DialogTitle>
                    <DialogDescription>
                        Isi data barang dengan lengkap. Klik tambah untuk menyimpan.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="kode_barang" className="text-right">
                            Kode Barang
                        </Label>
                        <Input id="kode_barang" value={data.kode_barang} onChange={handleChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="nama_barang" className="text-right">
                            Nama Barang
                        </Label>
                        <Input id="nama_barang" value={data.nama_barang} onChange={handleChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="kategori" className="text-right">
                            Kategori
                        </Label>
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="col-span-3 justify-between"
                                >
                                    {data.kategori
                                        ? categories.find((category) => category.value === data.kategori)?.label
                                        : "Pilih kategori..."}
                                    <ChevronsUpDown className="opacity-50" />
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent className="col-span-3 p-0">
                                <Command>
                                    <CommandInput
                                        placeholder="Search or create category..."
                                        className="h-9"
                                        value={inputValue}
                                        onValueChange={setInputValue}
                                    />
                                    <CommandList>
                                        <CommandEmpty>
                                            Kategori <strong>{inputValue}</strong> tidak ditemukan.<br/>
                                            <Button
                                                onClick={handleSubmitCategory} disabled={loadingCategory}
                                            >{loading ? "Memproses..." : `Tambahkan kategori ${inputValue}`}</Button>
                                        </CommandEmpty>

                                        <CommandGroup>
                                            {categories
                                                .filter(category => category.label.toLowerCase().includes(searchTerm.toLowerCase())) // Filter categories based on searchTerm
                                                .map((category) => (
                                                    <CommandItem
                                                        key={category.value}
                                                        value={category.value}
                                                        onSelect={(currentValue) => {
                                                            setData((prevData) => ({
                                                                ...prevData,
                                                                kategori: currentValue === prevData.kategori ? "" : currentValue,
                                                            }));
                                                            setOpen(false);
                                                        }}
                                                    >
                                                        {category.label}
                                                        <Check
                                                            className={cn(
                                                                "ml-auto",
                                                                data.kategori === category.value ? "opacity-100" : "opacity-0"
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
                        <Label htmlFor="stok" className="text-right">
                            Stok
                        </Label>
                        <Input id="stok" type="number" value={data.stok} onChange={handleChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="satuan" className="text-right">
                            Satuan
                        </Label>
                        <Select value={data.satuan} onValueChange={(value) => setData({ ...data, satuan: value })}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Pilih satuan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Satuan</SelectLabel>
                                    <SelectItem value="Kg">Kg</SelectItem>
                                    <SelectItem value="Meter">Meter</SelectItem>
                                    <SelectItem value="Batang">Batang</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="harga" className="text-right">
                            Harga
                        </Label>
                        <Input id="harga" value={data.harga} onChange={handleChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Pajak</Label>
                        <Switch checked={data.is_tax} onCheckedChange={handleSwitchChange} className="col-span-3" />
                    </div>
                    {data.is_tax && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="tax" className="text-right">
                                Jumlah Pajak
                            </Label>
                            <Input id="tax" value={data.tax} onChange={handleChange} className="col-span-3" />
                        </div>
                    )}
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
