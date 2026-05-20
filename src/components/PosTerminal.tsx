/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, ShoppingCart, Trash2, Shield, Percent, CreditCard, DollarSign, Sparkles } from 'lucide-react';
import { Product, TicketItem, CustomerCase, ProductClass, formatCOP } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface PosTerminalProps {
  ticketItems: TicketItem[];
  onRemoveItem: (index: number) => void;
  onAddItem: (product: Product, quantity: number) => void;
  onClearTicket: () => void;
  insuranceApplied: boolean;
  onApplyInsurance: () => void;
  currentCustomerCase: CustomerCase;
  allProducts: Product[];
  requiresColdBag: boolean;
  onToggleColdBag: () => void;
  onProceedToCheckout: (method: 'cash' | 'card' | 'insurance_only', amountPayerHanded: number) => void;
}

export default function PosTerminal({
  ticketItems,
  onRemoveItem,
  onAddItem,
  onClearTicket,
  insuranceApplied,
  onApplyInsurance,
  currentCustomerCase,
  allProducts,
  requiresColdBag,
  onToggleColdBag,
  onProceedToCheckout
}: PosTerminalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [cashAmountInput, setCashAmountInput] = useState('');

  // Filter products by search term
  const filteredProducts = allProducts.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode.includes(searchTerm)
  );

  // Subtotals (All values computed rigorously in COP integers/decimals)
  const totalOriginal = ticketItems.reduce((acc, curr) => acc + (curr.originalPrice * curr.quantity), 0);
  const totalInsuranceDiscount = insuranceApplied && currentCustomerCase.insuranceCard 
    ? ticketItems.reduce((acc, curr) => acc + ((curr.originalPrice * (currentCustomerCase.insuranceCard!.copayPercentage / 100)) * curr.quantity), 0)
    : 0;
  
  const coldBagCost = requiresColdBag ? 2500 : 0; // 2.500 COP
  const grandTotal = Math.max(0, totalOriginal - totalInsuranceDiscount + coldBagCost);

  const handleApplyInsurance = () => {
    if (!currentCustomerCase.insuranceCard) return;
    onApplyInsurance();
  };

  const handleCheckoutBtn = () => {
    if (ticketItems.length === 0) return;
    // For COP, suggest the next tidy billing bill denomination
    const roundedHigher = Math.ceil(grandTotal / 5000) * 5000;
    const defaultCash = roundedHigher < grandTotal ? roundedHigher + 5000 : roundedHigher;
    setCashAmountInput(defaultCash.toString());
    setPaymentMethod('cash');
    setCheckoutModalOpen(true);
  };

  const handleFinalCheckout = () => {
    if (paymentMethod === 'cash') {
      const amt = parseFloat(cashAmountInput);
      if (isNaN(amt) || amt < grandTotal) {
        alert(`Monto recibido insuficiente. El total a pagar es ${formatCOP(grandTotal)}.`);
        return;
      }
      onProceedToCheckout('cash', amt);
    } else {
      onProceedToCheckout('card', grandTotal);
    }
    setCheckoutModalOpen(false);
  };

  return (
    <div id="pos-terminal-base" className="bg-white border-2 border-slate-200 rounded-xl flex flex-col h-full min-h-[500px] shadow-md text-slate-800">
      
      {/* POS Top Bar - Clear Clinical Style */}
      <div className="bg-[#0f172a] px-4 py-3 rounded-t-lg flex justify-between items-center text-xs font-mono">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-emerald-400 font-extrabold tracking-wider">SISTEMA POS PHARMA-V7 COLOMBIA</span>
        </div>
        <div className="text-slate-300">
          Terminal ID: <span className="text-emerald-300 font-bold">POS_CAJA_01</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden min-h-0 bg-slate-50">
        
        {/* Left pane: Product Catalog search and details (Column span 7) */}
        <div className="lg:col-span-7 p-4 flex flex-col border-r border-slate-200 overflow-y-auto max-h-[500px] lg:max-h-full">
          <div className="mb-3">
            <label className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider block mb-1">MÓDULO DE BÚSQUEDA DEL CATÁLOGO DE MEDICAMENTOS</label>
            <div className="relative">
              <input
                id="pos-buscar-medicamento"
                type="text"
                placeholder="Buscar por marca, genérico o ingrese código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 pl-9 focus:outline-hidden focus:border-emerald-500 font-mono transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 max-h-[220px]">
            {filteredProducts.map((prod) => {
              const isLowStock = prod.stock <= 10;
              const isControlled = prod.category === ProductClass.CONTROLLED;
              const isCold = prod.category === ProductClass.COLD_CHAIN;
              
              return (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  id={`cat-${prod.id}`}
                  key={prod.id}
                  className="bg-white p-2.5 rounded border border-slate-200 flex justify-between items-start hover:border-emerald-300 hover:shadow-2xs transition-all text-xs"
                >
                  <div className="max-w-[70%] text-left">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-extrabold text-slate-900">{prod.name}</span>
                      {isControlled && (
                        <span className="bg-rose-50 text-rose-700 font-black px-1.5 py-0.5 rounded-[4px] text-[8px] border border-rose-200">
                          CONTROLADO
                        </span>
                      )}
                      {isCold && (
                        <span className="bg-sky-50 text-sky-700 font-black px-1.5 py-0.5 rounded-[4px] text-[8px] border border-sky-200">
                          CADENA FRÍO
                        </span>
                      )}
                    </div>
                    <div className="text-slate-500 mt-1">
                      Componente: <span className="font-medium text-slate-700">{prod.genericName}</span> | Dosis: {prod.dosage}
                    </div>
                    <div className="text-slate-400 mt-0.5 text-[10px]">
                      Vence: <strong className="font-mono text-slate-500">{prod.expirationDate}</strong> | {prod.shelfLocation}
                    </div>
                  </div>

                  <div className="text-right flex flex-col justify-between h-full min-h-[50px] self-stretch">
                    <span className="font-extrabold text-emerald-700 text-sm font-mono">{formatCOP(prod.price)}</span>
                    <div className="flex items-center gap-1.5 mt-2 justify-end">
                      <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded ${
                        isLowStock ? 'bg-amber-50 text-amber-700 border border-amber-200 font-semibold' : 'bg-slate-100 text-slate-500'
                      }`}>
                        Stock: {prod.stock} {isLowStock && '⚠️'}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onAddItem(prod, 1)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-1 rounded transition-all cursor-pointer shadow-xs"
                        title="Añadir manual al cobro"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            {filteredProducts.length === 0 && (
              <div className="text-slate-400 text-center font-mono py-8 bg-white rounded border border-dashed border-slate-200 text-xs">
                Medicamento no disponible en inventario.
              </div>
            )}
          </div>

          {/* Sugerencias de genéricos / Alternativas para el administrador */}
          <div className="mt-4 bg-[#f0f9ff] p-3 rounded-lg border border-sky-100 text-xs flex flex-col gap-1.5 text-left">
            <span className="text-sky-850 font-extrabold flex items-center gap-1 text-[11px] uppercase tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" /> REEMPLAZO GENÉRICO RECOMENDADO:
            </span>
            <p className="text-slate-650 text-[11px] leading-relaxed">
              Recuerda sugerir un <strong className="text-emerald-700 font-bold font-sans">Medicamento Genérico equivalente</strong> si la marca oficial es de precio restrictivo para el bolsillo del paciente. ¡Ayuda a cumplir la guía del POS nacional!
            </p>
          </div>
        </div>

        {/* Right pane: Shopping List, receipt, discounts, and payment (Column span 5) - Styled as a physical thermal receipt document */}
        <div className="lg:col-span-5 p-4 bg-white text-slate-800 flex flex-col justify-between max-h-[500px] lg:max-h-full border-t border-l border-slate-200 shadow-inner">
          <div>
            <span className="text-[10px] uppercase font-mono font-extrabold text-slate-400 tracking-wider block mb-2 text-left">TICKET COMPUTADO DE DISPENSACIÓN</span>
            
            {/* Table Items */}
            <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
              <AnimatePresence>
                {ticketItems.map((item, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    key={`${item.product.id}-${idx}`} 
                    className="flex justify-between items-center text-xs bg-slate-50 p-2 border border-slate-200 rounded shadow-2xs text-slate-800"
                  >
                    <div className="max-w-[70%] text-left">
                      <span className="font-extrabold text-slate-900 block uppercase tracking-tight">{item.product.name}</span>
                      <span className="text-[9px] text-slate-500 font-mono">
                        {item.quantity} und x {formatCOP(item.originalPrice)}
                        {insuranceApplied && (
                          <span className="text-emerald-700 font-bold ml-1 font-sans">
                            (EPS)
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-xs text-nowrap">
                        {formatCOP((item.originalPrice * item.quantity) - (insuranceApplied ? (item.originalPrice * (currentCustomerCase.insuranceCard?.copayPercentage || 0) / 100) * item.quantity : 0))}
                      </span>
                      <button
                        onClick={() => onRemoveItem(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-slate-200/50 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {ticketItems.length === 0 && (
                <div className="text-center text-slate-400 font-mono py-12 text-xs border border-dashed border-slate-200 rounded bg-slate-50">
                  SIN REGISTROS EN TIPO.
                  <br /> Escanee medicamentos físicos con la lectora.
                </div>
              )}
            </div>
          </div>

          {/* Checkout controls */}
          <div className="border-t border-slate-200 pt-3 mt-3 space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
            
            {/* Auxiliar cold bag check for cold-chain medications */}
            <div className="flex items-center justify-between bg-white p-2 rounded border border-slate-200">
              <div className="text-left">
                <span className="font-bold block text-sky-700 text-xs">Protección de Temperatura Cadena Frío</span>
                <span className="text-[9px] text-slate-450">¿Insulinas/Sueros? Exige bolsa de gel térmico.</span>
              </div>
              <motion.button
                id="btn-bolsa-termica"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onToggleColdBag}
                className={`text-[9px] font-mono px-2 py-1 rounded border uppercase font-extrabold transition-all cursor-pointer ${
                  requiresColdBag 
                    ? 'bg-sky-100 text-sky-850 border-sky-300'
                    : 'bg-slate-100 text-slate-500 border-slate-350'
                }`}
              >
                {requiresColdBag ? `Bolsa Sí (${formatCOP(2500)})` : 'AÑADIR BOLSA'}
              </motion.button>
            </div>

            {/* Insurance EPS details */}
            {currentCustomerCase.insuranceCard && (
              <div className="flex items-center justify-between bg-emerald-50 p-2 rounded border border-emerald-200">
                <div className="text-[11px] max-w-[65%] text-left">
                  <span className="font-bold block text-emerald-850 uppercase text-[9px]">{currentCustomerCase.insuranceCard.provider}</span>
                  <span className="text-[9px] text-slate-550 block leading-tight">Plan EPS Vigente - Copago compensado</span>
                </div>
                <motion.button
                  id="btn-aplicar-seguro"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleApplyInsurance}
                  className={`text-[9px] font-mono px-2 py-1 rounded border transition-all cursor-pointer ${
                    insuranceApplied 
                      ? 'bg-emerald-600 text-white font-extrabold border-emerald-700'
                      : 'bg-emerald-150 text-emerald-800 border-emerald-300'
                  }`}
                >
                  {insuranceApplied ? 'APLICADO' : 'APLICAR'}
                </motion.button>
              </div>
            )}

            {/* Price Calculations */}
            <div className="space-y-1 text-xs text-slate-700">
              <div className="flex justify-between text-slate-450 font-mono">
                <span>IMPORTE COMPONENTES:</span>
                <span>{formatCOP(totalOriginal)}</span>
              </div>
              {insuranceApplied && (
                <div className="flex justify-between text-emerald-700 font-semibold font-mono">
                  <span>SUBSIDIO DE COASEGURO ({currentCustomerCase.insuranceCard?.copayPercentage}%):</span>
                  <span>-{formatCOP(totalInsuranceDiscount)}</span>
                </div>
              )}
              {requiresColdBag && (
                <div className="flex justify-between text-sky-750 font-semibold font-mono">
                  <span>EMPAQUETADO FRÍO GEL:</span>
                  <span>+{formatCOP(coldBagCost)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-300 pt-1.5 items-end">
                <span className="font-extrabold text-slate-900 uppercase tracking-wide text-xs">TOTAL A CANCELAR:</span>
                <span className="text-xl font-mono font-black text-emerald-700 leading-none">{formatCOP(grandTotal)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <motion.button
              id="btn-proceder-pago"
              onClick={handleCheckoutBtn}
              disabled={ticketItems.length === 0}
              whileHover={ticketItems.length > 0 ? { scale: 1.02 } : {}}
              whileTap={ticketItems.length > 0 ? { scale: 0.98 } : {}}
              className={`w-full text-center py-2.5 rounded font-black text-xs uppercase tracking-widest cursor-pointer transition-all ${
                ticketItems.length === 0
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
              }`}
            >
              PROCEDER A COBRAR
            </motion.button>
          </div>
        </div>

      </div>

      {/* POS Checkout & Payment popup window */}
      <AnimatePresence>
        {checkoutModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-left"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="bg-white border-2 border-slate-200 rounded-xl max-w-md w-full p-6 text-slate-850 shadow-2xl relative"
            >
              <h3 className="text-sm font-black text-slate-950 mb-3 flex items-center gap-2 uppercase tracking-wide">
                <CreditCard className="w-5 h-5 text-emerald-600" /> Liquidación e Instrumento de Pago COP
              </h3>

              <div className="bg-slate-50 p-3.5 rounded border border-slate-200 font-mono text-xs mb-4 space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Paciente:</span>
                  <span className="font-bold text-slate-800">{currentCustomerCase.name}</span>
                </div>
                <div className="flex justify-between text-base border-t border-slate-200 pt-2 mt-2">
                  <span className="text-slate-705 font-bold">TOTAL A LIQUIDAR POS:</span>
                  <span className="text-emerald-700 font-extrabold">{formatCOP(grandTotal)}</span>
                </div>
              </div>

              {/* Methods Tabs */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`py-3 px-2 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 justify-center transition-all cursor-pointer ${
                    paymentMethod === 'cash'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-extrabold'
                      : 'bg-white border-slate-250 text-slate-450 hover:bg-slate-50'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  EFECTIVO (ABRE CAJÓN)
                </button>
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`py-3 px-2 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 justify-center transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'bg-sky-55/70 border-sky-500 text-sky-850 font-extrabold'
                      : 'bg-white border-slate-250 text-slate-450 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  TARJETA DATÁFONO
                </button>
              </div>

              {/* Cash details input */}
              {paymentMethod === 'cash' && (
                <div className="mb-4 bg-slate-50 border border-slate-200 p-3 rounded-lg">
                  <label className="text-[9px] uppercase font-mono font-bold text-slate-450 tracking-wider block mb-1">
                    Monto Recibido en Pesos Físicos (COP)
                  </label>
                  <div className="flex gap-2.5 items-center flex-wrap">
                    <div className="relative flex-1 min-w-[140px]">
                      <span className="absolute left-2.5 top-2 text-slate-400 font-mono">$</span>
                      <input
                        type="number"
                        value={cashAmountInput}
                        onChange={(e) => setCashAmountInput(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded py-1.5 pl-6 pr-2 text-sm text-slate-900 font-mono focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>
                    {/* Quick-fill buttons */}
                    {[grandTotal, Math.ceil(grandTotal / 5000) * 5000, Math.ceil(grandTotal / 10000) * 10000, 50000, 100000].map((quickVal) => (
                      <button
                        key={`quick-${quickVal}`}
                        onClick={() => setCashAmountInput(quickVal.toString())}
                        className="bg-white hover:bg-slate-100 text-slate-700 font-mono text-[9px] px-2 py-1 rounded transition-all border border-slate-200 cursor-pointer shadow-2xs font-semibold"
                      >
                        {formatCOP(quickVal)}
                      </button>
                    ))}
                  </div>
                  <p className="text-[9px] text-slate-450 mt-2.5 leading-relaxed font-mono">
                    Ingrese la divisa que entregó el cliente en mostrador (para este caso: {formatCOP(grandTotal)} o superior). El cajón monedero se abrirá visualmente abajo al guardar.
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setCheckoutModalOpen(false)}
                  className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-500 font-semibold py-2 px-4 rounded text-xs transition-all cursor-pointer text-center"
                >
                  Regresar
                </button>
                <button
                  id="btn-liquidar-POS"
                  onClick={handleFinalCheckout}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded text-xs transition-colors transition-all cursor-pointer text-center uppercase shadow-2xs"
                >
                  Confirmar Liquidación
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
