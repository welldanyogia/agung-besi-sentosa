import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {Head} from '@inertiajs/react';
import {CalendarDays, Plus} from "lucide-react";
import {useEffect, useState} from "react";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/Components/ui/card.jsx";
import {Input} from "@/Components/ui/input.jsx";
import {Button} from "@/Components/ui/button.jsx";
import axios from "axios";
import {AnimatePresence, motion} from "framer-motion";
import {DialogTambahItem} from "@/Components/Cashier/DialogTambahItem.jsx";
import DataTable from "@/Components/Cashier/table/data-table.jsx";
import {columns} from "@/Components/Cashier/table/column.jsx";
import {FinishTransactionDialog} from "@/Components/Cashier/FinishTransactionDialog.jsx";
import {AlertCancelDialog} from "@/Components/Cashier/AlertCancelDialog.jsx";
import {AlertSuccess} from "@/Components/AlertSuccess.jsx";
import {AlertDestructive} from "@/Components/AlertDestructive.jsx";
import {CashierDrawer} from "@/Components/Cashier/CashierDrawer.jsx";

const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(number);
};
function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth <= 768)
        }

        checkScreenSize()
        window.addEventListener("resize", checkScreenSize)

        return () => window.removeEventListener("resize", checkScreenSize)
    }, [])

    return isMobile
}
export default function Dashboard({auth,items,kategoris}) {
    const isMobile = useIsMobile()
    const [currentTime, setCurrentTime] = useState("");
    const [categories, setCategories] = useState([]);
    // const [items, setItems] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [invoiceItems, setInvoiceItems] = useState([])
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const [showAlert, setShowAlert] = useState(false);
    const [invoice, setInvoice] = useState(null)
    const [total,setTotal]= useState()
    const [subTotal,setSubTotal]= useState()
    const [storeInfo, setStoreInfo] = useState({
        store_name: '',
        address: '',
        phone_number: '',
    });

    useEffect(() => {
        // Hanya ambil data jika invoice atau storeInfo masih kosong atau null
        if (!invoice && !storeInfo.store_name) {
            axios.get('/api/storeinfo')
                .then((response) => {
                    if (response.data.data) {
                        setStoreInfo(response.data.data); // Set the existing store data
                    }
                })
                .catch((error) => {
                    console.error('Error fetching store info:', error);
                });
        }

        // Cek invoice dan invoiceItems
        if (!invoice) {
            getInvoice();
        }

        // Cek items jika belum ada
        // if (items.length === 0) {
        //     getItems();
        //     getCategories()
        // }

        const formattedCategories = kategoris.map(category => ({
            id: category.id,
            label: category.category_name,
            value: category.category_name,
            icon: null, // Jika ingin menambahkan ikon, bisa diganti dengan komponen yang sesuai
        }));

        setCategories(formattedCategories);
        const totalAmount = invoiceItems.reduce((acc, item) => acc + (item.sub_total + ((item?.item?.tax / 100) * item.sub_total)), 0);
        setTotal(formatRupiah(totalAmount));
        setSubTotal(formatRupiah(totalAmount));

    }, [invoice, storeInfo, invoiceItems, items]); // Menambahkan dependensi yang sesuai untuk memastikan hanya mengambil data jika diperlukan



    const getInvoice = async ()=>{
        try {
            const response = await axios.post("/api/cashier/get-pending-inv",{
                user_id: auth.user.id
            });
            if (response.data.success){
                setInvoice(response.data.invoice)
                setInvoiceItems(response.data.invoice.items)
            }else {
                setInvoice(null)
            }
        }catch (e) {
            setInvoice(null)
        }
    }
    const getItems = async () => {
        try {
            const response = await axios.post("/api/inventory/show");

            // Format ulang data agar sesuai dengan priorities
            // const formattedCategories = response.data.categories.map(category => ({
            //     id: category.id,
            //     label: category.category_name,
            //     value: category.category_name,
            //     icon: null, // Jika ingin menambahkan ikon, bisa diganti dengan komponen yang sesuai
            // }));
            console.log(response)

            setItems(response.data.items);
        } catch (error) {
            // console.error("Error fetching inventory data:", error);
        }
    };

    console.log("items :",items)

    const filteredItems = items.filter((product) => {
        const matchesCategory =
            activeCategory === null || product.category_id === activeCategory;  // Filter by category
        const matchesSearch = product.item_name.toLowerCase().includes(searchQuery.toLowerCase());  // Filter by search query
        return matchesCategory && matchesSearch;
    });

    useEffect(() => {

        const updateClock = () => {
            const now = new Date();
            const options = {
                timeZone: "Asia/Jakarta",
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
                // hour: "2-digit",
                // minute: "2-digit",
                // second: "2-digit"
            };
            setCurrentTime(new Intl.DateTimeFormat("id-ID", options).format(now));
        };

        updateClock();
        const interval = setInterval(updateClock, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <AuthenticatedLayout
            header={
                <div className={'flex justify-between'}>
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Cashier
                    </h2>
                    <div className={'flex gap-4'}>
                        <CalendarDays/>
                        <span>{currentTime}</span>
                    </div>
                </div>
            }
        >
            <Head title="Cashier"/>


            <div className="py-4">
                <div className="mx-auto max-w-7xl  min-h-screen sm:px-6 lg:px-8">
                    <AnimatePresence>
                        {showAlert && (
                            <motion.div
                                initial={{ x: 300, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 300, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 100 }}
                                className="fixed top-5 right-10 transform translate-x-1/2 z-50"
                            >
                                {/* Conditionally render success or error alert */}
                                {success !== null && <AlertSuccess message={success} />}
                                {error !== null && <AlertDestructive message={error} />}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div className="overflow-hidden shadow-sm sm:rounded-lg">

                        <div className="grid grid-cols-5 grid-rows-5 gap-4">
                            <div
                                className={`${isMobile ? 'col-span-5' : 'col-span-3'} p-2 max-md:col-span-5 max-lg:col-span-2 row-span-5 space-y-6`}>

                                <Card className={'p-4 grid gap-2'}>
                                    <Input placeholder="Cari barang disini..."
                                           onChange={(e) => setSearchQuery(e.target.value)}/>
                                    <div className="overflow-x-auto whitespace-nowrap pb-2 scrollbar-hidden">
                                        <div className={'flex gap-2 '}>
                                            <Button
                                                variant={activeCategory === null ? 'default' : 'outline'}
                                                size={'sm'}
                                                onClick={() => setActiveCategory(null)}
                                            >
                                                Tampilkan semua
                                            </Button>
                                            {categories.map(category => (
                                                <Button
                                                    key={category.id}
                                                    variant={activeCategory === category.id ? 'default' : 'outline'}
                                                    size={'sm'}
                                                    onClick={() => setActiveCategory(category.id)}
                                                >
                                                    {category.label}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </Card>
                                <Card className="w-full h-[800px] p-4 bg-gray-50">
                                    <div
                                        className="grid grid-cols-2 gap-4 max-lg:grid-cols-2 max-md:grid-cols-2 overflow-y-auto max-h-[700px] pb-2 scrollbar-hidden max-sm:grid-cols-1 md:grid-cols-2">
                                        {filteredItems.map((product) => (
                                            <DialogTambahItem key={product.id} product={product} barang={product}
                                                              setInvoiceItems={setInvoiceItems} setError={setError}
                                                              setSuccess={setSuccess} getItems={getItems} auth={auth}
                                                              getInvoice={getInvoice}/>
                                        ))}
                                    </div>
                                </Card>

                            </div>
                            {
                                !isMobile && (
                                    <div className="col-span-2 max-lg:col-span-3 max-md:col-span-3 row-span-5 col-start-4">
                                        <Card className={'py-2 grid gap-2'}>
                                            <CardTitle
                                                className={'font-bold text-2xl text-center uppercase'}>{storeInfo.store_name}</CardTitle>
                                            <CardHeader
                                                className={'text-center -mt-8 uppercase'}>{storeInfo.address}<br/>{storeInfo.phone_number}
                                            </CardHeader>
                                            <CardDescription className={'w-full px-6  mx-auto gap-2 flex flex-col'}>
                                                <div className={'w-full flex justify-between gap-2'}>
                                                    <div className={'flex gap-2 w-1/2'}>
                                                        <div>No. Invoice</div>
                                                        <div>:</div>
                                                        {
                                                            invoice !== null && (
                                                                <div>
                                                                    {invoice.invoice_code}
                                                                </div>
                                                            )
                                                        }
                                                    </div>
                                                </div>
                                                <div className={'w-full flex justify-between gap-2'}>
                                                    <div className={'flex gap-2  w-1/2'}>
                                                        <div>Kasir</div>
                                                        <div>:</div>
                                                        <div>{auth.user.name}</div>
                                                    </div>
                                                </div>
                                            </CardDescription>
                                            <CardContent>
                                                <DataTable data={invoiceItems} columns={columns}
                                                           setInvoiceItems={setInvoiceItems} auth={auth} invoice={invoice}
                                                           setError={setError} setSuccess={setSuccess} getItems={getItems}
                                                           getInvoice={getInvoice}/>
                                            </CardContent>
                                            <CardFooter className={'bg-gray-200 p-2 space-y-2 text-sm mx-5 flex flex-col'}>
                                                <div className={'flex justify-between w-full'}>
                                                    <span>Item(s)</span>
                                                    <span>{invoiceItems.length}</span>
                                                </div>
                                                <div className={'flex justify-between w-full'}>
                                                    <span>Sub-Total</span>
                                                    <span>{subTotal}</span> {/* Sum total */}
                                                </div>
                                                <div className={'flex justify-between w-full font-bold'}>
                                                    <span>Total</span>
                                                    <span>{total}</span> {/* Sum total */}
                                                </div>
                                            </CardFooter>
                                        </Card>
                                        <Card className={'mt-4'}>
                                            <div className={'w-full flex p-2 gap-2'}>
                                                <FinishTransactionDialog invoiceItems={invoiceItems} setError={setError}
                                                                         invoice_id={invoice} setInvoice={setInvoice}
                                                                         setInvoceItems={setInvoiceItems}
                                                                         storeInfo={storeInfo}/>
                                            </div>
                                            <div className={'w-full flex p-2 gap-2'}>
                                                <AlertCancelDialog setInvoiceItems={setInvoiceItems}
                                                                   invoiceItems={invoiceItems} setError={setError}
                                                                   setSuccess={setSuccess} getItems={getItems()}/>
                                            </div>
                                        </Card>
                                    </div>
                                )
                            }
                        </div>
                        {isMobile && (
                            <CashierDrawer storeInfo={storeInfo} invoice={invoice} auth={auth} invoiceItems={invoiceItems} setInvoiceItems={setInvoiceItems} setError={setError} setSuccess={setSuccess} getItems={getItems} getInvoice={getInvoice} setInvoice={setInvoice} subTotal={subTotal} total={total}/>
                        )}

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
