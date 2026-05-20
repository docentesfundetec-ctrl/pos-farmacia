/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FileText, CreditCard, Check, Package, Thermometer } from 'lucide-react';
import { CustomerCase, Product, ProductClass, formatCOP } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface MostradorProps {
  currentCase: CustomerCase;
  presentedProduct: Product | undefined;
  onScanBarcode: (product: Product) => void;
  gameCurrentDate: string; // "May 20, 2026"
}

interface TxParam {
  type: 'Efectivo' | 'Tarjeta';
  delivered: string;
}

const CASE_TX_PARAMS: { [id: string]: TxParam } = {
  case_01: { type: 'Efectivo', delivered: 'Billete de $10.000 COP' },
  case_02: { type: 'Efectivo', delivered: 'Billete de $20.000 COP' },
  case_03: { type: 'Tarjeta', delivered: 'Tarjeta Visa Premium' },
  case_04: { type: 'Efectivo', delivered: 'Billete de $5.000 COP' },
  case_05: { type: 'Efectivo', delivered: 'Billete de $50.000 COP' },
  case_06: { type: 'Tarjeta', delivered: 'Tarjeta de Crédito Medifar' },
  case_07: { type: 'Tarjeta', delivered: 'Tarjeta de Débito Familiar' },
  case_08: { type: 'Efectivo', delivered: 'Billete de $50.000 COP' },
  case_09: { type: 'Efectivo', delivered: 'Billete de $20.000 COP' },
};

