import {useState, useEffect} from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {Head} from '@inertiajs/react';
import {Card, CardContent, CardTitle} from "@/Components/ui/card.jsx";
import {Input} from '@/Components/ui/input';
import {Label} from '@/Components/ui/label';
import {Button} from '@/Components/ui/button';
import DataTable from "@/Components/Setting/table/data-table.jsx";
import {columns} from "@/Components/Setting/table/column.jsx";
import {AnimatePresence, motion} from "framer-motion";
import {AlertSuccess} from "@/Components/AlertSuccess.jsx";
import {AlertDestructive} from "@/Components/AlertDestructive.jsx";

export default function Dashboard({auth, users, storeInfo}) {
    const [storeInfor, setStoreInfor] = useState({
        store_name: storeInfo.store_name,
        address: storeInfo.address,
        phone_number: storeInfo.phone_number,
    });
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const [showAlert, setShowAlert] = useState(false);

    console.log(users)


    // Handle form submission to create/update store info
    const handleSubmit = (e) => {
        e.preventDefault();

        const data = {
            store_name: storeInfor.store_name,
            address: storeInfor.address,
            phone_number: storeInfor.phone_number,
        };

        // Submit the form data (this example uses Inertia.js to send a POST request to store or update the info)
        axios.post('/api/storeinfo', data)
            .then((response) => {
            })
            .catch((error) => {
                console.error('Error saving store info:', error);
            });
    };

    useEffect(() => {

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
                    Setting
                </h2>
            }
        >
            <Head title="Setting"/>

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
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg space-y-6">
                        <Card className={'p-12'}>
                            <CardTitle>
                                Setting
                            </CardTitle>
                            <CardContent className={'mt-6'}>
                                <form onSubmit={handleSubmit}>
                                    {/* Store Name Input */}
                                    <div className="mb-4">
                                        <Label htmlFor="storeName" className="block text-sm font-medium text-gray-700">
                                            Nama Toko
                                        </Label>
                                        <Input
                                            id="storeName"
                                            type="text"
                                            name="storeName"
                                            value={storeInfor.store_name}
                                            onChange={(e) => setStoreInfor({...storeInfor, store_name: e.target.value})}
                                            required
                                            className="mt-1 block w-full"
                                        />
                                    </div>

                                    {/* Address Input */}
                                    <div className="mb-4">
                                        <Label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                            Alamat
                                        </Label>
                                        <Input
                                            id="address"
                                            type="text"
                                            name="address"
                                            value={storeInfor.address}
                                            onChange={(e) => setStoreInfor({...storeInfor, address: e.target.value})}
                                            required
                                            className="mt-1 block w-full"
                                        />
                                    </div>

                                    {/* Phone Number Input */}
                                    <div className="mb-4">
                                        <Label htmlFor="phoneNumber"
                                               className="block text-sm font-medium text-gray-700">
                                            Nomor Telepon
                                        </Label>
                                        <Input
                                            id="phoneNumber"
                                            type="tel"
                                            name="phoneNumber"
                                            value={storeInfor.phone_number}
                                            onChange={(e) => setStoreInfor({
                                                ...storeInfor,
                                                phone_number: e.target.value
                                            })}
                                            required
                                            className="mt-1 block w-full"
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <Button type="submit" className="mt-4">
                                        Simpan
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                        {
                            (auth.user?.roles[0]?.name === 'superadmin' || auth.user?.roles[0]?.name === 'admin') && (

                                <DataTable data={users} columns={columns} setSuccess={setSuccess} setError={setError} auth={auth}/>

                            )
                        }
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
