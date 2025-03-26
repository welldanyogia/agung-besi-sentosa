"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import DataTable from "@/Components/Cashier/table/data-table.jsx";
import { columns } from "@/Components/Cashier/table/column.jsx";
import { FinishTransactionDialog } from "@/Components/Cashier/FinishTransactionDialog.jsx";
import { AlertCancelDialog } from "@/Components/Cashier/AlertCancelDialog.jsx";

export function CashierDrawer({ storeInfo, invoice, auth, invoiceItems, setInvoiceItems, setError, setSuccess, getItems, getInvoice, subTotal, total, setInvoice }) {
    return (
        <Drawer>
            <DrawerTrigger asChild>
                <button className="fixed bottom-5 right-5 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition">
                    <Plus size={24} />
                </button>
            </DrawerTrigger>
            <DrawerContent>
                <div className="mx-auto w-full max-w-lg"> {/* Lebih besar agar tidak terlalu sempit */}
                    <DrawerHeader>
                        <DrawerTitle className="text-base font-semibold">{storeInfo.store_name}</DrawerTitle>
                        <DrawerDescription className="text-sm">{storeInfo.address}<br />{storeInfo.phone_number}</DrawerDescription>
                    </DrawerHeader>
                    <div className="p-4 pb-0">
                        <Card className="p-2 grid gap-2">
                            <CardDescription className="w-full px-4 mx-auto gap-2 flex flex-col text-sm">
                                <div className="w-full flex justify-between gap-2">
                                    <div className="flex gap-2 w-1/2">
                                        <div>Kasir</div>
                                        <div>:</div>
                                        <div>{auth.user.name}</div>
                                    </div>
                                </div>
                            </CardDescription>
                            <CardContent className="w-full">
                                <div className="max-h-60 overflow-y-auto max-sm:w-4/5">
                                    <DataTable
                                        data={invoiceItems}
                                        columns={columns}
                                        setInvoiceItems={setInvoiceItems}
                                        auth={auth}
                                        invoice={invoice}
                                        setError={setError}
                                        setSuccess={setSuccess}
                                        getItems={getItems}
                                        getInvoice={getInvoice}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="bg-gray-200 text-xs p-2 flex flex-col max-sm:w-2/3"> {/* mx-5 bisa menyebabkan elemen keluar dari Card */}
                                <div className="flex justify-between w-full">
                                    <span>Item(s)</span>
                                    <span>{invoiceItems.length}</span>
                                </div>
                                <div className="flex justify-between w-full">
                                    <span>Sub-Total</span>
                                    <span>{subTotal}</span>
                                </div>
                                <div className="flex justify-between w-full font-bold">
                                    <span>Total</span>
                                    <span>{total}</span>
                                </div>
                            </CardFooter>
                        </Card>
                    </div>
                    <DrawerFooter>
                        <FinishTransactionDialog
                            invoiceItems={invoiceItems}
                            setError={setError}
                            invoice_id={invoice}
                            setInvoice={setInvoice}
                            setInvoiceItems={setInvoiceItems}
                            storeInfo={storeInfo}
                        />
                        <DrawerClose asChild>
                            <AlertCancelDialog
                                setInvoiceItems={setInvoiceItems}
                                invoiceItems={invoiceItems}
                                setError={setError}
                                setSuccess={setSuccess}
                                getItems={getItems()}
                            />
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
