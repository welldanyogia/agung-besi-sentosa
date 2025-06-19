import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {Head, router} from '@inertiajs/react';
import React, {useEffect, useState} from "react";
import DataTable from "@/Components/Inventory/table/data-table.jsx";
import {columns} from "@/Components/Inventory/table/column.jsx";
import {Card, CardContent, CardFooter, CardTitle} from "@/Components/ui/card.jsx";
import {DataTablePagination} from "@/Components/Inventory/table/data-table-pagination.jsx";
import {AnimatePresence, motion} from "framer-motion";
import {AlertDestructive} from "@/Components/AlertDestructive.jsx";
import {AlertSuccess} from "@/Components/AlertSuccess.jsx";
import {Tabs, TabsList, TabsTrigger} from "@/Components/ui/tabs.jsx";
import InventoryTabs from "@/Components/Inventory/table/InventoryTabs.jsx";
import DataTablePenjualan from "@/Components/Inventory/table-penjualan/data-table-penjualan.jsx";
import {columns_penjualan} from "@/Components/Inventory/table-penjualan/column-penjualan.jsx";

export default function Dashboard({auth, satuan, items, pembelians,itemCodes}) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);  // State to handle loading status
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const [showAlert, setShowAlert] = useState(false);
    const [activeTab, setActiveTab] = useState('jual');

    const getData = async () => {
        try {
            setLoading(true);  // Set loading to true before making the API call
            // const response = await axios.post('/api/inventory/show');  // Hit the /inventory/show endpoint
            setData(items);  // Assuming response.data is the inventory data
            setLoading(false);  // Set loading to false once data is fetched
        } catch (error) {
            setLoading(false);  // Set loading to false in case of success
        }
    };

    useEffect(() => {
        if (data.length <= 0) {
            getData();  // Fetch the inventory data when the component mounts

        }
        if (error || success) {
            setShowAlert(true);
            const timer = setTimeout(() => setShowAlert(false), 8000);
            return () => clearTimeout(timer);
        }
    }, [error, success]);

    const sortedData = [...data].sort((a, b) => b.stock - a.stock); // Sorting descending for top products
    const top5Products = sortedData.slice(0, 5); // Top 5 products
    const bottom5Products = sortedData.slice(-5); // Bottom 5 products
    const [tabValue, setTabValue] = useState('penjualan');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlTab = params.get('tabValue');

        if (urlTab) {
            setTabValue(urlTab);
        }else {
            setTabValue('penjualan')
        }
    }, []);

    // console.log('tab value :' , tabValue)

    useEffect(() => {
        // Refresh page from server when tab changes
        if (tabValue === null || tabValue === 'pembelian') {
            router.reload({
                only: ['items', 'pembelians'],
                preserveScroll: true,
                preserveState: true,
            });
        }
    }, [tabValue]);
    return (
        <AuthenticatedLayout
            header={
            <div className={'flex justify-between '}>
                <h2 className=" text-xl font-semibold leading-tight text-gray-800">
                    Inventory
                </h2>
                <Tabs value={tabValue} onValueChange={setTabValue} className="w-fit ">
                    <TabsList>
                        <TabsTrigger value="penjualan">Penjualan</TabsTrigger>
                        <TabsTrigger value="pembelian">Pembelian</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
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
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 gap-4">
                    {/* Tab Buttons */}
                    {/*<Tabs*/}
                    {/*    value={activeTab}*/}
                    {/*    onValueChange={(value) => setActiveTab(value)}*/}
                    {/*    className="w-full max-w-md"*/}
                    {/*>*/}
                    {/*    <TabsList>*/}
                    {/*        <TabsTrigger value="jual">Jual</TabsTrigger>*/}
                    {/*        <TabsTrigger value="beli">Beli</TabsTrigger>*/}
                    {/*    </TabsList>*/}
                    {/*</Tabs>*/}
                    {/*<div className={'w-full flex gap-2'}>*/}
                    {/*    <Card className={'w-full h-[200px] p-2'}>*/}
                    {/*        <div className="text-center font-semibold text-lg">Top 5 Products</div>*/}
                    {/*        <ul>*/}
                    {/*            {top5Products.map((item, index) => (*/}
                    {/*                <li key={index} className="py-1">*/}
                    {/*                    {item.item_name}: {item.stock} in stock*/}
                    {/*                </li>*/}
                    {/*            ))}*/}
                    {/*        </ul>*/}
                    {/*    </Card>*/}
                    {/*    <Card className={'w-full h-[200px]'}>*/}
                    {/*        <div className="text-center font-semibold text-lg">Bottom 5 Products</div>*/}
                    {/*        <ul>*/}
                    {/*            {bottom5Products.map((item, index) => (*/}
                    {/*                <li key={index} className="py-1">*/}
                    {/*                    {item.item_name}: {item.stock} in stock*/}
                    {/*                </li>*/}
                    {/*            ))}*/}
                    {/*        </ul>*/}
                    {/*    </Card>*/}
                    {/*</div>*/}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg mt-6 max-sm:p-2">
                        {tabValue === 'penjualan' && (
                            <DataTablePenjualan
                                data={data}
                                columns={columns_penjualan}
                                auth={auth}
                                setError={setError}
                                setSuccess={setSuccess}
                                getData={getData}
                                satuan={satuan}
                                role={auth.roles[0]}
                            />
                        )}

                        {tabValue === 'pembelian' && (
                            <DataTable
                                setTabValue={setTabValue}
                                items={items}
                                data={pembelians}
                                itemCodes={itemCodes}
                                columns={columns}
                                auth={auth}
                                setError={setError}
                                setSuccess={setSuccess}
                                getData={getData}
                                satuan={satuan}
                                role={auth.roles[0]}
                            />
                        )}

                        {/*<DataTableDetailTransaction tab={tabValue} columns={columns} data={data} auth={auth} setError={setError}*/}
                        {/*           setSuccess={setSuccess} getData={getData} satuan={satuan} role={auth.roles[0]}/>*/}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
