/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, ShieldAlert, ChevronRight, Award, Coins, AlertOctagon } from 'lucide-react';
import { AuditLog, formatCOP } from '../types';
import { motion } from 'motion/react';

interface AuditoriaModalProps {
  auditLog: AuditLog;
  onNextCustomer: () => void;
}

export default function AuditoriaModal({ auditLog, onNextCustomer }: AuditoriaModalProps) {
  const isSuccess = auditLog.success;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      id="modal-auditoria-perfil" 
      className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-left"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        transition={{ type: "spring", stiffness: 100, damping: 14 }}
        className={`max-w-md w-full bg-slate-900 border ${
          isSuccess ? 'border-emerald-500/50' : 'border-rose-500/50'
        } rounded-xl overflow-hidden shadow-2xl relative flex flex-col`}
      >
        
        {/* Banner principal */}
        <div className={`p-5 flex items-center gap-3 text-white ${
          isSuccess 
            ? 'bg-gradient-to-r from-emerald-950 to-teal-900' 
            : 'bg-gradient-to-r from-rose-950 to-red-950'
        }`}>
          {isSuccess ? (
            <div className="p-2 bg-emerald-900 rounded-lg border border-emerald-500 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
          ) : (
            <div className="p-2 bg-rose-900 rounded-lg border border-rose-500 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-rose-450" />
            </div>
          )}
          <div>
            <h3 className="font-sans font-extrabold text-base tracking-tight uppercase">
              {isSuccess ? 'REGISTRO DE DISPENSACIÓN CORRECTA' : 'MEMORANDO DE INFRACCIÓN DE AUDITORÍA'}
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              Expediente COP Nro: {auditLog.id}
            </span>
          </div>
        </div>

        {/* Cuerpo del memorando */}
        <div className="p-6 space-y-4 text-xs text-slate-300">
          <div className="bg-slate-950 p-4 rounded-lg space-y-2 border border-slate-850">
            <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase font-mono pb-1 border-b border-slate-900 text-left">
              <span>Indicador</span>
              <span className="text-right">Datos Reportados</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 text-left">Puesto Supervisor:</span>
              <span className="font-semibold text-slate-300 text-right">Auditor Interno de Farmacia</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 text-left">Cajero Evaluado:</span>
              <span className="font-semibold text-slate-300 text-right">Trainee Administrativo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 text-left">Paciente de Turno:</span>
              <span className="font-bold text-white text-right">{auditLog.customerName}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-mono font-bold text-slate-500 tracking-wider">
              {isSuccess ? 'RESOLUCIÓN DE CONCORDANCIA' : 'DICTAMEN DEL AUDITOR SANITARIO'}
            </label>
            <div className={`p-4 rounded-lg font-sans text-xs leading-relaxed border ${
              isSuccess 
                ? 'bg-emerald-950/20 border-emerald-900/35 text-emerald-100' 
                : 'bg-rose-950/25 border-rose-900/35 text-rose-100'
            }`}>
              <p className="font-medium">{auditLog.message}</p>
            </div>
          </div>

          {/* Impactos */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 flex items-center justify-between">
              <div>
                <span className="text-[9px] text-slate-500 block uppercase font-mono font-bold">Variación Caja</span>
                <span className={`text-[11px] font-mono font-bold ${auditLog.cashImpact >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {auditLog.cashImpact >= 0 ? `+${formatCOpSafe(auditLog.cashImpact)}` : `-${formatCOpSafe(Math.abs(auditLog.cashImpact))}`}
                </span>
              </div>
              <Coins className={`w-5 h-5 ${auditLog.cashImpact >= 0 ? 'text-emerald-500' : 'text-rose-500'}`} />
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 flex items-center justify-between">
              <div>
                <span className="text-[9px] text-slate-500 block uppercase font-mono font-bold">Puntaje Recibido</span>
                <span className={`text-xs font-mono font-bold ${auditLog.scoreImpact >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {auditLog.scoreImpact >= 0 ? `+ ${auditLog.scoreImpact}` : `${auditLog.scoreImpact}`} pts
                </span>
              </div>
              <Award className={`w-5 h-5 ${auditLog.scoreImpact >= 0 ? 'text-emerald-500' : 'text-rose-500'}`} />
            </div>
          </div>

          {!isSuccess && (
            <div className="bg-rose-950/20 text-rose-300 border border-rose-900/35 p-3 rounded-lg flex items-start gap-2 text-[10px] leading-relaxed">
              <AlertOctagon className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>¡Alerta de Mostrador!</strong> De acumular demasiadas infracciones graves, reprobarás tu práctica. Para evitarlo de nuevo, lee atentamente el <strong>Manual de Inducción POS</strong> con las normas regulatorias farmacológicas.
              </span>
            </div>
          )}

        </div>

        {/* Botón de progreso */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-850 flex">
          <button
            id="btn-siguiente-paciente"
            onClick={onNextCustomer}
            className={`w-full font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-all text-xs cursor-pointer ${
              isSuccess 
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                : 'bg-rose-600 hover:bg-rose-500 text-white'
            }`}
          >
            Siguiente Recepción en Mostrador <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </motion.div>
    </motion.div>
  );
}

// Safely format COP inside the file
function formatCOpSafe(v: number): string {
  try {
    return formatCOP(v);
  } catch (err) {
    return '$' + Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\n))/g, '.');
  }
}
