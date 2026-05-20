/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { RotateCcw, CheckCircle, Smartphone, Award, Coins } from 'lucide-react';
import { BillCoin, formatCOP } from '../types';
import { motion, AnimatePresence } from 'motion/react';

const playSound = (type: 'beep' | 'coin' | 'drawer' | 'success') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    if (type === 'beep') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'coin') {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.frequency.setValueAtTime(2200, ctx.currentTime);
      osc2.frequency.setValueAtTime(2800, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.18);
      osc2.stop(ctx.currentTime + 0.18);
    } else if (type === 'drawer') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
      
      setTimeout(() => {
        const ctx2 = new AudioContext();
        const oscRing = ctx2.createOscillator();
        const gainRing = ctx2.createGain();
        oscRing.connect(gainRing);
        gainRing.connect(ctx2.destination);
        oscRing.frequency.setValueAtTime(1700, ctx2.currentTime);
        gainRing.gain.setValueAtTime(0.12, ctx2.currentTime);
        gainRing.gain.exponentialRampToValueAtTime(0.001, ctx2.currentTime + 0.35);
        oscRing.start();
        oscRing.stop(ctx2.currentTime + 0.35);
      }, 70);
    } else if (type === 'success') {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc2.frequency.setValueAtTime(659.25, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.3);
      osc2.stop(ctx.currentTime + 0.3);
    }
  } catch (err) {}
};

const VAULT_MONEY: BillCoin[] = [
  { value: 50000, label: '$50.000 COP', type: 'bill' },
  { value: 20000, label: '$20.000 COP', type: 'bill' },
  { value: 10000, label: '$10.000 COP', type: 'bill' },
  { value: 5000, label: '$5.000 COP', type: 'bill' },
  { value: 2000, label: '$2.000 COP', type: 'bill' },
  { value: 1000, label: '$1.000 COP', type: 'bill' },
  { value: 500, label: '$500 COP', type: 'coin' },
  { value: 200, label: '$200 COP', type: 'coin' },
  { value: 100, label: '$100 COP', type: 'coin' },
  { value: 50, label: '$50 COP', type: 'coin' }
];

interface CajaRegistradoraProps {
  paymentMethod: 'cash' | 'card' | 'insurance_only';
  paymentReceived: number;
  totalToPay: number;
  customerName: string;
  onFinishTransaction: (returnedChange: number) => void;
}

