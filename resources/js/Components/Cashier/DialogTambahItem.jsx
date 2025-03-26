import {useEffect, useState} from "react";
import axios from "axios";
import {Check, ChevronsUpDown} from "lucide-react";
import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Switch} from "@/components/ui/switch";
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
import {usePage} from "@inertiajs/react";
import {Card} from "@/Components/ui/card.jsx";

export function DialogTambahItem({auth, product, setInvoiceItems, setSuccess, setError, getItems, getInvoice}) {
    const [openDialog, setOpenDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [quantity, setQuantity] = useState(1);

    const handleIncrease = () => {
        if (quantity < product.stock) {
            setQuantity((prevQuantity) => prevQuantity + 1);
        }
    };

    const handleDecrease = () => {
        if (quantity > 1) {
            setQuantity((prevQuantity) => prevQuantity - 1);
        }
    };

    const handleChange = (e) => {
        const value = Number(e.target.value);
        if (value > product.stock) {
            setQuantity(product.stock);
        } else if (value < 1) {
            setQuantity(1);
        } else {
            setQuantity(value);
        }
    };

    const handleAddItem = async () => {
        setLoading(true);

        // Check if item with the same id already exists in the invoiceItems
        setInvoiceItems((prevItems) => {
            const itemIndex = prevItems.findIndex((item) => item.id === product.id);

            if (itemIndex > -1) {
                const updatedItems = [...prevItems];
                updatedItems[itemIndex].qty += quantity;
                return updatedItems;
            } else {
                const newItem = {
                    id: product.id,
                    item_name: product.item_name,
                    price: product.price + ((product.tax/100)*product.price),
                    satuan: product.satuan,
                    qty: quantity,
                };
                return [...prevItems, newItem];
            }
        });

        try {
            const response = await axios.post("/api/cashier/update-stock", {
                item_id: product.id,
                quantity: quantity,
                user_id: auth.user.id,
            });

            setSuccess(response.data.message);
            getItems();
        } catch (error) {
            console.error("Error fetching inventory data:", error);
            setError("Gagal menambahkan barang!!!");
            getItems();
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

    return (
        <Dialog open={openDialog && product.stock > 0}  onOpenChange={(openDialog) => setOpenDialog(openDialog)}>
            <DialogTrigger asChild disabled={product.stock <= 0} onClick={() => {
                if (product.stock <= 0) {
                    setError("Stok Habis"); // Set error jika stok 0
                }
            }}>
                <Card
                    key={product.id}
                    className="flex flex-col justify-center p-4 rounded-lg shadow-md transition-all duration-300 hover:scale-105 hover:cursor-pointer"
                >
                    {/*<div className="w-full h-24 bg-gray-300 rounded-md flex items-center justify-center">*/}
                    {/*    {product.image ? (*/}
                    {/*        <img*/}
                    {/*            src={product.image}*/}
                    {/*            alt={product.name}*/}
                    {/*            className="w-full h-full object-cover rounded-md"*/}
                    {/*        />*/}
                    {/*    ) : (*/}
                    {/*        <span className="text-gray-600 text-sm">Gambar</span>*/}
                    {/*    )}*/}
                    {/*</div>*/}
                    <p className="font-semibold">{product.item_name}</p>
                    <p className="">{product.item_code}</p>
                    <p className="text-sm text-gray-700">{formatRupiah(product.price+((product.tax/100)*product.price))}</p>
                    <p className={`text-sm ${product.stock === 0 ? "text-red-500" : "text-green-500"}`}>
                        {product.stock === 0 ? "Stok Habis" : `Stok: ${product.stock}`}
                    </p>
                </Card>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Tambah Barang</DialogTitle>
                    <DialogDescription>Tambahkan barang dalam transaksi</DialogDescription>
                </DialogHeader>

                <div className="grid py-4 gap-2">
                    <div className="flex flex-col gap-2">
                        <div className="w-full flex justify-between">
                            <div>
                                <div className="font-bold">{product.item_name}</div>
                                <div>{product.item_code}</div>
                            </div>
                            <div className="text-md">
                                <div>
                                    {formatRupiah(product.price+((product.tax/100)*product.price))}/{product.satuan}
                                </div>
                                <div><strong>Stok : </strong>{product.stock}</div>
                            </div>
                        </div>

                        <div className="w-full h-full flex gap-8 items-center p-4 justify-center">
                            <Button onClick={handleDecrease} disabled={quantity <= 1}>-</Button>
                            <Input value={quantity} onChange={handleChange} className="w-16 text-center" disabled={product.stock === 0}/>
                            <span className={'-ml-6'}>/{product.satuan}</span>
                            <Button onClick={handleIncrease} disabled={quantity >= product.stock}>+</Button>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        disabled={loading || product.stock <= 0}
                        onClick={handleAddItem}
                    >
                        {loading ? "Menambahkan..." : "Tambah"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

