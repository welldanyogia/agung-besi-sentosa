import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {Head} from '@inertiajs/react';
import {useEffect, useState} from "react";
import DataTable from "@/Components/Report/table/data-table.jsx";
import {columns} from "@/Components/Report/table/column.jsx";
import {Card, CardContent, CardFooter, CardTitle} from "@/Components/ui/card.jsx";
import {DataTablePagination} from "@/Components/Inventory/table/data-table-pagination.jsx";
import {AnimatePresence, motion} from "framer-motion";
import {AlertDestructive} from "@/Components/AlertDestructive.jsx";
import {AlertSuccess} from "@/Components/AlertSuccess.jsx";
import {SalesChart} from "@/Components/Report/chart/SalesChart.jsx";

export default function Dashboard({auth}) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);  // State to handle loading status
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const [showAlert, setShowAlert] = useState(false);
    const [totalSales, setTotalSales] = useState(0);
    const [totalOrders, setTotalOrders] = useState(0);
    const [totalProductsSold, setTotalProductsSold] = useState(0);

    const getData = async () => {
        try {
            setLoading(true);
            const response = await axios.post('/api/report/show');
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
        let orders = transactions.length;
        let productsSold = 0;

        transactions.forEach((transaction) => {
            transaction.items.forEach((item) => {
                sales += item.price * item.qty; // Total sales
                productsSold += item.qty; // Total products sold
            });
        });

        setTotalSales(sales);
        setTotalOrders(orders);
        setTotalProductsSold(productsSold);
    };

    useEffect(() => {
        getData();  // Fetch the inventory data when the component mounts
        if (error || success) {
            setShowAlert(true);
            const timer = setTimeout(() => setShowAlert(false), 8000);
            return () => clearTimeout(timer);
        }
    }, [error, success]);


    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Report
                </h2>
            }
        >
            <Head title="Inventory"/>

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
                            <Card className={'w-full p-10 font-bold flex flex-col lg:text-2xl'}>
                                <div>
                                    Total Sales Hari ini
                                </div>
                                <div>
                                    {new Intl.NumberFormat('id-ID', {
                                        style: 'currency',
                                        currency: 'IDR',
                                        maximumFractionDigits: 0
                                    }).format(totalSales)}
                                </div>
                            </Card>
                            <Card className={'w-full p-10 font-bold flex flex-col lg:text-2xl'}>
                                <div>
                                    Total Order Hari ini
                                </div>
                                <div>
                                    {totalOrders}
                                </div>
                            </Card>
                            <Card className={'w-full p-10 font-bold flex flex-col lg:text-2xl'}>
                                <div>
                                    Total Produk Terjual Hari ini
                                </div>
                                <div>
                                    {totalProductsSold}
                                </div>
                            </Card>
                        </div>
                        <Card className={'w-full h-fit'}>
                        <SalesChart data={data}/>
                        </Card>
                        {/*<Card className={'w-full h-[200px]'}></Card>*/}
                    </div>
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <DataTable columns={columns} data={data} auth={auth} setError={setError}
                                   setSuccess={setSuccess}/>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