export default function CajaRegistradora({
  paymentMethod,
  paymentReceived,
  totalToPay,
  customerName,
  onFinishTransaction
}: CajaRegistradoraProps) {
  const [changeStack, setChangeStack] = useState<{ [value: number]: number }>({});
  const changeDue = Math.max(0, paymentReceived - totalToPay);

  useEffect(() => {
    if (paymentMethod === 'cash') {
      playSound('drawer');
    }
    setChangeStack({});
  }, [paymentMethod, paymentReceived, totalToPay]);

  const totalInChangeStack = Object.entries(changeStack).reduce(
    (sum, [valStr, count]) => sum + Number(valStr) * Number(count),
    0
  );

  const addMoney = (value: number) => {
    playSound('coin');
    setChangeStack(prev => ({
      ...prev,
      [value]: (prev[value] || 0) + 1
    }));
  };

  const removeMoney = (value: number) => {
    if (!changeStack[value]) return;
    playSound('coin');
    setChangeStack(prev => {
      const copy = { ...prev };
      if (copy[value] <= 1) {
        delete copy[value];
      } else {
        copy[value]--;
      }
      return copy;
    });
  };

  const clearStack = () => {
    playSound('coin');
    setChangeStack({});
  };

  const handleEntregar = () => {
    playSound('success');
    onFinishTransaction(Math.round(totalInChangeStack));
  };

  if (paymentMethod !== 'cash') {
    return (
      <motion.div 
        id="datáfono-screen" 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-[#f8fafc] border-2 border-slate-200 rounded-xl p-5 text-slate-800 flex flex-col items-center justify-center text-center h-full min-h-[300px]"
      >
        <motion.div 
          animate={{ scale: [1, 1.05, 1] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center border-2 border-sky-300 mb-3"
        >
          <Smartphone className="w-8 h-8 text-sky-600" />
        </motion.div>
        
        <h3 className="text-base font-bold text-slate-900 mb-1">Muelle de Autorización Transaccional</h3>
        <p className="text-xs text-slate-500 mb-4 max-w-sm">
          {paymentMethod === 'card' 
            ? `El cliente abonará un total de ${formatCOP(totalToPay)} mediante Datáfono electrónico.`
            : `El seguro cubre la totalidad para ${customerName}. Copago final: ${formatCOP(0)}`}
        </p>

        <div className="bg-white p-3.5 rounded-lg font-mono text-xs border border-slate-200 w-full max-w-sm mb-4 space-y-1.5 text-left shadow-2xs">
          <div className="flex justify-between">
            <span className="text-slate-400">BENEFICIARIO:</span>
            <span className="text-slate-800 font-bold">{customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">PASARELA TR:</span>
            <span className="text-sky-700 font-extrabold">{paymentMethod === 'card' ? 'TARJETA CHIP / SIN CONTACTO' : 'CONVENIO SUBSIDIADO'}</span>
          </div>
          <div className="flex justify-between border-t border-slate-100 pt-2 text-sm">
            <span className="text-slate-600 font-bold">MONTO LIQUIDADOR:</span>
            <span className="text-emerald-700 font-black font-mono">{paymentMethod === 'card' ? formatCOP(totalToPay) : formatCOP(0)}</span>
          </div>
        </div>

        <motion.button
          id="btn-confirmar-datafono"
          onClick={handleEntregar}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full max-w-sm bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-6 rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer text-xs uppercase"
        >
          <CheckCircle className="w-4 h-4" />
          Procesar Firma y Facturar
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ y: 50, scaleY: 0.8, opacity: 0 }}
      animate={{ y: 0, scaleY: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 14 }}
      id="caja-registradora-container" 
      className="bg-slate-900 border-x-4 border-b-8 border-t-2 border-slate-750 rounded-b-xl rounded-t-sm p-4 text-slate-100 flex flex-col h-full shadow-2xl relative"
    >
      {/* Front bezel groove of the dynamic drawer cash hardware */}
      <div className="absolute inset-x-0 -top-1 h-1 bg-slate-950 opacity-40"></div>

      {/* Encabezado Arqueo express with high contrast dark digital styling */}
      <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800 mb-4 text-xs">
        <div>
          <span className="text-[10px] text-emerald-500 block uppercase font-mono tracking-wider font-extrabold">HARDWARE POS: CAJÓN REGISTRADOR EXPULSADO</span>
          <span className="text-xs text-slate-350">Devuelva el vuelto físico legal a: <strong>{customerName}</strong></span>
        </div>
        <div className="text-right">
          <span className="text-[9px] text-slate-400 block uppercase font-mono font-bold label">VUELTO REQUERIDO</span>
          <span className="text-emerald-400 font-mono font-extrabold text-base bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-500/20">
            {formatCOP(changeDue)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
        
        {/* Bandejas Dinero (Interactive register layout structured beautifully) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Billetes Row */}
          <div>
            <h4 className="text-[9px] text-emerald-400 font-mono uppercase mb-1.5 font-bold tracking-wider">BANDEJAS DE PROTECCIÓN FISCAL (BILLETES COP)</h4>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {VAULT_MONEY.filter(m => m.type === 'bill').map((money) => (
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  key={`bill-${money.value}`}
                  onClick={() => addMoney(money.value)}
                  className="bg-[#1e293b] hover:bg-emerald-950/40 border border-[#334155] hover:border-emerald-500/50 p-2 text-center rounded-lg flex flex-col justify-between items-center group transition-all cursor-pointer h-16 shadow-lg relative overflow-hidden"
                >
                  <span className="text-[10px] font-mono font-black text-slate-300 group-hover:text-emerald-300 pointer-events-none">
                    {formatCOP(money.value)}
                  </span>
                  <div className="w-7 h-4 bg-emerald-800 group-hover:bg-emerald-600 rounded flex items-center justify-center text-[8.5px] text-emerald-100 pointer-events-none font-extrabold">
                    COP
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Monedas Row */}
          <div>
            <h4 className="text-[9px] text-amber-400 font-mono uppercase mb-1.5 font-bold tracking-wider">BANDEJAS DE MONEDAS SÓLIDAS MENORES (MONEDAS COP)</h4>
            <div className="grid grid-cols-4 gap-2">
              {VAULT_MONEY.filter(m => m.type === 'coin').map((money) => (
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  key={`coin-${money.value}`}
                  onClick={() => addMoney(money.value)}
                  className="bg-[#1e293b] hover:bg-amber-950/40 border border-[#334155] hover:border-amber-500/50 p-2 text-center rounded-lg flex flex-col justify-between items-center group transition-all cursor-pointer h-14 shadow-lg"
                >
                  <span className="text-[11px] font-mono font-black text-slate-300 group-hover:text-amber-300 pointer-events-none">
                    {formatCOP(money.value)}
                  </span>
                  <div className="w-5 h-5 rounded-full bg-amber-900 border border-amber-600 flex items-center justify-center text-[7.5px] text-amber-200 pointer-events-none font-mono font-bold shadow-inner">
                    $
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Cambio Generado Column */}
        <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 flex flex-col text-xs shadow-inner">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-2">
            <span className="font-extrabold text-slate-250 font-mono uppercase text-[10px] tracking-wide">Pila de Cambio a Entregar</span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearStack}
              className="text-slate-400 hover:text-slate-100 p-1 flex items-center gap-1 text-[9px] border border-slate-700 bg-slate-900 rounded transition-all cursor-pointer font-mono"
            >
              <RotateCcw className="w-3 h-3" /> Limpiar
            </motion.button>
          </div>

          {/* Money in change stack representation */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[120px] min-h-[95px]">
            <AnimatePresence>
              {Object.keys(changeStack).length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-slate-500 text-center text-[10px] p-2 border border-dashed border-slate-800 rounded bg-slate-900/40 font-mono"
                >
                  <Coins className="w-5 h-5 mb-1 text-slate-650" />
                  <span>Haz clic en los billetes/monedas para rellenar el arqueo.</span>
                </motion.div>
              ) : (
                Object.entries(changeStack).map(([valStr, count]) => {
                  const val = Number(valStr);
                  const isBill = val >= 1000;
                  return (
                    <motion.div
                      key={`stack-${valStr}`}
                      initial={{ scale: 0.9, opacity: 0, x: -10 }}
                      animate={{ scale: 1, opacity: 1, x: 0 }}
                      exit={{ scale: 0.9, opacity: 0, x: 10 }}
                      className={`flex items-center justify-between px-2 py-1.5 rounded text-[10px] font-mono border ${
                        isBill 
                          ? 'bg-emerald-950/50 border-emerald-500/30 text-emerald-300 font-bold' 
                          : 'bg-[#1e293b] border-slate-800 text-slate-300'
                      }`}
                    >
                      <span className="font-mono">{isBill ? 'Billete' : 'Moneda'} {formatCOP(val)}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-slate-100 bg-slate-850 px-1.5 rounded">{count}x</span>
                        <button
                          onClick={() => removeMoney(val)}
                          className="text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded font-mono font-bold h-4 w-4 flex items-center justify-center border border-slate-700"
                        >
                          -
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>

          {/* Total Counting indicator */}
          <div className="border-t border-slate-800 pt-2 mt-2 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-450 font-mono text-[9px]">TOTAL CONSTRUIDO:</span>
              <span className={`font-mono font-black text-base ${
                Math.abs(totalInChangeStack - changeDue) < 1 
                  ? 'text-emerald-400 font-bold' 
                  : 'text-amber-400'
              }`}>
                {formatCOP(totalInChangeStack)}
              </span>
            </div>

            <div className="bg-slate-900 text-[10px] text-slate-400 leading-normal border border-slate-800 rounded p-2 text-left font-mono">
              {Math.abs(totalInChangeStack - changeDue) < 1 ? (
                <div className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> ¡Monto exacto de pesos! Listo.
                </div>
              ) : totalInChangeStack < changeDue ? (
                <span>Faltan {formatCOP(changeDue - totalInChangeStack)} por devolver al paciente.</span>
              ) : (
                <span className="text-amber-400 font-semibold">
                  Sobran {formatCOP(totalInChangeStack - changeDue)}. ¡Riesgo de faltante en caja!
                </span>
              )}
            </div>

            <motion.button
              id="confirmar-efectivo-vuelto"
              onClick={handleEntregar}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs uppercase"
            >
              <Award className="w-4 h-4" /> Entregar Cambio Completo
            </motion.button>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
