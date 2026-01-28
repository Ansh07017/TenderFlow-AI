import { Rfp } from '../types';

const today = new Date();
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// This content now simulates a government tender for paints.
export const rfpDoc_CPWD_Exterior = `
Central Public Works Department - Notice Inviting Tender

--- BID DETAILS ---
Bid Number: CPWD/GGN/2026/B/987654
Dated: 02-01-2026
Bid End Date/Time: 28-01-2026 17:00:00
Bid Opening Date/Time: 28-01-2026 17:30:00
Bid Offer Validity: 180 (Days)
Type of Bid: Two Packet Bid

--- ORGANIZATION DETAILS ---
Ministry/State Name: Ministry of Housing and Urban Affairs
Department Name: Central Public Works Department (CPWD)
Organisation Name: CPWD, Gurgaon Division
Office Name: Project Engineer Office, Sector 34, Gurgaon

--- ITEM DETAILS ---
Total Quantity: 1500
Item Category: Premium Acrylic Exterior Emulsion Paint
Make: Asian Paints / Berger / Nerolac or equivalent
Experience Relaxation for MSE: Yes
Experience Relaxation for Startup: No

--- DOCUMENT REQUIREMENTS ---
Document required from seller: Certificate (IS 15489 Compliance), OEM Authorization Certificate, Past Performance Certificate

--- FINANCIAL DETAILS ---
ePBG Percentage(%): 3.00
Duration of ePBG required (Months): 12
Evaluation Method: Item-wise evaluation
Payment Terms: 100% payment after joint measurement and acceptance of work.

--- CONSIGNEE DETAILS ---
Consignee/Reporting Officer: Project Director, CPWD
Address: CPWD Project Site, DLF Cyber City Complex, Phase III, Gurgaon, Haryana-122002
PIN: 122002
Quantity: 1500 Litres
Delivery Days: 45

--- TECHNICAL SPECIFICATIONS ---
- Product: Apex Ultima Protek or Technically Equivalent
- Finish: Rich Matt
- Base: Water-based
- Required Coverage: Minimum 8 SqM per Litre for two coats
- Durability: Minimum 10 years warranty for paint film integrity
- Standard Compliance: Must comply with IS 15489 for exterior paints.
- Application Area: Exterior Concrete Walls

--- BUYER ADDED TERMS & CONDITIONS (ATC) ---
1. Scope of Supply: Supply of specified paint in 20L sealed containers. Price to include all cost components including delivery to site.
2. Certificates: Bidder must upload test certificates from NABL accredited lab for IS 15489 compliance.
3. Warranty: A 10-year comprehensive warranty certificate must be provided.
4. Only OEM or their authorized dealers are eligible to participate.

`;

export const rfpDoc_MES_Epoxy = `
Military Engineer Services - E-Tender Notice

Bid Number: MES/PUNE/2026/B/112233
Item Description: Supply of Heavy Duty Epoxy Floor Coating
Quantity: 5000 Litres
Bid Type: Single Packet Bid
Bid End Date: 15-02-2026 18:00:00
Offer Validity: 120 Days
ePBG: 5.00%
Payment Terms: As per MES Standard Conditions of Contract
Consignee: Garrison Engineer (Air Force), Air Force Station Lohegaon, Pune, Maharashtra - 411032
Technical Specs:
- Type: Two-component, solvent-based epoxy floor coating
- Finish: High Gloss
- Abrasion Resistance: Excellent, as per ASTM D4060
- Chemical Resistance: Resistant to Skydrol, ATF, and common industrial chemicals.
- Application: Aircraft Hangar Floor
- Standard: Must meet IS 15283 specifications.
Documents Required: OEM Authorization, Past supply record to Defence establishments, NABL lab test reports.
`;

export const rfpDoc_Prestige_Interior = `
Prestige Group - Request for Quotation

RFQ Number: PRESTIGE/FALCON/2026/RFQ/101
Project Name: Prestige Falcon City - Phase III Interiors
Item Description: Supply of Premium Interior Emulsion & Enamel Paints
Bid End Date: 22-02-2026 15:00:00
Bid Type: Two Packet Bid
Offer Validity: 90 Days
Consignee: Project Manager, Prestige Falcon City, Kanakapura Road, Bangalore, Karnataka-560062
Items:
1. Royale Matt Luxury Emulsion (or equivalent) - 10000 Litres
2. Apcolite Premium Satin Enamel (or equivalent) - 2000 Litres
Technical Specs:
- Emulsion: Low VOC (Green Building Compliant), Anti-Bacterial, High Washability.
- Enamel: High Gloss, Non-yellowing, for wooden doors and trim.
Documents Required: Green Building Product Certificate (LEED/IGBC), Shade Card approvals from architect, Company financial statements.
`;

