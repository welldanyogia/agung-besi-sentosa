import {useEffect, useState} from "react";
import axios from "axios";
import {
    Check,
    ChevronsUpDown,
    CalendarIcon
} from "lucide-react";
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
import {Input} from "@/Components/ui/input";
import {Label} from "@/Components/ui/label";
import {Switch} from "@/Components/ui/switch";
import {Popover, PopoverContent, PopoverTrigger} from "@/Components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/Components/ui/command";
import {cn} from "@/lib/utils.js";
import {router} from "@inertiajs/react";
import {format} from "date-fns";
import {Calendar} from "@/Components/ui/calendar.jsx";
import {id} from "date-fns/locale";
import {Inertia} from "@inertiajs/inertia";

export function DialogEditPembelian({auth, setTabValue,setError, setSuccess, dataSatuan,itemCodes,pembelian}) {
    const [open, setOpen] = useState(false);
    const [openCode, setOpenCode] = useState(false);
    const [openSatuan, setOpenSatuan] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [inputCodeValue, setInputCodeValue] = useState("");
    const [inputSatuanValue, setInputSatuanValue] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // bulan dimulai dari 0
    const dd = String(today.getDate()).padStart(2, '0');

    const formattedToday = `${yyyy}-${mm}-${dd}`;
    const [data, setData] = useState({
        kode_barang: pembelian.kode_barang,
        nama_barang: pembelian.nama_barang,
        kategori: pembelian.category.category_name,
        qty: pembelian.qty,
        satuan: pembelian.satuan,
        harga_beli: pembelian.harga,
        is_tax: pembelian.pajak,
        tax_percentage: pembelian.persentase_pajak,
        pajak_masukan: pembelian.pajak_masukan,
        harga_sebelum_pajak:pembelian.harga_total,
        tanggal_pembelian: pembelian.tanggal_pembelian
    });
    const handleDateChange = (date) => {
        if (date) {
            setData((prev) => ({
                ...prev,
                tanggal_pembelian: format(date, "yyyy-MM-dd"),
            }));
        }
    };

    const [loading, setLoading] = useState(false);
    const [loadingCategory, setLoadingCategory] = useState(false);
    const [categories, setCategories] = useState([]);
    const [satuan,setSatuan] = useState(dataSatuan)

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
    const getSatuan = async () => {
        try {
            const response = await axios.post("/api/satuans/");

            setSatuan(response.data.satuan)
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
    const handleSubmitSatuan = async (e) => {
        e.preventDefault();
        setLoadingCategory(true);
        setError(null);

        const payload = {
            satuan_name: inputSatuanValue,
        };


        try {
            const response = await axios.post("/api/satuan/store", payload);

            setSuccess(response.data.message)

            // Reset form setelah berhasil
            // resetForm();
            // getCategories()
        } catch (err) {
            // console.log(err)
            setError(err.message || "Terjadi kesalahan");
        } finally {
            getSatuan()
            setLoadingCategory(false);
        }
    };

    useEffect(() => {
        getCategories();
    }, []);

    const handleChange = (e) => {
        const {id, value} = e.target;
        setData((prevData) => ({
            ...prevData,
            [id]: value,
        }));
    };


    const handlePriceChange = (e) => {
        const id = e.target.id
        let value = e.target.value.replace(/[^\d]/g, ''); // Remove non-numeric characters

        if (id === 'harga_beli') {
            if (value === '') {
                setData((prevData) => ({
                    ...prevData,
                    harga_beli: 0,
                    pajak_masukan: 0,
                    harga_sebelum_pajak: 0
                }))
            }
        }
        if (id === 'harga_sebelum_pajak') {
            if (value === '') {
                setData((prevData) => ({
                    ...prevData,
                    harga_sebelum_pajak: 0
                }))
            }
        }
        if (id === 'pajak_masukan') {
            if (value === '') {
                setData((prevData) => ({
                    ...prevData,
                    pajak_masukan: 0
                }))
            }
        }
        if (!value || isNaN(value)) {
            return; // Do nothing if the value is invalid or NaN
        }

        value = parseInt(value, 10); // Convert to a number

        if (id === 'harga_sebelum_pajak') {
            setData((prevData) => ({
                ...prevData,
                [id]: value
            }))
        }
        if (id === 'pajak_masukan') {
            setData((prevData) => ({
                ...prevData,
                [id]: value
            }))
        }
        if (id === 'harga_beli') {
            if (data.tax_percentage !== null && data.tax_percentage !== undefined && data.tax_percentage !== '' && data.tax_percentage === true){
            setData((prevData) => ({
                ...prevData,
                [id]: value,
                pajak_masukan: value*(data.tax_percentage/(100+data.tax_percentage)),
                harga_sebelum_pajak: value*(100/(100+data.tax_percentage))
            }))
            } else {
                setData((prevData) => ({
                    ...prevData,
                    [id]: value,
                    pajak_masukan: 0,
                    harga_sebelum_pajak: 0
                }))
            }
        }

    }

    const formatRupiah = (number,digit=0) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: digit
        }).format(number);
    };

    const handleTaxChange = (e) => {
        // const value = e.target.value;
        let value = e.target.value;

        // Cek apakah value adalah string angka, lalu ubah ke integer
        if (typeof value === 'string' && value.trim() !== '') {
            value = parseInt(value, 10); // Ubah ke integer basis 10

            // Jika parseInt gagal (misal input kosong atau bukan angka), value akan NaN,
            // kamu bisa atur value default, misal 0 atau ''
            if (isNaN(value)) {
                value = 0; // atau sesuai kebutuhan, misal ''
            }
        }
        // Only set the value if it's a valid number between 0 and 100
        if (value === "" || (value >= 0 && value <= 100) && data.is_tax === true) {
            setData((prevData) => ({
                ...prevData,
                tax_percentage: value,
            }));

            if (value >0 && value !== '' && value !== null){
                setData((prevData)=>({
                    ...prevData,
                    pajak_masukan: data.harga_beli*(value/(100+value)),
                    harga_sebelum_pajak: data.harga_beli*(100/(100+value))
                }))
            }
        }else {
            setData((prevData)=>({
                ...prevData,
                pajak_masukan: 0,
                harga_sebelum_pajak: 0
            }))
        }
    };
    const handleSwitchChange = (checked) => {
        if (checked){
        setData((prevData) => ({
            ...prevData,
            is_tax: checked,
            pajak_masukan: data.harga_beli*(data.tax_percentage/(100+data.tax_percentage)),
            harga_sebelum_pajak: data.harga_beli*(100/(100+data.tax_percentage))
            // tax: checked ? prevData.tax : "" // Reset tax jika is_tax dimatikan
        }))
        } else {
            setData((prevData) => ({
                ...prevData,
                is_tax: checked,
                pajak_masukan: 0,
                harga_sebelum_pajak: 0
            }))
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // setLoading(true);
        // setError(null);

        const payload = {
            kode_barang: data.kode_barang,
            nama_barang: data.nama_barang,
            kategori: data.kategori,
            qty: data.qty,
            satuan: data.satuan,
            harga_beli: data.harga_beli,
            harga_sebelum_pajak: data.harga_sebelum_pajak,
            pajak_masukan: data.pajak_masukan,
            is_tax: data.is_tax,
            tax_percentage: parseFloat(data.tax_percentage),
            tanggal_pembelian: data.tanggal_pembelian,
            // created_by: auth.user.id
        };



        try {
            const response = await axios.post(`/api/inventory/pembelian/update/${pembelian.id}`, payload);


            // Reset form setelah berhasil
            setSuccess(response.data.message)
            // Inertia.reload()
            resetForm();
        } catch (err) {
            console.error("Terjadi kesalahan:", err);
            setError("Terjadi kesalahan Saat Menambahkan Barang");
        } finally {
            // router.get(route("inventory"), {preserveState: true});
            // setOpenDialog(false)
            // setLoading(false);

            setOpenDialog(false);
            setLoading(false);
            router.get(route("inventory"), {
                preserveState: true,
                tabValue: 'pembelian',
                onFinish: () => {
                    resetForm();
                    // setTabValue('pembelian')
                },
            });
        }
    };

    const resetForm = () => {
        setData({
            kode_barang: "",
            nama_barang: "",
            kategori: "",
            qty: "",
            satuan: "",
            satuan_id: "",
            harga: "",
            harga_sebelum_pajak: "",
            pajak_masukan: "",
            is_tax: false,
        });
        setInputValue(""); // Reset inputValue untuk pencarian kategori
        setSearchTerm(""); // Reset searchTerm
    };

    const isExactMatch = categories.some(
        (category) => category.label.toLowerCase() === inputValue.trim().toLowerCase()
    );


    return (
        <Dialog modal={false} open={openDialog} onOpenChange={(openDialog) => {
            setOpenDialog(openDialog);
            if (!openDialog) resetForm();
        }}>
            <DialogTrigger asChild>
                <Button onClick={()=>{
                }}>Edit</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto ">
            <DialogHeader>
                    <DialogTitle>Edit Pembelian</DialogTitle>
                    <DialogDescription>
                        Isi data barang dengan lengkap. Klik simpan untuk menyimpan.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {/*Kode Barang*/}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="kode_barang" className="text-right">
                            Kode Barang
                        </Label>
                        <Popover open={openCode} onOpenChange={setOpenCode} >
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="col-span-3 justify-between"
                                >
                                    {data.kode_barang && data.kode_barang.trim() !== ""
                                        ? data.kode_barang
                                        : "Pilih Kode Barang..."}
                                    <ChevronsUpDown className="opacity-50"/>
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent
                                className="col-span-3 p-0 z-50 w-[--radix-popover-trigger-width]"
                                side="bottom"
                                align="start"
                            >
                                <Command>
                                    <CommandInput
                                        placeholder="Cari atau tambah kode barang..."
                                        className="h-9"
                                        value={inputCodeValue}
                                        onValueChange={setInputCodeValue}
                                    />
                                    <div className="max-h-[300px] overflow-y-auto touch-auto overscroll-contain">
                                        <CommandList
                                            className="max-h-[200px] overflow-y-auto overscroll-contain touch-auto">
                                            {
                                                !isExactMatch && inputCodeValue.trim() !== "" && (
                                                    <div
                                                        className="flex text-sm flex-col items-center justify-center text-center space-y-2 py-4">
                                                        <div>
                                                            Kode Barang <strong>{inputCodeValue}</strong> tidak ditemukan.
                                                        </div>
                                                        <Button onClick={()=>{
                                                            setData({
                                                                kode_barang: item.item_code
                                                            })
                                                            setOpenCode(false)
                                                            const foundItem = items.find(item => item.item_code === currentValue);

                                                            if (foundItem) {
                                                                setData(prevData => ({
                                                                    ...prevData,
                                                                    nama_barang: foundItem.item_name,
                                                                    kategori: foundItem.category.category_name,
                                                                    satuan: foundItem.satuan
                                                                }));
                                                            }

                                                        }} disabled={loadingCategory} className={'items-center justify-center text-center'}>
                                                            {loading ? "Memproses..." : `Tambahkan Kode Barang "${inputCodeValue}"`}
                                                        </Button>
                                                    </div>
                                                )
                                            }

                                            <CommandGroup>
                                                {(itemCodes || [])
                                                    .filter(item_code => item_code.toLowerCase().includes(searchTerm.toLowerCase()))
                                                    .map((item_code) => (
                                                        <CommandItem
                                                            key={item_code}
                                                            value={item_code}
                                                            onSelect={(currentValue) => {
                                                                setData((prevData) => ({
                                                                    ...prevData,
                                                                    kode_barang: currentValue === prevData.kode_barang ? "" : currentValue,
                                                                }));
                                                                const foundItem = items.find(item => item.item_code === currentValue);

                                                                if (foundItem) {
                                                                    setData(prevData => ({
                                                                        ...prevData,
                                                                        nama_barang: foundItem.item_name,
                                                                        kategori: foundItem.category.category_name,
                                                                        satuan: foundItem.satuan

                                                                    }));
                                                                } else {
                                                                    // Jika ingin, bisa reset atau set data lain jika tidak ditemukan
                                                                    setData(prevData => ({
                                                                        ...prevData,
                                                                        nama_barang: ""
                                                                    }));
                                                                }

                                                                setOpenCode(false);
                                                            }}
                                                        >
                                                            {item_code}
                                                            <Check
                                                                className={cn("ml-auto", data.kode_barang === item_code ? "opacity-100" : "opacity-0")}
                                                            />
                                                        </CommandItem>
                                                    ))
                                                }

                                            </CommandGroup>
                                        </CommandList>
                                    </div>
                                </Command>
                            </PopoverContent>

                        </Popover>
                    </div>
                    {/*nama barang*/}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="nama_barang" className="text-right">
                            Nama Barang
                        </Label>
                        <Input id="nama_barang" value={data.nama_barang} onChange={handleChange}
                               className="col-span-3"/>
                    </div>
                    {/*kategori*/}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="kategori" className="text-right">
                            Kategori
                        </Label>
                        <Popover open={open} onOpenChange={setOpen} >
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

                            <PopoverContent
                                className="col-span-3 p-0 z-50 w-[--radix-popover-trigger-width]"
                                side="bottom"
                                align="start"
                            >
                                <Command>
                                    <CommandInput
                                        placeholder="Search or create category..."
                                        className="h-9"
                                        value={inputValue}
                                        onValueChange={setInputValue}
                                    />
                                    <div className="max-h-[300px] overflow-y-auto touch-auto overscroll-contain">
                                        <CommandList
                                            className="max-h-[200px] overflow-y-auto overscroll-contain touch-auto">
                                            {
                                                !isExactMatch && inputValue.trim() !== "" && (
                                                    <div
                                                        className="flex flex-col items-center justify-center text-center space-y-2 py-4">
                                                        <div>
                                                            Kategori <strong>{inputValue}</strong> tidak ditemukan.
                                                        </div>
                                                        <Button onClick={handleSubmitCategory} disabled={loadingCategory}>
                                                            {loading ? "Memproses..." : `Tambahkan kategori "${inputValue}"`}
                                                        </Button>
                                                    </div>
                                                )
                                            }

                                            <CommandGroup>
                                                {categories
                                                    .filter(category => category.label.toLowerCase().includes(searchTerm.toLowerCase()))
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
                                                                className={cn("ml-auto", data.kategori === category.value ? "opacity-100" : "opacity-0")}/>
                                                        </CommandItem>
                                                    ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </div>
                                </Command>
                            </PopoverContent>

                        </Popover>
                    </div>
                    {/*QTY*/}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="qty" className="text-right">
                            QTY
                        </Label>
                        <Input id="qty" type="number" value={data.qty} onChange={handleChange}
                               className="col-span-3"/>
                    </div>
                    {/*Satuan*/}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="kategori" className="text-right">
                            Satuan
                        </Label>
                        <Popover open={openSatuan} onOpenChange={setOpenSatuan} >
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
                                        value={inputSatuanValue}
                                        onValueChange={setInputSatuanValue}
                                    />
                                    <CommandList>
                                        <CommandEmpty>
                                            Satuan <strong>{inputSatuanValue}</strong> tidak ditemukan.<br/>
                                            <Button
                                                onClick={handleSubmitSatuan} disabled={loadingCategory}
                                            >{loading ? "Memproses..." : `Tambahkan satuan ${inputSatuanValue}`}</Button>
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
                        <Label htmlFor="harga_beli" className="text-right">
                            Harga Beli
                        </Label>
                        <Input id="harga_beli" value={formatRupiah(data.harga_beli)} onChange={handlePriceChange}
                               className="col-span-3"/>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Pajak</Label>
                        <Switch checked={data.is_tax} onCheckedChange={handleSwitchChange} className="col-span-3"/>
                    </div>
                    {data.is_tax && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="tax_percentage" className="text-right">
                                Persentase Pajak
                            </Label>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Input
                                    id="tax_percentage"
                                    value={data.tax_percentage}
                                    onChange={handleTaxChange}
                                    className="col-span-3"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    placeholder="Masukkan persentase pajak"
                                />
                                <span style={{ marginLeft: '4px' }}>%</span>
                            </div>
                        </div>
                    )}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="pajak_masukan" className="text-right">
                            Pajak Masukan
                        </Label>
                        <Input id="pajak_masukan" value={formatRupiah(data.pajak_masukan,2)} onChange={handlePriceChange}
                               className="col-span-3"/>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="harga_sebelum_pajak" className="text-right">
                            Harga Sebelum Pajak
                        </Label>
                        <Input id="harga_sebelum_pajak" value={formatRupiah(data.harga_sebelum_pajak,2)}
                               onChange={handlePriceChange} className="col-span-3"/>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="harga_sebelum_pajak" className="text-right">
                            Tanggal Pembelian
                        </Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-[240px] pl-3 text-left font-normal",
                                        !data.tanggal_pembelian && "text-muted-foreground"
                                    )}
                                >
                                    {data.tanggal_pembelian ? (
                                        format(new Date(data.tanggal_pembelian), "PPP", { locale: id })
                                    ) : (
                                        <span>Pilih tanggal</span>
                                    )}

                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={
                                        data.tanggal_pembelian
                                            ? new Date(data.tanggal_pembelian)
                                            : undefined
                                    }
                                    onSelect={handleDateChange}
                                    disabled={(date) =>
                                        date > new Date() || date < new Date("1900-01-01")
                                    }
                                    locale={id}
                                    initialFocus
                                />

                            </PopoverContent>
                        </Popover>
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