export default function Mostrador({
  currentCase,
  presentedProduct,
  onScanBarcode,
  gameCurrentDate
}: MostradorProps) {
  const [activeZoomDoc, setActiveZoomDoc] = useState<'prescription' | 'id' | 'insurance' | 'box' | null>(null);
  const [scanAnimation, setScanAnimation] = useState(false);

  // play scanner synth beep
  const playScannerBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(1100, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (_) {}
  };

  const handleScanClick = () => {
    if (!presentedProduct) return;
    setScanAnimation(true);
    playScannerBeep();
    setTimeout(() => {
      setScanAnimation(false);
      onScanBarcode(presentedProduct);
    }, 455);
  };

  const renderAvatar = (seed: string) => {
    const colors = [
      'from-emerald-300 to-teal-500',
      'from-blue-300 to-indigo-500',
      'from-emerald-400 to-sky-500',
      'from-sky-300 to-emerald-500',
      'from-teal-300 to-blue-500'
    ];
    const idx = Math.abs(seed.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)) % colors.length;
    const initial = seed.charAt(0).toUpperCase();

    return (
      <motion.div 
        animate={{ scale: [1, 1.03, 1], rotate: [0, 1, -1, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
        className={`w-12 h-12 rounded-full bg-gradient-to-tr ${colors[idx]} flex items-center justify-center text-teal-950 font-sans font-black text-lg border-2 border-emerald-400 shadow-sm`}
      >
        {initial}
      </motion.div>
    );
  };

  const isPrescriptionExpired = (dateStr: string | undefined) => {
    if (!dateStr) return false;
    const currentYear = 2026;
    const currentMonth = 5;
    const currentDay = 20;

    const parts = dateStr.split('-');
    if (parts.length < 3) return false;
    const recYear = parseInt(parts[0]);
    const recMonth = parseInt(parts[1]);
    const recDay = parseInt(parts[2]);

    const currentTs = Date.UTC(currentYear, currentMonth - 1, currentDay);
    const recTs = Date.UTC(recYear, recMonth - 1, recDay);
    const diffDays = (currentTs - recTs) / (1000 * 60 * 60 * 24);

    return diffDays > 30;
  };

  const txParam = CASE_TX_PARAMS[currentCase.id] || { type: 'Efectivo', delivered: 'Billete de $20.000 COP' };

  return (
    <div id="countertop-arena" className="bg-white border-2 border-emerald-100 rounded-xl p-5 flex flex-col justify-between h-full shadow-sm text-slate-800">
      
      {/* 1. Client and countertop viewport section - Clear Pharmacy styling */}
      <div className="bg-[#f0fdf4] rounded-xl border border-emerald-200 relative overflow-hidden flex flex-col justify-between p-4 px-5">
        
        {/* VIEWPORT METRIC ROW */}
        <div className="flex justify-between items-center">
          <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider">
            ATENCIÓN DE CLIENTES (MOSTRADOR)
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            Fecha: <strong className="text-slate-700">20-May-2026</strong>
          </span>
        </div>
        
        {/* CHAT/SPEECH INTERACTOR */}
        <div className="w-full mt-4 mb-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 15 }}
            className="bg-white text-slate-900 border-2 border-emerald-200 p-4 rounded-xl text-xs leading-relaxed shadow-sm relative text-left"
          >
            <div className="absolute top-[-8px] left-[24px] w-4 h-4 bg-white border-l-2 border-t-2 border-emerald-200 transform rotate-45"></div>
            <p className="font-semibold text-slate-900 text-[12px]">"{currentCase.dialogSpeech}"</p>
            {currentCase.dialogReviewText && (
              <p className="text-emerald-700 text-[10px] mt-2 italic border-t border-emerald-100 pt-2 font-mono">
                Revisión Documental: "{currentCase.dialogReviewText}"
              </p>
            )}
          </motion.div>
        </div>

        {/* CLIENT DETAILS & TRANSACTION SETTINGS */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white border border-emerald-100 p-3.5 rounded-lg shadow-2xs">
          
          {/* CLIENT FACE CARD */}
          <div className="flex items-center gap-3">
            {renderAvatar(currentCase.avatarSeed)}
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block uppercase font-mono tracking-widest font-bold">Identidad de Turno</span>
              <p className="text-slate-800 font-extrabold uppercase text-xs sm:text-sm">{currentCase.name}</p>
              {currentCase.isNervous && (
                <motion.span 
                  animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="text-rose-600 font-black text-[9px] bg-rose-50 px-1 border border-rose-100 rounded inline-block mt-0.5"
                >
                  ⚠️ PACIENTE IMPACIENTE/ANSIOSO/A
                </motion.span>
              )}
            </div>
          </div>

          {/* DYNAMIC PAYMENT / TRANSACTION PARAMETERS */}
          <div className="border-t sm:border-t-0 sm:border-l border-emerald-100 pt-3 sm:pt-0 sm:pl-5 flex-1 w-full text-left flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 uppercase font-mono block tracking-wider font-bold">Detalles de Cobro Solicitados:</span>
            
            <div className="flex lg:items-center gap-4 flex-wrap mt-0.5 text-xs">
              <div className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-200 font-mono">
                <span className="text-[10px] text-slate-450">TIPO:</span>
                <span className="font-bold text-slate-800 uppercase">{txParam.type}</span>
              </div>

              <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-2 py-1 rounded border border-emerald-100 font-mono">
                <span className="text-[10px] text-emerald-500">PRESENTA:</span>
                <strong className="text-emerald-900 font-bold">{txParam.delivered}</strong>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Physical countertop tabletop layout (with papers) */}
      <div id="desktop-surface" className="flex-1 bg-slate-50 rounded-xl p-4 mt-4 border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4 items-end relative min-h-[190px] shadow-inner">
        <div className="absolute top-2 left-3 text-[9px] uppercase font-mono text-slate-400 font-bold tracking-wider select-none">
          Documentos Médicos (Clic en cada uno para zoom interactivo)
        </div>

        {/* PRESCRIPTION TILE */}
        {currentCase.prescription ? (
          <motion.button
            whileHover={{ scale: 1.05, y: -4, rotate: -2, zIndex: 10, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveZoomDoc('prescription')}
            className="cursor-pointer text-left bg-white p-3 shadow-sm border-2 border-slate-200 flex flex-col gap-1 -rotate-1 rounded-sm block w-full relative min-h-[145px] text-slate-850"
          >
            <div className="border-b border-rose-300 pb-1 mb-1 text-[8px] font-sans font-bold text-red-750 flex justify-between items-center uppercase tracking-wide">
              <span>RECETA RP (MÉDICA)</span>
              <FileText className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
            </div>
            <div className="text-[9px] font-extrabold text-slate-900 leading-tight block truncate uppercase">DR. {currentCase.prescription.doctorName.split(' ')[1] || 'MÉDICO'}</div>
            <div className="text-[10px] font-sans italic text-slate-800 font-bold leading-tight mt-1 line-clamp-2">
              Rp: {currentCase.prescription.medicationName}
            </div>
            <p className="text-[8px] text-slate-550 leading-tight">{currentCase.prescription.dosage}</p>
            <div className="mt-auto flex justify-between items-end border-t border-slate-100 pt-1.5 text-[8px] space-y-0.5">
              <div className="space-y-px">
                <p className="font-mono text-[8px] text-slate-600">{currentCase.prescription.date}</p>
                <p className={`font-bold text-[7px] ${isPrescriptionExpired(currentCase.prescription.date) ? 'text-red-650' : 'text-emerald-700'}`}>
                  VENCE: {isPrescriptionExpired(currentCase.prescription.date) ? 'EXPIRADA' : 'VÁLIDA'}
                </p>
              </div>
              {currentCase.prescription.controlStamp ? (
                <span className="text-[7px] bg-rose-100 text-rose-800 font-black px-1 rounded border border-rose-300 uppercase">
                  ✓ SELLO
                </span>
              ) : (
                <div className="w-7 h-7 border border-dashed border-slate-300 rounded-full flex items-center justify-center opacity-30 text-[6px]">SIN SELLO</div>
              )}
            </div>
            {isPrescriptionExpired(currentCase.prescription.date) && (
              <div className="absolute inset-x-0 inset-y-0 bg-red-850/5 border border-dashed border-red-500 pointer-events-none flex items-center justify-center">
                <span className="text-[8.5px] bg-red-600 text-white font-mono font-bold uppercase rotate-12 px-1 rounded shadow-xs">RECETA CADUCADA</span>
              </div>
            )}
          </motion.button>
        ) : (
          <div className="border-2 border-dashed border-slate-200 rounded-lg min-h-[145px] bg-slate-100/50 flex flex-col items-center justify-center text-[10px] text-slate-400 text-center p-3 font-mono">
            <FileText className="w-5 h-5 opacity-20 mb-1" />
            <span>Sin Receta</span>
          </div>
        )}

        {/* ID CARD TILE */}
        {currentCase.physicalID ? (
          <motion.button
            whileHover={{ scale: 1.05, y: -4, rotate: 2, zIndex: 10, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveZoomDoc('id')}
            className="cursor-pointer text-left bg-blue-50/70 border-2 border-blue-200 p-3 shadow-xs rounded-lg flex flex-col gap-1 rotate-1 block w-full relative min-h-[145px] text-blue-900"
          >
            <div className="flex justify-between items-center text-[8px] font-mono font-bold tracking-wider text-blue-600 border-b border-blue-100 pb-0.5 mb-1">
              <span>CÉDULA CIUDADANA</span>
              <CreditCard className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-[9px] font-bold text-blue-950 truncate uppercase">{currentCase.physicalID.name}</div>
            <div className="text-[8px] mt-1 font-mono text-slate-600">
              CC: <span className="text-blue-900 font-bold block">{currentCase.physicalID.idNumber}</span>
            </div>
            <div className="text-[8px] text-slate-500">
              Nacimiento: {currentCase.physicalID.birthDate}
            </div>
            <div className="text-[8px] mt-auto font-bold text-blue-700 bg-blue-100 p-0.5 rounded text-center text-[7px] font-sans uppercase">
              Cotejo de ID
            </div>
          </motion.button>
        ) : (
          <div className="border-2 border-dashed border-slate-200 rounded-lg min-h-[145px] bg-slate-100/50 flex flex-col items-center justify-center text-[10px] text-slate-400 text-center p-3 font-mono">
            <CreditCard className="w-5 h-5 opacity-20 mb-1" />
            <span>Sin Cédula</span>
          </div>
        )}

        {/* INSURANCE CARD TILE */}
        {currentCase.insuranceCard ? (
          <motion.button
            whileHover={{ scale: 1.05, y: -4, rotate: -3, zIndex: 10, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveZoomDoc('insurance')}
            className="cursor-pointer text-left bg-emerald-50/50 border-2 border-emerald-200 p-3 shadow-xs rounded-lg flex flex-col gap-1 -rotate-2 block w-full relative min-h-[145px] text-emerald-950"
          >
            <div className="flex justify-between items-center text-[8px] font-mono font-bold tracking-wider text-emerald-700 border-b border-emerald-100 pb-0.5 mb-1">
              <span>CARNET SEGURO</span>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-[9px] font-extrabold text-emerald-950 truncate uppercase">{currentCase.insuranceCard.patientName}</div>
            <div className="text-[8px] mt-1 font-mono text-slate-600">
              Póliza: <span className="text-emerald-900 font-bold block font-mono">{currentCase.insuranceCard.policyNumber}</span>
            </div>
            <div className="text-[8px] bg-emerald-600 text-white p-0.5 rounded font-black mt-auto text-center font-sans tracking-wide">
              COBERTURA {currentCase.insuranceCard.copayPercentage}%
            </div>
          </motion.button>
        ) : (
          <div className="border-2 border-dashed border-slate-200 rounded-lg min-h-[145px] bg-slate-100/50 flex flex-col items-center justify-center text-[10px] text-slate-400 text-center p-3 font-mono">
            <Check className="w-5 h-5 opacity-20 mb-1" />
            <span>Sin Seguro</span>
          </div>
        )}

        {/* BOX OF LAID OUT MEDICINE */}
        {presentedProduct ? (
          <motion.button
            whileHover={{ scale: 1.05, y: -4, rotate: 3, zIndex: 10, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveZoomDoc('box')}
            className="cursor-pointer text-left bg-white p-3 shadow-sm border-2 border-slate-200 flex flex-col gap-1 rotate-2 rounded-sm block w-full relative min-h-[145px] text-slate-850"
          >
            <div className="text-[8px] uppercase font-mono text-slate-400 border-b border-slate-100 pb-0.5 flex justify-between items-center">
              <span>MEDICAMENTO COMERCIAL</span>
              <Package className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <p className="text-[10px] font-extrabold text-slate-900 uppercase leading-tight line-clamp-2">{presentedProduct.name}</p>
            
            <div className="bg-slate-50 p-0.5 flex justify-center py-1 rounded mt-1">
              <div className="w-full h-3 bg-slate-900 flex gap-[1px] items-center px-1">
                <div className="h-2 w-0.5 bg-white"></div>
                <div className="h-2 w-[0.1px] bg-white"></div>
                <div className="h-2 w-1 bg-white"></div>
                <div className="h-2 w-[0.1px] bg-white"></div>
                <div className="h-2 w-0.5 bg-white"></div>
                <div className="h-2 w-[0.5px] bg-white"></div>
                <div className="h-2 w-1.5 bg-white"></div>
              </div>
            </div>
            <div className="text-[8px] text-slate-550 font-mono mt-auto flex justify-between">
              <span>FÍSICO: {currentCase.presentedBoxExpiry}</span>
            </div>
          </motion.button>
        ) : (
          <div className="border-2 border-dashed border-slate-200 rounded-lg min-h-[145px] bg-slate-100/50 flex flex-col items-center justify-center text-[10px] text-slate-400 text-center p-3 font-mono">
            <Package className="w-5 h-5 opacity-20 mb-1" />
            <span>Sin Caja Física</span>
          </div>
        )}
      </div>

      {/* MAGNIFIER ZOOM OVERLAYS WITH BEAUTIFUL TRANSITIONS */}
      <AnimatePresence>
        {activeZoomDoc && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-left"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              transition={{ type: "spring", duration: 0.35 }}
              className="bg-white border-2 border-emerald-150 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl"
            >
              {/* Zoomed Document body view */}
              <div className="p-6">
                
                {activeZoomDoc === 'prescription' && currentCase.prescription && (
                  <div className="bg-white text-neutral-850 p-6 rounded-md font-sans border-t-8 border-emerald-600 shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start border-b border-rose-100 pb-3 mb-4">
                      <div>
                        <h4 className="text-xs font-black font-sans text-teal-950 uppercase tracking-widest">CAMI - CENTRO DE ATENCIÓN MÉDICA INTEGRAL COLOMBIA</h4>
                        <p className="text-[9.5px] text-slate-500 mt-0.5">{currentCase.prescription.doctorName} | Registro Licencia Col: {currentCase.prescription.doctorLicense}</p>
                      </div>
                      <FileText className="w-7 h-7 text-rose-600 animate-pulse" />
                    </div>

                    <div className="space-y-3 text-xs mb-5">
                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-100/40 p-2.5 rounded border border-slate-100">
                        <div>
                          <span className="text-[8px] text-slate-500 block">PACIENTE AFILIADO:</span>
                          <span className="font-extrabold text-slate-900">{currentCase.prescription.patientName}</span>
                        </div>
                        <div>
                          <span className="text-[8px] text-slate-500 block">NÚMERO DE CÉDULA DE CIUDADANÍA:</span>
                          <span className="font-mono text-slate-900 font-bold block">{currentCase.prescription.patientID}</span>
                        </div>
                      </div>

                      <div className="border border-slate-200 p-3 rounded bg-[#faf9f6]">
                        <span className="text-[8.5px] text-slate-500 block font-bold mb-1">RECIPI MÓDULO (RP ORDENADA):</span>
                        <p className="text-base font-serif italic text-teal-950 font-bold mb-1">
                          {currentCase.prescription.medicationName} | Dosis: {currentCase.prescription.dosage}
                        </p>
                        <p className="text-[10px] text-slate-650 mt-1">
                          <strong>Cantidad total formulada:</strong> {currentCase.prescription.quantity} Unidad de caja de inventario.
                        </p>
                      </div>

                      <div className="flex justify-between items-center text-[10px]">
                        <div>
                          <span className="text-slate-500 block text-[9px]">FECHA DE EXPEDICIÓN:</span>
                          <p className="font-bold font-mono text-slate-900 bg-amber-50 rounded px-1.5 py-0.5 inline-block border border-amber-200">{currentCase.prescription.date}</p>
                          <p className="text-[8.5px] text-slate-450 mt-1">(Límite nacional antibióticos: 30 de días)</p>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-500 block text-[9px] mb-0.5">ESTADO FISCALIZADOR SANITARIO:</span>
                          {currentCase.prescription.controlStamp ? (
                            <div className="inline-block bg-rose-100 border border-rose-350 text-rose-800 text-[9px] uppercase font-black px-2 py-0.5 rounded shadow-2xs rotate-[-2deg]">
                              ★ CONTROLADO - SELLO SANITARIO ★
                            </div>
                          ) : (
                            <span className="text-slate-450 italic text-[10px]">Medicamento de despacho normal</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                      <span className="text-[8px] text-slate-400 font-serif">Firma digital registrada del dispensador médico</span>
                      <div className="w-24 border-b border-dashed border-slate-400 text-center font-serif text-[10px] italic text-slate-700">
                        /{currentCase.prescription.doctorName.split(' ')[1]}/
                      </div>
                    </div>
                  </div>
                )}

                {activeZoomDoc === 'id' && currentCase.physicalID && (
                  <div className="bg-gradient-to-tr from-[#1e293b] to-[#0f172a] text-slate-100 p-5 rounded-xl border border-slate-700 shadow-xl font-mono">
                    <div className="flex justify-between items-start border-b border-slate-800 pb-3 mb-4">
                      <div>
                        <h4 className="text-xs font-black tracking-widest text-[#10b981]">REPÚBLICA DE COLOMBIA</h4>
                        <p className="text-[9px] text-[#94a3b8] tracking-tight">REGISTRO CIVIL NACIONAL | CÉDULA DE CIUDADANÍA</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[#10b981] text-[10px] border border-[#10b981]/30">
                        COL
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-1 bg-slate-950 rounded-lg p-2.5 flex flex-col items-center justify-center border border-slate-800 min-h-[90px]">
                        <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-500 flex items-center justify-center font-sans font-bold text-xl text-emerald-400">
                          {currentCase.name.charAt(0)}
                        </div>
                      </div>

                      <div className="col-span-2 space-y-2 text-xs">
                        <div>
                          <span className="text-[8px] text-[#64748b] block">NOMBRES Y APELLIDOS COMPLETOS:</span>
                          <p className="font-bold text-white uppercase text-xs">{currentCase.physicalID.name}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[8px] text-[#64748b] block">CÉDULA DE CIUDADANÍA CC N°:</span>
                            <p className="font-bold text-[#10b981] bg-slate-950 px-1 border border-slate-850 rounded block font-mono">{currentCase.physicalID.idNumber}</p>
                          </div>
                          <div>
                            <span className="text-[8px] text-[#64748b] block">NACIMIENTO:</span>
                            <p className="font-semibold text-slate-300">{currentCase.physicalID.birthDate}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[8px] text-[#64748b] block">GÉNERO:</span>
                            <p className="font-medium text-slate-300">{currentCase.physicalID.gender}</p>
                          </div>
                          <div>
                            <span className="text-[8px] text-[#64748b] block">GRUPO SANGUÍNEO:</span>
                            <p className="font-bold text-rose-400 uppercase">O POSITIVO (O+)</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeZoomDoc === 'insurance' && currentCase.insuranceCard && (
                  <div className="bg-gradient-to-tr from-emerald-950 to-emerald-900 border-2 border-emerald-400 text-slate-100 p-6 rounded-lg font-sans shadow-lg">
                    <div className="flex justify-between items-center border-b border-emerald-800 pb-3 mb-4">
                      <div>
                        <h4 className="text-base font-black text-white uppercase tracking-wider">{currentCase.insuranceCard.provider}</h4>
                        <p className="text-[9px] text-emerald-300 font-mono uppercase tracking-wider">EPS Afiliación de Subsidios Copagos</p>
                      </div>
                      <div className="bg-emerald-900 text-emerald-300 font-bold px-3 py-1 rounded text-xs border border-emerald-600 font-mono">
                        PLAN EPS ACTIVO
                      </div>
                    </div>

                    <div className="space-y-3 text-xs font-mono">
                      <div>
                        <span className="text-[8px] text-emerald-400 block">PACIENTE TITULAR PLAN:</span>
                        <p className="text-sm font-bold text-white uppercase">{currentCase.insuranceCard.patientName}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-[8px] text-emerald-400 block">CÉDULA DE AFILIADO:</span>
                          <p className="font-bold text-white">{currentCase.insuranceCard.patientID}</p>
                        </div>
                        <div>
                          <span className="text-[8px] text-emerald-400 block">N° AFILIACIÓN VIRTUAL CC:</span>
                          <p className="font-bold text-white">{currentCase.insuranceCard.policyNumber}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 border-t border-emerald-800 pt-3">
                        <div>
                          <span className="text-[8px] text-emerald-400 block">% SUBSIDIO COMPENSACIÓN EPS:</span>
                          <p className="text-sm text-emerald-300 font-bold font-sans">
                            Cubre el {currentCase.insuranceCard.copayPercentage}% del valor regulado COP
                          </p>
                        </div>
                        <div>
                          <span className="text-[8px] text-emerald-400 block">VIGENCIA PLAN EPS:</span>
                          <p className={`font-semibold ${currentCase.insuranceCard.isValid ? 'text-white' : 'text-rose-450'}`}>
                            {currentCase.insuranceCard.expirationDate}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeZoomDoc === 'box' && presentedProduct && (
                  <div className="bg-slate-50 border-2 border-slate-200 text-slate-850 p-6 rounded-lg font-sans">
                    <div className="flex justify-between items-start border-b border-slate-200 pb-3 mb-4">
                      <div>
                        <span className="text-[9px] text-emerald-600 font-mono tracking-wider block uppercase font-bold">REGISTRO DE EMPAQUE EN CAJA FÍSICA</span>
                        <h4 className="text-base font-black text-slate-900 font-sans">{presentedProduct.name}</h4>
                      </div>
                      {presentedProduct.category === ProductClass.CONTROLLED ? (
                        <span className="bg-rose-100 text-rose-800 font-bold border border-rose-300 px-2.5 py-1 rounded text-[9px] uppercase tracking-wide">
                          Medicamento Controlado F.N.E
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded text-[9px] font-bold border border-slate-200 font-mono">
                          {presentedProduct.category}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono mb-4">
                      <div className="space-y-1.5 bg-slate-100 p-3 rounded border border-slate-200">
                        <div>
                          <span className="text-[8px] text-slate-500 block">PRINCIPIO ACTIVO COMPUESTO:</span>
                          <span className="font-bold text-slate-800 block">{presentedProduct.genericName}</span>
                        </div>
                        <div>
                          <span className="text-[8px] text-slate-500 block">DOSIFICACIÓN REGISTRADA:</span>
                          <span className="font-bold text-slate-800 block">{presentedProduct.dosage}</span>
                        </div>
                        <div>
                          <span className="text-[8px] text-slate-500 block">FORMA Y PRESENTACIÓN:</span>
                          <span className="font-medium text-slate-650 block">{presentedProduct.presentation}</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 bg-slate-100 p-3 rounded border border-slate-200">
                        <div>
                          <span className="text-[8px] text-slate-500 block">LOTE ASIGNADO:</span>
                          <span className="font-bold text-slate-800 block">{currentCase.presentedBoxBatch}</span>
                        </div>
                        <div>
                          <span className="text-[8px] text-slate-500 block">FECHA DE INSPECCIÓN VENCIMIENTO:</span>
                          <span className={`font-bold block ${
                            currentCase.presentedBoxExpiry.startsWith('03/2026') ? 'text-rose-700 bg-rose-50 px-1 rounded border border-rose-250 font-black' : 'text-slate-800'
                          }`}>
                            {currentCase.presentedBoxExpiry}
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] text-slate-500 block">SISTEMA CONTROL ACTUAL:</span>
                          <span className="text-emerald-700 font-bold block">05/2026 (Mayo 2026)</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-md flex flex-col items-center border border-slate-200">
                      <div className="text-[9px] text-neutral-400 font-sans font-bold uppercase tracking-wider mb-1">CÓDIGO DE BARRAS DE LECTURA DE SEGURIDAD (CUM / POS)</div>
                      <div className="w-11/12 h-8 bg-slate-100 flex items-center justify-center tracking-widest text-[#1e293b] font-mono font-bold text-xs select-none">
                        ||| || | | |||| ||| ||| ||| | || |||| |
                      </div>
                      <span className="text-[10px] font-mono text-slate-650 font-semibold tracking-wide mt-1">{presentedProduct.barcode}</span>
                    </div>

                    {presentedProduct.category === ProductClass.COLD_CHAIN && (
                      <div className="mt-3 flex items-center gap-2 bg-[#f0f9ff] text-sky-805 p-3 rounded-lg border border-sky-200 text-[11px] leading-relaxed">
                        <Thermometer className="w-4 h-4 text-sky-600 animate-pulse flex-shrink-0" />
                        <div>
                          <strong>Protección Térmica Espeical:</strong> Requiere rellenar empaquetado en una <strong>Bolsa Térmica refrigerada</strong>. Entregar este medicamento al paciente sin gel protector inactivará la molécula de insulina de inmediato.
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Modal Bottom buttons */}
              <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-end gap-2">
                <span className="text-[10px] text-slate-500 self-center mr-auto font-mono">Haz clic en Cerrar para continuar</span>
                <button
                  onClick={() => setActiveZoomDoc(null)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-1.5 px-4 rounded text-xs transition-all cursor-pointer"
                >
                  Cerrar Inspección
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
