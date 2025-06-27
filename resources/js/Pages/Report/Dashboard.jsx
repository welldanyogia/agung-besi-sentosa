import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {Head, usePage} from '@inertiajs/react';
import {useEffect, useState} from "react";
import DataTable from "@/Components/Report/table/data-table.jsx";
import {columns} from "@/Components/Report/table/column.jsx";
import {Card, CardContent, CardFooter, CardTitle} from "@/Components/ui/card.jsx";
import {DataTablePagination} from "@/Components/Inventory/table/data-table-pagination.jsx";
import {AnimatePresence, motion} from "framer-motion";
import {AlertDestructive} from "@/Components/AlertDestructive.jsx";
import {AlertSuccess} from "@/Components/AlertSuccess.jsx";
import {SalesChart} from "@/Components/Report/chart/SalesChart.jsx";
import StockTabsCard from "@/Components/Report/chart/StockTabsCard.jsx";

export default function Dashboard({auth}) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);  // State to handle loading status
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const [showAlert, setShowAlert] = useState(false);
    const [totalSales, setTotalSales] = useState(0);
    const [totalOrders, setTotalOrders] = useState(0);
    const [totalProductsSold, setTotalProductsSold] = useState(0);
    const [date, setDate] = useState(new Date());
    const [barangMasuk, setBarangMasuk] = useState([])
    const [barangKeluar, setBarangKeluar] = useState([])

    const getData = async () => {
        try {
            setLoading(true);
            const response = await axios.post('/api/report/show');
            // Format tanggal yang dipilih ke format YYYY-MM-DD
            const selectedDate = new Date(date).toISOString().split('T')[0];

            // Filter hanya yang sesuai dengan tanggal yang dipilih
            const filteredMasuk = response.data.barang_masuk.filter(
                item => item.date === selectedDate
            );

            const filteredKeluar = response.data.barang_keluar.filter(
                item => item.date === selectedDate
            );

            setBarangMasuk(filteredMasuk);
            setBarangKeluar(filteredKeluar);
            setData(response.data.transaction);
            setLoading(false);
            // Calculate totals after fetching data
            calculateTotals(response.data.transaction);
        } catch (error) {
            setLoading(false);
        }
    };


    const calculateTotals = (transactions) => {
        let sales = 0;
        let orders = 0;
        let productsSold = 0;

        const today = new Date().toISOString().split("T")[0];

        transactions.forEach((transaction) => {
            const transactionDate = new Date(transaction.created_at).toISOString().split("T")[0];

            if (transactionDate === today) {
                orders += 1;

                transaction.items.forEach((item) => {
                    // Konversi qty jika price_type === 'eceran'
                    let qty = item.qty;
                    if (item.price_type === 'eceran') {
                        const conversion = item.item?.retail_conversion || 1;
                        qty = item.qty / conversion;
                    }

                    productsSold += qty;
                });

                if (transaction.status === 'paid') {
                    sales += transaction.total_price;
                }
            }
        });

        setTotalSales(sales);
        setTotalOrders(orders);
        setTotalProductsSold(productsSold);
    };


    useEffect(() => {
        getData();  // Fetch the inventory data when the component mounts

        if (error || success) {
            setShowAlert(true);

            const timer = setTimeout(() => {
                setShowAlert(false);
                setError(null);
                setSuccess(null);
            }, 8000);

            return () => clearTimeout(timer);
        }
    }, [error, success,date]);


    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Report
                </h2>
            }
        >
            <Head title="Report"/>

            <AnimatePresence>
                {showAlert && (
                    <motion.div
                        initial={{x: 300, opacity: 0}}
                        animate={{x: 0, opacity: 1}}
                        exit={{x: 300, opacity: 0}}
                        transition={{type: 'spring', stiffness: 100}}
                        className="fixed top-5 right-10 transform translate-x-1/2 z-50"
                    >
                        {/* Conditionally render success or error alert */}
                        {success !== null && <AlertSuccess message={success}/>}
                        {error !== null && <AlertDestructive message={error}/>}
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 gap-4 flex flex-col space-y-6">
                    <div className={'w-full flex flex-col gap-2'}>
                        <div className={'flex w-full gap-2'}>
                            <Card className={'w-full p-10 flex flex-col'}>
                                <div className={'text-xl'}>
                                    Total Penjualan Hari ini
                                </div>
                                <div className={'font-bold lg:text-2xl'}>
                                    {new Intl.NumberFormat('id-ID', {
                                        style: 'currency',
                                        currency: 'IDR',
                                        maximumFractionDigits: 0
                                    }).format(totalSales)}
                                </div>
                            </Card>
                            <Card className={'w-full p-10 flex flex-col'}>
                                <div className={'text-xl'}>
                                    Total Order Hari ini
                                </div>
                                <div className={'font-bold lg:text-2xl'}>
                                    {totalOrders}
                                </div>
                            </Card>
                            <Card className={'w-full p-10 flex flex-col'}>
                                <div className={'text-xl'}>
                                    Total Produk Terjual Hari ini
                                </div>
                                <div className={'font-bold lg:text-2xl'}>
                                    {parseFloat(totalProductsSold).toFixed(2)}
                                </div>
                            </Card>
                        </div>
                        <div className="flex gap-4">
                            <Card className="w-2/3 h-fit">
                                <SalesChart data={data}/>
                            </Card>
                            <StockTabsCard date={date} setDate={setDate} barangKeluar={barangKeluar} barangMasuk={barangMasuk}/>
                        </div>
                        {/*<Card className={'w-full h-[200px]'}></Card>*/}
                    </div>
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                    <DataTable columns={columns} data={data} auth={auth} setError={setError}
                                   setSuccess={setSuccess} getData={getData}/>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
