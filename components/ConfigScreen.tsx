
import React, { useState } from 'react';
import { AppConfig, CompanyConfig, SigningAuthority } from '../types';

interface ConfigScreenProps {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
}

const InputField: React.FC<{label: string, name: keyof CompanyConfig, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void, type?: string, required?: boolean, rows?: number}> = 
({label, name, value, onChange, type = 'text', required = false, rows}) => (
    <div>
        <label htmlFor={name} className="block text-sm font-semibold text-ink-500">{label}</label>
        {rows ? (
            <textarea id={name} name={name} value={value} onChange={onChange} required={required} rows={rows} className="mt-1 block w-full px-3 py-2 bg-base-100 border border-base-300 rounded-md shadow-sm placeholder-ink-400 focus:outline-none focus:ring-accent-700 focus:border-accent-700 sm:text-sm" />
        ) : (
            <input type={type} name={name} id={name} value={value} onChange={onChange} required={required} className="mt-1 block w-full px-3 py-2 bg-base-100 border border-base-300 rounded-md shadow-sm placeholder-ink-400 focus:outline-none focus:ring-accent-700 focus:border-accent-700 sm:text-sm" />
        )}
    </div>
);


const AuthorityForm: React.FC<{onSave: (authority: Omit<SigningAuthority, 'id'>) => void, onCancel: () => void}> = ({ onSave, onCancel }) => {
    const [name, setName] = useState('');
    const [designation, setDesignation] = useState('');
    const [din, setDin] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && designation && din) {
            onSave({ name, designation, din });
            setName('');
            setDesignation('');
            setDin('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-base-100 rounded-md border border-base-300 mt-4 space-y-4">
            <h4 className="text-md font-semibold text-ink-700">Add New Authority</h4>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required className="block w-full px-3 py-2 bg-base-200 border border-base-300 rounded-md text-sm" />
                <input type="text" placeholder="Designation" value={designation} onChange={e => setDesignation(e.target.value)} required className="block w-full px-3 py-2 bg-base-200 border border-base-300 rounded-md text-sm" />
                <input type="text" placeholder="DIN" value={din} onChange={e => setDin(e.target.value)} required className="block w-full px-3 py-2 bg-base-200 border border-base-300 rounded-md text-sm" />
             </div>
             <div className="flex justify-end gap-2">
                <button type="button" onClick={onCancel} className="px-3 py-1.5 bg-base-300 text-ink-700 text-sm rounded-md hover:bg-opacity-80 font-semibold">Cancel</button>
                <button type="submit" className="px-3 py-1.5 bg-accent-700 text-white text-sm rounded-md hover:bg-opacity-90 font-semibold">Save Authority</button>
             </div>
        </form>
    );
};


export const ConfigScreen: React.FC<ConfigScreenProps> = ({ config, setConfig }) => {
  const [companyDetails, setCompanyDetails] = useState<CompanyConfig>(config.companyDetails);
  const [isAddingAuthority, setIsAddingAuthority] = useState(false);

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCompanyDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleCompanySave = () => {
    setConfig(prev => ({ ...prev, companyDetails }));
    alert('Company details updated.');
  };

  const handleAddAuthority = (authority: Omit<SigningAuthority, 'id'>) => {
    const newAuthority: SigningAuthority = {
        id: `DIR-${Date.now()}`,
        ...authority,
    };
    setConfig(prev => ({...prev, signingAuthorities: [...prev.signingAuthorities, newAuthority]}));
    setIsAddingAuthority(false);
  };

  const handleDeleteAuthority = (id: string) => {
      if (window.confirm('Are you sure you want to remove this signing authority?')) {
          setConfig(prev => ({...prev, signingAuthorities: prev.signingAuthorities.filter(auth => auth.id !== id)}));
      }
  };


  return (
    <div className="space-y-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-ink-700">Configuration</h2>

        {/* Company Details Card */}
        <div className="bg-base-200 p-6 rounded-lg shadow-sm border border-base-300">
            <h3 className="text-xl font-bold mb-4 text-ink-700">Company Details</h3>
            <div className="space-y-4">
                <InputField label="Company Name" name="companyName" value={companyDetails.companyName} onChange={handleCompanyChange} required />
                <InputField label="Company Address" name="companyAddress" value={companyDetails.companyAddress} onChange={handleCompanyChange} required rows={3} />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="GSTIN" name="gstin" value={companyDetails.gstin} onChange={handleCompanyChange} required />
                    <InputField label="PAN" name="pan" value={companyDetails.pan} onChange={handleCompanyChange} required />
                </div>
            </div>
            <div className="mt-6 text-right">
                <button onClick={handleCompanySave} className="px-5 py-2 bg-accent-700 text-white font-bold rounded-lg shadow-sm hover:bg-opacity-90 transition text-sm">
                    Save Company Details
                </button>
            </div>
        </div>

        {/* Signing Authorities Card */}
        <div className="bg-base-200 p-6 rounded-lg shadow-sm border border-base-300">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-ink-700">Signing Authorities</h3>
                {!isAddingAuthority && (
                    <button onClick={() => setIsAddingAuthority(true)} className="text-sm bg-success-100 text-success-700 px-3 py-2 rounded-md hover:bg-opacity-80 font-semibold">
                        Add New Authority
                    </button>
                )}
            </div>
            <div className="space-y-3">
                {config.signingAuthorities.map(auth => (
                    <div key={auth.id} className="p-3 bg-base-100 rounded-md border border-base-300 flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-ink-700">{auth.name}</p>
                            <p className="text-sm text-ink-500">{auth.designation} <span className="text-ink-400">(DIN: {auth.din})</span></p>
                        </div>
                        <button onClick={() => handleDeleteAuthority(auth.id)} className="font-semibold text-error-700 hover:underline text-sm">
                            Remove
                        </button>
                    </div>
                ))}
                 {config.signingAuthorities.length === 0 && !isAddingAuthority && (
                    <p className="text-ink-500 text-center py-4">No signing authorities added.</p>
                )}
            </div>
            {isAddingAuthority && <AuthorityForm onSave={handleAddAuthority} onCancel={() => setIsAddingAuthority(false)} />}
        </div>
    </div>
  );
};
