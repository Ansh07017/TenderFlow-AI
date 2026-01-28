
import React from 'react';
import { Rfp } from '../types';

interface FinalRecommendationProps {
  rfp: Rfp;
}

type RationaleStatus = 'high' | 'medium' | 'low' | 'critical';

const getRecommendation = (rfp: Rfp): {
    recommendation: 'PROCEED' | 'PROCEED WITH CAUTION' | 'NO BID';
    colorClass: string;
    rationale: {
        category: string;
        summary: string;
        status: RationaleStatus;
    }[];
} => {
    const { eligibilityAnalysis, technicalAnalysis, pricing, riskAnalysis } = rfp.agentOutputs;
    const rationale: { category: string; summary: string; status: RationaleStatus }[] = [];
    
    // --- Rationale Calculation ---
    
    // 1. Technical Fit
    const analyses = technicalAnalysis?.lineItemAnalyses;
    if (analyses && analyses.length > 0) {
        const totalMatch = analyses.reduce((acc, curr) => acc + (curr.selectedSku.matchPercentage || 0), 0);
        const avgMatch = totalMatch / analyses.length;
        
        if (avgMatch >= 80) {
            rationale.push({ category: 'Technical Fit', summary: `High (${avgMatch.toFixed(0)}% avg match)`, status: 'high' });
        } else if (avgMatch >= 60) {
            rationale.push({ category: 'Technical Fit', summary: `Medium (${avgMatch.toFixed(0)}% avg match)`, status: 'medium' });
        } else {
            rationale.push({ category: 'Technical Fit', summary: `Low (${avgMatch.toFixed(0)}% avg match)`, status: 'low' });
        }
    } else {
        rationale.push({ category: 'Technical Fit', summary: 'No compliant SKU found', status: 'critical' });
    }

    // 2. Compliance
    if (eligibilityAnalysis) {
        if (eligibilityAnalysis.some(e => e.status === 'Fail')) {
            rationale.push({ category: 'Compliance', summary: 'Major non-compliance detected', status: 'critical' });
        } else if (eligibilityAnalysis.some(e => e.status === 'Warn')) {
            rationale.push({ category: 'Compliance', summary: 'Manual verification required', status: 'medium' });
        } else {
            rationale.push({ category: 'Compliance', summary: 'High alignment', status: 'high' });
        }
    }

    // 3. Financials
    if (pricing && analyses && analyses.length > 0) {
        const totalMaterialCOGS = analyses.reduce((acc, analysis) => {
            const { rfpLineItem, selectedSku } = analysis;
            return acc + (selectedSku.costPrice * rfpLineItem.quantity);
        }, 0);

        const totalCost = totalMaterialCOGS + (pricing['Total Transportation Cost'] || 0) + (pricing['Testing Costs'] || 0) + (pricing['Total Brokerage'] || 0);
        const totalRevenue = pricing['Final Bid Value'] || 0;
        const margin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0;
        
        const avgMinMargin = analyses.reduce((acc, curr) => acc + curr.selectedSku.minMarginPercent, 0) / analyses.length;

        if (margin >= avgMinMargin) {
            rationale.push({ category: 'Financials', summary: `Healthy margin (${margin.toFixed(1)}%)`, status: 'high' });
        } else if (margin > 0) {
            rationale.push({ category: 'Financials', summary: `Below target margin (${margin.toFixed(1)}%)`, status: 'medium' });
        } else {
            rationale.push({ category: 'Financials', summary: 'Negative margin project', status: 'critical' });
        }
    } else {
        rationale.push({ category: 'Financials', summary: 'Pricing analysis pending', status: 'medium'});
    }

    // 4. Risk
    if (riskAnalysis && riskAnalysis.length > 0) {
        const hasHighRisk = riskAnalysis.some(r => r.riskLevel === 'High');
        const hasMediumRisk = riskAnalysis.some(r => r.riskLevel === 'Medium');
        if (hasHighRisk) {
            rationale.push({ category: 'Risk Profile', summary: 'High (Timeline or delivery risk)', status: 'critical' });
        } else if (hasMediumRisk) {
            rationale.push({ category: 'Risk Profile', summary: 'Manageable (Medium-level risks)', status: 'medium' });
        } else {
            rationale.push({ category: 'Risk Profile', summary: 'Low', status: 'high' });
        }
    } else {
        rationale.push({ category: 'Risk Profile', summary: 'Low', status: 'high'});
    }

    // --- Final Recommendation ---
    if (rationale.some(r => r.status === 'critical')) {
        return { recommendation: 'NO BID', colorClass: 'bg-error-900 text-error-400 border-error-600', rationale };
    }
    if (rationale.some(r => r.status === 'medium' || r.status === 'low')) {
        return { recommendation: 'PROCEED WITH CAUTION', colorClass: 'bg-warning-900 text-warning-400 border-warning-600', rationale };
    }
    return { recommendation: 'PROCEED', colorClass: 'bg-success-900 text-success-400 border-success-600', rationale };
};

const getStatusIndicator = (status: RationaleStatus) => {
    const colorClasses: Record<RationaleStatus, string> = {
        high: 'text-success-400',
        medium: 'text-warning-400',
        low: 'text-warning-400',
        critical: 'text-error-400',
    };
    return <span className={colorClasses[status]}>●</span>;
}

export const FinalRecommendation: React.FC<FinalRecommendationProps> = ({ rfp }) => {
    const { recommendation, colorClass, rationale } = getRecommendation(rfp);

    return (
        <div className="bg-base-200 p-6 rounded-lg shadow-sm border border-base-300">
            <h3 className="text-xl font-bold mb-4 text-ink-700">Final Recommendation</h3>
            <div className={`p-4 rounded-md border ${colorClass} text-center mb-4`}>
                <p className="text-sm font-semibold uppercase tracking-wider">Bid Recommendation</p>
                <p className="text-3xl font-bold">{recommendation}</p>
            </div>
            <div>
                <h4 className="font-semibold text-ink-700 mb-2">Rationale</h4>
                <ul className="space-y-2">
                    {rationale.map(item => (
                        <li key={item.category} className="flex items-center gap-3 p-3 bg-base-100 rounded-md border border-base-300">
                           <span className="flex-shrink-0">{getStatusIndicator(item.status)}</span>
                           <span className="font-semibold text-ink-500 w-32 flex-shrink-0">{item.category}:</span>
                           <span className="text-ink-700">{item.summary}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};
