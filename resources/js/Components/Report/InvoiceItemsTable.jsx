import React from "react";
import DataTable from "@/Components/Report/table-detail-transaction/data-table.jsx";
import {columns} from "@/Components/Report/table-detail-transaction/column.jsx";

const InvoiceItemsTable = ({ items,invoice }) => {
    return (
        <div className="overflow-x-auto">
            <DataTable columns={columns} data={items} invoice={invoice}/>
        </div>
    );
};

export default InvoiceItemsTable;
