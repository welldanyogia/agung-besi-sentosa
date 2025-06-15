import {useEffect, useState} from "react";
import axios from "axios";
import {Check, ChevronsUpDown} from "lucide-react";
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
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select.jsx";
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
import {router, usePage} from "@inertiajs/react";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/Components/ui/card.jsx";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/Components/ui/tabs.jsx";
import {Inertia} from "@inertiajs/inertia";

export function DialogTambahItem({auth, product, setInvoiceItems, setSuccess, setError, getItems, getInvoice}) {
    const [openDialog, setOpenDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const initialQuantity = ["ornamen"].includes(product.category?.category_name.toLowerCase()) ? 1 : 0.5;
    const [quantity, setQuantity] = useState(initialQuantity);
    const availableTabs = [
        {key: 'retail', label: 'Retail', price: product.retail_price},
        {key: 'semi_grosir', label: 'Semi Grosir', price: product.semi_grosir_price},
        {key: 'grosir', label: 'Grosir', price: product.wholesale_price},
        {key: 'eceran', label: 'Eceran', price: product.eceran_price},
    ].filter(tab => Number(tab.price) !== 0);// Filter hanya yang memiliki harga

    const defaultValue = availableTabs.length > 0 ? availableTabs[0].key : ''; // Ambil yang pertama
    const [selectedTab, setSelectedTab] = useState(defaultValue);
    // console.log()
    const step = ["ornamen"].includes(product?.category?.category_name.toLowerCase()) ? 1 : 0.5;


    const handleIncrease = (priceType = null) => {
        const maxQuantity = priceType === 'eceran'
            ? product?.retail_conversion ?? 0
            : product?.stock ?? 0;

        if (quantity + step <= maxQuantity) {
            setQuantity(prevQuantity => parseFloat((prevQuantity + step).toFixed(2)));
        }
    };


    const handleDecrease = () => {
        if (quantity - step >= step) {
            setQuantity(prevQuantity => parseFloat((prevQuantity - step).toFixed(2)));
        }
    };

    const handleChange = (e, priceType = null) => {
        let raw = e.target.value;
        let value = parseFloat(raw);

        // Jika value awal 0 dan user input angka tanpa koma, ubah langsung jadi integer biasa
        if (quantity === 0 && !raw.includes('.') && !raw.includes(',')) {
            setQuantity(parseInt(raw));
            return;
        }

        if (isNaN(value)) {
            setQuantity(quantity === 0 ? 0 : step);
            return;
        }

        // Tentukan batas maksimum berdasarkan priceType jika ada
        let maxQuantity;
        if (priceType === 'eceran') {
            maxQuantity = product?.retail_conversion ?? 0;
        } else {
            maxQuantity = product?.stock ?? 0;
        }

        if (value > maxQuantity) {
            setQuantity(maxQuantity);
        } else {
            // Boleh input desimal, bulatkan ke kelipatan step
            const isMultipleOfStep = Math.abs(value % step) < 0.0001;

            if (!isMultipleOfStep) {
                const multiplier = Math.round(value / step);
                value = multiplier * step;
            }

            setQuantity(parseFloat(value.toFixed(2)));
        }
    };



    const handleAddItem = async () => {
        setLoading(true);

        // Tentukan price_type berdasarkan tab yang dipilih
        const priceType = selectedTab || "retail"; // Default ke "retail" jika tidak ada

        // Tentukan harga berdasarkan price_type
        let itemPrice;
        switch (priceType) {
            case "eceran":
                itemPrice = product.eceran_price;
                break;
            case "semi_grosir":
                itemPrice = product.semi_grosir_price;
                break;
            case "grosir":
                itemPrice = product.wholesale_price;
                break;
            case "retail":
            default:
                itemPrice = product.retail_price;
                break;
        }

        // Tambahkan item ke dalam invoice
        setInvoiceItems((prevItems) => {
            const itemIndex = prevItems?.findIndex((item) => item.id === product.id);

            if (itemIndex > -1) {
                const updatedItems = [...prevItems];
                updatedItems[itemIndex].qty += quantity;
                return updatedItems;
            } else {
                const newItem = {
                    id: product.id,
                    item_name: priceType === "eceran" ? `${product.item_name} (Eceran)` : product.item_name,
                    price: itemPrice, // Harga dengan pajak
                    satuan: product.satuan,
                    qty: quantity,
                    price_type: priceType, // Tambahkan price_type ke item
                };
                return [...prevItems, newItem];
            }
        });

        try {
            const response = await axios.post("/api/cashier/update-stock", {
                item_id: product.id,
                quantity: quantity,
                user_id: auth.user.id,
                price_type: priceType, // Kirim price_type ke API
            });

            setSuccess(response.data.message);
            // console.log(response)
        } catch (error) {
            // console.log(error)
            setError("Gagal menambahkan barang!!!");
        } finally {
            router.reload()
            // getItems()
        }

        setTimeout(() => {
            setLoading(false);
            setOpenDialog(false);
            setQuantity(1);
            getInvoice();
        }, 1000);
    };


    const formatRupiah = (number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(number);
    };

    const gridColsClass = {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
        5: 'grid-cols-5',
    }[availableTabs.length] || 'grid-cols-1'; // fallback jika tidak cocok

    useEffect(() => {
        const defaultQty = ["ornamen"].includes(product.category?.category_name.toLowerCase()) ? 1 : 0.5;
        setQuantity(defaultQty);
    }, [product]);


    return (
        <Dialog open={openDialog && product.stock > 0} onOpenChange={(openDialog) => setOpenDialog(openDialog)}>
            <DialogTrigger asChild disabled={product.stock <= 0} onClick={() => {
                if (product.stock <= 0) {
                    setError("Stok Habis"); // Set error jika stok 0
                }
            }}>
                <Card
                    key={product.id}
                    className="relative flex flex-col justify-center py-6 px-4  rounded-lg shadow-md transition-all duration-300 hover:scale-105 hover:cursor-pointer"
                >
                    {/* Pita Pajak */}
                    {product.is_tax === 1 && (
                        <div
                            className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg">
                            + Pajak
                        </div>
                    )}
                    {product.eceran_price !== null && (
                        <div
                            className="absolute top-0 left-0 bg-indigo-500 text-white text-xs font-bold px-2 py-1 rounded-br-lg rounded-tl-lg">
                            Eceran
                        </div>
                    )}

                    <p className="font-semibold">{product.item_name}</p>
                    <p className="">{product.item_code}</p>
                    <p className="text-sm text-gray-700">
                        {formatRupiah(product.retail_price)}
                    </p>
                    <p className={`text-sm ${product.stock === 0 ? "text-red-500" : "text-green-500"}`}>
                        {product.stock === 0 ? "Stok Habis" : `Stok: ${parseFloat(product.stock).toFixed(2)}`}
                    </p>
                    <p className="">Kategori : <span className={'font-bold'}>{product.category.category_name}</span></p>
                </Card>

            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Tambah Barang</DialogTitle>
                    <DialogDescription>Tambahkan barang dalam transaksi</DialogDescription>
                </DialogHeader>

                <div className="grid py-4 gap-2">
                    <div className="flex flex-col gap-2">
                        <div className="w-full justify-between">
                            <div className={'flex justify-between w-full p-2'}>
                                <div className={'flex flex-col justify-center p-2 text-center'}>
                                    <div className={'font-bold'}>Nama Barang</div>
                                    <div>{product.item_name}</div>
                                </div>
                                <div className={'flex flex-col justify-center p-2 text-center'}>
                                    <div className={'font-bold'}>Kode Barang</div>
                                    <div>{product.item_code}</div>
                                </div>
                                <div className={'flex flex-col justify-center p-2 text-center'}>
                                    <strong>Stok</strong>{product.stock} {product.satuan}</div>
                            </div>
                            <div className="text-md w-full">
                                <Tabs value={selectedTab} onValueChange={(newValue) => setSelectedTab(newValue)}
                                      className="w-full">
                                    <TabsList className={`grid w-full ${gridColsClass}`}>
                                        {availableTabs.map(tab => (
                                            <TabsTrigger key={tab.key} value={tab.key}>
                                                {tab.label}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>

                                    <TabsContent value="retail">
                                        <div className={'w-full flex flex-col'}>
                                            <div className={'justify-center text-center font-bold'}>
                                                Harga : {formatRupiah(product.retail_price)}
                                            </div>
                                            <div className="w-full h-full flex gap-8 items-center p-4 justify-center">
                                                <Button onClick={handleDecrease} disabled={quantity <= step}>-</Button>
                                                <Input
                                                    type="number"
                                                    value={quantity}
                                                    step={step}
                                                    onChange={handleChange}
                                                    className="w-16 text-center"
                                                    disabled={product.stock === 0}
                                                />

                                                <span className={'-ml-6'}>/{product.satuan}</span>
                                                <Button onClick={handleIncrease}
                                                        disabled={quantity >= product.stock}>+</Button>
                                            </div>
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="semi_grosir">
                                        <div className={'w-full flex flex-col'}>
                                            <div className={'justify-center text-center font-bold'}>
                                                Harga : {formatRupiah(product.semi_grosir_price)}
                                            </div>
                                            <div className="w-full h-full flex gap-8 items-center p-4 justify-center">
                                                <Button onClick={handleDecrease} disabled={quantity <= step}>-</Button>
                                                <Input
                                                    type="number"
                                                    value={quantity}
                                                    step={step}
                                                    onChange={handleChange}
                                                    className="w-16 text-center"
                                                    disabled={product.stock === 0}
                                                />
                                                <span className={'-ml-6'}>/{product.satuan}</span>
                                                <Button onClick={handleIncrease}
                                                        disabled={quantity >= product.stock}>+</Button>
                                            </div>
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="grosir">
                                        <div className={'w-full flex flex-col'}>
                                            <div className={'justify-center text-center font-bold'}>
                                                Harga : {formatRupiah(product.wholesale_price)}
                                            </div>
                                            <div className="w-full h-full flex gap-8 items-center p-4 justify-center">
                                                <Button onClick={handleDecrease} disabled={quantity <= step}>-</Button>
                                                <Input
                                                    type="number"
                                                    value={quantity}
                                                    step={step}
                                                    onChange={handleChange}
                                                    className="w-16 text-center"
                                                    disabled={product.stock === 0}
                                                />
                                                <span className={'-ml-6'}>/{product.satuan}</span>
                                                <Button onClick={handleIncrease}
                                                        disabled={quantity >= product.stock}>+</Button>
                                            </div>
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="eceran">
                                        <div className={'w-full flex flex-col'}>
                                            <div className={'justify-center text-center font-bold'}>
                                                Harga : {formatRupiah(product.eceran_price)}
                                            </div>
                                            <div className={'justify-center text-center'}>
                                                1 {product.satuan} = {product.retail_conversion} {product.retail_unit}
                                            </div>
                                            <div className="w-full h-full flex gap-8 items-center p-4 justify-center">
                                                <Button onClick={handleDecrease} disabled={quantity <= step}>-</Button>
                                                <Input
                                                    type="number"
                                                    value={quantity}
                                                    step={step}
                                                    onChange={(e) => handleChange(e, 'eceran')}
                                                    className="w-16 text-center"
                                                    disabled={product.stock === 0}
                                                />
                                                <span className={'-ml-6'}>/{product.retail_unit}</span>
                                                <Button onClick={() => handleIncrease('eceran')}
                                                        disabled={quantity >= product.retail_conversion}>+</Button>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>

                            </div>
                        </div>

                    </div>
                </div>

                <DialogFooter>
                    <Button
                        disabled={loading || product.stock <= step || quantity < step || quantity === 0 || isNaN(quantity)}
                        onClick={handleAddItem}
                    >
                        {loading ? "Menambahkan..." : "Tambah"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

