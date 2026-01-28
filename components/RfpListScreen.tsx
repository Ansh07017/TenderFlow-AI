
import React from 'react';
import { Rfp } from '../types';
import { RfpInput } from './RfpInput';

interface RfpListScreenProps {
  rfps: Rfp[];
  onProcessRfp: (data: { source: 'URL' | 'File'; content: string; fileName?: string; }) => void;
  onViewAnalysis: (rfpId: string) => void;
  onProcessExistingRfp: (rfpId: string) => void;
}

const getDaysLeft = (closingDate: Date) => {
  const diffTime = closingDate.getTime() - new Date().getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
};

const DaysLeftBadge: React.FC<{ days: number }> = ({ days }) => {
  let colorClasses = 'bg-success-600 text-white';
  if (days < 8) colorClasses = 'bg-warning-600 text-base-100 font-bold';
  if (days < 3) colorClasses = 'bg-error-600 text-white';
  if (days === 0) colorClasses = 'bg-base-300 text-ink-700';

  return (
    <span title="Based on bid closing date" className={`px-2 py-0.5 text-xs font-medium rounded-full ${colorClasses}`}>
      {days} {days === 1 ? 'day' : 'days'} left
    </span>
  );
};

const StatusSpinner: React.FC = () => (
  <div className="flex items-center justify-center text-ink-500">
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    Processing...
  </div>
);

export const RfpListScreen: React.FC<RfpListScreenProps> = ({ rfps, onProcessRfp, onViewAnalysis, onProcessExistingRfp }) => {
  const urgentRfps = rfps.filter(rfp => getDaysLeft(rfp.closingDate) === 0 && rfp.status === 'Pending');

  return (
    <div className="space-y-6">
      <RfpInput onSubmit={onProcessRfp} />
      <div className="bg-base-200 p-6 rounded-lg shadow-sm border border-base-300">
        <h2 className="text-xl font-bold mb-4 text-ink-700">RFP Discovery</h2>
        {urgentRfps.length > 0 && (
          <div className="bg-warning-900 bg-opacity-50 border border-warning-400 text-warning-400 px-4 py-2 rounded-md mb-4 text-sm font-semibold" role="alert">
            ⚠️ {urgentRfps.length} RFP requires immediate action (deadline today).
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-ink-500">
            <thead className="text-xs text-ink-700 uppercase bg-base-100">
              <tr>
                <th scope="col" className="px-6 py-3 font-semibold">RFP ID</th>
                <th scope="col" className="px-6 py-3 font-semibold">Organisation</th>
                <th scope="col" className="px-6 py-3 font-semibold">Bid Type</th>
                <th scope="col" className="px-6 py-3 font-semibold">Closing Date</th>
                <th scope="col" className="px-6 py-3 font-bold text-center">⏱ Deadline</th>
                <th scope="col" className="px-6 py-3 font-semibold text-center">Status</th>
                <th scope="col" className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rfps.map(rfp => {
                const daysLeft = getDaysLeft(rfp.closingDate);
                return (
                  <tr key={rfp.id} className="bg-base-200 border-b border-base-300 hover:bg-base-300">
                    <th scope="row" className="px-6 py-4 font-semibold text-ink-700 whitespace-nowrap">{rfp.id}</th>
                    <td className="px-6 py-4">{rfp.organisation}</td>
                    <td className="px-6 py-4">{rfp.bidType}</td>
                    <td className="px-6 py-4">{rfp.closingDate.toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-center"><DaysLeftBadge days={daysLeft} /></td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-semibold text-ink-700">{rfp.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {rfp.status === 'Pending' && <button onClick={() => onProcessExistingRfp(rfp.id)} className="px-3 py-1 text-sm font-semibold rounded-md border border-accent-700 text-accent-700 hover:bg-accent-700 hover:text-white transition-colors">Start Analysis</button>}
                      {(rfp.status === 'Processing' || rfp.status === 'Parsing' || rfp.status === 'Extracting') && <StatusSpinner />}
                      {rfp.status === 'Complete' && <button onClick={() => onViewAnalysis(rfp.id)} className="font-semibold text-success-400 hover:underline">View Analysis</button>}
                       {rfp.status === 'Error' && <span className="font-semibold text-error-400">Failed</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};