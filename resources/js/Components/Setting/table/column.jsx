'use client';

import { createColumnHelper } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/Components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"
import { AlertDeleteDialog } from "@/Components/Inventory/AlertDeleteDialog.jsx";
import { AlertEditDialog } from "@/Components/Inventory/AlertEditDialog.jsx";
import { Checkbox } from "@/Components/ui/checkbox"
import { Badge } from "@/Components/ui/badge.jsx";
import {DialogEditBarang} from "@/Components/Inventory/DialogEditBarang.jsx";

const columnHelper = createColumnHelper();

export const columns = [
    // {
    //     id: "select",
    //     header: ({ table }) => (
    //         <div className="text-center">
    //             <Checkbox
    //                 checked={
    //                     table.getIsAllPageRowsSelected() ||
    //                     (table.getIsSomePageRowsSelected() && "indeterminate")
    //                 }
    //                 onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
    //                 aria-label="Select all"
    //             />
    //         </div>
    //     ),
    //     cell: ({ row }) => (
    //         <div className="text-center">
    //             <Checkbox
    //                 checked={row.getIsSelected()}
    //                 onCheckedChange={(value) => row.toggleSelected(!!value)}
    //                 aria-label="Select row"
    //             />
    //         </div>
    //     ),
    //     enableSorting: false,
    //     enableHiding: false,
    // },
    columnHelper.accessor("no", {
        id: 'no',
        header: () => <div className="text-center">No</div>,
        cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
    }),
    columnHelper.accessor("name", {
        header: () => <div className="text-center">Nama</div>,
        cell: ({ getValue }) => <div className="text-center">{getValue()}</div>,
    }),
    columnHelper.accessor("email", {
        header: () => <div className="text-center">Email</div>,
        cell: ({ getValue }) => <div className="text-center">{getValue()}</div>,
    }),
    columnHelper.accessor("username", {
        header: () => <div className="text-center">Username</div>,
        cell: ({ getValue }) => <div className="text-center">{getValue()}</div>,
    }),
    columnHelper.accessor("phone_number", {
        // id: "kategori",
        header: () => <div className="text-center">No HP</div>,
        cell: ({ getValue }) => <div className="text-center">{getValue()}</div>,
    }),
    columnHelper.accessor("invoices_count", {
        header: () => <div className="text-center">Total Transaksi</div>,
        cell: ({getValue}) => <div className="flex justify-center">
            <Badge className="text-center uppercase">
                {getValue()}
            </Badge>
        </div>,
    }),
    columnHelper.accessor("roles", {
        header: () => <div className="text-center">Role</div>,
        cell: ({getValue}) => {
            const roles = getValue().map(role => role.name);
            const updatedRoles = roles.map(role => role === 'employee' ? 'karyawan' : role).join(', ');

            return (
                <div className="flex justify-center">
                    <Badge className="text-center uppercase">
                        {updatedRoles}
                    </Badge>
                </div>
            );
        },
    }),

    // {
    //     id: "actions",
    //     header: () => <div className="text-center">Aksi</div>,
    //     cell: ({ row }) => (
    //         <div className="flex justify-center gap-2">
    //             <DialogEditBarang barang={row.original}/>
    //             <AlertDeleteDialog />
    //         </div>
    //     ),
    // },
];
