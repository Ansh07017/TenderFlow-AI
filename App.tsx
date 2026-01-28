
import React, { useState, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Header } from './components/Header';
import { RfpListScreen } from './components/RfpListScreen';
import { StoreScreen } from './components/StoreScreen';
import { LogScreen } from './components/LogScreen';
import { ConfigScreen } from './components/ConfigScreen';
import { AnalysisScreen } from './components/AnalysisScreen';
import { ProcessingScreen } from './components/ProcessingScreen';
import { AgentName, LogEntry, Rfp, SKU, ParsedRfpData, AppConfig, LineItemTechnicalAnalysis } from './types';
import { initialRfpList } from './data/rfpData';
import { productInventory } from './data/storeData';
import { initialConfig } from './data/configData';
import { TRUCK_COST_PER_KM, TRANSPORT_COST_ADJUSTMENT_FACTOR, CONSIGNEE_LOCATIONS, getDistanceFromLatLonInKm } from './constants';

// --- Gemini API Setup ---
const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

const rfpProductLineItemSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "The name of the product required." },
        quantity: { type: Type.NUMBER, description: "The quantity of the product." },
        technicalSpecs: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of key technical specifications SPECIFIC to this line item." },
        requiredStandards: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of specific compliance standards or codes SPECIFIC to this line item." },
    },
    required: ['name', 'quantity', 'technicalSpecs']
};

const parsedRfpDataSchema: any = {
  type: Type.OBJECT,
  properties: {
    metadata: {
      type: Type.OBJECT,
      properties: {
        bidNumber: { type: Type.STRING, description: "The unique identification number for the bid (e.g., 'GEM/2026/B/7064364')." },
        issuingOrganization: { type: Type.STRING, description: "The name of the organization that issued the RFP (e.g., 'Mahanadi Coalfields Limited')." },
        bidType: { type: Type.STRING, description: "The type of bid (e.g., 'Two Packet Bid')." },
        bidEndDate: { type: Type.STRING, description: "The closing date and time for the bid in ISO 8601 format (e.g., '2026-01-26T20:00:00')." },
        offerValidity: { type: Type.NUMBER, description: "The number of days the offer should be valid for (e.g., 120)." },
        deliveryDays: { type: Type.NUMBER, description: "The number of days allowed for delivery after order placement." },
      },
      required: ['bidNumber', 'issuingOrganization', 'bidType', 'bidEndDate', 'offerValidity'],
    },
    products: {
      type: Type.ARRAY,
      items: rfpProductLineItemSchema,
    },
    mandatoryDocuments: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of documents that are mandatory for the seller to provide for the overall bid."
    },
    financialConditions: {
      type: Type.OBJECT,
      properties: {
        epbg: { type: Type.STRING, description: "The ePBG percentage, if mentioned (e.g., '5.00')." },
        paymentTerms: { type: Type.STRING, description: "The payment terms." },
      },
    },
    eligibilityCriteria: {
      type: Type.OBJECT,
      properties: {
        localSupplierClass: { type: Type.STRING, description: "Any local supplier classification mentioned (e.g., 'Class I / II Gujarat MSE')." },
        turnoverRequirement: { type: Type.STRING, description: "Any financial turnover requirements (e.g., '>= 2x bid value')." },
        qualityCertifications: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of required quality certifications (e.g., 'TS/IATF/BIS/NABL')." },
        sampleApprovalClause: { type: Type.STRING, description: "Details of any sample approval clauses." },
        optionClause: { type: Type.STRING, description: "Details of any option clause for quantity variation (e.g., '+25%'). If not present, return 'N/A'." },
      },
    },
    consignee: { type: Type.STRING, description: "The full name and address of the consignee (recipient), including PIN code." },
  },
  required: ['metadata', 'products', 'mandatoryDocuments', 'financialConditions', 'consignee'],
};


