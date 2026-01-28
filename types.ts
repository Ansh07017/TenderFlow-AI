
export type AgentName = 'MASTER_AGENT' | 'SALES_AGENT' | 'PARSING_ENGINE' | 'TECHNICAL_AGENT' | 'PRICING_AGENT' | 'EXTRACTOR' | 'FINALIZING_AGENT';

export interface LogEntry {
  timestamp: Date;
  agent: AgentName | 'SYSTEM';
  message: string;
  data?: string;
}

export type TruckType = 'MINI_TRUCK' | 'LCV' | 'MEDIUM_TRUCK' | 'HEAVY_TRUCK';

export interface SKU {
  skuId: string;
  productName: string;
  productCategory: string;
  productSubCategory: string;
  oemBrand: string;
  specification: Record<string, string>;
  availableQuantity: number;
  warehouseLocation: string; // "City, ST"
  warehouseCode: string;
  warehouseLat: number;
  warehouseLon: number;
  truckType: TruckType;
  leadTime: number; // in days
  costPrice: number;
  unitSalesPrice: number;
  bulkSalesPrice: number;
  gstRate: number; // in percent
  brokerage?: number; // optional
  minMarginPercent: number;
  isActive: boolean;
  isCustomMadePossible: boolean;
  isComplianceReady: boolean;
  matchPercentage?: number;
}

export interface RfpProductLineItem {
    name: string;
    quantity: number;
    technicalSpecs: string[];
    requiredStandards?: string[];
}

export interface ParsedRfpData {
  metadata: {
    bidNumber: string;
    issuingOrganization: string;
    bidType: string;
    bidEndDate: string;
    offerValidity: number; // days
    deliveryDays?: number;
  };
  products: RfpProductLineItem[];
  mandatoryDocuments: string[];
  financialConditions: {
    epbg: string;
    paymentTerms: string;
  };
  eligibilityCriteria?: {
    localSupplierClass?: string;
    turnoverRequirement?: string;
    qualityCertifications?: string[];
    sampleApprovalClause?: string;
    optionClause?: string;
  };
  consignee: string;
}

export interface LineItemTechnicalAnalysis {
    rfpLineItem: RfpProductLineItem;
    top3Recommendations: SKU[];
    selectedSku: SKU;
    complianceChecks: {
        standard: string;
        status: 'Found' | 'Referenced' | 'NotFound';
        source: string;
        verified: boolean;
    }[];
}

export interface Rfp {
  id: string;
  organisation: string;
  bidType: string;
  closingDate: Date;
  status: 'Pending' | 'Extracting' | 'Parsing' | 'Processing' | 'Complete' | 'Error';
  rawDocument: string;
  source: 'URL' | 'File';
  fileName?: string;
  ingestionStatus?: {
      detected: boolean;
      encodingWarning: boolean;
      ocrFallback: boolean;
      extracted: boolean;
  };
  agentOutputs: {
    parsedData?: ParsedRfpData;
    eligibilityAnalysis?: {
      criterion: string;
      statusText: string;
      status: 'Pass' | 'Warn' | 'Info' | 'Fail';
    }[];
    technicalAnalysis?: {
      lineItemAnalyses: LineItemTechnicalAnalysis[];
    };
    pricing?: Record<string, number>;
    riskAnalysis?: {
      category: 'Logistics' | 'Compliance' | 'Financial' | 'Technical';
      statement: string;
      riskLevel: 'Low' | 'Medium' | 'High';
    }[];
  };
  activeAgent?: AgentName;
  processingDuration?: number; // in seconds
}

// --- App Configuration Types ---

export interface CompanyConfig {
  companyName: string;
  companyAddress: string;
  gstin: string;
  pan: string;
}

export interface SigningAuthority {
  id: string;
  name: string;
  designation: string;
  din: string;
}

export interface AppConfig {
  companyDetails: CompanyConfig;
  signingAuthorities: SigningAuthority[];
}
