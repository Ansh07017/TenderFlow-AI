
import { AppConfig } from '../types';

export const initialConfig: AppConfig = {
  companyDetails: {
    companyName: 'Asian Paints Limited',
    companyAddress: '6A, Shantinagar, Santacruz (E), Mumbai - 400 055, India',
    gstin: '27AAACA5566G1Z5',
    pan: 'AAACA5566G',
  },
  signingAuthorities: [
    {
      id: 'DIR-001',
      name: 'R Seshasayee',
      designation: 'Chairman',
      din: '00015522',
    },
    {
      id: 'DIR-002',
      name: 'Amit Syngle',
      designation: 'Managing Director & CEO',
      din: '01516169',
    },
  ],
};
