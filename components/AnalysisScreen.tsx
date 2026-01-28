
import React, { useState, useMemo } from 'react';
import { Rfp } from '../types';
import { ImpactSummary } from './ImpactSummary';
import { FinalRecommendation } from './FinalRecommendation';

const AgentSection: React.FC<{ title: string; agentName: string; children: React.ReactNode }> = ({ title, agentName, children }) => (
  <div className="bg-base-200 p-6 rounded-lg shadow-sm border border-base-300">
    <div className="border-b border-base-300 pb-3 mb-4">
      <h3 className="text-xl font-bold text-ink-700">{title}</h3>
      <p className="text-xs font-semibold text-ink-500 uppercase tracking-wider mt-1">Handled by: {agentName}</p>
    </div>
    <div className="space-y-4 text-sm text-ink-700">{children}</div>
  </div>
);

const DataPair: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <p className="text-xs font-semibold text-ink-500 uppercase tracking-wider">{label}</p>
    <p className="font-medium text-lg">{children}</p>
  </div>
);

const Pill: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="bg-accent-100 text-accent-700 text-sm font-semibold me-2 px-2.5 py-0.5 rounded-full">{children}</span>
);

const StoreMasterLabel: React.FC = () => (
    <p className="text-xs text-ink-400 mt-1">Source: Store Master (verified pricing & availability)</p>
);

const getComplianceStatusIcon = (status: 'Found' | 'Referenced' | 'NotFound') => {
  switch (status) {
    case 'Found': return <span className="text-success-400 font-bold">✓</span>;
    case 'Referenced': return <span className="text-success-400 font-bold">✓</span>;
    case 'NotFound': return <span className="text-warning-400 font-bold">⚠</span>;
    default: return null;
  }
};

const getEligibilityStatusIcon = (status: 'Pass' | 'Warn' | 'Info' | 'Fail') => {
  switch (status) {
    case 'Pass': return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
    case 'Warn': return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-warning-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.22 3.008-1.742 3.008H4.42c-1.522 0-2.492-1.674-1.742-3.008l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" /></svg>;
    case 'Info': return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent-700" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>;
    default: return null;
  }
};

const getRiskIcon = (level: 'Low' | 'Medium' | 'High') => {
    switch (level) {
        case 'Low': return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent-700" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>;
        case 'Medium': return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-warning-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.22 3.008-1.742 3.008H4.42c-1.522 0-2.492-1.674-1.742-3.008l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" /></svg>;
        case 'High': return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-error-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>;
    }
}

