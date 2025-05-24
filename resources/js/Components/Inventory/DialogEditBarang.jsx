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
import {usePage} from "@inertiajs/react";

export function DialogEditBarang({ barang,dataSatuan,setError }) {
    const {auth} = usePage().props
    const [open, setOpen] = useState(false);
    const [openSatuan, setOpenSatuan] = useState(false);
    const [openSatuanEcerean, setOpenSatuanEcerean] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [satuan,setSatuan] = useState(dataSatuan)
    const [data, setData] = useState({
        kode_barang: barang.item_code,
        nama_barang: barang.item_name,
        kategori: barang.category.category_name,
        stok: barang.stock,
        satuan: barang.satuan,
        harga: barang.price,
        wholesale_price: barang.wholesale_price,
        retail_price: barang.retail_price,
        eceran_price: barang.eceran_price,
        retail_unit: barang.retail_unit,
        bulk_unit: barang.bulk_unit,
        bulk_spec: barang.bulk_spec,
        retail_conversion: barang.retail_conversion,
        is_tax: barang.is_tax,
        is_eceran: barang.is_eceran,
        tax: barang.tax
    });

    console.log(data.is_tax)


    const [loading, setLoading] = useState(false);
    const [loadingCategory, setLoadingCategory] = useState(false);
    const [categories, setCategories] = useState([]);

    const getSatuan = async () => {
        try {
            const response = await axios.post("/api/satuans/");

            setSatuan(response.data.satuan)
        } catch (error) {
            console.error("Error fetching inventory data:", error);
        }
    };
    const handleSubmitSatuan = async (e) => {
        e.preventDefault();
        setLoadingCategory(true);
        // setError(null);

        const payload = {
            satuan_name: inputValue,
        };


        try {
            const response = await axios.post("/api/satuan/store", payload);

            setSuccess(response.data.message)

            // Reset form setelah berhasil
            // resetForm();
            // getCategories()
        } catch (err) {
            setError(err.message || "Terjadi kesalahan");
        } finally {
            getSatuan()
            setLoadingCategory(false);
        }
    };
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
        // setError(null);

        const payload = {
            category_name: inputValue,
        };


        try {
            const response = await axios.post("/api/categories/store", payload);

            // setSuccess(response.data.message)

            // Reset form setelah berhasil
            // resetForm();
            // getCategories()
        } catch (err) {
            // setError(err.message || "Terjadi kesalahan");
        } finally {
            getCategories()
            // setLoadingCategory(false);
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

        const payload = {
            item_code: data.kode_barang,
            item_name: data.nama_barang,
            category_name: data.kategori,
            stock: data.stok,
            satuan: data.satuan,
            price: data.harga,
            wholesale_price: data.wholesale_price,
            retail_price: data.retail_price,
            eceran_price: data.eceran_price,
            retail_unit: data.retail_unit,
            bulk_unit: data.bulk_unit,
            bulk_spec: data.bulk_spec,
            retail_conversion: data.retail_conversion,
            is_tax: data.is_tax,
            tax: data.is_tax ? data.tax : null,
            updated_by: auth.user.id // Menyertakan siapa yang mengupdate
        };

        try {
            const response = await axios.post(`/api/inventory/update/${barang.id}`, payload);
            // console.log("Update success:", response.data);

            // Setelah update berhasil, tutup dialog dan refresh data
            setOpenDialog(false);
            window.location.reload(); // Bisa diganti dengan cara yang lebih efisien jika menggunakan state management
        } catch (err) {
            console.error("Terjadi kesalahan:", err);
            // Tampilkan pesan error jika perlu
        } finally {
            setLoading(false);
        }
    };
    const handleTaxChange = (e) => {
        const value = e.target.value;

        // Only set the value if it's a valid number between 0 and 100
        if (value === "" || (value >= 0 && value <= 100)) {
            setData((prevData) => ({
                ...prevData,
                tax: value,
            }));
        }
    };


    const resetForm = () => {
        setData({
            kode_barang: barang.item_code,
            nama_barang: barang.item_name,
            kategori: barang.category.category_name,
            stok: barang.stock,
            satuan: barang.satuan,
            harga: barang.price,
            wholesale_price: barang.wholesale_price,
            retail_price: barang.retail_price,
            eceran_price: barang.eceran_price,
            retail_unit: barang.retail_unit,
            bulk_unit: barang.bulk_unit,
            bulk_spec: barang.bulk_spec,
            retail_conversion: barang.retail_conversion,
            is_tax: false,
            is_eceran: false,
            tax: barang.tax
        });
        setInputValue(""); // Reset inputValue untuk pencarian kategori
        setSearchTerm(""); // Reset searchTerm
    };

    const formatRupiah = (number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }).format(number);
    };
    const handlePriceChange = (e) => {
        const id = e.target.id
        let value = e.target.value.replace(/[^\d]/g, ''); // Remove non-numeric characters

        if (id === 'harga') {
            if (value === '') {
                setData((prevData) => ({
                    ...prevData,
                    harga: 0
                }))
            }
        }
        if (id === 'eceran_price') {
            if (value === '') {
                setData((prevData) => ({
                    ...prevData,
                    eceran_price: 0
                }))
            }
        }
        if (id === 'wholesale_price') {
            if (value === '') {
                setData((prevData) => ({
                    ...prevData,
                    wholesale_price: 0
                }))
            }
        }
        if (id === 'retail_price') {
            if (value === '') {
                setData((prevData) => ({
                    ...prevData,
                    retail_price: 0
                }))
            }
        }
        if (!value || isNaN(value)) {
            return; // Do nothing if the value is invalid or NaN
        }

        value = parseInt(value, 10); // Convert to a number

        if (id === 'wholesale_price') {
            setData((prevData) => ({
                ...prevData,
                [id]: value
            }))
        }
        if (id === 'retail_price') {
            setData((prevData) => ({
                ...prevData,
                [id]: value
            }))
        }
        if (id === 'harga') {
            setData((prevData) => ({
                ...prevData,
                [id]: value
            }))
        }
        if (id === 'eceran_price') {
            setData((prevData) => ({
                ...prevData,
                [id]: value
            }))
        }

    }
    const handleSwitchEceranChange = (checked) => {
        setData((prevData) => ({
            ...prevData,
            is_eceran: checked,
        }));
    };
    return (
        <Dialog open={openDialog} onOpenChange={(openDialog) => { setOpenDialog(openDialog); if (!openDialog) resetForm(); }}>
            <DialogTrigger asChild>
                <Button variant="outline">Edit</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">

            <DialogHeader>
                    <DialogTitle>Edit Barang</DialogTitle>
                    <DialogDescription>
                        Isi data barang dengan lengkap. Klik simpan untuk menyimpan.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="kode_barang" className="text-right">
                            Kode Barang
                        </Label>
                        <Input id="kode_barang" value={data.kode_barang} onChange={handleChange}
                               className="col-span-3"/>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="nama_barang" className="text-right">
                            Nama Barang
                        </Label>
                        <Input id="nama_barang" value={data.nama_barang} onChange={handleChange}
                               className="col-span-3"/>
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
                                    <ChevronsUpDown className="opacity-50"/>
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
                        <Input id="stok" type="number" value={data.stok} onChange={handleChange}
                               className="col-span-3"/>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="kategori" className="text-right">
                            Satuan
                        </Label>
                        <Popover open={openSatuan} onOpenChange={setOpenSatuan}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="col-span-3 justify-between"
                                >
                                    {data.satuan
                                        ? satuan.find((satuan) => satuan.name === data.satuan)?.name
                                        : "Pilih satuan..."}
                                    <ChevronsUpDown className="opacity-50"/>
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent className="col-span-3 p-0">
                                <Command>
                                    <CommandInput
                                        placeholder="Cari or tambahkan satuan baru..."
                                        className="h-9"
                                        value={inputValue}
                                        onValueChange={setInputValue}
                                    />
                                    <CommandList>
                                        <CommandEmpty>
                                            Satuan <strong>{inputValue}</strong> tidak ditemukan.<br/>
                                            <Button
                                                onClick={handleSubmitSatuan} disabled={loadingCategory}
                                            >{loading ? "Memproses..." : `Tambahkan satuan ${inputValue}`}</Button>
                                        </CommandEmpty>

                                        <CommandGroup>
                                            {satuan
                                                .filter(satuan => satuan.name.toLowerCase().includes(searchTerm.toLowerCase())) // Filter categories based on searchTerm
                                                .map((satuan) => (
                                                    <CommandItem
                                                        key={satuan.id}
                                                        value={satuan.name}
                                                        onSelect={(currentValue) => {
                                                            setData((prevData) => ({
                                                                ...prevData,
                                                                satuan: currentValue === prevData.satuan ? "" : currentValue,
                                                            }));
                                                            setOpenSatuan(false);
                                                        }}
                                                    >
                                                        {satuan.name}
                                                        <Check
                                                            className={cn(
                                                                "ml-auto",
                                                                data.satuan === satuan.name ? "opacity-100" : "opacity-0"
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
                        <Label htmlFor="harga" className="text-right">
                            Harga Modal
                        </Label>
                        <Input id="harga" value={formatRupiah(data.harga)} onChange={handlePriceChange}
                               className="col-span-3"/>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="retail_price" className="text-right">
                            Harga Retail
                        </Label>
                        <Input id="retail_price" value={formatRupiah(data.retail_price)} onChange={handlePriceChange}
                               className="col-span-3"/>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="wholesale_price" className="text-right">
                            Harga Grosir
                        </Label>
                        <Input id="wholesale_price" value={formatRupiah(data.wholesale_price)}
                               onChange={handlePriceChange} className="col-span-3"/>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Pajak</Label>
                        <Switch checked={data.is_tax} onCheckedChange={handleSwitchChange} className="col-span-3"/>
                    </div>
                    {data.is_tax === true && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="tax" className="text-right">
                                Jumlah Pajak
                            </Label>
                            <Input
                                id="tax"
                                value={data.tax}
                                onChange={handleTaxChange}
                                className="col-span-3"
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"  // Allows decimal input for more precision
                                placeholder="Masukkan persentase (0-100)"
                            />
                        </div>
                    )}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Eceran</Label>
                        <Switch checked={data.is_eceran} onCheckedChange={handleSwitchEceranChange}
                                className="col-span-3"/>
                    </div>
                    {data.is_eceran === true && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="kategori" className="text-right">
                                Satuan Eceran
                            </Label>
                            <Popover open={openSatuanEcerean} onOpenChange={setOpenSatuanEcerean}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={open}
                                        className="col-span-3 justify-between"
                                    >
                                        {data.retail_unit
                                            ? satuan.find((satuan) => satuan.name === data.retail_unit)?.name
                                            : "Pilih satuan..."}
                                        <ChevronsUpDown className="opacity-50"/>
                                    </Button>
                                </PopoverTrigger>

                                <PopoverContent className="col-span-3 p-0">
                                    <Command>
                                        <CommandInput
                                            placeholder="Cari or tambahkan satuan baru..."
                                            className="h-9"
                                            value={inputValue}
                                            onValueChange={setInputValue}
                                        />
                                        <CommandList>
                                            <CommandEmpty>
                                                Satuan <strong>{inputValue}</strong> tidak ditemukan.<br/>
                                                <Button
                                                    onClick={handleSubmitSatuan} disabled={loadingCategory}
                                                >{loading ? "Memproses..." : `Tambahkan satuan ${inputValue}`}</Button>
                                            </CommandEmpty>

                                            <CommandGroup>
                                                {satuan
                                                    .filter(satuan => satuan.name.toLowerCase().includes(searchTerm.toLowerCase())) // Filter categories based on searchTerm
                                                    .map((satuan) => (
                                                        <CommandItem
                                                            key={satuan.id}
                                                            value={satuan.name}
                                                            onSelect={(currentValue) => {
                                                                setData((prevData) => ({
                                                                    ...prevData,
                                                                    retail_unit: currentValue === prevData.retail_unit ? "" : currentValue,
                                                                }));
                                                                setOpenSatuanEcerean(false);
                                                            }}
                                                        >
                                                            {satuan.name}
                                                            <Check
                                                                className={cn(
                                                                    "ml-auto",
                                                                    data.retail_unit === satuan.name ? "opacity-100" : "opacity-0"
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
                    )}
                    {data.retail_unit !== null && (
                        <>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="retail_conversion" className="text-right">
                                    1 {data.satuan} =
                                </Label>
                                <Input id="retail_conversion" type="number" value={data.retail_conversion}
                                       onChange={handleChange}
                                       className="col-span-2"/>
                                <Label htmlFor="retail_conversion" className="text-left">
                                    {data.retail_unit}
                                </Label>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="eceran_price" className="text-right">
                                    Harga Eceran
                                </Label>
                                <Input id="eceran_price" value={formatRupiah(data.eceran_price)}
                                       onChange={handlePriceChange}
                                       className="col-span-3"/>
                            </div>
                        </>
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
