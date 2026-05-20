/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum ProductClass {
  OTC = 'Venta Libre (OTC)',
  RX = 'Bajo Receta (Rx)',
  CONTROLLED = 'Receta Controlada/Psicotrópico',
  COLD_CHAIN = 'Cadena de Frío (Refrigerado)'
}

export interface Product {
  id: string;
  name: string;
  genericName: string;
  dosage: string;
  presentation: string; // e.g. "Caja x 30 comprimidos", "Frasco 120ml"
  price: number;
  stock: number;
  barcode: string;
  category: ProductClass;
  shelfLocation: string; // e.g. "Estante A-3", "Refrigerador", "Caja Fuerte"
  expirationDate: string; // "MM/YYYY" e.g. "08/2027"
  batchNumber: string;
  requiresThermalBag?: boolean;
}

export interface Prescription {
  id: string;
  patientName: string;
  patientID: string;
  doctorName: string;
  doctorLicense: string;
  date: string; // "YYYY-MM-DD"
  medicationName: string;
  dosage: string;
  quantity: number;
  controlStamp: boolean; // Must be stamped for controlled drugs
  isForged?: boolean;
  forgeryReason?: string;
}

export interface InsuranceCard {
  provider: string; // e.g. "Seguro Medifar", "EcoSalud", "Plan Vital"
  policyNumber: string;
  patientName: string;
  patientID: string;
  copayPercentage: number; // e.g. 70 means insurance pays 70%, patient pays 30%
  isValid: boolean;
  expirationDate: string; // "YYYY-MM-DD"
}

export interface PhysicalID {
  name: string;
  idNumber: string;
  birthDate: string;
  gender: string;
}

export interface CustomerCase {
  id: string;
  name: string;
  avatarUrl?: string;
  avatarSeed: string; // seed for simple geometric/initial avatar design
  dialogSpeech: string;
  dialogReviewText: string; // text when reviewing documents
  prescription?: Prescription;
  insuranceCard?: InsuranceCard;
  physicalID?: PhysicalID;
  presentedBoxId: string; // product ID in inventory that the customer physically hands over, if any
  presentedBoxExpiry: string; // customized expiry on customer's physical box (could be expired!)
  presentedBoxBatch: string; // customized batch
  requiresGenericSubstitutionSuggestion?: boolean;
  isNervous?: boolean;
  correctAction: 'sell' | 'reject_expired_recipe' | 'reject_expired_med' | 'reject_wrong_dosage' | 'reject_no_recipe' | 'reject_missing_stamp' | 'reject_id_mismatch' | 'reject_forgery';
  reasonDescription: string; // educational text explaining the correct protocol
  pointsWorth: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  customerName: string;
  success: boolean;
  penaltyType?: 'grave' | 'leve' | 'excelente';
  message: string;
  scoreImpact: number;
  cashImpact: number;
}

export interface TicketItem {
  product: Product;
  quantity: number;
  originalPrice: number;
  insuranceDiscount: number; // actual currency discount applied
  finalPrice: number;
}

export interface BillCoin {
  value: number;
  label: string;
  type: 'bill' | 'coin';
}

export const formatCOP = (v: number): string => {
  return '$' + Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\n))/g, '.');
};
