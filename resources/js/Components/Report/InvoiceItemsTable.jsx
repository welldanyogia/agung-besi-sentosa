import React from "react";
import DataTableDetailTransaction from "@/Components/Report/table-detail-transaction/data-table-detail-transaction.jsx";
import {columns} from "@/Components/Report/table-detail-transaction/column.jsx";

const InvoiceItemsTable = ({ items,invoice }) => {
    return (
        <div className="overflow-x-auto">
            <DataTableDetailTransaction columns={columns} data={items} invoice={invoice} />
        </div>
    );
};

export default InvoiceItemsTable;
