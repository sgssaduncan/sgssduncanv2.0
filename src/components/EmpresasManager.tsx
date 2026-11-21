import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { Building2, Upload, Download, Plus, Search, Trash2, Edit2, X, Save } from 'lucide-react';
import { dbService } from '../services/db';
import type { Empresa } from '../types';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';

export default function EmpresasManager({ onBack }: { onBack: () => void }) {
  const { profile } = useAuth();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Empresa>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const data = await dbService.getEmpresas();
      setEmpresas(data);
    } catch (e) {
      toast.error('Error al cargar empresas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      loadData();
    }
  }, [profile]);

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([{
      id: "",
      nombre: "Empresa Ejemplo C.A.",
      codigo: "EMP-001",
      rif: "J-00000000-0"
    }]);
    
    // Auto-fit columns
    ws['!cols'] = [{ wch: 15 }, { wch: 30 }, { wch: 15 }, { wch: 20 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Empresas");
    XLSX.writeFile(wb, "Plantilla_Carga_Empresas.xlsx");
    toast.success("Plantilla descargada");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading("Procesando archivo...");
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        const nuevasEmpresas: Empresa[] = data.map((row: any) => ({
          id: row['id'] || '',
          nombre: row['nombre'] || '',
          codigo: row['codigo'] || '',
          rif: row['rif'] || ''
        })).filter(e => e.nombre && e.codigo); // require at least this

        if (nuevasEmpresas.length === 0) {
          toast.error("El archivo no contiene datos válidos", { id: toastId });
          return;
        }

        await dbService.batchSaveEmpresas(nuevasEmpresas);
        toast.success(`Se procesaron ${nuevasEmpresas.length} registros`, { id: toastId });
        await loadData();
      } catch (error) {
        toast.error("Error al procesar el archivo Excel", { id: toastId });
      }
    };
    reader.readAsBinaryString(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveEdit = async () => {
    if (!editForm.nombre || !editForm.codigo) {
      toast.error('Nombre y código son requeridos');
      return;
    }
    const toastId = toast.loading('Guardando...');
    try {
      if (editingId && editingId !== 'new') {
        await dbService.updateEmpresa(editingId, editForm);
        toast.success('Empresa actualizada', { id: toastId });
      } else {
        await dbService.createEmpresa(editForm as Omit<Empresa, 'id'>);
        toast.success('Empresa creada', { id: toastId });
      }
      setEditingId(null);
      setEditForm({});
      await loadData();
    } catch (e) {
      toast.error('Error al guardar', { id: toastId });
    }
  };

  const handleDelete = async (id: string) => {
    if(!window.confirm('¿Desea eliminar esta empresa?')) return;
    try {
      await dbService.deleteEmpresa(id);
      toast.success('Empresa eliminada');
      await loadData();
    } catch (e) {
      toast.error('Error al eliminar');
    }
  };

  const handleCreateNew = () => {
    setEditingId('new');
    setEditForm({
      nombre: '',
      codigo: '',
      rif: ''
    });
  };

  const filtered = empresas.filter(e => 
    e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.rif.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors font-black text-slate-400"
        >
          <X size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Building2 className="text-blue-600" />
            Gestión de Empresas
          </h2>
          <p className="text-sm text-slate-500 font-medium">Carga masiva, edición y listado de empresas</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar empresa..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button 
            onClick={downloadTemplate}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl font-bold transition-colors text-sm"
          >
            <Download size={18} /> Plantilla
          </button>
          <label className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-xl font-bold transition-colors text-sm cursor-pointer whitespace-nowrap">
            <Upload size={18} /> Subir Excel
            <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="hidden" ref={fileInputRef} />
          </label>
          <button 
            onClick={handleCreateNew}
            disabled={editingId === 'new'}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-bold transition-colors shadow-lg shadow-blue-200 text-sm disabled:opacity-50"
          >
            <Plus size={18} /> Nuevo
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden text-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-black tracking-widest text-[10px] text-slate-400 uppercase">ID</th>
                <th className="px-6 py-4 font-black tracking-widest text-[10px] text-slate-400 uppercase">Nombre</th>
                <th className="px-6 py-4 font-black tracking-widest text-[10px] text-slate-400 uppercase">Código</th>
                <th className="px-6 py-4 font-black tracking-widest text-[10px] text-slate-400 uppercase">RIF</th>
                <th className="px-6 py-4 font-black tracking-widest text-[10px] text-slate-400 uppercase text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {editingId === 'new' && (
                <tr className="bg-blue-50/30">
                  <td className="px-6 py-4 text-xs font-mono text-slate-400">-</td>
                  <td className="px-6 py-4">
                    <input 
                      type="text" 
                      value={editForm.nombre || ''} 
                      onChange={e => setEditForm({...editForm, nombre: e.target.value})}
                      className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Nombre..."
                      autoFocus
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input 
                      type="text" 
                      value={editForm.codigo || ''} 
                      onChange={e => setEditForm({...editForm, codigo: e.target.value})}
                      className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Código..."
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input 
                      type="text" 
                      value={editForm.rif || ''} 
                      onChange={e => setEditForm({...editForm, rif: e.target.value})}
                      className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="RIF..."
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                       <button onClick={handleSaveEdit} className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg"><Save size={18} /></button>
                       <button onClick={() => {setEditingId(null); setEditForm({});}} className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-lg"><X size={18} /></button>
                    </div>
                  </td>
                </tr>
              )}
              {loading && !empresas.length ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : null}
              {filtered.map(emp => {
                const isEditing = editingId === emp.id;
                return (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">{emp.id.substring(0, 8)}</td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                         <input 
                           type="text" 
                           value={editForm.nombre || ''} 
                           onChange={e => setEditForm({...editForm, nombre: e.target.value})}
                           className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      ) : (
                         <span className="font-bold text-slate-700">{emp.nombre}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                         <input 
                           type="text" 
                           value={editForm.codigo || ''} 
                           onChange={e => setEditForm({...editForm, codigo: e.target.value})}
                           className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      ) : (
                         <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md font-mono text-xs font-bold">{emp.codigo}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                         <input 
                           type="text" 
                           value={editForm.rif || ''} 
                           onChange={e => setEditForm({...editForm, rif: e.target.value})}
                           className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      ) : (
                         <span className="font-medium text-slate-600">{emp.rif}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                       {isEditing ? (
                         <div className="flex justify-end gap-2">
                           <button onClick={handleSaveEdit} className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg"><Save size={18} /></button>
                           <button onClick={() => {setEditingId(null); setEditForm({});}} className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-lg"><X size={18} /></button>
                         </div>
                       ) : (
                         <div className="flex justify-end gap-2">
                           <button 
                             onClick={() => {
                               setEditingId(emp.id);
                               setEditForm({nombre: emp.nombre, codigo: emp.codigo, rif: emp.rif});
                             }} 
                             className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                           >
                             <Edit2 size={18} />
                           </button>
                           <button 
                             onClick={() => handleDelete(emp.id)}
                             className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                           >
                             <Trash2 size={18} />
                           </button>
                         </div>
                       )}
                    </td>
                  </tr>
                )
              })}
              {!loading && filtered.length === 0 && editingId !== 'new' && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium italic">
                    No se encontraron empresas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
