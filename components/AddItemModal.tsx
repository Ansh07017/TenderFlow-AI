
import React, { useState } from 'react';
import { SKU, TruckType } from '../types';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newItem: SKU) => void;
}

const initialFormState: Omit<SKU, 'matchPercentage'> = {
  skuId: '', productName: '', productCategory: '', productSubCategory: '', oemBrand: '',
  specification: { Type: '', Motor: '' },
  availableQuantity: 0, warehouseLocation: '', warehouseCode: '',
  warehouseLat: 0, warehouseLon: 0, truckType: 'LCV',
  leadTime: 0, costPrice: 0, unitSalesPrice: 0, bulkSalesPrice: 0,
  gstRate: 0, brokerage: 0, minMarginPercent: 0,
  isActive: true, isCustomMadePossible: false, isComplianceReady: false,
};

const InputField: React.FC<{label: string, name: string, value: string | number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, required?: boolean, step?: string}> = 
({label, name, value, onChange, type = 'text', required = false, step = "any"}) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-ink-500">{label}</label>
        <input type={type} name={name} id={name} value={value} onChange={onChange} required={required} step={step} className="mt-1 block w-full px-3 py-2 bg-base-100 border border-base-300 rounded-md shadow-sm placeholder-ink-400 focus:outline-none focus:ring-accent-700 focus:border-accent-700 sm:text-sm" />
    </div>
);

const SelectField: React.FC<{label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, children: React.ReactNode}> = 
({ label, name, value, onChange, children }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-ink-500">{label}</label>
        <select id={name} name={name} value={value} onChange={onChange} className="mt-1 block w-full px-3 py-2 bg-base-100 border border-base-300 rounded-md shadow-sm focus:outline-none focus:ring-accent-700 focus:border-accent-700 sm:text-sm">
            {children}
        </select>
    </div>
);

const CheckboxField: React.FC<{label: string, name: string, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void}> = ({ label, name, checked, onChange }) => (
    <div className="flex items-center">
        <input id={name} name={name} type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 text-accent-700 bg-base-100 border-base-300 rounded focus:ring-accent-700" />
        <label htmlFor={name} className="ml-2 block text-sm text-ink-700">{label}</label>
    </div>
);

export const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formState, setFormState] = useState(initialFormState);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const checked = isCheckbox ? (e.target as HTMLInputElement).checked : false;

    const val = isCheckbox ? checked : (type === 'number' ? parseFloat(value) || 0 : value);
    setFormState(prev => ({...prev, [name]: val}));
  };

  const handleSpecChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({...prev, specification: {...prev.specification, [name]: value }}));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formState);
    setFormState(initialFormState);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 overflow-y-auto h-full w-full z-20" onClick={onClose}>
      <div className="relative top-10 mx-auto p-5 border border-base-300 w-full max-w-4xl shadow-lg rounded-md bg-base-200" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <h3 className="text-lg font-medium leading-6 text-ink-700 mb-4">Add New Inventory Item</h3>
          
          <div className="space-y-4 p-4 rounded-md">
            <fieldset className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <legend className="font-medium text-ink-700 text-sm sr-only">Core Identification</legend>
              <InputField label="SKU ID" name="skuId" value={formState.skuId} onChange={handleChange} required />
              <InputField label="Product Name" name="productName" value={formState.productName} onChange={handleChange} required />
              <InputField label="Product Category" name="productCategory" value={formState.productCategory} onChange={handleChange} />
              <InputField label="Product Sub-Category" name="productSubCategory" value={formState.productSubCategory} onChange={handleChange} />
              <InputField label="OEM / Brand" name="oemBrand" value={formState.oemBrand} onChange={handleChange} />
            </fieldset>

            <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <legend className="font-medium text-ink-700 text-sm sr-only">Specifications</legend>
               <InputField label="Specification (Type)" name="Type" value={formState.specification.Type || ''} onChange={handleSpecChange} />
               <InputField label="Specification (Motor)" name="Motor" value={formState.specification.Motor || ''} onChange={handleSpecChange} />
            </fieldset>

            <fieldset className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <legend className="font-medium text-ink-700 text-sm sr-only">Inventory & Logistics</legend>
              <InputField label="Available Quantity" name="availableQuantity" value={formState.availableQuantity} onChange={handleChange} type="number" required />
              <InputField label="Warehouse Location" name="warehouseLocation" value={formState.warehouseLocation} onChange={handleChange} />
              <InputField label="Warehouse Lat" name="warehouseLat" value={formState.warehouseLat} onChange={handleChange} type="number" step="0.0001"/>
              <InputField label="Warehouse Lon" name="warehouseLon" value={formState.warehouseLon} onChange={handleChange} type="number" step="0.0001"/>
              <SelectField label="Truck Type" name="truckType" value={formState.truckType} onChange={handleChange}>
                  {(['MINI_TRUCK', 'LCV', 'MEDIUM_TRUCK', 'HEAVY_TRUCK'] as TruckType[]).map(t => <option key={t} value={t}>{t}</option>)}
              </SelectField>
            </fieldset>
            
            <fieldset className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <legend className="font-medium text-ink-700 text-sm sr-only">Pricing & Finance</legend>
                <InputField label="Cost Price (INR)" name="costPrice" value={formState.costPrice} onChange={handleChange} type="number" required />
                <InputField label="Unit Sales Price (INR)" name="unitSalesPrice" value={formState.unitSalesPrice} onChange={handleChange} type="number" required />
                <InputField label="Bulk Sales Price (INR)" name="bulkSalesPrice" value={formState.bulkSalesPrice} onChange={handleChange} type="number" />
                <InputField label="GST Rate (%)" name="gstRate" value={formState.gstRate} onChange={handleChange} type="number" required />
                <InputField label="Min. Margin (%)" name="minMarginPercent" value={formState.minMarginPercent} onChange={handleChange} type="number" required />
            </fieldset>

            <fieldset className="flex items-center gap-6 pt-2">
                 <legend className="font-medium text-ink-700 text-sm sr-only">System Flags</legend>
                 <CheckboxField label="Is Active" name="isActive" checked={formState.isActive} onChange={handleChange} />
                 <CheckboxField label="Custom-made possible" name="isCustomMadePossible" checked={formState.isCustomMadePossible} onChange={handleChange} />
                 <CheckboxField label="Compliance Ready" name="isComplianceReady" checked={formState.isComplianceReady} onChange={handleChange} />
            </fieldset>
          </div>
          
          <div className="pt-6 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-base-300 text-ink-700 rounded-md hover:bg-opacity-80 font-semibold">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-accent-700 text-white rounded-md hover:bg-opacity-90 font-semibold">Save Item</button>
          </div>
        </form>
      </div>
    </div>
  );
};