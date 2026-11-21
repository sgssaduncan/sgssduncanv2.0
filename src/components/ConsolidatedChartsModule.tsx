import React, { useState, useMemo, useRef } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList, Legend } from 'recharts';
import { Download, MessageCircle, Mail, MapPin, Grid, Camera, FileSpreadsheet, FileText } from 'lucide-react';
import { cn } from '../lib/utils';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';
import { dbService } from '../services/db';
import * as XLSX from 'xlsx';
import { downloadCSV, jsonToCSV } from '../lib/exportUtils';

interface Props {
  inspecciones: any[];
  localidades: any[];
  establecimientos: any[];
  tipos: any[];
  user: any;
}

export default function ConsolidatedChartsModule({ inspecciones, localidades, establecimientos, tipos, user }: Props) {
  const [chartType, setChartType] = useState<'column' | 'bar' | 'line' | 'pie'>('column');
  const [filterLocalidad, setFilterLocalidad] = useState<string>('ALL');
  const [filterTipo, setFilterTipo] = useState<string>('ALL');
  const [exporting, setExporting] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const data = useMemo(() => {
    if (!inspecciones.length) return [];

    let filtered = inspecciones;

    if (filterLocalidad !== 'ALL') {
      filtered = filtered.filter(i => i.localidadId === filterLocalidad);
    }
    
    // Si queremos filtrar por tipo de establecimiento ('DISTRIBUIDORA', 'SERVICENTRO')
    if (filterTipo !== 'ALL') {
      const allowedEstablecimientos = establecimientos
        .filter(e => {
            const isDist = e.tipo?.toUpperCase() === 'DISTRIBUIDORA' || (e.nombre || '').toUpperCase().includes('DISTRIBUIDORA');
            if (filterTipo === 'DISTRIBUIDORA') return isDist;
            if (filterTipo === 'SERVICENTRO') return !isDist;
            return true;
        })
        .map(e => e.id);
        
      filtered = filtered.filter(i => allowedEstablecimientos.includes(i.establecimientoId));
    }

    // Determine what to show on X-axis    
    const result: { name: string, percent: number }[] = [];

    if (filterLocalidad === 'ALL') {
      // Group by Localidad
      localidades.forEach(loc => {
        const locInspections = filtered.filter(i => i.localidadId === loc.id);
        if (locInspections.length > 0) {
          const avg = locInspections.reduce((sum, i) => sum + (i.puntuacionConformidad || 0), 0) / locInspections.length;
          result.push({ name: loc.nombre, percent: Number(avg.toFixed(1)) });
        }
      });
    } else {
      // Group by Establecimiento
      const locEsts = establecimientos.filter(e => e.localidadId === filterLocalidad);
      locEsts.forEach(est => {
        // filter by tipo if needed
        const isDist = est.tipo?.toUpperCase() === 'DISTRIBUIDORA' || (est.nombre || '').toUpperCase().includes('DISTRIBUIDORA');
        if (filterTipo === 'DISTRIBUIDORA' && !isDist) return;
        if (filterTipo === 'SERVICENTRO' && isDist) return;

        const estInspections = filtered.filter(i => i.establecimientoId === est.id);
        if (estInspections.length > 0) {
          const avg = estInspections.reduce((sum, i) => sum + (i.puntuacionConformidad || 0), 0) / estInspections.length;
          // simplify name
          let cleanName = est.nombre.replace(/servicentro \s+/i, 'SC ').replace(/distribuidora \s+/i, 'Dist. ');
          result.push({ name: cleanName, percent: Number(avg.toFixed(1)) });
        }
      });
    }

    // Sort descending by default
    return result.sort((a, b) => b.percent - a.percent);
  }, [inspecciones, localidades, establecimientos, filterLocalidad, filterTipo]);

  const getColorByEficiencia = (ef: number) => {
    if (ef >= 90) return '#22c55e'; // green
    if (ef >= 70) return '#eab308'; // yellow
    return '#ef4444'; // red
  };

  const getBase64Image = async (format: 'jpeg' | 'png') => {
    if (!chartRef.current) return null;
    const element = chartRef.current;
    
    // Para evitar cortes en móviles y asegurar una buena resolución al exportar
    const originalWidth = element.style.width;
    element.style.width = '1000px'; 
    
    // Esperamos para que el navegador aplique los estilos de width y se quite el tooltip
    await new Promise(r => setTimeout(r, 400));

    try {
      const canvas = await html2canvas(element, { backgroundColor: '#ffffff', scale: 2, useCORS: true, logging: false, windowWidth: 1000 });
      const dataUrl = format === 'jpeg' ? canvas.toDataURL('image/jpeg', 0.95) : canvas.toDataURL('image/png');
      element.style.width = originalWidth;
      return dataUrl;
    } catch(e) {
      element.style.width = originalWidth;
      throw e;
    }
  };

  const dataURIToFile = (dataURI: string, fileName: string) => {
    const splitDataURI = dataURI.split(',');
    const byteString = splitDataURI[0].indexOf('base64') >= 0 ? atob(splitDataURI[1]) : decodeURI(splitDataURI[1]);
    const mimeString = splitDataURI[0].split(':')[1].split(';')[0];
    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new File([ia], fileName, { type: mimeString });
  };

  const saveAuditLog = async (accion: string, filename: string) => {
    if (!user) return;
    try {
      await dbService.logAction('EXPORT', 'reportesPDF', filename, `Exportado gráfico consolidado: ${filename}`);
    } catch (e) {
      console.warn("Audit log error:", e);
    }
  };

  const handleExportPDF = async () => {
    const element = chartRef.current;
    if (!element) return;
    setExporting(true);
    
    const originalWidth = element.style.width;
    element.style.width = '1000px'; 
    await new Promise(r => setTimeout(r, 400));
    
    const fileName = `Graficos_Consolidados_${new Date().getTime()}.pdf`;
    const opt = {
      margin: 10,
      filename: fileName,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false, windowWidth: 1000 },
      jsPDF: { unit: 'mm' as const, format: 'letter' as const, orientation: 'landscape' as const },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] }
    };

    try {
      const worker = html2pdf().from(element).set(opt);
      await worker.save();
      
      const base64Pdf = await worker.outputPdf('datauristring');
      if (base64Pdf && user) {
        await dbService.saveReportePDF({
          tipo: 'Consolidado',
          nombre: fileName,
          referencia: filterLocalidad === 'ALL' ? 'Nacional' : localidades.find(l=>l.id===filterLocalidad)?.nombre || 'Region',
          pdfData: base64Pdf,
          userId: user.uid,
          fecha: new Date().toISOString()
        });
      }

      await saveAuditLog("Exportación PDF de Gráfico", fileName);
      toast.success("PDF generado exitosamente");
    } catch (e) {
      console.error(e);
      toast.error("Error al generar PDF");
    } finally {
      element.style.width = originalWidth;
      setExporting(false);
    }
  };

  const handleExportJPG = async () => {
    if (!chartRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await getBase64Image('jpeg');
      if (dataUrl) {
        const link = document.createElement('a');
        link.download = `Graficos_Consolidados_${new Date().getTime()}.jpg`;
        link.href = dataUrl;
        link.click();
        await saveAuditLog("Exportación JPG de Gráfico", link.download);
        toast.success("Imagen descargada exitosamente");
      }
    } catch(e) {
      console.error(e);
      toast.error("Error al generar imagen");
    } finally {
      setExporting(false);
    }
  };

  const handleShare = async (method: 'whatsapp' | 'email') => {
    if (!chartRef.current) return;
    setExporting(true);
    
    try {
      const fileName = `Graficos_${new Date().getTime()}.jpg`;
      const dataUrl = await getBase64Image('jpeg');
      
      if (!dataUrl) throw new Error("Could not generate image");
      
      if (navigator.canShare && navigator.userAgent.match(/mobile/i)) {
          const file = dataURIToFile(dataUrl, fileName);
          if (navigator.canShare({ files: [file] })) {
              try {
                  await navigator.share({
                      files: [file],
                      title: 'Gráficos Consolidados',
                      text: 'Adjunto gráficos consolidados.',
                  });
                  await saveAuditLog("Compartir Gráfico", fileName);
                  setExporting(false);
                  return;
              } catch (shareErr) {
                  // Fallback to non-native share if aborted or unsupported
                  console.warn("Share failed, trying fallback", shareErr);
              }
          }
      }

      // Fallbacks
      if (method === 'whatsapp') {
          const message = `Gráficos Consolidados generados en el sistema.`;
          const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
          window.open(url, '_blank');
      } else {
          const message = `Se generaron gráficos consolidados en el sistema.`;
          window.location.href = `mailto:?subject=Gráficos Consolidados&body=${encodeURIComponent(message)}`;
      }
      
      toast.success("Abriendo cliente...");
    } catch (e) {
        console.error(e);
        toast.error("No se pudo compartir nativamente");
    } finally {
        setExporting(false);
    }
  };

  const handleExportDataExcel = () => {
    if (data.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }
    try {
      const exportRows = data.map(d => ({
        'Entidad / Área': d.name,
        'Cumplimiento (%)': d.percent,
        'Estatus': d.percent >= 90 ? 'Óptimo (>= 90%)' : d.percent >= 75 ? 'Aceptable (75-89%)' : 'Crítico (< 75%)',
        'Filtro Localidad': filterLocalidad === 'ALL' ? 'Todas' : localidades.find(l => l.id === filterLocalidad)?.nombre || 'Región'
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportRows);
      XLSX.utils.book_append_sheet(wb, ws, 'Datos Analítica');
      XLSX.writeFile(wb, `Analisis_Grafico_SST_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Datos analíticos exportados a Excel (.xlsx)');
    } catch (err) {
      console.error(err);
      toast.error('Error al exportar a Excel');
    }
  };

  const handleExportDataCSV = () => {
    if (data.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }
    try {
      const exportRows = data.map(d => ({
        Entidad_Area: d.name,
        Cumplimiento_Porcentaje: d.percent,
        Estatus: d.percent >= 90 ? 'Optimo' : d.percent >= 75 ? 'Aceptable' : 'Critico',
        Filtro_Localidad: filterLocalidad === 'ALL' ? 'Todas' : localidades.find(l => l.id === filterLocalidad)?.nombre || 'Region'
      }));

      const csv = jsonToCSV(exportRows);
      downloadCSV(csv, `Analisis_Grafico_SST_${new Date().toISOString().split('T')[0]}.csv`);
      toast.success('Datos analíticos exportados a CSV (.csv)');
    } catch (err) {
      console.error(err);
      toast.error('Error al exportar a CSV');
    }
  };

  const renderChart = () => {
    if (data.length === 0) {
        return <div className="flex items-center justify-center h-full text-slate-400 font-bold">Sin datos suficientes</div>;
    }

    const commonAxisProps = {
        tick: { fill: '#64748b', fontSize: 10, fontWeight: 'bold' },
        axisLine: { stroke: '#cbd5e1' },
    };

    switch (chartType) {
        case 'bar':
        return (
            <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} layout="vertical" margin={{ top: 20, right: 40, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="name" type="category" {...commonAxisProps} width={130} interval={0} />
                {!exporting && <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />}
                <Bar isAnimationActive={false} dataKey="percent" name="Cumplimiento" radius={[0, 4, 4, 0]} maxBarSize={40}>
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColorByEficiencia(entry.percent)} />
                ))}
                <LabelList dataKey="percent" position="right" formatter={(val: number) => `${val}%`} style={{ fill: '#334155', fontSize: '11px', fontWeight: 'bold' }} />
                </Bar>
            </BarChart>
            </ResponsiveContainer>
        );
        case 'line':
        return (
            <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data} margin={{ top: 30, right: 30, left: -20, bottom: 45 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" {...commonAxisProps} height={80} interval={0} />
                <YAxis domain={[0, 100]} {...commonAxisProps} />
                {!exporting && <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />}
                <Line isAnimationActive={false} type="monotone" name="Cumplimiento" dataKey="percent" stroke="#00519E" strokeWidth={3} dot={{ r: 6, fill: '#00519E', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
            </LineChart>
            </ResponsiveContainer>
        );
        case 'pie':
        return (
            <ResponsiveContainer width="100%" height={400}>
            <PieChart margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                {!exporting && <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(val: number) => [`${val}%`, 'Cumplimiento']} />}
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '10px' }} />
                <Pie isAnimationActive={false} data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={130} paddingAngle={2} dataKey="percent" nameKey="name" label={(entry) => `${entry.percent}%`} labelLine={{stroke: '#cbd5e1', strokeWidth: 1}}>
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColorByEficiencia(entry.percent)} />
                ))}
                </Pie>
            </PieChart>
            </ResponsiveContainer>
        );
        case 'column':
        default:
        return (
            <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} margin={{ top: 30, right: 30, left: -20, bottom: 45 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" {...commonAxisProps} height={80} interval={0} />
                <YAxis domain={[0, 100]} {...commonAxisProps} />
                {!exporting && <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(val: number) => [`${val}%`, 'Cumplimiento']} />}
                <Bar isAnimationActive={false} dataKey="percent" name="Cumplimiento" radius={[4, 4, 0, 0]} maxBarSize={60}>
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColorByEficiencia(entry.percent)} />
                ))}
                <LabelList dataKey="percent" position="top" formatter={(val: number) => `${val}%`} style={{ fill: '#334155', fontSize: '11px', fontWeight: 'bold' }} />
                </Bar>
            </BarChart>
            </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full">
            <div className="flex flex-wrap gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                        <MapPin size={14} /> Localidad
                    </label>
                    <select
                        value={filterLocalidad}
                        onChange={(e) => setFilterLocalidad(e.target.value)}
                        className="p-2 border border-slate-300 rounded-lg text-sm bg-slate-50 hover:bg-white focus:ring-2 focus:ring-[#00519E] focus:border-transparent transition-all outline-none"
                    >
                        <option value="ALL">TODAS LAS LOCALIDADES</option>
                        {localidades.map(l => (
                        <option key={l.id} value={l.id}>{l.nombre}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                        <Grid size={14} /> Establecimiento
                    </label>
                    <select
                        value={filterTipo}
                        onChange={(e) => setFilterTipo(e.target.value)}
                        className="p-2 border border-slate-300 rounded-lg text-sm bg-slate-50 hover:bg-white focus:ring-2 focus:ring-[#00519E] focus:border-transparent transition-all outline-none"
                    >
                        <option value="ALL">TODOS</option>
                        <option value="DISTRIBUIDORA">DISTRIBUIDORAS</option>
                        <option value="SERVICENTRO">SERVICENTROS</option>
                    </select>
                </div>
            </div>

            <div className="flex flex-col gap-1.5 pb-2 lg:pb-0">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                    <Camera size={14} /> TIPO DE GRÁFICO
                </label>
                <div className="bg-slate-100 p-1 flex flex-wrap gap-1 rounded-lg">
                    {[
                        { id: 'column', label: 'Columnas' },
                        { id: 'bar', label: 'Barras' },
                        { id: 'line', label: 'Líneas' },
                        { id: 'pie', label: 'Circular' }
                    ].map(type => (
                        <button
                            key={type.id}
                            onClick={() => setChartType(type.id as any)}
                            className={cn(
                                "px-3 py-1.5 text-xs font-bold rounded-md transition-all",
                                chartType === type.id 
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
            <div>
                <h2 className="text-lg font-bold text-slate-800 uppercase">Análisis Global: {chartType === 'column' ? 'Columnas' : chartType === 'bar' ? 'Barras' : chartType === 'line' ? 'Líneas' : 'Circular'}</h2>
                <p className="text-sm text-slate-500">{filterLocalidad === 'ALL' ? 'Comparativa de todas las localidades' : `Localidad: ${localidades.find(l=>l.id===filterLocalidad)?.nombre}`}</p>
            </div>
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={handleExportDataExcel}
                    disabled={exporting || data.length === 0}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors font-bold text-xs border border-emerald-200"
                    title="Exportar datos a Excel (.xlsx)"
                >
                    <FileSpreadsheet size={16} />
                    <span>Excel</span>
                </button>
                <button
                    onClick={handleExportDataCSV}
                    disabled={exporting || data.length === 0}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-bold text-xs border border-slate-200"
                    title="Exportar datos a CSV (.csv)"
                >
                    <FileText size={16} />
                    <span>CSV</span>
                </button>
                <button
                    onClick={handleExportPDF}
                    disabled={exporting}
                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    title="Exportar a PDF"
                >
                    <Download size={18} />
                </button>
                <button
                    onClick={handleExportJPG}
                    disabled={exporting}
                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    title="Descargar JPG"
                >
                    <Camera size={18} />
                </button>
                <button
                    onClick={() => handleShare('whatsapp')}
                    disabled={exporting}
                    className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                    title="Compartir WhatsApp"
                >
                    <MessageCircle size={18} />
                </button>
                <button
                    onClick={() => handleShare('email')}
                    disabled={exporting}
                    className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                    title="Compartir E-mail"
                >
                    <Mail size={18} />
                </button>
            </div>
        </div>

        {/* CONTENEDOR EXPORTABLE */}
        <div 
            ref={chartRef} 
            className="w-full bg-white relative flex flex-col"
            style={{ 
                minHeight: '600px',
                padding: '30px 40px', // report styling
            }}
        >
            <style>{`
                [ref="chartRef"],
                [ref="chartRef"] * {
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
            `}</style>
            {/* Header */}
            <div className="flex justify-between items-end border-b-2 border-[#00519E] pb-4 mb-6">
                <div>
                   <img src="/logo.png" alt="Duncan" style={{ height: "40px", objectFit: "contain" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold text-[#00519E] uppercase m-0 leading-tight">
                       Reporte de Indicadores
                    </h2>
                    <p className="text-sm font-bold text-slate-600 m-0 leading-tight mt-1">
                       {filterLocalidad === 'ALL' ? 'Nivel Nacional' : `Región: ${localidades.find(l => l.id === filterLocalidad)?.nombre}`}
                    </p>
                    <p className="text-xs text-slate-500 m-0 mt-1">
                       Fecha: {new Date().toLocaleDateString()}
                    </p>
                </div>
            </div>

            {/* Title */}
            <div className="mb-6 text-center">
                <h3 className="text-lg font-bold text-slate-800 uppercase m-0">
                    {chartType === 'column' ? 'Gráfico de Columnas' : chartType === 'bar' ? 'Gráfico de Barras' : chartType === 'line' ? 'Gráfico de Líneas' : 'Gráfico Circular'} - Cumplimiento (%)
                </h3>
                {filterTipo !== 'ALL' && (
                    <p className="text-sm text-slate-500 uppercase font-bold mt-1">
                        Filtro de Establecimiento: {filterTipo === 'DISTRIBUIDORA' ? 'DISTRIBUIDORAS' : 'SERVICENTROS'}
                    </p>
                )}
            </div>
            
            {/* Chart */}
            <div className="w-full flex-1 flex flex-col items-center justify-center overflow-hidden" style={{ height: '420px', minHeight: '420px' }}>
                <div className="w-full h-full" style={{ minWidth: '100%' }}>
                    {renderChart()}
                </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span>Generado por Sistema de Inspección DUNCAN</span>
                <span>Desarrollado por ERGOEXPRESS, C.A. - RIF: J-50251246-2</span>
            </div>
        </div>
      </div>
    </div>
  );
}
