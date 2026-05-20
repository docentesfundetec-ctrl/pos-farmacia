/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CustomerCase } from '../types';

export const SCENARIOS: CustomerCase[] = [
  {
    id: 'case_01',
    name: 'Andrés Mendoza',
    avatarSeed: 'andres',
    dialogSpeech: 'Hola. Vengo con un dolor de cabeza tremendo desde ayer. Me dijeron que el Ibuprofeno de 400mg sirve. ¿Me puede dar una caja, por favor?',
    dialogReviewText: 'Estuve trabajando bajo el sol... solo quiero tomarme algo para la migraña. No tengo receta pero me dijeron que es de venta libre.',
    presentedBoxId: 'prod_ibu400',
    presentedBoxExpiry: '12/2028',
    presentedBoxBatch: 'IBU-9902',
    correctAction: 'sell',
    reasonDescription: 'El Ibuprofeno de 400mg es clasificado como Medicamento de Venta Libre (OTC). No exige receta médica, y la fecha de vencimiento física (12/2028) es correcta.',
    pointsWorth: 100
  },
  {
    id: 'case_02',
    name: 'Marta Lucía Gómez',
    avatarSeed: 'marta',
    dialogSpeech: 'Buenos días joven. Vengo a reclamar mi Amoxicilina de 500mg contra la infección de garganta. Aquí le entrego la receta del médico.',
    dialogReviewText: '¿Hay algún problema con el papel? El doctor me la dio hace unos meses pero no me la había tomado porque me sentí mejor... pero ahora me volvió el dolor.',
    prescription: {
      id: 'rec_amox_expired',
      patientName: 'Marta Lucía Gómez',
      patientID: 'CC 41.920.332',
      doctorName: 'Dr. Alejandro Restrepo',
      doctorLicense: 'RM-998821',
      date: '2025-11-15', // Expired! Current date is May 20, 2026 (more than 30 days)
      medicationName: 'Amoxicilina 500mg',
      dosage: '500mg',
      quantity: 1,
      controlStamp: false
    },
    presentedBoxId: 'prod_amox500',
    presentedBoxExpiry: '10/2027',
    presentedBoxBatch: 'AMX-0051',
    correctAction: 'reject_expired_recipe',
    reasonDescription: 'La receta de Amoxicilina (un antibiótico) tiene fecha del 15 de Noviembre de 2025. Al estar en Mayo de 2026, supera por mucho el límite de validez de 30 días para recetas de antibióticos. Debe rechazarse para evitar superbacterias y exigir receta nueva.',
    pointsWorth: 150
  },
  {
    id: 'case_03',
    name: 'Carlos Estupiñán',
    avatarSeed: 'carlos',
    dialogSpeech: 'Buenas tardes. Mi doctor de control me mandó Metformina para el azúcar alto. Presento esta caja que tengo en la mano para registrarla, y mi respectiva receta.',
    dialogReviewText: 'Mire el papel, ahí dice todo. El doctor me recomendó mucho tomarme esto todos los días sin falta.',
    prescription: {
      id: 'rec_met_diff_dose',
      patientName: 'Carlos Estupiñán',
      patientID: 'CC 79.881.002',
      doctorName: 'Dra. María Camila Pérez',
      doctorLicense: 'RM-331201',
      date: '2026-05-18', // Valid (current date is May 20, 2026)
      medicationName: 'Metformina Tecnoquímicas 500mg',
      dosage: '500mg', // Note: Recipe says 500mg
      quantity: 1,
      controlStamp: false
    },
    presentedBoxId: 'prod_met1000', // Note: Customer presents the 1000mg box! Discrepancy!
    presentedBoxExpiry: '01/2028',
    presentedBoxBatch: 'MET-1002',
    correctAction: 'reject_wrong_dosage',
    reasonDescription: 'Discrepancia en la dosificación: La receta ordena explícitamente "Metformina 500mg", pero la caja presentada en mostrador es de "Metformina 1000mg". Despacharlo sería sobredosificar gravemente al paciente diabético.',
    pointsWorth: 150
  },
  {
    id: 'case_04',
    name: 'Helena Restrepo',
    avatarSeed: 'helena',
    dialogSpeech: 'Hola señor. Requiero llevar una cajita de Paracetamol de 500mg. Encontré esta en la cesta de ofertas del mostrador principal. ¿Me la cobra?',
    dialogReviewText: 'Era la última caja que quedaba en ese montón de promoción. Espero que me la pueda registrar rápido porque voy de afán.',
    presentedBoxId: 'prod_para500',
    presentedBoxExpiry: '03/2026', // Expired! Current date is May 20, 2026.
    presentedBoxBatch: 'PAR-4412',
    correctAction: 'reject_expired_med',
    reasonDescription: 'El empaque del Paracetamol presentado indica vencimiento en "03/2026" (Marzo de 2026), pero hoy es Mayo de 2026. Vender medicamentos vencidos es un delito contra la salud pública y causal de clausura de la farmacia.',
    pointsWorth: 180
  },
  {
    id: 'case_05',
    name: 'Jorge Eliécer Cruz',
    avatarSeed: 'jorge',
    dialogSpeech: 'Buenas noches, amigo del POS. Vengo con mucha urgencia y un dolor terrible porque sufro de crisis de ansiedad extrema. El psiquiatra me recetó Clonazepam 2mg. Aquí tengo el papel.',
    dialogReviewText: 'Por favor, registre el Clonazepam de 2mg rápido. La ansiedad está insoportable. Le entrego mi cédula de ciudadanía.',
    prescription: {
      id: 'rec_clona_nocontrol',
      patientName: 'Jorge Eliécer Cruz',
      patientID: 'CC 80.112.544',
      doctorName: 'Dr. Fernando Restrepo (Psiquiatra)',
      doctorLicense: 'RM-102941',
      date: '2026-05-19', // Valid date
      medicationName: 'Clonazepam Roche 2mg',
      dosage: '2mg',
      quantity: 1,
      controlStamp: false // Controlled psychotropic, but lacks the Required "Sello de Control de Medicamentos Especiales"!
    },
    physicalID: {
      name: 'Jorge Eliécer Cruz',
      idNumber: 'CC 80.112.544',
      birthDate: '1978-04-12',
      gender: 'Masculino'
    },
    presentedBoxId: 'prod_clona2',
    presentedBoxExpiry: '08/2027',
    presentedBoxBatch: 'CLO-4012',
    correctAction: 'reject_missing_stamp',
    reasonDescription: 'El Clonazepam es una benzodiacepina (psicotrópico controlado). Por ley estricta del fondo nacional de estupefacientes, estas recetas DEBEN estar marcadas/selladas con el "Sello de Control de Sustancias Fiscalizadas". Como no lo tiene, venderlo violaría la ley penal.',
    pointsWorth: 200
  },
  {
    id: 'case_06',
    name: 'Laura Sofía Pinzón',
    avatarSeed: 'laura',
    dialogSpeech: 'Hola. Vengo a retirar mi dosis mensual de Atorvastatina de 20mg. Tengo convenio con mi seguro médico "Seguro Medifar". Me dijeron que me cubre el 70% del valor comercial.',
    dialogReviewText: 'Tengo mi carnet del Seguro Medifar y mi receta médica al día. Revise las compensaciones de copago en el sistema POS.',
    prescription: {
      id: 'rec_atorva_copay',
      patientName: 'Laura Sofía Pinzón',
      patientID: 'CC 1.018.441.992',
      doctorName: 'Dr. Samuel Bermúdez',
      doctorLicense: 'RM-81123',
      date: '2026-05-10',
      medicationName: 'Atorvastatina Genfar 20mg (Genérico)',
      dosage: '20mg',
      quantity: 1,
      controlStamp: false
    },
    insuranceCard: {
      provider: 'Seguro Medifar',
      policyNumber: 'MED-99211029',
      patientName: 'Laura Sofía Pinzón',
      patientID: 'CC 1.018.441.992',
      copayPercentage: 70, // 70% discount
      isValid: true,
      expirationDate: '2027-12-31'
    },
    presentedBoxId: 'prod_atorva20',
    presentedBoxExpiry: '09/2027',
    presentedBoxBatch: 'ATO-7761',
    correctAction: 'sell', // All good! Require apply insurance discount
    reasonDescription: 'Venta regular con seguro de salud (Copago). Se debe cotejar que el ID del carnet coincida con el paciente, aplicar el 70% de descuento en el terminal POS, y cobrar el 30% restante.',
    pointsWorth: 180
  },
  {
    id: 'case_07',
    name: 'Mauricio Valencia',
    avatarSeed: 'mauricio',
    dialogSpeech: 'Qué tal cajero. Vengo a comprar la Insulina Lantus para mi abuela. Ella es diabética insulina-dependiente. Aquí está la receta médica.',
    dialogReviewText: 'Dijo el doctor que es sumamente vital que regrese directo a casa tras comprarla por lo de la cadena de frío... ¿ustedes proveen la bolsa protectora verdad?',
    prescription: {
      id: 'rec_insulin_ok',
      patientName: 'Ana Lucía de Valencia', // Grandmother
      patientID: 'CC 24.312.019',
      doctorName: 'Dr. Ricardo Vallejo',
      doctorLicense: 'RM-449102',
      date: '2026-05-15',
      medicationName: 'Insulina Lantus Solofastar 100 UI',
      dosage: '100 UI/ml',
      quantity: 1,
      controlStamp: false
    },
    presentedBoxId: 'prod_lantus',
    presentedBoxExpiry: '03/2027',
    presentedBoxBatch: 'LAN-3321',
    correctAction: 'sell', // Require chain of cold thermal bag packing
    reasonDescription: 'Venta de medicamento Termosensible (Cadena de Frío). Es imperativo que el cajero active el descriptor de "Bolsa Térmica" con gel refrigerante para evitar que la insulina se desnaturalice en el trayecto, además de verificar la receta.',
    pointsWorth: 170
  },
  {
    id: 'case_08',
    name: 'Dora María Quiroga',
    avatarSeed: 'dora',
    dialogSpeech: 'Hola joven. Necesito retirar mi Clonazepam de 2mg para mis nervios. Traigo mi receta firmada y sellada por fin, además de mi cédula física.',
    dialogReviewText: 'Mi número de cédula es 32.551.902. El doctor se equivocó un poquito por el afán de escribir... pero soy yo misma de verdad, ¡no me vaya a negar las gotitas!',
    prescription: {
      id: 'rec_clona_mismatch',
      patientName: 'Dora María Quiroga',
      patientID: 'CC 32.551.902',
      doctorName: 'Dr. Alejandro Restrepo',
      doctorLicense: 'RM-998821',
      date: '2026-05-19',
      medicationName: 'Clonazepam Roche 2mg',
      dosage: '2mg',
      quantity: 1,
      controlStamp: true // Has stamp!
    },
    physicalID: {
      name: 'Dora María Quiroga',
      idNumber: 'CC 39.551.902', // NOTE: ID Number is CC 39.551.902, but prescription says CC 32.551.902! Mismatch!
      birthDate: '1961-11-20',
      gender: 'Femenino'
    },
    presentedBoxId: 'prod_clona2',
    presentedBoxExpiry: '08/2027',
    presentedBoxBatch: 'CLO-4012',
    correctAction: 'reject_id_mismatch',
    reasonDescription: 'Desajuste de Identidad Crítico: El número de cédula en la receta de psicotrópicos (CC 32.551.902) no coincide con el número de la cédula física presentada (CC 39.551.902). Por seguridad legal de narcóticos, cualquier discrepancia de ID invalida el despacho inmediato.',
    pointsWorth: 200
  },
  {
    id: 'case_09',
    name: 'William Rentería',
    avatarSeed: 'william',
    dialogSpeech: 'Estimado, buenas noches. Requiero despachar esta receta de Salbutamol Inhalador. Es para el asma de mi hijo.',
    dialogReviewText: 'He revisado el papel y parece que el sello del doctor se corrió un poco, pero se lee perfectamente. ¿Me lo despacha por favor?',
    prescription: {
      id: 'rec_salbu_forged',
      patientName: 'Enrique Rentería',
      patientID: 'TI 1.098.312.441',
      doctorName: 'Dr. Carlos Fuentes',
      doctorLicense: 'RM-FORGERY', // Forgery! Doctor's license looks like typical scribbeld fake RM-X0X0X0 with eraser marks
      date: '2026-05-20',
      medicationName: 'Salbutamol Glaxo 100mcg',
      dosage: '100mcg',
      quantity: 1,
      controlStamp: false,
      isForged: true,
      forgeryReason: 'La licencia del médico RM-FORGERY y la firma tienen rastros de alteración digital evidente. Parece una copia impresa escaneada.'
    },
    presentedBoxId: 'prod_salbu100',
    presentedBoxExpiry: '04/2028',
    presentedBoxBatch: 'SAL-0542',
    correctAction: 'reject_forgery',
    reasonDescription: 'Receta Médica Sospechosa / Falsificada: La firma médica y la licencia del doctor muestran señales claras de adulteración. En la vida real, los administradores deben cotejar el número de licencia en el registro público de salud y rechazar si es falso para mitigar fraude farmacéutico.',
    pointsWorth: 220
  }
];