export const AnalysisScreen: React.FC<{ rfp: Rfp, onBack: () => void }> = ({ rfp, onBack }) => {
  const { parsedData, technicalAnalysis, pricing, eligibilityAnalysis, riskAnalysis } = rfp.agentOutputs;
  
  const initialComplianceState = useMemo(() => {
    return technicalAnalysis?.lineItemAnalyses.map(analysis =>
        analysis.complianceChecks.map(check => ({ ...check }))
    ) || [];
  }, [technicalAnalysis]);
  const [lineItemComplianceChecks, setLineItemComplianceChecks] = useState(initialComplianceState);

  const handleVerificationChange = (lineItemIndex: number, checkIndex: number) => {
    const newChecksState = [...lineItemComplianceChecks];
    newChecksState[lineItemIndex][checkIndex].verified = !newChecksState[lineItemIndex][checkIndex].verified;
    setLineItemComplianceChecks(newChecksState);
  };
  
  const allVerified = useMemo(() => lineItemComplianceChecks.flat().every(check => check.verified), [lineItemComplianceChecks]);

  return (
    <div className="space-y-6">
      <div>
        <button onClick={onBack} className="text-sm text-accent-700 hover:underline mb-2 font-semibold">&larr; Back to RFP List</button>
        <h2 className="text-2xl font-bold">Analysis Report: <span className="font-semibold text-ink-400">{rfp.id}</span></h2>
      </div>

      <ImpactSummary rfp={rfp} />
      
      <div className="space-y-6">
        {parsedData && (
          <AgentSection title="RFP Discovery & Eligibility" agentName="SALES_AGENT">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <DataPair label="Issuing Organization">{parsedData.metadata.issuingOrganization}</DataPair>
              <DataPair label="Bid Type"><Pill>{parsedData.metadata.bidType}</Pill></DataPair>
              <DataPair label="Offer Validity">{parsedData.metadata.offerValidity} days</DataPair>
              <DataPair label="Total Line Items">{parsedData.products.length}</DataPair>
              <DataPair label="Consignee">{parsedData.consignee.split(',')[0]}</DataPair>
            </div>
            {eligibilityAnalysis && eligibilityAnalysis.length > 0 && (
                <div className="mt-4 p-4 bg-base-100 rounded-md border border-base-300">
                  <h4 className="font-bold text-ink-700 mb-2">Eligibility & Compliance Snapshot</h4>
                  <ul className="space-y-2">
                    {eligibilityAnalysis.map((item, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <div className="flex-shrink-0">{getEligibilityStatusIcon(item.status)}</div>
                        <p className="text-ink-500">
                          <span className="font-semibold text-ink-700">{item.criterion}:</span> {item.statusText}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
            )}
          </AgentSection>
        )}

        {technicalAnalysis && technicalAnalysis.lineItemAnalyses && (
          <AgentSection title="SKU Matching & Specification Alignment" agentName="TECHNICAL_AGENT">
             <p className="text-xs text-ink-400 mb-3">Human-in-the-loop verification required. Please check each item to confirm compliance before finalizing.</p>
            <div className="space-y-4">
              {technicalAnalysis.lineItemAnalyses.map((analysis, lineItemIndex) => (
                <div key={lineItemIndex} className="p-4 bg-base-100 rounded-lg border border-base-300">
                  <h4 className="font-bold text-lg text-ink-700">
                    Line Item {lineItemIndex + 1}: {analysis.rfpLineItem.name}
                  </h4>
                  <p className="text-sm text-ink-500 mb-3">Required Quantity: {analysis.rfpLineItem.quantity} units</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-semibold text-sm text-ink-700 mb-2">Compliance Checklist</h5>
                      <ul className="space-y-2">
                        {(lineItemComplianceChecks[lineItemIndex] || []).map((check, checkIndex) => (
                          <li key={checkIndex}>
                            <label htmlFor={`verify-${lineItemIndex}-${checkIndex}`} className="flex items-center cursor-pointer">
                              <input 
                                id={`verify-${lineItemIndex}-${checkIndex}`}
                                type="checkbox" 
                                checked={check.verified}
                                onChange={() => handleVerificationChange(lineItemIndex, checkIndex)}
                                className="h-4 w-4 rounded bg-base-300 border-base-300 text-accent-700 focus:ring-accent-700"
                              />
                              <span className="ml-3 flex items-center gap-2 text-sm">
                                {getComplianceStatusIcon(check.status)}
                                <span>{check.standard}: <strong className="font-semibold">{check.source}</strong></span>
                              </span>
                            </label>
                          </li>
                        ))}
                        {analysis.complianceChecks.length === 0 && <p className="text-ink-500 text-xs italic">No specific standards listed for this item.</p>}
                      </ul>
                    </div>
                    <div className="bg-base-200 p-3 rounded-md">
                      <p className="text-xs font-semibold text-ink-500 uppercase">Selected SKU</p>
                      <p className="font-semibold text-accent-700 text-lg">{analysis.selectedSku.skuId}</p>
                      <p className="text-xs text-ink-400">{analysis.selectedSku.productName} ({analysis.selectedSku.matchPercentage?.toFixed(0)}% spec match)</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </AgentSection>
        )}

        {pricing && (
          <AgentSection title="Cost, Logistics & Compliance" agentName="PRICING_AGENT">
             <StoreMasterLabel />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                <div>
                  <h4 className="font-bold text-ink-700 mb-2">Final Bid Value Breakdown</h4>
                  <ul className="divide-y divide-base-300">
                    {Object.entries(pricing).map(([key, value]) => (
                      <li key={key} className={`py-2 flex justify-between items-center ${key === 'Final Bid Value' ? 'font-bold text-xl' : ''}`}>
                        <span className="text-ink-500">{key}</span>
                        <span className={key === 'Final Bid Value' ? 'text-success-400' : 'text-ink-700'}>
                          {(value as number).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 bg-base-100 rounded-md border border-base-300">
                    <h4 className="font-bold text-ink-700">Pricing Assumptions</h4>
                    <ul className="list-disc list-inside space-y-2 mt-2 text-ink-500">
                        <li>Transport cost aggregated for all line items based on respective warehouse locations.</li>
                        <li><strong>+10%</strong> adjustment added for tolls and route variations.</li>
                        <li>GST applied at a blended rate based on the items in the bid.</li>
                    </ul>
                </div>
             </div>
          </AgentSection>
        )}
      </div>
      
      {riskAnalysis && riskAnalysis.length > 0 && (
        <div className="bg-base-200 p-6 rounded-lg shadow-sm border border-warning-400">
            <h3 className="text-xl font-bold text-warning-400 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.22 3.008-1.742 3.008H4.42c-1.522 0-2.492-1.674-1.742-3.008l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                Key Risks & Assumptions
            </h3>
            <div className="space-y-3">
                {riskAnalysis.map((risk, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-base-100 rounded-md">
                        <div className="flex-shrink-0 pt-1">{getRiskIcon(risk.riskLevel)}</div>
                        <div>
                            <span className="text-xs font-semibold bg-base-300 text-ink-500 px-2 py-0.5 rounded-full">{risk.category}</span>
                            <p className="mt-1 text-ink-500">{risk.statement}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

       <FinalRecommendation rfp={rfp} />

       <div className="mt-6 pt-6 border-t border-base-300 text-center">
        <button 
          onClick={() => alert('Report Approved and Submitted!')}
          disabled={!allVerified}
          className="bg-success-600 text-white px-8 py-3 rounded-lg font-bold text-base hover:bg-opacity-90 transition disabled:bg-base-300 disabled:text-ink-400 disabled:cursor-not-allowed"
        >
          Finalize & Approve Report
        </button>
        {!allVerified && <p className="text-xs text-warning-400 mt-2">All compliance checks must be verified before finalizing.</p>}
      </div>
    </div>
  );
};