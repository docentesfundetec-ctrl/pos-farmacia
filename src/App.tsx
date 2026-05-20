/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { 
  Play, BookOpen, Clock, Settings, Landmark, RefreshCw, AlertTriangle, 
  CheckCircle, ShieldCheck, HeartPulse, Sparkles, LogIn, ChevronRight,
  UserCheck, AlertCircle, ShoppingBag, FolderOpen, Coins, HelpCircle, ShoppingCart, Lock, Unlock, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { SCENARIOS } from './data/scenarios';
import { INITIAL_INVENTORY } from './data/inventory';
import { Product, TicketItem, CustomerCase, AuditLog, ProductClass, formatCOP } from './types';

import Mostrador from './components/Mostrador';
import PosTerminal from './components/PosTerminal';
import CajaRegistradora from './components/CajaRegistradora';
import AuditoriaModal from './components/AuditoriaModal';

export default function App() {
  // Game Setup States
  const [gameState, setGameState] = useState<'welcome' | 'playing' | 'end_summary'>('welcome');
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  const [score, setScore] = useState(1000); // Evaluation score points
  const [cashBalance, setCashBalance] = useState(300000); // 300.000 COP cash register drawer balance
  const [auditHistory, setAuditHistory] = useState<AuditLog[]>([]);
  
  // Mobile Collapsible States
  const [guideExpanded, setGuideExpanded] = useState(false);
  const [rejectionExpanded, setRejectionExpanded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDesktop = window.innerWidth >= 1024;
      setGuideExpanded(isDesktop);
      setRejectionExpanded(isDesktop);
    }
  }, []);
  
  // Active Workbench States
  const [ticketItems, setTicketItems] = useState<TicketItem[]>([]);
  const [insuranceApplied, setInsuranceApplied] = useState(false);
  const [requiresColdBag, setRequiresColdBag] = useState(false);
  const [selectedSubTab, setSelectedSubTab] = useState<'scan' | 'history'>('scan');
  
  // Dialog / Flow States
  const [shiftActiveStatus, setShiftActiveStatus] = useState<'counter' | 'checkout' | 'audit_modal'>('counter');
  const [latestAuditLog, setLatestAuditLog] = useState<AuditLog | null>(null);
  const [currentCheckoutInfo, setCurrentCheckoutInfo] = useState<{
    method: 'cash' | 'card' | 'insurance_only';
    cashReceived: number;
  } | null>(null);

  // Constants
  const GAME_CURRENT_DATE = "2026-05-20"; // 20 de Mayo, 2026
  const currentCase = SCENARIOS[currentCaseIndex];
  const totalCases = SCENARIOS.length;

  const getPresentedProduct = () => {
    return INITIAL_INVENTORY.find(p => p.id === currentCase.presentedBoxId);
  };

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'sell': return 'Aprobado y Despachado';
      case 'reject_no_recipe': return 'ID / Falta Receta Médica Habilitante';
      case 'reject_expired_recipe': return 'Receta Médica Caducada (>30 días)';
      case 'reject_expired_med': return 'Empaque de Medicamento Vencido';
      case 'reject_wrong_dosage': return 'Discrepancia en Dosificación / Peso';
      case 'reject_missing_stamp': return 'Falta Sello de Narcóticos en Receta';
      case 'reject_id_mismatch': return 'Incompatibilidad de Identidad Cédula/Receta';
      case 'reject_forgery': return 'Receta Falsificada';
      default: return reason;
    }
  };

  // Start shift helper
  const startShift = () => {
    setGameState('playing');
    setCurrentCaseIndex(0);
    setScore(1000);
    setCashBalance(300000); // Reset caja to 300.000 COP
    setAuditHistory([]);
    resetCaseWorkbenchState();
  };

  const resetCaseWorkbenchState = () => {
    setTicketItems([]);
    setInsuranceApplied(false);
    setRequiresColdBag(false);
    setShiftActiveStatus('counter');
    setCurrentCheckoutInfo(null);
  };

  // Add Item to ticket list (scan event or manual)
  const handleAddItem = (product: Product, quantity: number) => {
    setTicketItems(prev => {
      const idx = prev.findIndex(item => item.product.id === product.id);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          quantity: updated[idx].quantity + quantity
        };
        return updated;
      }
      return [...prev, {
        product,
        quantity,
        originalPrice: product.price,
        insuranceDiscount: 0,
        finalPrice: product.price
      }];
    });

    // Play instant scanner beep
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
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
      }
    } catch (_) {}
  };

  const handleLeftColumnScan = () => {
    const presentedProd = getPresentedProduct();
    if (presentedProd) {
      handleAddItem(presentedProd, 1);
    }
  };

  const handleRemoveItem = (index: number) => {
    setTicketItems(prev => prev.filter((_, i) => i !== index));
    if (ticketItems.length <= 1) {
      setRequiresColdBag(false);
    }
  };

  const handleClearTicket = () => {
    setTicketItems([]);
    setRequiresColdBag(false);
    setInsuranceApplied(false);
  };

  // Toggle auxiliary ice pack bag for insulins
  const handleToggleColdBag = () => {
    setRequiresColdBag(prev => !prev);
  };

  // Trigger Insurance Benefits
  const handleApplyInsurance = () => {
    if (!currentCase.insuranceCard) return;
    setInsuranceApplied(prev => !prev);
  };

  // Proceed from touchscreen to cash register popping drawer
  const handleProceedToCheckout = (method: 'cash' | 'card' | 'insurance_only', amountPayerHanded: number) => {
    setCurrentCheckoutInfo({
      method,
      cashReceived: amountPayerHanded
    });
    setShiftActiveStatus('checkout');
  };

  // Evaluate "SELL" action completion once money is returned
  const handleFinishTransaction = (returnedChange: number) => {
    const totalOriginal = ticketItems.reduce((acc, curr) => acc + (curr.originalPrice * curr.quantity), 0);
    const totalInsuranceDiscount = insuranceApplied && currentCase.insuranceCard 
      ? ticketItems.reduce((acc, curr) => acc + ((curr.originalPrice * (currentCase.insuranceCard!.copayPercentage / 100)) * curr.quantity), 0)
      : 0;
    const coldBagCost = requiresColdBag ? 2500 : 0;
    const grandTotal = Math.max(0, totalOriginal - totalInsuranceDiscount + coldBagCost);

    let isSuccess = false;
    let scoreImpact = 0;
    let cashImpact = 0;
    let auditMsg = '';

    const changeDue = currentCheckoutInfo?.method === 'cash' 
      ? Math.max(0, currentCheckoutInfo.cashReceived - grandTotal)
      : 0;

    // Check if this case was supposed to be a rejection!
    if (currentCase.correctAction !== 'sell') {
      isSuccess = false;
      scoreImpact = -200;
      cashImpact = -grandTotal; 
      auditMsg = `GRAVE OMISIÓN DE PROTECCIÓN SANITARIA: Dispensaste y cobraste el medicamento a ${currentCase.name} de forma imprudente. El mostrador requería RECHAZAR la dispensación debido a: ${currentCase.reasonDescription}. La farmacia ha sido denunciada por entes reguladores Estatales.`;
    } else {
      // It was safe to sell, but did they scan the CORRECT MEDICINE?
      const mainTicketItem = ticketItems[0];
      const presentedProd = getPresentedProduct();
      
      if (!mainTicketItem || (presentedProd && mainTicketItem.product.id !== presentedProd.id)) {
        isSuccess = false;
        scoreImpact = -100;
        cashImpact = -10000; // -10.000 COP penalty
        auditMsg = `INCONGRUENCIA EN REGISTRO / DISPENSA: Cobraste cobro regular a ${currentCase.name}, pero el medicamento ingresado en el tiquete del POS no coincide con el empaque que el cliente solicitó en mostrador. Registraste un producto alterno ilegalmente.`;
      }
      // Check insurance application
      else if (currentCase.insuranceCard && !insuranceApplied) {
        isSuccess = true;
        scoreImpact = currentCase.pointsWorth - 50; 
        cashImpact = grandTotal;
        auditMsg = `ADVERTENCIA DE COBRO INDEBIDO: Completaste el despacho de forma médica oportuna, pero olvidaste presionar el botón de "Aplicar Seguro" en el sistema POS. Le cobraste la tarifa comercial plena de ${formatCOP(totalOriginal)} a ${currentCase.name}, ignorando su cobertura del ${currentCase.insuranceCard.copayPercentage}%, vulnerando sus derechos financieros de asegurado.`;
      }
      // Check cold-chain insulin thermal gel pack bag
      else if (currentCase.id === 'case_07' && !requiresColdBag) {
        isSuccess = false;
        scoreImpact = -120;
        cashImpact = -35000; // -35k COP penalty
        auditMsg = `FALLA CRÍTICA EN CADENA DE FRÍO: Dispensaste Insulina Lantus a ${currentCase.name} de forma óptima, pero omitiste adjuntar la bolsa térmica protectora con gel refrigerante. Se quebró la cadena de frío, la proteína de insulina se desnaturalizará en minutos y perjudicará la salud de la abuela diabética.`;
      }
      // Check cash change returned inaccuracy
      else if (currentCheckoutInfo?.method === 'cash' && Math.abs(returnedChange - changeDue) > 1) {
        isSuccess = false;
        scoreImpact = -50;
        const discrepancy = returnedChange - changeDue;
        cashImpact = grandTotal - discrepancy; 

        if (discrepancy > 0) {
          auditMsg = `FALTA DE ARQUEO EN CAJA REGISTRADORA: Completaste el despacho del producto, pero entregaste ${formatCOP(discrepancy)} de más en efectivo en el vuelto. Pérdida neta de caja administrativa para el cierre de guardia.`;
        } else {
          auditMsg = `FALLA DE SERVICIO AL CLIENTE: Completaste la transacción, pero de forma descuidada le devolviste ${formatCOP(Math.abs(discrepancy))} de menos en el vuelto. El cliente ${currentCase.name} se retiró enfadado y reportará una denuncia de robo de mostrador.`;
        }
      } 
      else {
        // perfect sale!
        isSuccess = true;
        scoreImpact = currentCase.pointsWorth;
        cashImpact = grandTotal;
        auditMsg = `¡DISPENSACIÓN Y ENTRADA EXCELENTE! Despachaste perfectamente a ${currentCase.name}. Cotejaste la prescripción médica original en receta, aplicaste seguro oportuno en el terminal POS, registraste el producto mediante escáner y cerraste la caja monedera con exactitud fiscal. ¡Un trabajo impecable!`;
      }
    }

    const log: AuditLog = {
      id: `MEM-${Math.floor(1000 + Math.random() * 9000).toString()}`,
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      customerName: currentCase.name,
      success: isSuccess,
      message: auditMsg,
      scoreImpact,
      cashImpact
    };

    setLatestAuditLog(log);
    setAuditHistory(prev => [log, ...prev]);
    setScore(prev => Math.max(0, prev + scoreImpact));
    setCashBalance(prev => Math.round(prev + cashImpact));
    setShiftActiveStatus('audit_modal');
  };

  // Evaluate "REJECT / DENY" action choosing from popup menu reasons
  const handleRejectAction = (reason: string) => {
    let isSuccess = false;
    let scoreImpact = 0;
    let cashImpact = 0;
    let auditMsg = '';

    if (currentCase.correctAction === reason) {
      isSuccess = true;
      scoreImpact = currentCase.pointsWorth;
      auditMsg = `¡CORRECTO! Detectaste exitosamente la discrepancia regulatoria y denegaste el despacho a ${currentCase.name}. Motivo idóneo comprobado: ${currentCase.reasonDescription}`;
    } else {
      isSuccess = false;
      scoreImpact = -120;
      
      if (currentCase.correctAction === 'sell') {
        auditMsg = `AUDITORÍA DE ERROR GRAVE: Rechazaste de forma injustificada el medicamento a ${currentCase.name}. Cuestionaste su receta diciendo "${getReasonLabel(reason)}", pero sus documentos estaban completamente correctos y en regla según leyes farmacéuticas. Perdimos la venta y la reputación comercial.`;
      } else {
        auditMsg = `AUDITORÍA DE ERROR REGULATORIO: Denegaste el medicamento a ${currentCase.name}, pero citaste el motivo de rechazo incorrecto. Argumentaste "${getReasonLabel(reason)}", sin embargo, la verdadera causal legal vigente para esta multa de mostrador es: "${getReasonLabel(currentCase.correctAction)}". Esto refleja falta de formación técnica.`;
      }
    }

    const log: AuditLog = {
      id: `MEM-${Math.floor(1000 + Math.random() * 9000).toString()}`,
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      customerName: currentCase.name,
      success: isSuccess,
      message: auditMsg,
      scoreImpact,
      cashImpact
    };

    setLatestAuditLog(log);
    setAuditHistory(prev => [log, ...prev]);
    setScore(prev => Math.max(0, prev + scoreImpact));
    setShiftActiveStatus('audit_modal');
  };

  const handleNextPatientProgress = () => {
    if (currentCaseIndex + 1 < totalCases) {
      setCurrentCaseIndex(prev => prev + 1);
      resetCaseWorkbenchState();
    } else {
      setGameState('end_summary');
    }
  };

  return (
    <div className="min-h-screen bg-slate-55 flex flex-col justify-between relative font-sans text-slate-800">
      
      {/* Background radial soft light blobs */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-100/25 rounded-full blur-3xl pointer-events-none"></div>

      <AnimatePresence mode="wait">
        {/* Welcome screen - Styled in a clean pharmacy look */}
        {gameState === 'welcome' && (
          <motion.div 
            key="welcome"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            id="welcome-layout" 
            className="w-full flex-1 flex flex-col justify-between p-6 md:p-12 z-10"
          >
            {/* Branding header */}
            <div className="max-w-6xl mx-auto w-full flex justify-between items-center border-b border-emerald-100 pb-4">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-8 h-8 text-emerald-600" />
                <span className="font-sans font-black text-slate-900 tracking-tight uppercase text-lg">Academia FarmaPOS</span>
              </div>
              <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full font-mono font-bold">
                ESTÁNDAR DE CAPACITACIÓN COLOMBIA v2.4
              </span>
            </div>

            {/* Inner hero box */}
            <div className="max-w-5xl mx-auto w-full my-auto py-12 flex flex-col lg:flex-row gap-12 items-center">
              <div className="flex-1 space-y-6 text-left">
                <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-100 text-xs shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Simulador de Entrenamiento Técnico POS de Farmacia (COP)
                </div>
                
                <h1 className="text-3xl md:text-5xl font-black font-sans text-slate-900 tracking-tight leading-none">
                  Práctica Operativa Completa de Sistema POS y Arqueo
                </h1>

                <p className="text-sm md:text-base text-slate-650 leading-relaxed font-sans">
                  Consolida tus habilidades antes de iniciar tu carrera laboral. Este simulador enseña a futuros <strong className="text-emerald-700">cajeros, regentes y administradores de farmacias</strong> a manejar la interfaz computacional de un sistema POS real, contrastar prescripciones críticas con la cédula de ciudadanía del usuario, y controlar la caja de efectivo de manera idónea, todo en <strong>Pesos Colombianos (COP)</strong>.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-705">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="font-extrabold text-teal-950 block mb-1">🔍 1. Comprobación de Seguridad</span>
                    Inspecciona la receta del cliente, su identificación nacional de cédula y el empaque comercial físico. Detecta falsificaciones, dosis erróneas o caducidades.
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="font-extrabold text-teal-950 block mb-1">💻 2. Facturación en Monitor POS</span>
                    Usa el escáner láser lateral para ingresar el medicamento y su precio al instante, busca unidades en catálogo, aplica copagos del seguro o cadena de frío.
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="font-extrabold text-teal-950 block mb-1">💵 3. Arqueo de Vuelto Detallado</span>
                    Suma billetes y monedas reales colombianas desde el cajón monedero que se abre visualmente abajo. Evita mermas de dinero personal o de la tienda.
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="font-extrabold text-teal-950 block mb-1">📊 4. Auto-Evaluación de Guardia</span>
                    Cada turno de mostrador genera un memorando detallado de auditoría del regente sanitario. ¡Apunta al puntaje de 100% de efectividad!
                  </div>
                </div>

                <motion.button
                  id="comenzar-turno-practica"
                  onClick={startShift}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-black px-8 py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer uppercase tracking-widest text-xs"
                >
                  Iniciar Turno Práctico <Play className="fill-white w-4 h-4 text-white" />
                </motion.button>
              </div>

              <div className="w-full lg:w-80 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">Guía Regulatoria Colombiana</h3>
                <div className="space-y-3 text-[11px] text-slate-500 leading-relaxed text-left font-mono">
                  <div>
                    <strong className="text-slate-800 font-sans">Fecha del Sistema Operativo:</strong>
                    <p className="font-mono text-emerald-700 font-extrabold">20 de Mayo, 2026</p>
                  </div>
                  <div>
                    <strong className="text-slate-800 font-sans">Antibióticos & Regulares:</strong>
                    <p>Las recetas médicas presentan vencimiento legal imperativo a los 30 días de su fecha de expedición.</p>
                  </div>
                  <div>
                    <strong className="text-slate-800 font-sans">Medicamentos Controlados:</strong>
                    <p>Exigen contrastar la Cédula CC idéntica, el nombre coincidente del titular y el Sello Sanitario en papel.</p>
                  </div>
                  <div>
                    <strong className="text-slate-800 font-sans">Estricto Cadena de Frío:</strong>
                    <p>Al despachar Lantus de cadena de frío, debe pulsar "Añadir Bolsa" para mantener el gel protector.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Portada Footer */}
            <div className="max-w-6xl mx-auto w-full text-center border-t border-slate-200 pt-6 text-[10px] text-slate-400 flex flex-col md:flex-row justify-between items-center gap-2">
              <span>SISTEMA REGISTRADO DE CAPACITACIÓN CLÍNICO-ADMINISTRATIVO COLOMBIA</span>
              <span>ENTORNO SEGURO - APRENDIZAJE EXPERIENCIAL</span>
            </div>
          </motion.div>
        )}

        {/* End summary screen - Pharmacy light styled */}
        {gameState === 'end_summary' && (
          <motion.div 
            key="summary"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex-1 flex flex-col justify-between p-6 md:p-12 z-10"
          >
            <div className="max-w-4xl mx-auto w-full my-auto py-8 text-center space-y-8">
              <div className="flex flex-col items-center space-y-2">
                <HeartPulse className="w-16 h-16 text-emerald-600" />
                <h1 className="text-2xl md:text-4xl font-black font-sans text-slate-900 uppercase tracking-tight">
                  Reporte de Calificación: Turno de Caja Finalizado
                </h1>
                <p className="text-slate-500 text-xs md:text-sm max-w-lg leading-relaxed">
                  Tu turno ha finalizado correctamente. La dirección técnica de la farmacia corporativa emite el siguiente extracto oficial de observaciones académicas del POS:
                </p>
              </div>

              {/* Metric cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto text-left">
                
                <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between shadow-2xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono tracking-wider font-bold">Porcentaje de Éxito</span>
                    <span className={`text-4xl font-mono font-bold block mt-1 ${Math.round((auditHistory.filter(a => a.success).length / totalCases) * 100) >= 70 ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {Math.round((auditHistory.filter(a => a.success).length / totalCases) * 100)}%
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-3 leading-relaxed font-sans">
                    {Math.round((auditHistory.filter(a => a.success).length / totalCases) * 100) >= 80 
                      ? 'Excelente precisión de arqueo y fiscalización. Estás acreditado de mostrador.' 
                      : 'Se recomienda leer con mayor detalle la guía técnica de mostrador colombiana.'}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between shadow-2xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono tracking-wider font-bold">Puntaje Logrado</span>
                    <span className="text-4xl font-mono font-bold text-slate-900 block mt-1">
                      {score} <span className="text-sm font-sans font-normal text-slate-400">pts</span>
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-3 leading-relaxed font-sans">
                    Nivel de satisfacción y pericia técnica del regente en mostrador.
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between shadow-2xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono tracking-wider font-bold">Arqueo Final de Efectivo COP</span>
                    <span className={`text-3xl font-mono font-bold block mt-1.5 ${cashBalance >= 300000 ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {formatCOP(cashBalance)}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-3 font-mono leading-normal">
                    Fondo inicial: {formatCOP(300000)}
                    <br />
                    Flujo neto: {(cashBalance - 300000) >= 0 ? '+' : ''}{formatCOP(cashBalance - 300000)}
                  </p>
                </div>

              </div>

              {/* List of actions summarized */}
              <div className="bg-white max-w-3xl mx-auto rounded-xl border border-slate-200 p-4 text-left shadow-2xs">
                <h3 className="text-[10px] uppercase font-mono text-slate-400 font-bold mb-3 tracking-wider">Historial de Observaciones de Inspección</h3>
                <div className="space-y-2 max-h-[190px] overflow-y-auto pr-2">
                  {auditHistory.map((item, index) => (
                    <div key={`audit-${item.id}-${index}`} className="bg-slate-50 p-3 rounded border border-slate-200 flex justify-between items-start gap-3 text-xs leading-normal">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${item.success ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                          <strong className="text-slate-800">{item.customerName}</strong>
                          <span className="text-[9px] text-slate-400 font-mono">Registro: {item.id}</span>
                        </div>
                        <p className="text-slate-650 text-xs mt-1 leading-snug">{item.message}</p>
                      </div>
                      <div className="text-right font-mono font-bold text-[11px] self-center">
                        <span className={item.scoreImpact >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
                          {item.scoreImpact >= 0 ? `+${item.scoreImpact}` : `${item.scoreImpact}`} pts
                        </span>
                        {item.cashImpact !== 0 && (
                          <span className={`block text-[10px] mt-0.5 ${item.cashImpact >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                            {item.cashImpact >= 0 ? `+${formatCOP(item.cashImpact)}` : `-${formatCOP(Math.abs(item.cashImpact))}`}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-x-3 pt-2">
                <motion.button
                  id="btn-reiniciar-simulador"
                  onClick={startShift}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 px-8 rounded-lg text-xs transition-all cursor-pointer shadow-xs uppercase tracking-wider block sm:inline-block w-full sm:w-auto"
                >
                  Iniciar Nuevo Turno de Práctica
                </motion.button>
                <button
                  id="volver-bienvenida"
                  onClick={() => setGameState('welcome')}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 px-8 rounded-lg text-xs transition-all cursor-pointer uppercase tracking-wider border border-slate-300 block sm:inline-block w-full sm:w-auto mt-2 sm:mt-0"
                >
                  Volver a la portada
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Active training scenario gameplay */}
        {gameState === 'playing' && (
          <motion.div 
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans select-none w-full"
          >
            {/* Sleek High-Contrast Pharmacy Workplace Header */}
            <div className="h-12 bg-white text-slate-800 border-b border-slate-200 flex items-center justify-between px-6 z-20 shadow-2xs">
              <div className="flex items-center gap-4">
                <HeartPulse className="w-5 h-5 text-emerald-600" />
                <span className="font-sans font-black tracking-widest text-slate-900 text-xs sm:text-sm uppercase leading-none">ACADEMIA FARMAPOS SYSTEM</span>
                <span className="text-[10px] text-slate-400 font-mono hidden md:inline leading-none">| EVALUACIÓN OPERATIVA COLOMBIA</span>
              </div>
              
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="bg-slate-100 text-slate-705 px-2.5 py-1 rounded-full text-[10px] font-bold hidden sm:inline">
                  GUÍA DE APRENDIZ
                </span>
                <span className="bg-emerald-50 text-emerald-850 border border-emerald-200 px-2.5 py-1 rounded-full font-bold text-[10px] sm:text-xs">
                  PUNTOS: {score}
                </span>
                <span className="bg-blue-50 text-blue-900 border border-blue-200 px-2.5 py-1 rounded-full font-bold text-[10px] sm:text-xs">
                  ARQUEO CAJA: {formatCOP(cashBalance)}
                </span>
              </div>
            </div>

            {/* Structured Practicing Area */}
            <div className="flex-1 max-w-7xl mx-auto w-full p-4 flex flex-col gap-4">
              
              {/* TOP ROW: THE COUNTERTOP (MOSTRADOR) WITH LOGISTICS */}
              <div id="mostrador-top-deck" className="w-full">
                <Mostrador
                  currentCase={currentCase}
                  presentedProduct={getPresentedProduct()}
                  onScanBarcode={(prod) => handleAddItem(prod, 1)}
                  gameCurrentDate={GAME_CURRENT_DATE}
                />
              </div>

              {/* MIDDLE SECTION: DIVISION 12 COLUMNS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                
                {/* LEFT 4-COLUMNS: TRAINING MANUAL AND LASER BARCODE READER DEVICE */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                  
                  {/* Lector Láser de Códigos Widget */}
                  <div className="bg-white border-2 border-emerald-100 rounded-xl p-4 shadow-sm flex flex-col justify-between text-left">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-2">
                      <div className="p-1 px-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs font-mono font-bold">
                        LASER-UPC
                      </div>
                      <div>
                        <h4 className="text-[10px] text-slate-400 font-bold uppercase font-mono block leading-none">Lectora de Códigos Manual</h4>
                        <span className="text-[9px] text-slate-500">Registra el empaque presentado de forma instantánea.</span>
                      </div>
                    </div>

                    {/* Physical Scanning Area slot with red pulsing laser line */}
                    <div className="bg-slate-900 rounded-lg h-14 relative overflow-hidden flex flex-col items-center justify-center p-2 mb-3 border border-slate-800">
                      <div className="absolute inset-x-0 top-1/2 h-0.5 bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,1)] animate-bounce"></div>
                      <span className="text-[10px] font-mono font-semibold tracking-widest text-emerald-400 z-10 text-center uppercase select-none opacity-85">
                        [ ESCÁNER DE BARRAS LÁSER ]
                      </span>
                      <span className="text-[8.5px] font-mono text-slate-450 z-10 text-center mt-1">
                        {getPresentedProduct() ? getPresentedProduct()?.barcode : 'Sin Medicamento'}
                      </span>
                    </div>

                    {getPresentedProduct() ? (
                      <motion.button
                        id="scanner-maquina-lectora"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLeftColumnScan}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-3 rounded text-[11px] uppercase tracking-wider transition-all cursor-pointer text-center shadow-2xs flex items-center justify-center gap-1.5"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Escanear Código y Precio al Instante
                      </motion.button>
                    ) : (
                      <button
                        disabled
                        className="w-full bg-slate-100 text-slate-400 font-bold font-mono py-2.5 px-3 rounded text-[10px] border border-slate-200 cursor-not-allowed select-none uppercase tracking-wider"
                      >
                        Bandeja Escáner Vacía
                      </button>
                    )}
                  </div>

                  {/* Quick-Guide list card (Guía Rápida de Funciones) */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex-1 text-left">
                    <button
                      onClick={() => setGuideExpanded(!guideExpanded)}
                      className="w-full flex justify-between items-center text-left cursor-pointer focus:outline-none group pb-2 border-b border-slate-105"
                    >
                      <h3 className="text-xs font-black text-slate-950 uppercase flex items-center gap-2 tracking-wider">
                        <BookOpen className="w-4 h-4 text-emerald-600" /> Guía de Funciones de Caja
                      </h3>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-bold lg:hidden select-none">
                          {guideExpanded ? 'Ocultar' : 'Mostrar'}
                        </span>
                        <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${guideExpanded ? 'rotate-90' : ''}`} />
                      </div>
                    </button>
                    
                    <AnimatePresence initial={false}>
                      {guideExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-3 text-[11px] text-slate-600 leading-normal mt-3">
                            <div className="bg-slate-50 p-2.5 rounded border border-slate-150">
                              <strong className="text-slate-800 block mb-0.5">1. Registro de Barras:</strong>
                              <span>Presiona el botón de <strong>"Escanear Código"</strong> en la lectora láser para ingresar la medicina y su precio al instante al sistema central.</span>
                            </div>

                            <div className="bg-slate-50 p-2.5 rounded border border-slate-150">
                              <strong className="text-slate-800 block mb-0.5">2. Varios Productos:</strong>
                              <span>Utiliza el buscador central del catálogo POS si requieres dispensar unidades adicionales haciendo clic en el icono de carrito.</span>
                            </div>

                            <div className="bg-slate-50 p-2.5 rounded border border-slate-150">
                              <strong className="text-slate-800 block mb-0.5">3. Copago Seguro EPS Colombiana:</strong>
                              <span>Si la tarjeta o carnet de seguro (ej. Famisanar, Sura, EPS) está presentado, oprime el botón inline <strong>"Aplicar"</strong> en el tiquete del POS.</span>
                            </div>

                            <div className="bg-slate-50 p-2.5 rounded border border-slate-150">
                              <strong className="text-slate-800 block mb-0.5">4. Cadena de Frío Termolábil:</strong>
                              <span>Si despachas insulina Lantus, exige activar la bolsa protectora con el botón de <strong>bolsa térmica</strong> con gel ($2.500 COP).</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                </div>

                {/* RIGHT 8-COLUMNS: CENTRAL COMPUTER SCREEN SYSTEM POS */}
                <div className="lg:col-span-8 flex flex-col justify-between">
                  
                  {/* Monitor bezel frame */}
                  <div className="bg-slate-205 p-2 rounded-2xl border-4 border-slate-300 shadow-inner bg-slate-200">
                    
                    {/* Central POS Navigation */}
                    <div className="flex bg-[#0f172a] border border-b-0 border-slate-800 rounded-t-lg overflow-hidden text-xs">
                      <button
                        onClick={() => setSelectedSubTab('scan')}
                        className={`py-2 px-4 font-bold tracking-tight border-r border-[#1e293b] transition-all cursor-pointer flex items-center gap-1.5 ${
                          selectedSubTab === 'scan'
                            ? 'bg-slate-50 text-slate-800 font-extrabold'
                            : 'text-slate-400 hover:bg-slate-850'
                        }`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5 text-emerald-500" /> Computador POS: Facturar Venta
                      </button>
                      <button
                        onClick={() => setSelectedSubTab('history')}
                        className={`py-2 px-4 font-bold tracking-tight transition-all cursor-pointer flex items-center gap-1.5 ${
                          selectedSubTab === 'history'
                            ? 'bg-slate-50 text-slate-800 font-extrabold'
                            : 'text-slate-400 hover:bg-slate-850'
                        }`}
                      >
                        <FolderOpen className="w-3.5 h-3.5 text-blue-450 text-sky-400" /> Historial de Logs ({auditHistory.length})
                      </button>
                    </div>

                    {/* Content area inside screen mockup */}
                    <div className="min-h-[435px]">
                      {selectedSubTab === 'history' ? (
                        <div className="bg-white border-2 border-slate-200 rounded-b-xl p-5 flex flex-col h-full overflow-y-auto max-h-[435px] text-left">
                          <h3 className="text-xs uppercase font-mono text-slate-450 mb-3 font-semibold pb-1.5 border-b border-slate-100">Bitácora de Observaciones de Caja</h3>
                          
                          <div className="space-y-2">
                            {auditHistory.map((item, index) => (
                              <div key={`history-log-${index}`} className="bg-slate-50 p-3 rounded border border-slate-200 text-xs leading-relaxed">
                                <div className="flex justify-between items-center">
                                  <span className="font-extrabold text-slate-800">{item.customerName}</span>
                                  <span className={`font-mono font-black text-[10px] uppercase ${item.success ? 'text-emerald-700 bg-emerald-50 px-1.5 border border-emerald-200' : 'text-rose-700 bg-rose-50 px-1.5 border border-rose-200'}`}>
                                    {item.success ? 'DESPACHO COMPLETO EXCELENTE' : 'INFRACCIÓN REGISTRADA'}
                                  </span>
                                </div>
                                <p className="text-slate-600 mt-1 italic leading-snug">"{item.message}"</p>
                                <div className="flex justify-between border-t border-slate-150 pt-1.5 mt-1.5 font-mono text-[9px] text-slate-400">
                                  <span>ID REGISTRO: {item.id}</span>
                                  <span>
                                    Corte Caja: <strong className={item.cashImpact >= 0 ? 'text-emerald-700' : 'text-rose-600'}>{formatCOP(item.cashImpact)}</strong> | Puntos: {item.scoreImpact}
                                  </span>
                                </div>
                              </div>
                            ))}
                            {auditHistory.length === 0 && (
                              <div className="text-center font-mono py-16 text-slate-400 text-xs border border-dashed border-slate-200 rounded bg-slate-50/50">
                                <FolderOpen className="w-8 h-8 opacity-20 mx-auto mb-2" />
                                <span>No hay operaciones registradas aún. Finalice el despacho del primer cliente de mostrador.</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <PosTerminal
                          ticketItems={ticketItems}
                          onRemoveItem={handleRemoveItem}
                          onAddItem={handleAddItem}
                          onClearTicket={handleClearTicket}
                          insuranceApplied={insuranceApplied}
                          onApplyInsurance={handleApplyInsurance}
                          currentCustomerCase={currentCase}
                          allProducts={INITIAL_INVENTORY}
                          requiresColdBag={requiresColdBag}
                          onToggleColdBag={handleToggleColdBag}
                          onProceedToCheckout={handleProceedToCheckout}
                        />
                      )}
                    </div>

                  </div>

                  {/* REJECTION DENEGATION / AUDITOR CONSOLE MODULE (PAPERS PLEASE SYSTEM) */}
                  <div id="rejection-panel-container" className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-left mt-4 flex-1">
                    <button
                      onClick={() => setRejectionExpanded(!rejectionExpanded)}
                      className="w-full flex justify-between items-center text-left cursor-pointer focus:outline-none group pb-2 border-b border-slate-150"
                    >
                      <div className="pr-2">
                        <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block leading-none">Consola Especial de Denegación Técnica</span>
                        <span className="text-xs text-slate-650 font-sans mt-1 block">Si detectas una discrepancia legal de mostrador, selecciona la causal oportuna:</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <ShieldAlert className="w-4 h-4 text-rose-500" />
                        <span className="text-[10px] text-slate-400 font-bold lg:hidden select-none">
                          {rejectionExpanded ? 'Ocultar' : 'Mostrar'}
                        </span>
                        <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${rejectionExpanded ? 'rotate-90' : ''}`} />
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {rejectionExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden mt-3"
                        >
                          {/* Stamp rejection causes buttons */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                            {[
                              { key: 'reject_no_recipe', label: 'Sin receta médica legal / Habilitante' },
                              { key: 'reject_expired_recipe', label: 'Receta caducada u obsoleta (>30 días)' },
                              { key: 'reject_expired_med', label: 'Medicamento comercial físico ya vencido' },
                              { key: 'reject_wrong_dosage', label: 'Dosificación prescrita no coincide con físico' },
                              { key: 'reject_missing_stamp', label: 'Sello estatal nacional faltante en Psicotrópico' },
                              { key: 'reject_id_mismatch', label: 'Identidad (Cédula CC) no coincide con receta' },
                              { key: 'reject_forgery', label: 'Falsedad ideológica o alteración en documento' }
                            ].map((reasonOp) => (
                              <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                key={reasonOp.key}
                                id={`btn-reject-${reasonOp.key}`}
                                onClick={() => handleRejectAction(reasonOp.key)}
                                className="text-left bg-slate-50 hover:bg-rose-50/70 text-rose-800 hover:text-rose-950 border border-slate-200 hover:border-rose-300 p-2 rounded text-xs transition-all flex items-center justify-between cursor-pointer group"
                              >
                                <span className="font-semibold">{reasonOp.label}</span>
                                <span className="text-[9px] bg-rose-100 text-rose-900 border border-rose-300/60 px-2 py-0.5 rounded font-black uppercase pointer-events-none">
                                  Rechazar
                                </span>
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                </div>

              </div>

              {/* BOTTOM SECTION: PHYSICAL HARDWARE CASH REGISTER TRAY */}
              <div id="physical-drawer-section" className="w-full">
                <AnimatePresence mode="wait">
                  {shiftActiveStatus === 'checkout' && currentCheckoutInfo ? (
                    <motion.div 
                      key="drawer-open"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 30 }}
                      className="border-4 border-emerald-400 rounded-2xl p-2 bg-[#0b1329] shadow-lg text-left"
                    >
                      <div className="bg-emerald-700 text-white px-4 py-2 rounded-t-xl font-mono text-[10px] font-bold flex justify-between items-center">
                        <span className="flex items-center gap-1.5 uppercase tracking-wider">
                          <Unlock className="w-3.5 h-3.5" /> CAJÓN DE CAJA MONEDERO ABIERTO [ SISTEMA EMITIÓ APERTURA AUTOMÁTICA ]
                        </span>
                        <span>Hardware ID: CH-MON-COL-7</span>
                      </div>
                      <div className="min-h-[220px]">
                        <CajaRegistradora
                          paymentMethod={currentCheckoutInfo.method}
                          paymentReceived={currentCheckoutInfo.cashReceived}
                          totalToPay={ticketItems.reduce((acc, curr) => acc + (curr.originalPrice * curr.quantity), 0) - (insuranceApplied && currentCase.insuranceCard ? ticketItems.reduce((acc, curr) => acc + ((curr.originalPrice * (currentCase.insuranceCard!.copayPercentage / 100)) * curr.quantity), 0) : 0) + (requiresColdBag ? 2500 : 0)}
                          customerName={currentCase.name}
                          onFinishTransaction={handleFinishTransaction}
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <div key="drawer-closed" className="border-[3px] border-slate-350 rounded-2xl p-3 bg-white shadow-2xs text-left">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                            <Lock className="w-5 h-5 text-slate-400" />
                          </div>
                          <div>
                            <h4 className="text-[11px] font-extrabold uppercase font-mono text-slate-800 tracking-wide flex items-center gap-1">
                              Cajón Monedero / Caja Registradora Física: <span className="text-slate-450 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[9px] font-bold">CERRADO</span>
                            </h4>
                            <p className="text-[10px] text-slate-500 leading-normal mt-0.5">El cajón de caja de hardware está asegurado por cierre de solenoide. Se abrirá automáticamente y se deslizará físicamente con sonido de campana una vez liquide el tiquete presionando "PROCEDER A COBRAR".</p>
                          </div>
                        </div>

                        {/* Auxiliary drawer inspector tab trigger */}
                        <button
                          onClick={() => {
                            alert("El cajón de caja se abrirá automáticamente después de que completes el cobro del ticket presionando 'PROCEDER A COBRAR' y luego 'Confirmar Liquidación' en el monitor central.");
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded text-[10px] uppercase border border-slate-300 shadow-2xs transition-all tracking-wider whitespace-nowrap self-stretch sm:self-auto text-center cursor-pointer"
                        >
                          Ayuda del Cajón
                        </button>
                      </div>
                    </div>
                  )}
                </AnimatePresence>
              </div>

            </div>

            {/* Audit feedback overlay */}
            <AnimatePresence>
              {shiftActiveStatus === 'audit_modal' && latestAuditLog && (
                <AuditoriaModal
                  auditLog={latestAuditLog}
                  onNextCustomer={handleNextPatientProgress}
                />
              )}
            </AnimatePresence>

            {/* Auxiliary academic workstation footer */}
            <footer className="bg-white border-t border-slate-200 h-11 text-[9px] font-mono text-slate-400 flex items-center justify-between px-6 select-none mt-6">
              <div>GUARDA DE TURNO EN DESARROLLO COLOMBIA</div>
              <div className="flex gap-2">
                <span>PACIENTE ACTUAL: {currentCaseIndex + 1} / {totalCases}</span>
                <span>|</span>
                <span className="text-emerald-700 font-bold">SISTEMA EVALUADOR ACTIVO</span>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
