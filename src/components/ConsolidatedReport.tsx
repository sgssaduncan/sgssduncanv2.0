import React, { useMemo, useState, useEffect, useRef } from 'react';
import { dbService } from '../services/db';
import type { Inspeccion, Establecimiento, Localidad, TipoInspeccion } from '../types';
import { Download, Filter, RefreshCw, BarChart2, Calendar, MapPin, MessageCircle, Mail, Camera, X, FileSpreadsheet, FileText } from 'lucide-react';
import { cn, formatDateTime } from '../lib/utils';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { useAuth } from '../hooks/useAuth';
import ConsolidatedChartsModule from './ConsolidatedChartsModule';
import { exportConsolidatedReportToExcel, exportConsolidatedReportToCSV } from '../lib/exportUtils';

interface ReportData {
  ambito: string;
  nombre: string;
  eficiencia: number;
  ponderacion: number;
  ponderado: number;
  isLocalidadHeader?: boolean;
  promedioRegion?: number;
}

export default function ConsolidatedReport() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'tabla' | 'graficos'>('tabla');
  const [inspecciones, setInspecciones] = useState<Inspeccion[]>([]);
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [establecimientos, setEstablecimientos] = useState<Establecimiento[]>([]);
  const [tipos, setTipos] = useState<TipoInspeccion[]>([]);
  
  const [selectedLocalidad, setSelectedLocalidad] = useState<string>('ALL');
  
  // Evidencias (Fotos de Distribuidora / Servicentro)
  const [fotoDistribuidora, setFotoDistribuidora] = useState<string | null>(null);
  const [fotoServicentro, setFotoServicentro] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [insp, locs, ests, tps] = await Promise.all([
        dbService.getInspecciones(2000),
        dbService.getLocalidades(),
        dbService.getEstablecimientos(),
        dbService.getTiposInspeccion()
      ]);
      setInspecciones(insp.filter(i => i.estado === 'Completada'));
      setLocalidades(locs);
      setEstablecimientos(ests);
      setTipos(tps);
    } catch (error) {
      console.error('Error loading data', error);
    } finally {
      setLoading(false);
    }
  };

  const reportRows = useMemo(() => {
    if (!localidades.length || !establecimientos.length || !tipos.length) return [];

    let filteredLocs = localidades;
    if (selectedLocalidad !== 'ALL') {
      filteredLocs = localidades.filter(l => l.id === selectedLocalidad);
    }

    const rows: ReportData[] = [];

    filteredLocs.forEach(loc => {
      const locEsts = establecimientos.filter(e => e.localidadId === loc.id);
      
      const distribuidoras = locEsts.filter(e => e.tipo === 'Distribuidora' || e.tipo?.toUpperCase() === 'DISTRIBUIDORA' || e.nombre.toUpperCase().includes('DISTRIBUIDORA'));
      const distribuidora = distribuidoras.length > 0 ? distribuidoras[0] : locEsts[0];
      
      const servicentros = locEsts.filter(e => e.id !== distribuidora?.id);
      const locInspections = inspecciones.filter(i => i.localidadId === loc.id);
      
      let totalRegion = 0;
      const subRows: ReportData[] = [];

      // --- 1. Distribuidora ---
      if (distribuidora) {
        const distInspections = locInspections.filter(i => i.establecimientoId === distribuidora.id);
        
        // General
        const distGeneral = distInspections.filter(i => 
          tipos.find(t => t.id === i.tipoInspeccionId)?.categoria !== 'Vehículos' &&
          tipos.find(t => t.id === i.tipoInspeccionId)?.categoria !== 'Maquinaria' &&
          !tipos.find(t => t.id === i.tipoInspeccionId)?.nombre.toUpperCase().includes('MONTACARGAS')
        );
        const efDist = distGeneral.length > 0 ? 
          distGeneral.reduce((sum, i) => sum + (i.puntuacionConformidad || 0), 0) / distGeneral.length : 0;
        const pondDist = efDist * 0.4;
        totalRegion += pondDist;
        subRows.push({
          ambito: 'DISTRIBUIDORA',
          nombre: distribuidora.nombre.toUpperCase(),
          eficiencia: efDist,
          ponderacion: 0.4,
          ponderado: pondDist
        });

        // Vehículos
        const distVeh = distInspections.filter(i => 
          tipos.find(t => t.id === i.tipoInspeccionId)?.categoria === 'Vehículos'
        );
        if (distVeh.length > 0) {
          const efVeh = distVeh.reduce((sum, i) => sum + (i.puntuacionConformidad || 0), 0) / distVeh.length;
          const pondVeh = efVeh * 0.05;
          totalRegion += pondVeh;
          subRows.push({
            ambito: 'DISTRIBUIDORA',
            nombre: 'Vehículos Carga Pesada',
            eficiencia: efVeh,
            ponderacion: 0.05,
            ponderado: pondVeh
          });
        }

        // Montacargas
        const distMon = distInspections.filter(i => 
          tipos.find(t => t.id === i.tipoInspeccionId)?.categoria === 'Maquinaria' ||
          tipos.find(t => t.id === i.tipoInspeccionId)?.nombre.toUpperCase().includes('MONTACARGAS')
        );
        if (distMon.length > 0) {
          const efMon = distMon.reduce((sum, i) => sum + (i.puntuacionConformidad || 0), 0) / distMon.length;
          const pondMon = efMon * 0.05;
          totalRegion += pondMon;
          subRows.push({
            ambito: 'DISTRIBUIDORA',
            nombre: 'Montacargas',
            eficiencia: efMon,
            ponderacion: 0.05,
            ponderado: pondMon
          });
        }
      }

      // --- 2. Servicentros ---
      const totalScWeight = 0.5;
      const weightPerSc = servicentros.length > 0 ? (totalScWeight / servicentros.length) : 0;

      servicentros.forEach(sc => {
        const scInspections = locInspections.filter(i => i.establecimientoId === sc.id);
        
        const scGeneral = scInspections.filter(i => 
          tipos.find(t => t.id === i.tipoInspeccionId)?.categoria !== 'Maquinaria' &&
          !tipos.find(t => t.id === i.tipoInspeccionId)?.nombre.toUpperCase().includes('MONTACARGAS')
        );
        
        const scMon = scInspections.filter(i => 
          tipos.find(t => t.id === i.tipoInspeccionId)?.categoria === 'Maquinaria' ||
          tipos.find(t => t.id === i.tipoInspeccionId)?.nombre.toUpperCase().includes('MONTACARGAS')
        );

        if (scMon.length > 0) {
          const genWeight = weightPerSc * (2/3);
          const monWeight = weightPerSc * (1/3);

          const efScGen = scGeneral.length > 0 ? 
            scGeneral.reduce((sum, i) => sum + (i.puntuacionConformidad || 0), 0) / scGeneral.length : 0;
          const pondScGen = efScGen * genWeight;
          totalRegion += pondScGen;
          subRows.push({
            ambito: 'SERVICENTRO',
            nombre: sc.nombre.toUpperCase().replace('SERVICENTRO ', ''),
            eficiencia: efScGen,
            ponderacion: genWeight,
            ponderado: pondScGen
          });

          const efScMon = scMon.length > 0 ? 
            scMon.reduce((sum, i) => sum + (i.puntuacionConformidad || 0), 0) / scMon.length : 0;
          const pondScMon = efScMon * monWeight;
          totalRegion += pondScMon;
          subRows.push({
            ambito: 'SERVICENTRO',
            nombre: 'Montacargas',
            eficiencia: efScMon,
            ponderacion: monWeight,
            ponderado: pondScMon
          });
        } else {
          const efSc = scGeneral.length > 0 ? 
            scGeneral.reduce((sum, i) => sum + (i.puntuacionConformidad || 0), 0) / scGeneral.length : 0;
          const pondSc = efSc * weightPerSc;
          totalRegion += pondSc;
          subRows.push({
            ambito: 'SERVICENTRO',
            nombre: sc.nombre.toUpperCase().replace('SERVICENTRO ', ''),
            eficiencia: efSc,
            ponderacion: weightPerSc,
            ponderado: pondSc
          });
        }
      });

      // Header Row (Localidad) - solo agregamos si hay subrows con datos
      if (subRows.some(r => r.eficiencia > 0)) {
        rows.push({
          ambito: 'LOCALIDAD',
          nombre: loc.nombre.toUpperCase(),
          eficiencia: 0,
          ponderacion: 0,
          ponderado: 0,
          isLocalidadHeader: true,
          promedioRegion: totalRegion
        });
        rows.push(...subRows);
      }
    });

    return rows;
  }, [inspecciones, localidades, establecimientos, tipos, selectedLocalidad]);

  const localidadesGraphData = useMemo(() => {
    return reportRows
      .filter(r => r.isLocalidadHeader)
      .map(r => ({
        name: r.nombre,
        promedio: Number(r.promedioRegion?.toFixed(1)) || 0,
      }))
      .sort((a, b) => b.promedio - a.promedio);
  }, [reportRows]);

  const handleImageUpload = (type: 'dist' | 'sc', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (type === 'dist') setFotoDistribuidora(event.target?.result as string);
        if (type === 'sc') setFotoServicentro(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExport = async (method: "download" | "whatsapp" | "email") => {
    const element = document.getElementById('pdf-report-container');
    if (!element) return;
    
    setExporting(true);

    const originalScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';

    const currentScrollY = window.scrollY;
    const currentScrollX = window.scrollX;
    window.scrollTo({ left: 0, top: 0, behavior: 'auto' });

    const locationName = selectedLocalidad === 'ALL' 
       ? 'Consolidado_Nacional' 
       : localidades.find(l => l.id === selectedLocalidad)?.nombre.replace(/\s+/g, '_') || 'Regional';
      
    const fileName = `Reporte_Consolidado_${locationName}_${new Date().getTime()}.pdf`;

    const opt = {
      margin:       [15, 10, 15, 10] as [number, number, number, number], // Margen en mm (1.5 cm top and bottom)
      filename:     fileName,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { 
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: 740,
        scrollX: 0,
        scrollY: 0
      },
      jsPDF:        { unit: 'mm' as const, format: 'letter' as const, orientation: 'portrait' as const },
      pagebreak:    { mode: ["avoid-all", "css", "legacy"] }
    };

    const parent = element.parentElement;
    const originalParentStyle = parent ? parent.getAttribute('style') : null;
    
    if (parent) {
      parent.style.setProperty("position", "fixed", "important");
      parent.style.setProperty("left", "0px", "important");
      parent.style.setProperty("top", "0px", "important");
      parent.style.setProperty("z-index", "999999", "important");
      parent.style.setProperty("width", "740px", "important");
      parent.style.setProperty("pointer-events", "none", "important");
      parent.style.setProperty("background-color", "#ffffff", "important");
      parent.style.setProperty("opacity", "1", "important");
    }

    try {
      // Give browser time to load and render the element cleanly
      await new Promise(resolve => setTimeout(resolve, 350));

      if (method === "download") {
        const worker = html2pdf().from(element).set(opt);
        await worker.save();
        
        try {
          const base64Pdf = await worker.outputPdf('datauristring');
          if (base64Pdf && user) {
            await dbService.saveReportePDF({
              tipo: 'Consolidado',
              nombre: fileName,
              referencia: selectedLocalidad,
              pdfData: base64Pdf,
              userId: user.uid,
              fecha: new Date().toISOString()
            });
          }
        } catch (e) {
          console.warn('No se pudo guardar en historial (quizás es muy pesado)', e);
        }

        toast.success("Reporte descargado con éxito y guardado en historial");
        return;
      }

      // Siempre descargamos y guardamos el PDF de manera directa y confiable, evitando navigator.share nativo
      try {
        const worker = html2pdf().from(element).set(opt);
        await worker.save();
        
        try {
          const base64Pdf = await worker.outputPdf('datauristring');
          if (base64Pdf && user) {
            await dbService.saveReportePDF({
              tipo: 'Consolidado',
              nombre: fileName,
              referencia: selectedLocalidad,
              pdfData: base64Pdf,
              userId: user.uid,
              fecha: new Date().toISOString()
            });
          }
        } catch (e) {
          console.warn('No se pudo guardar en historial', e);
        }

        const message = `Estimados,\n\nSe ha generado el Reporte Consolidado Regional: ${locationName.replace(/_/g, ' ')}.\n\n📄 Archivo: ${fileName}\n\n(Nota para el emisor: El archivo PDF correspondiente se ha guardado automáticamente en su carpeta de descargas del equipo, por favor adjúntelo antes de enviar).\n\nAtentamente,\nControl Interno.`;
        if (method === "whatsapp") {
          const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
          window.open(url, "_blank");
          toast.success("PDF generado y descargado. Abriendo WhatsApp...");
        } else if (method === "email") {
          window.location.href = `mailto:?subject=Reporte Consolidado ${locationName.replace(/_/g, ' ')}&body=${encodeURIComponent(message)}`;
          toast.success("PDF generado y descargado. Abriendo gestor de correo...");
        }
      } catch (e) {
        console.warn("Generation failed", e);
        throw e;
      }
    } catch (error) {
      console.error("Error sharing exported PDF:", error);
      toast.error("Ocurrió un error al intentar generar el PDF");
    } finally {
      if (parent && originalParentStyle) {
        parent.setAttribute('style', originalParentStyle);
      }
      window.scrollTo({ left: currentScrollX, top: currentScrollY, behavior: "auto" });
      document.documentElement.style.scrollBehavior = originalScrollBehavior;
      setExporting(false);
    }
  };

  const handleExportExcel = () => {
    if (reportRows.length === 0) {
      toast.error("No hay datos consolidados para exportar");
      return;
    }
    try {
      exportConsolidatedReportToExcel(
        reportRows,
        inspecciones,
        { localidades, establecimientos, tipos },
        selectedRegionName
      );
      toast.success("Reporte consolidado exportado a Excel (.xlsx)");
    } catch (err) {
      console.error("Error al exportar consolidado a Excel:", err);
      toast.error("Error al exportar a Excel");
    }
  };

  const handleExportCSV = () => {
    if (reportRows.length === 0) {
      toast.error("No hay datos consolidados para exportar");
      return;
    }
    try {
      exportConsolidatedReportToCSV(reportRows, selectedRegionName);
      toast.success("Reporte consolidado exportado a CSV (.csv)");
    } catch (err) {
      console.error("Error al exportar consolidado a CSV:", err);
      toast.error("Error al exportar a CSV");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-slate-500">Cargando reporte...</div>;
  }

  const getColorByEficiencia = (val: number) => {
    if (val >= 90) return '#10b981'; // emerald-500
    if (val >= 75) return '#eab308'; // yellow-500
    if (val > 0) return '#ef4444'; // red-500
    return '#cbd5e1'; // slate-300
  };

  const todayStr = formatDateTime(new Date().toISOString());
  const selectedRegionName = selectedLocalidad === 'ALL' 
    ? 'TODAS LAS LOCALIDADES' 
    : localidades.find(l => l.id === selectedLocalidad)?.nombre.toUpperCase() || 'REGIÓN';

  // Render para el reporte oculto que usa html2pdf (tamaño A4/Letter optimizado)
  const renderPdfContent = () => {
    const regionCount = reportRows.filter(r => r.isLocalidadHeader).length;
    const promedioGeneral = reportRows.filter(r => r.isLocalidadHeader).reduce((acc, r) => acc + (r.promedioRegion || 0), 0) / (regionCount || 1);
    const totalInstalaciones = reportRows.filter(r => !r.isLocalidadHeader).length;

    return (
      <div style={{ position: 'absolute', left: '-9999px', top: '0px', width: '740px', pointerEvents: 'none', zIndex: -100 }}>
        <div 
          id="pdf-report-container" 
          style={{ 
            display: 'block',
            width: '740px',
            backgroundColor: '#ffffff', 
            color: '#000', 
            padding: '0',
            fontFamily: "Arial, 'Helvetica Neue', Helvetica, sans-serif",
            minHeight: 'auto',
            fontSize: '9px',
          }}
        >
        <style>{`
          #pdf-report-container,
          #pdf-report-container * {
            font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;
            letter-spacing: 0px !important;
            word-spacing: normal !important;
            word-break: normal !important;
            word-wrap: normal !important;
            overflow-wrap: normal !important;
            font-variant-ligatures: none !important;
            -webkit-font-variant-ligatures: none !important;
            text-rendering: auto !important;
            font-kerning: none !important;
            font-feature-settings: "kern" 0 !important;
            -webkit-font-smoothing: antialiased !important;
          }
          #pdf-report-container table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          #pdf-report-container th,
          #pdf-report-container td {
            vertical-align: middle !important;
            line-height: 1.45 !important;
            box-sizing: border-box !important;
          }
          #pdf-report-container td p,
          #pdf-report-container td span,
          #pdf-report-container td div,
          #pdf-report-container td label {
            vertical-align: middle !important;
          }
        `}</style>
        {/* HEADER SECTION - SAP ERP FORMAT */}
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #000', marginBottom: '10px' }}>
            <tbody>
                <tr>
                    <td style={{ width: '20%', borderRight: '1.5px solid #000', padding: '12px', textAlign: 'center', verticalAlign: 'middle' }}>
                        <img src="/logo.png" alt="Duncan" style={{ maxHeight: '55px', maxWidth: '100%', objectFit: 'contain' }} />
                    </td>
                    <td style={{ width: '55%', borderRight: '1.5px solid #000', padding: '8px', textAlign: 'center', verticalAlign: 'middle' }}>
                        <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#000', lineHeight: '1.2' }}>PROGRAMA DE SEGURIDAD Y SALUD EN EL TRABAJO</div>
                        <div style={{ fontSize: '13px', color: '#002855', fontWeight: 'bold', marginTop: '2px', textDecoration: 'underline' }}>INFORME EJECUTIVO DE CONFORMIDAD - {selectedRegionName.toUpperCase()}</div>
                    </td>
                    <td style={{ width: '25%', padding: '0' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '7.5px' }}>
                            <tbody>
                                <tr><td style={{ borderBottom: '1px solid #000', padding: '3px 6px' }}><strong>CÓDIGO DOC:</strong> SST-F-CONSOL</td></tr>
                                <tr><td style={{ borderBottom: '1px solid #000', padding: '3px 6px' }}><strong>ESTADO:</strong> VALIDADO ERP</td></tr>
                                <tr><td style={{ padding: '3px 6px' }}><strong>EMISIÓN:</strong> {todayStr.split(' ')[0]}</td></tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>

        {/* CONTENIDO PRINCIPAL - MATRIZ DE DATOS */}
        {localidadesGraphData.length > 0 ? (
          <>
            {/* KPI DASHBOARD CORPORATIVO */}
            <div style={{ border: '1.5px solid #000', marginBottom: '15px' }}>
              <div style={{ backgroundColor: '#004B93', color: '#fff', padding: '4px 8px', fontSize: '9px', fontWeight: '900' }}>1.0 INDICADORES CLAVE DE DESEMPEÑO (KPIs)</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                  <tbody>
                      <tr>
                          <td style={{ width: '33.3%', padding: '10px', borderRight: '1px solid #000', borderBottom: '1px solid #000' }}>
                             <div style={{ fontSize: '7.5px', color: '#666', fontWeight: '900' }}>EFICIENCIA REGIONAL</div>
                             <div style={{ fontSize: '20px', fontWeight: '900', color: getColorByEficiencia(promedioGeneral) }}>{promedioGeneral.toFixed(1)}%</div>
                          </td>
                          <td style={{ width: '33.3%', padding: '10px', borderRight: '1px solid #000', borderBottom: '1px solid #000' }}>
                             <div style={{ fontSize: '7.5px', color: '#666', fontWeight: '900' }}>ZONAS AUDITADAS</div>
                             <div style={{ fontSize: '20px', fontWeight: '900', color: '#000' }}>{regionCount}</div>
                          </td>
                          <td style={{ width: '33.3%', padding: '10px', borderBottom: '1px solid #000' }}>
                             <div style={{ fontSize: '7.5px', color: '#666', fontWeight: '900' }}>TOTAL INSTALACIONES</div>
                             <div style={{ fontSize: '20px', fontWeight: '900', color: '#000' }}>{totalInstalaciones}</div>
                          </td>
                      </tr>
                  </tbody>
              </table>
            </div>

            <div style={{ border: '1.5px solid #000', marginBottom: '15px' }}>
              <div style={{ backgroundColor: '#004B93', color: '#fff', padding: '4px 8px', fontSize: '9px', fontWeight: '900' }}>2.0 DESEMPEÑO COMPARATIVO POR LOCALIDAD</div>
              <div style={{ padding: '10px', backgroundColor: '#fff' }}>
                {localidadesGraphData.map((loc, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', fontSize: '8.5px', marginBottom: '6px' }}>
                    <div style={{ width: '150px', fontWeight: '900', color: '#000' }}>{loc.name.toUpperCase()}</div>
                    <div style={{ flex: 1, backgroundColor: '#eee', height: '12px', margin: '0 10px', border: '0.5px solid #000' }}>
                       <div style={{ width: `${loc.promedio}%`, backgroundColor: getColorByEficiencia(loc.promedio), height: '100%' }}></div>
                    </div>
                    <div style={{ width: '45px', textAlign: 'right', fontWeight: '900', fontSize: '10px', color: getColorByEficiencia(loc.promedio) }}>{loc.promedio.toFixed(1)}%</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ border: '1.5px solid #000', marginBottom: '15px' }}>
               <div style={{ backgroundColor: '#004B93', color: '#fff', padding: '4px 8px', fontSize: '9px', fontWeight: '900' }}>3.0 MATRIZ TÉCNICA DE CUMPLIMIENTO</div>
               <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#e5e7eb' }}>
                    <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'left', width: '20%' }}>ÁMBITO</th>
                    <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'left', width: '40%' }}>INSTALACIÓN / UNIDAD DE NEGOCIO</th>
                    <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'center', width: '15%' }}>EFICACIA (%)</th>
                    <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'center', width: '10%' }}>PESO</th>
                    <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'right', width: '15%' }}>APORTE (PTS)</th>
                  </tr>
                </thead>
                <tbody>
                  {reportRows.map((row, i) => {
                    if (row.isLocalidadHeader) {
                      return (
                        <tr key={i} style={{ backgroundColor: '#f3f4f6', color: '#000' }}>
                          <td colSpan={2} style={{ padding: '6px', border: '1px solid #000', fontWeight: '900', fontSize: '8.5px' }}>
                            LOCALIDAD: {row.nombre.toUpperCase()}
                          </td>
                          <td colSpan={3} style={{ padding: '6px', border: '1px solid #000', textAlign: 'right', fontSize: '8.5px', fontWeight: '900' }}>
                            CONSOLIDADO LOCALIDAD: <span style={{ color: getColorByEficiencia(row.promedioRegion || 0) }}>{row.promedioRegion?.toFixed(1)}%</span>
                          </td>
                        </tr>
                      );
                    }
                    
                    return (
                      <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#fcfcfc' }}>
                        <td style={{ border: '1px solid #000', padding: '4px', color: '#555', fontWeight: '900' }}>{row.ambito.toUpperCase()}</td>
                        <td style={{ border: '1px solid #000', padding: '4px', fontWeight: '900' }}>{row.nombre}</td>
                        <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center', color: getColorByEficiencia(row.eficiencia), fontWeight: '900' }}>
                          {Math.round(row.eficiencia)}%
                        </td>
                        <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center', color: '#666' }}>
                          {(row.ponderacion * 100).toFixed(1)}%
                        </td>
                        <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'right', fontWeight: '900' }}>
                          {row.ponderado.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* REGISTRO FOTOGRÁFICO DE AUDITORÍA */}
            {(fotoDistribuidora || fotoServicentro) && (
              <div style={{ border: '1.5px solid #000', marginBottom: '20px', pageBreakInside: 'avoid' }}>
                <div style={{ backgroundColor: '#004B93', color: '#fff', padding: '4px 8px', fontSize: '9px', fontWeight: '900' }}>4.0 REGISTRO FOTOGRÁFICO DE AUDITORÍA</div>
                <div style={{ display: 'flex', padding: '10px', gap: '15px' }}>
                  {fotoDistribuidora && (
                    <div style={{ flex: '1', textAlign: 'center', border: '1px solid #000', padding: '5px' }}>
                      <div style={{ fontSize: '7.5px', fontWeight: '900', marginBottom: '4px' }}>DISTRIBUIDORA / CENTRO LOGÍSTICO</div>
                      <img src={fotoDistribuidora} alt="Distribuidora" style={{ width: '100%', height: '180px', objectFit: 'contain' }} />
                    </div>
                  )}
                  {fotoServicentro && (
                    <div style={{ flex: '1', textAlign: 'center', border: '1px solid #000', padding: '5px' }}>
                      <div style={{ fontSize: '7.5px', fontWeight: '900', marginBottom: '4px' }}>SERVICENTRO / PUNTO DE ATENCIÓN</div>
                      <img src={fotoServicentro} alt="Servicentro" style={{ width: '100%', height: '180px', objectFit: 'contain' }} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PROTOCOLO DE VALIDACIÓN CORPORATIVA */}
            <div style={{ border: '1.5px solid #000', pageBreakInside: 'avoid' }}>
              <div style={{ backgroundColor: '#e5e7eb', padding: '4px 8px', fontSize: '9px', fontWeight: '900', borderBottom: '1px solid #000', textAlign: 'center' }}>5.0 PROTOCOLO DE VALIDACIÓN CORPORATIVA</div>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "center" }}>
                <tbody>
                  <tr>
                    <td style={{ width: "50%", padding: "15px 10px", borderRight: '1px solid #000' }}>
                      <div style={{ height: "60px", marginBottom: "5px", borderBottom: '1px dashed #000', width: '180px', margin: '0 auto' }} />
                      <div style={{ fontSize: '8px', fontWeight: '900' }}>FIRMA AUTORIZADA: GERENCIA SST</div>
                    </td>
                    <td style={{ width: "50%", padding: "15px 10px" }}>
                      <div style={{ height: "60px", marginBottom: "5px", borderBottom: '1px dashed #000', width: '180px', margin: '0 auto' }} />
                      <div style={{ fontSize: '8px', fontWeight: '900' }}>FIRMA AUTORIZADA: DIRECCIÓN GENERAL</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666', border: '1.5px solid #000' }}>
            STATUS: NO DATA AVAILABLE FOR CURRENT SELECTION
          </div>
        )}

        {/* FOOTER CORPORATIVO FINAL */}
        <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none', borderStyle: 'none', marginTop: '15px', borderTop: '2.5px solid #000', paddingTop: '4px' }}>
          <tbody>
            <tr>
              <td style={{ width: '30%', textAlign: 'left', border: 'none', borderStyle: 'none', padding: '0', fontSize: '6.5px', fontWeight: 'bold', color: '#000', backgroundColor: 'transparent' }}>
                ERP AUDIT: CONSOL-REG-{selectedRegionName.substring(0,3).toUpperCase()}
              </td>
              <td style={{ width: '40%', textAlign: 'center', border: 'none', borderStyle: 'none', padding: '0', fontSize: '6.5px', fontWeight: 'bold', color: '#000', backgroundColor: 'transparent' }}>
                DOCUMENTO GENERADO AUTOMÁTICAMENTE - PÁGINA 1 / 1
              </td>
              <td style={{ width: '30%', textAlign: 'right', border: 'none', borderStyle: 'none', padding: '0', fontSize: '6.5px', fontWeight: 'bold', color: '#000', backgroundColor: 'transparent' }}>
                DESARROLLADO POR ERGOEXPRESS, C.A. - RIF: J-50251246-2
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Section UI */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-[#00519E] rounded-xl">
              <BarChart2 className="w-6 h-6" />
            </div>
            Reporte Consolidado
          </h1>
          <p className="text-slate-500 text-sm mt-1 ml-12">Análisis de cumplimiento por área y localidad</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'tabla' && (
            <>
              <button 
                onClick={loadData}
                className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 font-bold text-sm shadow-sm transition-all active:scale-95"
                disabled={loading || exporting}
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> 
                Actualizar
              </button>
              
              <button
                onClick={() => handleExport('download')}
                disabled={exporting || reportRows.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-[#00519E] text-white rounded-lg hover:bg-[#003d7a] font-bold text-sm shadow-sm transition-all disabled:opacity-50 active:scale-95"
                title="Descargar Reporte en PDF"
              >
                {exporting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Download size={16} />
                )}
                PDF
              </button>

              <button
                onClick={handleExportExcel}
                disabled={exporting || reportRows.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold text-sm shadow-sm transition-all disabled:opacity-50 active:scale-95"
                title="Exportar Matriz Consolidada a Excel (.xlsx)"
              >
                <FileSpreadsheet size={16} />
                Excel (.xlsx)
              </button>

              <button
                onClick={handleExportCSV}
                disabled={exporting || reportRows.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 font-bold text-sm shadow-sm transition-all disabled:opacity-50 active:scale-95"
                title="Exportar Matriz Consolidada a CSV (.csv)"
              >
                <FileText size={16} />
                CSV (.csv)
              </button>
              
              <button
                onClick={() => handleExport('whatsapp')}
                disabled={exporting || reportRows.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-lg hover:bg-[#1ebd5c] font-bold text-sm shadow-sm transition-all disabled:opacity-50"
                title="Compartir por WhatsApp"
              >
                <MessageCircle size={16} />
                WhatsApp
              </button>

              <button
                onClick={() => handleExport('email')}
                disabled={exporting || reportRows.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 font-bold text-sm shadow-sm transition-all disabled:opacity-50"
                title="Enviar por Correo"
              >
                <Mail size={16} />
                Email
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap bg-white rounded-xl border border-slate-200 p-1 shadow-sm gap-1">
        <button
          onClick={() => setActiveTab('tabla')}
          className={cn(
            "flex-1 py-3 px-4 text-sm font-bold uppercase tracking-wider text-center rounded-lg transition-all",
            activeTab === 'tabla' ? "bg-[#00519E] text-white shadow-md" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
          )}
        >
          Vista de Tabla (PDF Estándar)
        </button>
        <button
          onClick={() => setActiveTab('graficos')}
          className={cn(
            "flex-1 py-3 px-4 text-sm font-bold uppercase tracking-wider text-center rounded-lg transition-all",
            activeTab === 'graficos' ? "bg-[#00519E] text-white shadow-md" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
          )}
        >
          Módulo de Gráficos (Avanzado)
        </button>
      </div>

      {activeTab === 'graficos' ? (
        <ConsolidatedChartsModule 
          inspecciones={inspecciones} 
          localidades={localidades} 
          establecimientos={establecimientos} 
          tipos={tipos} 
          user={user} 
        />
      ) : (
        <>
          {/* Filter and Settings Section */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center gap-6">
        <div className="flex-1 max-w-md w-full">
          <div className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-wider text-xs mb-2">
            <Filter size={16} />
            <span>Filtro de Localidad</span>
          </div>
          <select 
            value={selectedLocalidad}
            onChange={(e) => setSelectedLocalidad(e.target.value)}
            className="w-full text-sm border-slate-300 rounded-lg focus:ring-[#00519E] focus:border-[#00519E] bg-slate-50 hover:bg-white transition-colors py-2 px-3 font-semibold text-slate-700 shadow-sm"
          >
            <option value="ALL">Mostrar Todas las Localidades</option>
            {localidades.map(l => (
              <option key={l.id} value={l.id}>{l.nombre}</option>
            ))}
          </select>
        </div>
        
        <div className="flex-1 w-full flex flex-col sm:flex-row gap-4 border-t lg:border-t-0 lg:border-l border-slate-200 pt-4 lg:pt-0 lg:pl-6">
          <div className="flex-1">
            <div className="flex items-center justify-between text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-2">
              <span className="flex items-center gap-1"><Camera size={14} /> Foto Dist.</span>
              {fotoDistribuidora && (
                <button onClick={() => setFotoDistribuidora(null)} className="text-red-500 hover:text-red-700"><X size={14}/></button>
              )}
            </div>
            {fotoDistribuidora ? (
              <div className="h-12 w-full rounded border border-slate-200 overflow-hidden relative">
                <img src={fotoDistribuidora} className="w-full h-full object-cover" alt="Dist preview" />
              </div>
            ) : (
              <label className="flex items-center justify-center w-full h-12 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 hover:border-[#00519E] transition-colors">
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload('dist', e)} />
                <span className="text-xs font-bold text-slate-500 px-2 text-center">Cargar Foto de Distribuidora</span>
              </label>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-2">
              <span className="flex items-center gap-1"><Camera size={14} /> Foto SC.</span>
              {fotoServicentro && (
                <button onClick={() => setFotoServicentro(null)} className="text-red-500 hover:text-red-700"><X size={14}/></button>
              )}
            </div>
            {fotoServicentro ? (
              <div className="h-12 w-full rounded border border-slate-200 overflow-hidden relative">
                <img src={fotoServicentro} className="w-full h-full object-cover" alt="SC preview" />
              </div>
            ) : (
              <label className="flex items-center justify-center w-full h-12 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 hover:border-[#00519E] transition-colors">
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload('sc', e)} />
                <span className="text-xs font-bold text-slate-500 px-2 text-center">Cargar Foto de Servicentro</span>
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Graphs and Visual Data */}
      {reportRows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 text-center text-slate-400">
          <BarChart2 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="font-bold text-slate-600 tracking-wider text-lg">No hay datos para mostrar</h3>
          <p className="text-sm mt-2 max-w-md mx-auto">Parece que no hay inspecciones completadas o faltan configuraciones de localidad con los niveles de filtrado requeridos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart Column */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-black text-slate-800 uppercase tracking-wide text-sm flex items-center gap-2">
                <MapPin className="text-[#00519E] w-5 h-5" />
                Cumplimiento por Localidad
              </h2>
            </div>
            <div className="p-6 flex-1 min-h-[300px]">
              {localidadesGraphData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={localidadesGraphData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} domain={[0, 100]} />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="promedio" radius={[6, 6, 0, 0]} maxBarSize={60}>
                      {localidadesGraphData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getColorByEficiencia(entry.promedio)} />
                      ))}
                      <LabelList dataKey="promedio" position="top" style={{ fill: '#475569', fontSize: '11px', fontWeight: 'bold' }} formatter={(val: number) => `${val}%`} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : null}
            </div>
          </div>

          {/* Detailed Lists Sidebar */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[500px]">
             <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-black text-slate-800 uppercase tracking-wide text-sm">
                Desglose por Ámbito
              </h2>
            </div>
            <div className="p-2 overflow-y-auto flex-1">
              {reportRows.map((row, i) => {
                if (row.isLocalidadHeader) {
                  return (
                    <div key={i} className="sticky top-0 bg-slate-50 border-y border-slate-200 p-3 mt-4 first:mt-0 z-10 flex justify-between items-center shadow-sm">
                      <span className="font-black text-slate-800 uppercase text-xs tracking-wider">{row.nombre}</span>
                      <span className="bg-[#00519E] text-white px-2 py-0.5 rounded text-xs font-bold">{row.promedioRegion?.toFixed(1)}%</span>
                    </div>
                  );
                }

                const effColor = row.eficiencia >= 90 ? "text-emerald-600" : row.eficiencia >= 75 ? "text-yellow-600" : row.eficiencia > 0 ? "text-red-500" : "text-slate-400";
                
                return (
                  <div key={i} className="flex justify-between items-center p-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    <div>
                      <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{row.ambito}</div>
                      <div className="font-bold text-slate-700 text-sm line-clamp-1 truncate" title={row.nombre}>{row.nombre}</div>
                    </div>
                    <div className="text-right">
                      <div className={cn("font-black text-base", effColor)}>{Math.round(row.eficiencia)}%</div>
                      <div className="text-[10px] text-slate-400 font-medium">Pond: {(row.ponderado).toFixed(2)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      </>
      )}
      
      {renderPdfContent()}
    </div>
  );
}
