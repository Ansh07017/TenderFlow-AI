
import React from 'react';
import { Rfp } from '../types';

const getDaysLeft = (closingDate: Date) => {
  const diffTime = closingDate.getTime() - new Date().getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
};

const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
}

interface ImpactSummaryProps {
  rfp: Rfp;
}

export const ImpactSummary: React.FC<ImpactSummaryProps> = ({ rfp }) => {
    const daysLeft = getDaysLeft(rfp.closingDate);
    const processingDuration = rfp.processingDuration ? formatDuration(rfp.processingDuration) : 'N/A';
    
    const getMatchConfidence = (): { value: string; highlightClass: string } => {
        const analyses = rfp.agentOutputs.technicalAnalysis?.lineItemAnalyses;

        if (!analyses || analyses.length === 0) {
            return { value: 'Pending Analysis', highlightClass: 'text-ink-500' };
        }

        const totalMatchPercentage = analyses.reduce((acc, curr) => acc + (curr.selectedSku.matchPercentage || 0), 0);
        const averageMatch = totalMatchPercentage / analyses.length;
        
        const allComplianceChecks = analyses.flatMap(a => a.complianceChecks);
        const hasFoundStandard = allComplianceChecks.some(c => c.status === 'Found');
        const hasReferencedStandard = allComplianceChecks.some(c => c.status === 'Referenced');

        if (averageMatch >= 80) {
            const text = hasFoundStandard ? `High (${averageMatch.toFixed(0)}% | Standards-mapped)` : `High (${averageMatch.toFixed(0)}%)`;
            return { value: text, highlightClass: 'text-success-400' };
        }
        
        if (averageMatch >= 60) {
            const text = hasReferencedStandard ? `Medium (${averageMatch.toFixed(0)}% | ATC referenced)` : `Medium (${averageMatch.toFixed(0)}%)`;
            return { value: text, highlightClass: 'text-ink-700' };
        }
        
        if (averageMatch > 0) {
            return { value: `Low (${averageMatch.toFixed(0)}%)`, highlightClass: 'text-warning-400' };
        }

        if (allComplianceChecks.length > 0) {
            return { value: 'Verification Required', highlightClass: 'text-warning-400' };
        }

        return { value: 'No Compliant SKU', highlightClass: 'text-error-400' };
    };
    
    const matchConfidence = getMatchConfidence();

    const summaryItems = [
        { label: 'RFP Deadline', value: `${daysLeft} days remaining`, highlight: daysLeft < 7 ? 'text-warning-400' : (daysLeft < 3 ? 'text-error-400' : 'text-ink-700') },
        { label: 'Processing Time', value: processingDuration },
        { label: 'Manual Effort Saved', value: '~6-8 hours' },
        { label: 'Avg. Spec Match', value: matchConfidence.value, highlight: matchConfidence.highlightClass },
        { label: 'Pricing Confidence', value: rfp.agentOutputs.pricing ? 'Medium-High' : 'N/A' }
    ];

    return (
        <div className="bg-base-200 p-4 rounded-lg shadow-sm border border-accent-700">
            <h3 className="text-lg font-bold text-ink-700 mb-3 sr-only">Impact Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-center">
                {summaryItems.map(item => (
                    <div key={item.label}>
                        <p className="text-xs font-semibold text-ink-500 uppercase tracking-wider">{item.label}</p>
                        <p className={`text-2xl font-bold ${item.highlight || 'text-ink-700'}`}>{item.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};