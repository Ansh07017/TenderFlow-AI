
import React, { useState, useRef, useMemo } from 'react';
import { SKU } from '../types';
import { AddItemModal } from './AddItemModal';

interface StoreScreenProps {
  inventory: SKU[];
  setInventory: React.Dispatch<React.SetStateAction<SKU[]>>;
}

type SortKeys = keyof SKU;
type SortDirection = 'asc' | 'desc';

const currencyFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

const columnsConfig: { key: keyof SKU | 'warehouseCity' | 'warehouseState'; header: string; isBase: boolean; render?: (item: SKU) => React.ReactNode }[] = [
    { key: 'skuId', header: 'SKU No', isBase: true },
    { key: 'productName', header: 'Item Name', isBase: true },
    { key: 'productCategory', header: 'Category', isBase: false },
    { key: 'specification', header: 'Specification JSON', isBase: false, render: (item) => {
        const specString = JSON.stringify(item.specification);
        return <span title={specString}>{specString.length > 30 ? `${specString.substring(0, 30)}...` : specString}</span>;
    }},
    { key: 'availableQuantity', header: 'Available Quantity', isBase: true, render: (item) => `${item.availableQuantity} units` },
    { key: 'costPrice', header: 'Cost Price', isBase: true, render: (item) => currencyFormatter.format(item.costPrice) },
    { key: 'unitSalesPrice', header: 'Sales Price', isBase: true, render: (item) => currencyFormatter.format(item.unitSalesPrice) },
    { key: 'bulkSalesPrice', header: 'Bulk Sales Price', isBase: false, render: (item) => currencyFormatter.format(item.bulkSalesPrice) },
    { key: 'gstRate', header: 'GST Rate', isBase: false, render: (item) => `${item.gstRate}%` },
    { key: 'warehouseCity', header: 'Warehouse City', isBase: true, render: (item) => item.warehouseLocation.split(',')[0] || item.warehouseLocation },
    { key: 'warehouseState', header: 'Warehouse State', isBase: false, render: (item) => item.warehouseLocation.split(',')[1]?.trim() || 'N/A' },
    { key: 'truckType', header: 'Truck Type', isBase: false },
];

export const StoreScreen: React.FC<StoreScreenProps> = ({ inventory, setInventory }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKeys; direction: SortDirection } | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDownloadDemo = () => {
    const headers = "SKU_No,Item_Name,Category,Specification_JSON,Available_Quantity,Warehouse_City,Warehouse_Lat,Warehouse_Lon,Cost_Price_Per_Unit,Sales_Price_Per_Unit,Bulk_Sales_Price_Per_Unit,GST_Rate,Truck_Type,isActive,isComplianceReady";
    const exampleRow = "AC-IND-H25,Industrial AC Compressor H25,Compressors,\"{ \"\"Type\"\": \"\"Reciprocating Compressor\"\", \"\"Motor\"\": \"\"15 HP High-efficiency motor\"\" }\",12,Nagpur,21.1458,79.0882,180000,220000,210000,18,MEDIUM_TRUCK,true,true";
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${exampleRow}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "tenderflow_inventory_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    alert("CSV import is a demo feature. Please use 'Add New' for the full schema.");
    if(fileInputRef.current) fileInputRef.current.value = "";
  };
  
  const sortedAndFilteredInventory = useMemo(() => {
    let sortedItems = [...inventory];
    if (sortConfig !== null) {
      sortedItems.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortedItems.filter(sku => 
      sku.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      sku.skuId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [inventory, searchTerm, sortConfig]);
  
  const requestSort = (key: SortKeys) => {
    let direction: SortDirection = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSaveItem = (newItem: SKU) => { setInventory(prev => [...prev, newItem]); setIsModalOpen(false); };
  const handleDeleteItem = (skuId: string) => { if (window.confirm(`Are you sure you want to delete SKU ${skuId}?`)) { setInventory(prev => prev.filter(item => item.skuId !== skuId)); } };
  
  const visibleColumns = useMemo(() => isExpanded ? columnsConfig : columnsConfig.filter(c => c.isBase), [isExpanded]);

  return (
    <>
      <AddItemModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveItem} />
      <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
      <div className="bg-base-200 p-6 rounded-lg shadow-sm border border-base-300">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <h2 className="text-xl font-bold">Store Inventory</h2>
          <div className="flex flex-wrap items-center gap-2">
            <input type="text" placeholder="Search SKU or Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="text-sm p-2 bg-base-100 border border-base-300 rounded-md focus:ring-1 focus:ring-accent-700 focus:border-accent-700"/>
            <button onClick={() => setIsExpanded(!isExpanded)} className="text-sm bg-base-300 text-ink-700 px-3 py-2 rounded-md hover:bg-opacity-80 font-semibold border border-base-300">
                {isExpanded ? 'Show Less' : 'Show More'} Columns
            </button>
            <button onClick={() => setIsModalOpen(true)} className="text-sm bg-success-700 text-white px-3 py-2 rounded-md hover:bg-opacity-80 font-semibold">Add New</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-ink-500">
            <thead className="text-xs text-ink-700 uppercase bg-base-100">
              <tr>
                {visibleColumns.map(col => (
                  <th key={col.key} scope="col" className="px-6 py-3 cursor-pointer font-semibold whitespace-nowrap" onClick={() => requestSort(col.key as SortKeys)}>
                    {col.header}
                  </th>
                ))}
                <th scope="col" className="px-6 py-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedAndFilteredInventory.map(sku => (
                <tr key={sku.skuId} className="bg-base-200 border-b border-base-300 hover:bg-base-300">
                    {visibleColumns.map(col => (
                        <td key={`${sku.skuId}-${col.key}`} className={`px-6 py-4 ${col.key === 'skuId' ? 'font-semibold text-ink-700' : ''} whitespace-nowrap`}>
                            {col.render ? col.render(sku) : sku[col.key as keyof SKU]}
                        </td>
                    ))}
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleDeleteItem(sku.skuId)} className="font-semibold text-error-700 hover:underline">Delete</button>
                      </div>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
