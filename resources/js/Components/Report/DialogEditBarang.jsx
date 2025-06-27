import { useEffect, useState } from "react";
import axios from "axios";
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
import {usePage} from "@inertiajs/react";
import InvoiceItemsTable from "@/Components/Report/InvoiceItemsTable.jsx";

export function DialogEditBarang({ barang,setError,setSuccess}) {
    const {auth} = usePage().props
    const [open, setOpen] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    // const [data, setData] = useState({
    //     kode_barang: barang.item_code,
    //     nama_barang: barang.item_name,
    //     kategori: barang.category.category_name,
    //     stok: barang.stock,
    //     satuan: barang.satuan,
    //     harga: barang.price,
    //     is_tax: barang.is_tax,
    //     tax: barang.tax
    // });


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
            price: data.harga_beli,
            is_tax: data.is_tax,
            tax: data.is_tax ? data.tax : null,
            created_by: auth.user.id
        };


        try {
            const response = await axios.post("/api/inventory/store", payload);


            // Reset form setelah berhasil
            setSuccess(response.data.message)
        } catch (err) {
            console.error("Terjadi kesalahan:", err);
            setError("Terjadi kesalahan Saat Menambahkan Barang");
        } finally {
            setOpenDialog(false)
            setLoading(false);
        }
    };

    return (
        <Dialog open={openDialog} onOpenChange={(openDialog) => { setOpenDialog(openDialog) }}>
            <DialogTrigger asChild>
                <Button variant="secondary">Detail</Button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl w-full max-sm:max-w-[425px]">
            <DialogHeader>
                    <DialogTitle>Detail Transaksi : {barang.invoice_code}</DialogTitle>
                    <DialogDescription>
                        Detail Transaksi dari {barang.invoice_code}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <InvoiceItemsTable items={barang.items} invoice={barang} />
                    {/*<div className="grid grid-cols-4 items-center gap-4">*/}
                    {/*    <Label htmlFor="kode_barang" className="text-right">*/}
                    {/*        Kode Barang*/}
                    {/*    </Label>*/}
                    {/*    <Input id="kode_barang" value={data.kode_barang} onChange={handleChange} className="col-span-3" />*/}
                    {/*</div>*/}
                    {/*<div className="grid grid-cols-4 items-center gap-4">*/}
                    {/*    <Label htmlFor="nama_barang" className="text-right">*/}
                    {/*        Nama Barang*/}
                    {/*    </Label>*/}
                    {/*    <Input id="nama_barang" value={data.nama_barang} onChange={handleChange} className="col-span-3" />*/}
                    {/*</div>*/}
                    {/*<div className="grid grid-cols-4 items-center gap-4">*/}
                    {/*    <Label htmlFor="kategori" className="text-right">*/}
                    {/*        Kategori*/}
                    {/*    </Label>*/}
                    {/*    <Popover open={open} onOpenChange={setOpen}>*/}
                    {/*        <PopoverTrigger asChild>*/}
                    {/*            <Button*/}
                    {/*                variant="outline"*/}
                    {/*                role="combobox"*/}
                    {/*                aria-expanded={open}*/}
                    {/*                className="col-span-3 justify-between"*/}
                    {/*            >*/}
                    {/*                {data.kategori*/}
                    {/*                    ? categories.find((category) => category.value === data.kategori)?.label*/}
                    {/*                    : "Pilih kategori..."}*/}
                    {/*                <ChevronsUpDown className="opacity-50" />*/}
                    {/*            </Button>*/}
                    {/*        </PopoverTrigger>*/}

                    {/*        <PopoverContent className="col-span-3 p-0">*/}
                    {/*            <Command>*/}
                    {/*                <CommandInput*/}
                    {/*                    placeholder="Search or create category..."*/}
                    {/*                    className="h-9"*/}
                    {/*                    value={inputValue}*/}
                    {/*                    onValueChange={setInputValue}*/}
                    {/*                />*/}
                    {/*                <CommandList>*/}
                    {/*                    <CommandEmpty>*/}
                    {/*                        Kategori <strong>{inputValue}</strong> tidak ditemukan.<br/>*/}
                    {/*                        <Button*/}
                    {/*                            onClick={handleSubmitCategory} disabled={loadingCategory}*/}
                    {/*                        >{loading ? "Memproses..." : `Tambahkan kategori ${inputValue}`}</Button>*/}
                    {/*                    </CommandEmpty>*/}

                    {/*                    <CommandGroup>*/}
                    {/*                        {categories*/}
                    {/*                            .filter(category => category.label.toLowerCase().includes(searchTerm.toLowerCase())) // Filter categories based on searchTerm*/}
                    {/*                            .map((category) => (*/}
                    {/*                                <CommandItem*/}
                    {/*                                    key={category.value}*/}
                    {/*                                    value={category.value}*/}
                    {/*                                    onSelect={(currentValue) => {*/}
                    {/*                                        setData((prevData) => ({*/}
                    {/*                                            ...prevData,*/}
                    {/*                                            kategori: currentValue === prevData.kategori ? "" : currentValue,*/}
                    {/*                                        }));*/}
                    {/*                                        setOpen(false);*/}
                    {/*                                    }}*/}
                    {/*                                >*/}
                    {/*                                    {category.label}*/}
                    {/*                                    <Check*/}
                    {/*                                        className={cn(*/}
                    {/*                                            "ml-auto",*/}
                    {/*                                            data.kategori === category.value ? "opacity-100" : "opacity-0"*/}
                    {/*                                        )}*/}
                    {/*                                    />*/}
                    {/*                                </CommandItem>*/}
                    {/*                            ))}*/}
                    {/*                    </CommandGroup>*/}
                    {/*                </CommandList>*/}
                    {/*            </Command>*/}
                    {/*        </PopoverContent>*/}
                    {/*    </Popover>*/}
                    {/*</div>*/}
                    {/*<div className="grid grid-cols-4 items-center gap-4">*/}
                    {/*    <Label htmlFor="stok" className="text-right">*/}
                    {/*        Stok*/}
                    {/*    </Label>*/}
                    {/*    <Input id="stok" type="number" value={data.stok} onChange={handleChange} className="col-span-3" />*/}
                    {/*</div>*/}
                    {/*<div className="grid grid-cols-4 items-center gap-4">*/}
                    {/*    <Label htmlFor="satuan" className="text-right">*/}
                    {/*        Satuan*/}
                    {/*    </Label>*/}
                    {/*    <Select value={data.satuan} onValueChange={(value) => setData({ ...data, satuan: value })}>*/}
                    {/*        <SelectTrigger className="col-span-3">*/}
                    {/*            <SelectValue placeholder="Pilih satuan" />*/}
                    {/*        </SelectTrigger>*/}
                    {/*        <SelectContent>*/}
                    {/*            <SelectGroup>*/}
                    {/*                <SelectLabel>Satuan</SelectLabel>*/}
                    {/*                <SelectItem value="Kg">Kg</SelectItem>*/}
                    {/*                <SelectItem value="Meter">Meter</SelectItem>*/}
                    {/*                <SelectItem value="Batang">Batang</SelectItem>*/}
                    {/*            </SelectGroup>*/}
                    {/*        </SelectContent>*/}
                    {/*    </Select>*/}
                    {/*</div>*/}
                    {/*<div className="grid grid-cols-4 items-center gap-4">*/}
                    {/*    <Label htmlFor="harga" className="text-right">*/}
                    {/*        Harga*/}
                    {/*    </Label>*/}
                    {/*    <Input id="harga" value={data.harga} onChange={handleChange} className="col-span-3" />*/}
                    {/*</div>*/}
                    {/*<div className="grid grid-cols-4 items-center gap-4">*/}
                    {/*    <Label className="text-right">Pajak</Label>*/}
                    {/*    <Switch checked={data.is_tax} onCheckedChange={handleSwitchChange} className="col-span-3" />*/}
                    {/*</div>*/}
                    {/*{data.is_tax && (*/}
                    {/*    <div className="grid grid-cols-4 items-center gap-4">*/}
                    {/*        <Label htmlFor="tax" className="text-right">*/}
                    {/*            Jumlah Pajak*/}
                    {/*        </Label>*/}
                    {/*        <Input id="tax" value={data.tax} onChange={handleChange} className="col-span-3" />*/}
                    {/*    </div>*/}
                    {/*)}*/}
                </div>
            </DialogContent>
        </Dialog>
    );
}
