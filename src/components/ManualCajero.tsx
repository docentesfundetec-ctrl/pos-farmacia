/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, ShieldCheck, HelpCircle, Activity, Landmark, AlertCircle } from 'lucide-react';

export default function ManualCajero() {
  return (
    <div id="handbook-container" className="bg-slate-900 border border-slate-700 rounded-xl p-6 text-slate-100 flex flex-col h-full overflow-y-auto">
      <div className="flex items-center gap-3 border-b border-slate-700 pb-4 mb-4">
        <BookOpen className="text-emerald-400 w-6 h-6" />
        <div>
          <h2 className="text-xl font-sans font-bold text-white tracking-tight">Manual de Inducción POS Farmacéutico</h2>
          <p className="text-xs text-slate-400">Guía Oficial de Operación, Auditoría y Buenas Prácticas de Dispensación</p>
        </div>
      </div>

      <div className="space-y-6 text-sm">
        {/* Sección 1: Clasificación */}
        <section id="clasificacion-seccion" className="bg-slate-800/50 p-4 border border-slate-700/60 rounded-lg">
          <h3 className="text-emerald-300 font-semibold mb-2 flex items-center gap-2">
            <Activity className="w-4 h-4" /> 1. Clasificación Legal de Medicamentos
          </h3>
          <ul className="space-y-3 text-xs leading-relaxed text-slate-300">
            <li>
              <strong className="text-white block">Venta Libre (OTC - Over The Counter):</strong>
              Medicinas de bajo riesgo (ej. Paracetamol, Ibuprofeno). No requieren receta médica. El cajero puede venderlas libremente previa verificación de lote y fecha de vencimiento.
            </li>
            <li>
              <strong className="text-white block">Bajo Receta (Rx):</strong>
              Antibióticos, antihipertensivos, hipoglucemiantes. Requieren receta emitida por profesional habilitado. La receta debe registrarse en el POS y archivarse o devolverse según la normativa.
            </li>
            <li>
              <strong className="text-white block">Receta Controlada o Retenida (Narcóticos/Psicotrópicos):</strong>
              Ej. Clonazepam. Sustancias psicotrópicas controladas por ley de estupefacientes. Requieren de receta oficial sellada por la autoridad médica autorizada, firma autógrafa y cotejo estricto del documento de identidad del usuario.
            </li>
            <li>
              <strong className="text-white block text-sky-300">Cadena de Frío (Ambos):</strong>
              Medicamentos termolábiles (ej. Insulina) que deben mantenerse entre 2°C y 8°C. El POS exige registrar el uso de una <span className="text-sky-300 font-semibold">Bolsa Térmica con Gel Refrigerante</span>. Omitir esto invalida la venta y malogra el medicamento.
            </li>
          </ul>
        </section>

        {/* Sección 2: Protocolo de Cotejo Papers, Please */}
        <section id="cotejo-seccion" className="bg-slate-800/50 p-4 border border-slate-700/60 rounded-lg">
          <h3 className="text-emerald-300 font-semibold mb-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> 2. Protocolo de Cotejo & Control ("Papers, Please")
          </h3>
          <p className="text-xs text-slate-400 mb-3">
            Antes de registrar el producto en el POS y cobrar, realiza las 5 preguntas de oro del auditor:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
            <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
              <span className="font-semibold text-white block">¿La Receta está Vencida?</span>
              Las recetas comunes y de antibióticos tienen un límite máximo de <span className="text-amber-400">30 días de validez</span> desde su expedición. Pasado el término, no deben dispensarse.
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
              <span className="font-semibold text-white block">¿El Fisico coincide con Receta?</span>
              Verifica que el nombre comercial/genérico, la dosificación (ej. 500mg vs 1000mg) y la cantidad coincidan exactamente con la caja física presentada.
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
              <span className="font-semibold text-white block">¿El Medicamento está Vencido?</span>
              Mira detenidamente la fecha inscrita en la caja de medicina física. Si la fecha es igual o anterior al mes en curso, ¡está vencido! Colócala en merma y avisa.
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
              <span className="font-semibold text-white block">¿Sello de Estupefaciente?</span>
              Las recetas de psicotrópicos controlados deben portar obligatoriamente el <span className="text-rose-400">"Sello de Control de Medicamento Fiscalizado"</span>. Sin sello, está prohibidísima la venta.
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800 md:col-span-2">
              <span className="font-semibold text-white block">¿Identidad Coincidente?</span>
              Para psicotrópicos o seguros especiales, coteja el documento de identidad física (ID) contra el nombre y Cédula/NIF descritos en la receta médica. Cualquier discrepancia en números anula el proceso.
            </div>
          </div>
        </section>

        {/* Sección 3: Manejo de Copagos y Seguros */}
        <section id="seguros-seccion" className="bg-slate-800/50 p-4 border border-slate-700/60 rounded-lg">
          <h3 className="text-emerald-300 font-semibold mb-2 flex items-center gap-2">
            <Landmark className="w-4 h-4" /> 3. Copagos y Seguros Médicos
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Cuando un paciente presente un carnet de aseguradora vigente (ej: <span className="text-emerald-400 font-medium">Seguro Medifar</span>):
            <br />
            1. Valida los nombres y cédula en el carnet contra los documentos.
            <br />
            2. En el terminal POS, antes de dar click en cobrar, presiona el botón <strong className="text-emerald-300">"Aplicar Seguro"</strong> para que el POS calcule el copago (ej. cobertura del 70%, el cliente solo paga el 30% en caja).
            <br />
            3. Si el cajero cobra tarifa completa al asegurado sin aplicar la póliza, recibirá un memorando por cobro indebido.
          </p>
        </section>

        {/* Sección 4: Arqueo de Caja y Vuelto */}
        <section id="arqueo-seccion" className="bg-slate-800/50 p-4 border border-slate-700/60 rounded-lg">
          <h3 className="text-emerald-300 font-semibold mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> 4. Arqueo de Caja & Entrega de Vuelto
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Cuando el cliente pague con dinero en efectivo en caja:
            <br />
            1. El cajón monedero se abrirá automáticamente.
            <br />
            2. El administrador cuenta visualmente la cantidad entregada por el cliente.
            <br />
            3. Calcula el vuelto exacto (Pago − Total).
            <br />
            4. Retira billete por billete y moneda por moneda de la bandeja física interactiva. 
            <br />
            <span className="text-yellow-400 font-semibold">Regla fiscal:</span> Entregar menos vuelto del debido enoja al cliente; entregar más vuelto genera pérdidas salariales directas para ti al final de tu turno administrativo.
          </p>
        </section>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-700 text-[10px] text-slate-500 text-center flex justify-between items-center bg-slate-900/80 sticky bottom-0">
        <span>© ACADEMIA DE CAJEROS FARMACÉUTICOS</span>
        <span className="bg-emerald-900/50 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800 font-mono">v1.16</span>
      </div>
    </div>
  );
}