const geminiService = {
  parseRFP: async (rfpContent: string): Promise<string> => {
    const prompt = `Your task is to parse the following RFP document and extract key information into a structured JSON format. The document may contain a mix of English and Hindi.
It is CRITICAL to associate technical specifications and compliance standards directly with EACH product line item in the 'products' array. Do not list technical specifications or standards globally.

Your output MUST be a single, valid JSON object. Do NOT include any text, explanations, or markdown formatting (like \`\`\`json) before or after the JSON object.

Parse the following document:
---DOCUMENT START---
${rfpContent}
---DOCUMENT END---
`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: parsedRfpDataSchema,
        systemInstruction: "You are an expert document analysis agent for a company that responds to Requests for Proposals (RFPs). Your primary function is to parse unstructured RFP documents and extract key information into a structured JSON format. Your key skill is extracting structured data from visually complex documents that contain a mix of English and Hindi, including data laid out in tables with varying formats. You must accurately map labels to values and handle multilingual content seamlessly. Pay close attention to details like bid numbers, deadlines, technical specifications, and financial terms.",
      },
    });

    const text = response.text;

    if (!text) {
        throw new Error("Received empty response from AI model.");
    }
    return text;
  },
};

type View = 'rfps' | 'store' | 'config' | 'logs' | 'processing' | 'analysis';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('rfps');
  const [rfps, setRfps] = useState<Rfp[]>(initialRfpList);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedRfpId, setSelectedRfpId] = useState<string | null>(null);
  const [inventory, setInventory] = useState<SKU[]>(productInventory);
  const [config, setConfig] = useState<AppConfig>(initialConfig);
  const [processingStartTime, setProcessingStartTime] = useState<Date | null>(null);

  const addLog = useCallback((agent: AgentName | 'SYSTEM', message: string, data?: any) => {
    setLogs(prevLogs => [
      ...prevLogs,
      { timestamp: new Date(), agent, message, data: data ? JSON.stringify(data, null, 2) : undefined }
    ]);
  }, []);

  const updateRfpState = (rfpId: string, updates: Partial<Rfp>) => {
    setRfps(prevRfps =>
      prevRfps.map(rfp => {
        if (rfp.id === rfpId) {
          const updatedRfp = { ...rfp, ...updates };
          if (updates.agentOutputs) {
            updatedRfp.agentOutputs = {
              ...rfp.agentOutputs,
              ...updates.agentOutputs,
            };
          }
          return updatedRfp;
        }
        return rfp;
      })
    );
  };
  
  const processRfp = async (rfpId: string, rfpToProcessOverride?: Rfp) => {
    const startTime = Date.now();
    const rfpToProcess = rfpToProcessOverride || rfps.find(r => r.id === rfpId);
    if (!rfpToProcess) {
      addLog('SYSTEM', `Could not find RFP with ID ${rfpId} to start processing.`, { availableIds: rfps.map(r => r.id) });
      return;
    }

    let currentRfpId = rfpId;

    try {
      addLog('SYSTEM', `Processing pipeline initiated for RFP: ${currentRfpId}`);
      
      updateRfpState(currentRfpId, { status: 'Extracting', activeAgent: 'EXTRACTOR' });
      addLog('EXTRACTOR', 'Starting raw text extraction from source document.');
      await new Promise(resolve => setTimeout(resolve, 1500));
      addLog('EXTRACTOR', 'Text extraction complete.');
      
      updateRfpState(currentRfpId, { status: 'Parsing', activeAgent: 'PARSING_ENGINE' });
      addLog('PARSING_ENGINE', 'Agent invoked. Sending extracted text to Gemini for structuring.');
      
      const rawResponseText = await geminiService.parseRFP(rfpToProcess.rawDocument);
      let parsedData: ParsedRfpData;
      try {
        let cleanedJsonString = rawResponseText.trim().match(/```json\s*([\s\S]*?)\s*```/)?.[1] || rawResponseText;
        parsedData = JSON.parse(cleanedJsonString);
      } catch (e) {
        addLog('PARSING_ENGINE', 'Failed to parse JSON response from Gemini.', rawResponseText);
        throw new Error('Invalid JSON response from AI model.');
      }
      addLog('PARSING_ENGINE', 'Parsing complete. Received structured data from Gemini.');
      
      if (currentRfpId !== parsedData.metadata.bidNumber) {
        const tempId = currentRfpId;
        currentRfpId = parsedData.metadata.bidNumber;
        setRfps(prev => prev.map(r => r.id === tempId ? {
            ...r, id: currentRfpId, organisation: parsedData.metadata.issuingOrganization,
            bidType: parsedData.metadata.bidType, closingDate: new Date(parsedData.metadata.bidEndDate)
        } : r));
        setSelectedRfpId(currentRfpId);
      }
      
      updateRfpState(currentRfpId, { status: 'Processing', activeAgent: 'SALES_AGENT', agentOutputs: { parsedData } });
      addLog('SALES_AGENT', `Received parsed RFP ${currentRfpId}. Checking business eligibility.`);
      await new Promise(resolve => setTimeout(resolve, 800));
      addLog('SALES_AGENT', `Product category is within scope. Proceeding.`);
      
      const eligibilityAnalysis: Rfp['agentOutputs']['eligibilityAnalysis'] = [];
      const criteria = parsedData.eligibilityCriteria || {};
      const paymentTerms = parsedData.financialConditions.paymentTerms || '';
      eligibilityAnalysis.push({ criterion: 'Local Supplier Requirement', statusText: criteria.localSupplierClass || 'Not Evaluated', status: 'Info' });
      eligibilityAnalysis.push({ criterion: 'Turnover Criteria', statusText: criteria.turnoverRequirement || 'Data not available', status: 'Warn' });
      eligibilityAnalysis.push({ criterion: 'Quality Certification', statusText: 'Manual verification required', status: 'Warn' });
      eligibilityAnalysis.push({ criterion: 'Sample Approval Clause', statusText: criteria.sampleApprovalClause || 'Not explicitly mentioned', status: 'Info' });
      const daysMatch = paymentTerms.match(/(\d+)\s*days/i);
      eligibilityAnalysis.push({ criterion: 'Payment Terms', statusText: daysMatch && parseInt(daysMatch[1], 10) >= 60 ? `${daysMatch[1]} days (Acceptable)` : `Requires Review (${paymentTerms})`, status: daysMatch && parseInt(daysMatch[1], 10) >= 60 ? 'Pass' : 'Warn' });
      updateRfpState(currentRfpId, { agentOutputs: { eligibilityAnalysis } });
      addLog('SALES_AGENT', 'Eligibility and compliance snapshot generated.');

      updateRfpState(currentRfpId, { activeAgent: 'TECHNICAL_AGENT' });
      addLog('TECHNICAL_AGENT', 'Agent invoked. Starting per-line-item technical analysis.');
      
      const lineItemAnalyses: LineItemTechnicalAnalysis[] = [];
      for (const product of parsedData.products) {
          addLog('TECHNICAL_AGENT', `Analyzing line item: ${product.name} (Qty: ${product.quantity})`);
          const rfpSpecs = new Set(product.technicalSpecs);
          const skuRecommendations = inventory.filter(sku => sku.isActive && sku.isComplianceReady).map(sku => {
              const skuSpecs = new Set(Object.values(sku.specification));
              const matchedParams = [...rfpSpecs].filter(spec => [...skuSpecs].some(s => (s as string).includes((spec as string).split(' ')[0])));
              const matchPercentage = rfpSpecs.size > 0 ? (matchedParams.length / rfpSpecs.size) * 100 : 100;
              return { ...sku, matchPercentage };
          }).sort((a, b) => b.matchPercentage - a.matchPercentage);

          if (skuRecommendations.length === 0) throw new Error(`No active/compliant SKUs found for ${product.name}.`);
          const selectedSku = skuRecommendations[0];

          const complianceChecks = (product.requiredStandards || []).map(standard => {
              const skuStandard = selectedSku.specification['Standard'] || '';
              let status: 'Found' | 'Referenced' | 'NotFound' = 'NotFound';
              let source = 'Manual verification required';
              if (skuStandard.toLowerCase().includes(standard.toLowerCase().split(':')[0])) { status = 'Found'; source = 'Available in Store Spec Sheet'; }
              else if (standard.toLowerCase().includes('spec')) { status = 'Referenced'; source = 'ATC-mapped'; }
              else if (/\d{5,}/.test(standard) && !standard.toLowerCase().includes('is')) { status = 'Found'; source = `GSRTC Code ${standard.match(/\d+/)?.[0]}`; }
              return { standard, status, source, verified: false };
          });

          lineItemAnalyses.push({ rfpLineItem: product, top3Recommendations: skuRecommendations.slice(0, 3), selectedSku, complianceChecks });
          addLog('TECHNICAL_AGENT', `Best fit for ${product.name}: SKU ${selectedSku.skuId} with ${selectedSku.matchPercentage?.toFixed(0)}% match.`);
      }

      const technicalAnalysis = { lineItemAnalyses };
      updateRfpState(currentRfpId, { agentOutputs: { technicalAnalysis } });
      addLog('TECHNICAL_AGENT', 'All line items analyzed.');

      await new Promise(resolve => setTimeout(resolve, 500));
      updateRfpState(currentRfpId, { activeAgent: 'PRICING_AGENT' });
      addLog('PRICING_AGENT', 'Agent invoked. Starting financial calculation for all line items.');

      let totalMaterialCost = 0, totalTransportCost = 0, totalBrokerageCost = 0;
      const consigneePin = parsedData.consignee.match(/PIN-?(\d{6})/)?.[1] || '770076';
      const consigneeLocation = CONSIGNEE_LOCATIONS[consigneePin];

      for (const analysis of technicalAnalysis.lineItemAnalyses) {
          const { rfpLineItem, selectedSku } = analysis;
          const quantity = rfpLineItem.quantity;
          const pricePerUnit = quantity >= 5 ? selectedSku.bulkSalesPrice : selectedSku.unitSalesPrice;
          const materialCost = pricePerUnit * quantity;
          totalMaterialCost += materialCost;
          if (consigneeLocation) {
              const distance = getDistanceFromLatLonInKm(selectedSku.warehouseLat, selectedSku.warehouseLon, consigneeLocation.lat, consigneeLocation.lon);
              totalTransportCost += distance * TRUCK_COST_PER_KM[selectedSku.truckType] * TRANSPORT_COST_ADJUSTMENT_FACTOR;
          }
          totalBrokerageCost += materialCost * ((selectedSku.brokerage || 0) / 100);
      }
      
      const testingCost = 2500;
      const subtotal = totalMaterialCost + totalTransportCost + testingCost + totalBrokerageCost;
      const firstSkuGstRate = technicalAnalysis.lineItemAnalyses[0]?.selectedSku.gstRate || 18;
      const gst = subtotal * (firstSkuGstRate / 100);
      const finalBidValue = subtotal + gst;
      
      const pricing = { 'Total Material Cost': totalMaterialCost, 'Total Transportation Cost': totalTransportCost, 'Testing Costs': testingCost, 'Total Brokerage': totalBrokerageCost, 'Subtotal': subtotal, [`GST (approx. ${firstSkuGstRate}%)`]: gst, 'Final Bid Value': finalBidValue };
      addLog('PRICING_AGENT', `Total pricing calculated. Final bid value: ${finalBidValue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}`, pricing);
      
      addLog('PRICING_AGENT', 'Starting risk and assumption analysis.');
      const riskAnalysisSet = new Set<string>();
      const riskAnalysis: Rfp['agentOutputs']['riskAnalysis'] = [];
      const addRisk = (risk: Rfp['agentOutputs']['riskAnalysis'][0]) => !riskAnalysisSet.has(risk.statement) && riskAnalysisSet.add(risk.statement) && riskAnalysis.push(risk);

      if (totalTransportCost < totalMaterialCost * 0.05) addRisk({ category: 'Logistics', statement: 'Transport cost assumes warehouse proximity; verify for remote/challenging sites.', riskLevel: 'Low' });
      if (parsedData.eligibilityCriteria?.sampleApprovalClause) addRisk({ category: 'Compliance', statement: 'Delivery timeline is subject to delays from the sample approval process.', riskLevel: 'Medium' });
      if (parsedData.eligibilityCriteria?.optionClause) addRisk({ category: 'Financial', statement: `Option clause detected ("${parsedData.eligibilityCriteria.optionClause}"). This may impact final quantity and value.`, riskLevel: 'Medium' });
      if (parsedData.mandatoryDocuments?.length) addRisk({ category: 'Compliance', statement: 'All mandatory documents require manual verification and attachment before final submission.', riskLevel: 'Medium' });
      
      for (const analysis of technicalAnalysis.lineItemAnalyses) {
          const { selectedSku } = analysis;
          const deliveryDays = parsedData.metadata.deliveryDays;
          if (deliveryDays && selectedSku.leadTime > deliveryDays) {
              addRisk({ category: 'Logistics', statement: `Potential timeline conflict for ${selectedSku.productName}: SKU lead time (${selectedSku.leadTime} days) exceeds required delivery of ${deliveryDays} days.`, riskLevel: 'High' });
          }
      }
      addLog('PRICING_AGENT', `Risk analysis complete. Identified ${riskAnalysis.length} key points.`);

      updateRfpState(currentRfpId, { agentOutputs: { pricing, riskAnalysis } });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateRfpState(currentRfpId, { activeAgent: 'FINALIZING_AGENT' });
      addLog('FINALIZING_AGENT', 'Compiling all agent outputs into final report.');
      await new Promise(resolve => setTimeout(resolve, 800));
      addLog('FINALIZING_AGENT', 'Final report compiled.');
      
      const durationInSeconds = Math.round((Date.now() - startTime) / 1000);
      updateRfpState(currentRfpId, { status: 'Complete', activeAgent: undefined, processingDuration: durationInSeconds });
      addLog('SYSTEM', `All agents completed. RFP: ${currentRfpId} is ready for review.`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog('SYSTEM', `Processing failed for RFP ${currentRfpId}: ${errorMessage}`, error);
      const durationInSeconds = Math.round((Date.now() - startTime) / 1000);
      updateRfpState(currentRfpId, { status: 'Error', processingDuration: durationInSeconds });
    }
  };

  const addRfp = (newRfpData: { source: 'URL' | 'File'; content: string; fileName?: string }) => {
    const tempId = `TDR-${Date.now()}`;
    const newRfp: Rfp = {
      id: tempId,
      organisation: 'Parsing...',
      bidType: 'Parsing...',
      closingDate: new Date(),
      status: 'Pending',
      rawDocument: newRfpData.content,
      source: newRfpData.source,
      fileName: newRfpData.fileName,
      agentOutputs: {},
    };
    setRfps(prev => [newRfp, ...prev]);
    addLog('SYSTEM', `New RFP ingested from ${newRfp.source}${newRfp.fileName ? ` (${newRfp.fileName})` : ''}.`);
    handleStartProcessing(tempId, newRfp);
  };

  const handleStartProcessing = (rfpId: string, rfpObject?: Rfp) => {
    setProcessingStartTime(new Date());
    setSelectedRfpId(rfpId);
    setCurrentView('processing');
    processRfp(rfpId, rfpObject);
  }

  const handleViewAnalysis = (rfpId: string) => {
    setSelectedRfpId(rfpId);
    setCurrentView('analysis');
  }

  const handleBackToList = () => {
    setSelectedRfpId(null);
    setCurrentView('rfps');
    setProcessingStartTime(null);
  }
  
  const selectedRfp = rfps.find(r => r.id === selectedRfpId);

  const renderContent = () => {
    switch (currentView) {
      case 'store':
        return <StoreScreen inventory={inventory} setInventory={setInventory} />;
      case 'config':
        return <ConfigScreen config={config} setConfig={setConfig} />;
      case 'logs':
        return <LogScreen logs={logs} />;
      case 'processing': {
        const processingLogs = logs.filter(log => processingStartTime && log.timestamp >= processingStartTime);
        return selectedRfp ? <ProcessingScreen rfp={selectedRfp} logs={processingLogs} onViewResults={() => handleViewAnalysis(selectedRfp.id)} onBack={handleBackToList} processingStartTime={processingStartTime} /> : <RfpListScreen rfps={rfps} onProcessRfp={addRfp} onViewAnalysis={handleViewAnalysis} onProcessExistingRfp={handleStartProcessing} />;
      }
      case 'analysis':
        return selectedRfp ? <AnalysisScreen rfp={selectedRfp} onBack={handleBackToList}/> : <RfpListScreen rfps={rfps} onProcessRfp={addRfp} onViewAnalysis={handleViewAnalysis} onProcessExistingRfp={handleStartProcessing} />;
      case 'rfps':
      default:
        return <RfpListScreen rfps={rfps} onProcessRfp={addRfp} onViewAnalysis={handleViewAnalysis} onProcessExistingRfp={handleStartProcessing} />;
    }
  };

  return (
    <div className="min-h-screen font-sans">
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      <main className="p-4 md:p-6 lg:p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;