export const rfpDoc_LT_Industrial = `
Larsen & Toubro - Infrastructure Division - Vendor Enquiry

Enquiry No: LNT/INFRA/BRIDGE/PU/2026/045
Item: High Performance Aliphatic Polyurethane (PU) Topcoat
Quantity: 8000 Litres
Closing Date: 05-03-2026 17:00:00
Bid Type: Single Packet Bid
Offer Validity: 120 days
Consignee: L&T Chenab Bridge Project Site, Kauri, Jammu & Kashmir
Technical Specs:
- Base: Aliphatic Polyurethane
- Properties: Excellent UV resistance, corrosion resistance, and gloss retention.
- Application: Final topcoat for structural steel of bridge superstructure.
- Standard: Must comply with SSPC-Paint 36 Level 3.
- Warranty: 15-year performance warranty required.
Documents Required: NACE/FROSIO certified inspector report for previous projects, Detailed application methodology, 15-year warranty certificate draft.
`;

export const rfpDoc_Godrej_Waterproofing = `
Godrej Properties Ltd - Material Procurement Tender

Tender ID: GPL/KOL/WTRPRF/2026/78
Item: Elastomeric Liquid Waterproofing Membrane
Quantity: 7500 Litres
Bid End Date: 12-02-2026 14:00:00
Bid Type: Two Packet Bid
Offer Validity: 90 days
Consignee: Godrej Waterside IT Park, Salt Lake Sector V, Kolkata, West Bengal - 700091
Technical Specs:
- Type: Fibre-reinforced elastomeric liquid waterproofing membrane.
- Elongation: Minimum 400%
- Application: Concrete roofs, terraces, and podiums.
- Standard: Must meet ASTM D6083 standards.
Documents Required: Product Technical Data Sheet (PDS), Material Safety Data Sheet (MSDS), past project completion certificates for similar applications.
`;

export const rfpDocumentContent = rfpDoc_CPWD_Exterior;

export const initialRfpList: Rfp[] = [
  {
    id: 'CPWD/GGN/2026/B/987654',
    organisation: 'CPWD, Gurgaon Division',
    bidType: 'Two Packet Bid',
    closingDate: new Date('2026-01-28T17:00:00'),
    status: 'Pending',
    rawDocument: rfpDoc_CPWD_Exterior,
    source: 'File',
    fileName: 'CPWD-Paint-Tender.pdf',
    agentOutputs: {},
  },
  {
    id: 'MES/PUNE/2026/B/112233',
    organisation: 'Military Engineer Services, Pune',
    bidType: 'Single Packet Bid',
    closingDate: addDays(today, 25),
    status: 'Pending',
    rawDocument: rfpDoc_MES_Epoxy,
    source: 'URL',
    fileName: 'https://mes.gov.in/tenders/pune-112233',
    agentOutputs: {},
  },
  {
    id: 'PRESTIGE/FALCON/2026/RFQ/101',
    organisation: 'Prestige Group, Bangalore',
    bidType: 'Two Packet Bid',
    closingDate: addDays(today, 32),
    status: 'Pending',
    rawDocument: rfpDoc_Prestige_Interior,
    source: 'File',
    fileName: 'Prestige-Falcon-Interiors.pdf',
    agentOutputs: {},
  },
  {
    id: 'LNT/INFRA/BRIDGE/PU/2026/045',
    organisation: 'L&T Infrastructure',
    bidType: 'Single Packet Bid',
    closingDate: addDays(today, 45),
    status: 'Pending',
    rawDocument: rfpDoc_LT_Industrial,
    source: 'URL',
    fileName: 'https://larsentoubro.com/vendor/enq-045',
    agentOutputs: {},
  },
  {
    id: 'GPL/KOL/WTRPRF/2026/78',
    organisation: 'Godrej Properties, Kolkata',
    bidType: 'Two Packet Bid',
    closingDate: addDays(today, 22),
    status: 'Pending',
    rawDocument: rfpDoc_Godrej_Waterproofing,
    source: 'File',
    fileName: 'Godrej-Waterproofing-RFQ.pdf',
    agentOutputs: {},
  },
];