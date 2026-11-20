import React, { useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSGD } from '../contexts/SGDContext';
import {
  ArrowLeft, Printer, Download, Share2, FileSpreadsheet,
  CheckCircle2, XCircle, AlertTriangle, MinusCircle, Edit3, Shield
} from 'lucide-react';
import { FORM_REGISTRY } from '../lib/formDefinitions';
import { formatDate, getResultadoBadgeClass, getEstadoBadgeClass } from '../lib/utils';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

export default function ReportePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getInspeccionById } = useSGD();
  const reportRef = useRef<HTMLDivElement>(null);

  const inspeccion = id ? getInspeccionById(id) : undefined;

  const { formDef, responses, observations, additional, signatures } = useMemo(() => {
    if (!inspeccion) return { formDef: null, responses: {}, observations: {}, additional: {}, signatures: {} };
    const fd = FORM_REGISTRY[inspeccion.tipoCodigo] || FORM_REGISTRY.EXT;
    let resp: Record<string, string> = {};
    let obs: Record<string, string> = {};
    let add: Record<string, string> = {};
    let sig: Record<string, string> = {};
    try { if (inspeccion.formResponses) resp = JSON.parse(inspeccion.formResponses); } catch {}
    try { if (inspeccion.formObservations) obs = JSON.parse(inspeccion.formObservations); } catch {}
    try { if (inspeccion.formAdditional) add = JSON.parse(inspeccion.formAdditional); } catch {}
    try { if (inspeccion.formSignatures) sig = JSON.parse(inspeccion.formSignatures); } catch {}
    return { formDef: fd, responses: resp, observations: obs, additional: add, signatures: sig };
  }, [inspeccion]);

  if (!inspeccion) {
    return (
      <div className="py-16 text-center text-slate-500">
        <p className="font-semibold text-lg">Inspección no encontrada</p>
        <Link to="/inspecciones" className="btn-primary mt-4 inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Volver a Inspecciones
        </Link>
      </div>
    );
  }

  const exportCSV = () => {
    if (!formDef) return;
    const rows: string[][] = [
      ['SGD DUNCAN — REPORTE DE INSPECCIÓN SSA'],
      ['Correlativo', String(inspeccion.correlativo || '—')],
      ['Tipo', inspeccion.tipoNombre],
      ['Empresa', inspeccion.empresaNombre],
      ['Establecimiento', inspeccion.establecimientoNombre],
      ['Localidad', inspeccion.localidadNombre],
      ['Fecha', formatDate(inspeccion.fecha)],
      ['Inspector', inspeccion.inspector],
      ['Estado', inspeccion.estado],
      ['Resultado', inspeccion.resultado || '—'],
      ['Puntuación', `${inspeccion.puntuacion ?? 0}%`],
      [],
      ['Sección', 'Ítem', 'Respuesta'],
    ];

    for (const section of formDef.sections) {
      for (const item of section.items) {
        rows.push([section.title, item.label, responses[item.id] || '—']);
      }
    }

    const csvContent = '\uFEFF' + rows.map(r => r.map(c => `"${(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SGD_${inspeccion.tipoCodigo}_${inspeccion.correlativo || 'INSP'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Reporte CSV descargado');
  };

  const exportPDF = () => {
    if (!formDef) return;
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
      
      // Header
      doc.setFillColor(30, 64, 175); // Blue 800
      doc.rect(0, 0, 216, 24, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('SGD DUNCAN — SISTEMA DE GESTIÓN SSA', 14, 12);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Informe Oficial de Inspección: ${inspeccion.tipoNombre}`, 14, 18);

      // Metadatos
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(9);
      autoTable(doc, {
        startY: 28,
        head: [['Parámetro', 'Detalle', 'Parámetro', 'Detalle']],
        body: [
          ['Empresa', inspeccion.empresaNombre, 'N° Correlativo', String(inspeccion.correlativo || '—')],
          ['Establecimiento', inspeccion.establecimientoNombre, 'Fecha', formatDate(inspeccion.fecha)],
          ['Localidad', inspeccion.localidadNombre, 'Inspector', inspeccion.inspector],
          ['Resultado', inspeccion.resultado || '—', 'Puntuación', `${inspeccion.puntuacion ?? 0}%`],
        ],
        theme: 'grid',
        headStyles: { fillColor: [241, 245, 249], textColor: [71, 85, 105], fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 2 },
      });

      // Detalle de ítems
      const tableData: string[][] = [];
      for (const section of formDef.sections) {
        tableData.push([`SECCIÓN: ${section.title.toUpperCase()}`, '', '']);
        for (const item of section.items) {
          tableData.push(['', item.label, responses[item.id] || '—']);
        }
      }

      const prevY = (doc as any).lastAutoTable?.finalY || 60;
      autoTable(doc, {
        startY: prevY + 6,
        head: [['', 'Ítem Evaluado', 'Respuesta']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 2 },
        didParseCell: (data) => {
          if (data.row.raw && data.row.raw[0] && String(data.row.raw[0]).startsWith('SECCIÓN:')) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [226, 232, 240];
            data.cell.colSpan = 3;
          }
        }
      });

      doc.save(`SGD_${inspeccion.tipoCodigo}_${inspeccion.correlativo || 'INSP'}.pdf`);
      toast.success('Reporte PDF descargado');
    } catch (err) {
      console.error(err);
      toast.error('Error generando PDF');
    }
  };

  const shareWhatsApp = () => {
    const text = `*SGD Duncan — Reporte de Inspección*\nTipo: ${inspeccion.tipoNombre}\nEstablecimiento: ${inspeccion.establecimientoNombre}\nFecha: ${formatDate(inspeccion.fecha)}\nResultado: ${inspeccion.resultado || '—'} (${inspeccion.puntuacion ?? 0}%)\nInspector: ${inspeccion.inspector}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6 fade-in max-w-4xl mx-auto pb-12">
      {/* Barra de Acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/inspecciones')} className="p-2 -ml-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="badge badge-blue text-xs">{inspeccion.tipoCodigo}</span>
              <h1 className="text-xl font-bold text-slate-900">Reporte de Inspección</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {inspeccion.establecimientoNombre} · {formatDate(inspeccion.fecha)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {inspeccion.estado !== 'completada' && (
            <Link to={`/inspecciones/${inspeccion._id}/formulario`} className="btn-secondary flex items-center gap-1.5 text-xs">
              <Edit3 className="h-3.5 w-3.5" /> Editar
            </Link>
          )}
          <button onClick={exportCSV} className="btn-secondary flex items-center gap-1.5 text-xs">
            <FileSpreadsheet className="h-3.5 w-3.5" /> CSV
          </button>
          <button onClick={exportPDF} className="btn-secondary flex items-center gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" /> PDF
          </button>
          <button onClick={() => window.print()} className="btn-secondary flex items-center gap-1.5 text-xs">
            <Printer className="h-3.5 w-3.5" /> Imprimir
          </button>
          <button onClick={shareWhatsApp} className="btn-primary flex items-center gap-1.5 text-xs">
            <Share2 className="h-3.5 w-3.5" /> Compartir
          </button>
        </div>
      </div>

      {/* Contenido del Reporte para Pantalla e Impresión */}
      <div ref={reportRef} className="card p-6 sm:p-8 space-y-6 bg-white shadow-sm print:border-none print:shadow-none">
        {/* Cabecera Membrete */}
        <div className="flex items-start justify-between pb-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-xl text-white">
              <Shield className="h-7 w-7" />
            </div>
            <div>
              <p className="font-bold text-lg text-slate-900">ACUMULADORES DUNCAN, C.A.</p>
              <p className="text-xs text-slate-500">Sistema de Gestión de Seguridad, Salud y Ambiente (SG-SSA)</p>
              <p className="text-xs font-semibold text-blue-600 mt-0.5">{inspeccion.tipoNombre}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="font-mono text-sm font-bold text-slate-800">
              N° {String(inspeccion.correlativo || '1001').padStart(4, '0')}
            </span>
            <p className="text-xs text-slate-400 mt-0.5">{formatDate(inspeccion.fecha)}</p>
          </div>
        </div>

        {/* Ficha Resumen */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Empresa</span>
            <span className="font-semibold text-slate-800">{inspeccion.empresaNombre}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Establecimiento</span>
            <span className="font-semibold text-slate-800">{inspeccion.establecimientoNombre}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Inspector</span>
            <span className="font-semibold text-slate-800">{inspeccion.inspector}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Estado / Resultado</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={getEstadoBadgeClass(inspeccion.estado)}>
                {inspeccion.estado === 'completada' ? 'Completada' : 'En Progreso'}
              </span>
              {inspeccion.resultado && (
                <span className={getResultadoBadgeClass(inspeccion.resultado)}>
                  {inspeccion.resultado} ({inspeccion.puntuacion ?? 0}%)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Campos Adicionales si aplican */}
        {additional && Object.keys(additional).length > 0 && (
          <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
            <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">Datos Específicos del Equipo / Área</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {Object.entries(additional).map(([k, v]) => (
                <div key={k}>
                  <span className="text-slate-500 capitalize block">{k}:</span>
                  <span className="font-medium text-slate-800">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Secciones de Preguntas e Items */}
        {formDef?.sections.map((section, idx) => (
          <div key={section.id} className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <span className="flex items-center justify-center w-6 h-6 rounded bg-blue-100 text-blue-700 text-xs font-bold">
                {idx + 1}
              </span>
              <h3 className="font-semibold text-sm text-slate-900">{section.title}</h3>
            </div>

            <div className="divide-y divide-slate-100">
              {section.items.map(item => {
                const val = responses[item.id];
                return (
                  <div key={item.id} className="py-2 flex items-center justify-between gap-4 text-xs">
                    <span className="text-slate-700 flex-1">{item.label}</span>
                    <span className="font-semibold">
                      {val === 'C' || val === 'Bueno' || val === 'Si' || val === 'Operativo' ? (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> {val}
                        </span>
                      ) : val === 'NC' || val === 'Dañado' || val === 'No' || val === 'No Operativo' ? (
                        <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded flex items-center gap-1">
                          <XCircle className="h-3.5 w-3.5" /> {val}
                        </span>
                      ) : val === 'OM' ? (
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded flex items-center gap-1">
                          <AlertTriangle className="h-3.5 w-3.5" /> {val}
                        </span>
                      ) : val ? (
                        <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{val}</span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>

            {observations[section.id] && (
              <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 italic">
                <strong>Observaciones:</strong> {observations[section.id]}
              </div>
            )}
          </div>
        ))}

        {/* Firmas */}
        <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
          <div className="border-t border-slate-300 pt-2">
            <p className="font-medium text-slate-800">{inspeccion.inspector}</p>
            <p className="text-slate-400">Elaborado por (Inspector SSA)</p>
          </div>
          <div className="border-t border-slate-300 pt-2">
            <p className="font-medium text-slate-800">Supervisor de Área / Sede</p>
            <p className="text-slate-400">Revisado y Conforme</p>
          </div>
        </div>
      </div>
    </div>
  );
}
