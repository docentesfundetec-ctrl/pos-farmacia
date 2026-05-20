/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, ProductClass } from '../types';

export const INITIAL_INVENTORY: Product[] = [
  {
    id: 'prod_ibu400',
    name: 'Ibuprofeno Mk 400mg',
    genericName: 'Ibuprofeno',
    dosage: '400mg',
    presentation: 'Caja x 20 tabletas',
    price: 6500,
    stock: 25,
    barcode: '7701234560012',
    category: ProductClass.OTC,
    shelfLocation: 'Estante A-1',
    expirationDate: '12/2028',
    batchNumber: 'IBU-9902'
  },
  {
    id: 'prod_para500',
    name: 'Paracetamol Genfar 500mg',
    genericName: 'Paracetamol',
    dosage: '500mg',
    presentation: 'Caja x 30 tabletas',
    price: 4000,
    stock: 40,
    barcode: '7701234560029',
    category: ProductClass.OTC,
    shelfLocation: 'Estante A-2',
    expirationDate: '09/2027',
    batchNumber: 'PAR-4412'
  },
  {
    id: 'prod_amox500',
    name: 'Amoxicilina Sandoz 500mg',
    genericName: 'Amoxicilina',
    dosage: '500mg',
    presentation: 'Caja x 15 cápsulas',
    price: 12500,
    stock: 18,
    barcode: '7701234560036',
    category: ProductClass.RX,
    shelfLocation: 'Estante B-1 (Antibióticos)',
    expirationDate: '10/2027',
    batchNumber: 'AMX-0051'
  },
  {
    id: 'prod_clona2',
    name: 'Clonazepam Roche 2mg',
    genericName: 'Clonazepam',
    dosage: '2mg',
    presentation: 'Caja x 30 comprimidos',
    price: 28000,
    stock: 10,
    barcode: '7701234560043',
    category: ProductClass.CONTROLLED,
    shelfLocation: 'Gabinete de Seguridad (Caja Fuerte)',
    expirationDate: '08/2027',
    batchNumber: 'CLO-4012'
  },
  {
    id: 'prod_lantus',
    name: 'Insulina Lantus Solofastar 100 UI',
    genericName: 'Insulina Glargina',
    dosage: '100 UI/ml',
    presentation: 'Caja x 5 plumas prellenadas',
    price: 85000,
    stock: 8,
    barcode: '7701234560050',
    category: ProductClass.COLD_CHAIN,
    shelfLocation: 'Refrigerador de Medicamentos',
    expirationDate: '03/2027',
    batchNumber: 'LAN-3321',
    requiresThermalBag: true
  },
  {
    id: 'prod_met500',
    name: 'Metformina Tecnoquímicas 500mg',
    genericName: 'Metformina',
    dosage: '500mg',
    presentation: 'Caja x 30 tabletas',
    price: 15000,
    stock: 30,
    barcode: '7701234560067',
    category: ProductClass.RX,
    shelfLocation: 'Estante C-2',
    expirationDate: '11/2027',
    batchNumber: 'MET-5001'
  },
  {
    id: 'prod_met1000',
    name: 'Metformina Tecnoquímicas 1000mg',
    genericName: 'Metformina',
    dosage: '1000mg',
    presentation: 'Caja x 30 tabletas',
    price: 22500,
    stock: 15,
    barcode: '7701234560074',
    category: ProductClass.RX,
    shelfLocation: 'Estante C-2',
    expirationDate: '01/2028',
    batchNumber: 'MET-1002'
  },
  {
    id: 'prod_losa50',
    name: 'Losartán Coaspharma 50mg',
    genericName: 'Losartán Potásico',
    dosage: '50mg',
    presentation: 'Caja x 30 tabletas',
    price: 18000,
    stock: 22,
    barcode: '7701234560081',
    category: ProductClass.RX,
    shelfLocation: 'Estante D-1',
    expirationDate: '07/2028',
    batchNumber: 'LOS-8890'
  },
  {
    id: 'prod_lipitor20',
    name: 'Lipitor Pfizer 20mg (Marca)',
    genericName: 'Atorvastatina',
    dosage: '20mg',
    presentation: 'Caja x 30 tabletas de marca',
    price: 45000,
    stock: 12,
    barcode: '7701234560098',
    category: ProductClass.RX,
    shelfLocation: 'Estante D-4 (Especialidades)',
    expirationDate: '06/2028',
    batchNumber: 'LIP-0129'
  },
  {
    id: 'prod_atorva20',
    name: 'Atorvastatina Genfar 20mg (Genérico)',
    genericName: 'Atorvastatina',
    dosage: '20mg',
    presentation: 'Caja x 30 tabletas genéricas',
    price: 12000,
    stock: 35,
    barcode: '7701234560104',
    category: ProductClass.RX,
    shelfLocation: 'Estante D-4 (Genéricos)',
    expirationDate: '09/2027',
    batchNumber: 'ATO-7761'
  },
  {
    id: 'prod_salbu100',
    name: 'Salbutamol Glaxo 100mcg',
    genericName: 'Salbutamol',
    dosage: '100mcg',
    presentation: 'Inhalador de 200 dosis',
    price: 14200,
    stock: 20,
    barcode: '7701234560111',
    category: ProductClass.RX,
    shelfLocation: 'Estante B-3 (Respiratorio)',
    expirationDate: '04/2028',
    batchNumber: 'SAL-0542'
  }
];
