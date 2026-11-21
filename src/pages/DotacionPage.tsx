import React, { useState } from 'react';
import {
  Package, Plus, Search, AlertTriangle, CheckCircle2,
  Calendar, User, Shield, ArrowDownRight, RefreshCw, FileText
} from 'lucide-react';
import { gsApi } from '../lib/googleSheetsClient';
import type { ArticuloEPP, DotacionEPP, Empleado } from '../types';
import { today, formatDate } from '../lib/utils';
import { useSGD } from '../contexts/SGDContext';
import toast from 'react-hot-toast';

export default function DotacionPage() {
  const { empleados, currentUser } = useSGD();
  const [activeTab, setActiveTab] = useState<'inventario' | 'entregas'>('inventario');
  const [inventario, setInventario] = useState<ArticuloEPP[]>(() => gsApi.getInventarioEPP());
  const [entregas, setEntregas] = useState<DotacionEPP[]>(() => gsApi.getSolicitudesEPP());
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Formulario nueva dotación
  const [formEmpleado, setFormEmpleado] = useState('');
  const [formCedula, setFormCedula] = useState('');
  const [formCargo, setFormCargo] = useState('');
  const [formEmpresa, setFormEmpresa] = useState('Acumuladores Duncan, C.A.');
  const [formEstablecimiento, setFormEstablecimiento] = useState('Planta Los Ruices');
  const [formArticuloId, setFormArticuloId] = useState(inventario[0]?._id || '');
  const [formCantidad, setFormCantidad] = useState(1);
  const [formFecha, setFormFecha] = useState(today());

  // Stock bajo
  const stockCriticoCount = inventario.filter(i => i.stockActual <= i.stockMinimo).length;

  const handleSelectEmpleado = (empId: string) => {
    const found = empleados.find(e => e._id === empId);
    if (found) {
      setFormEmpleado(found.nombre);
      setFormCedula(found.cedula);
      setFormCargo(found.cargo);
      if (found.empresaNombre) setFormEmpresa(found.empresaNombre);
    }
  };

  const handleCreateEntrega = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmpleado.trim() || !formCedula.trim()) {
      toast.error('Indica el nombre y cédula del trabajador');
      return;
    }

    const item = inventario.find(i => i._id === formArticuloId);
    if (!item) {
      toast.error('Selecciona un artículo válido');
      return;
    }

    if (item.stockActual < formCantidad) {
      toast.error(`Stock insuficiente. Solo quedan ${item.stockActual} ${item.unidad}`);
      return;
    }

    // Descontar stock
    const updatedInv = inventario.map(i => {
      if (i._id === item._id) {
        return { ...i, stockActual: i.stockActual - formCantidad };
      }
      return i;
    });
    setInventario(updatedInv);
    localStorage.setItem('sgd_inventario_epp', JSON.stringify(updatedInv));

    // Crear registro de entrega
    const nuevaEntrega: DotacionEPP = {
      _id: `dot_${Date.now()}`,
      empleadoNombre: formEmpleado.trim(),
      cedula: formCedula.trim(),
      cargo: formCargo.trim() || 'Operario',
      empresaNombre: formEmpresa,
      establecimientoNombre: formEstablecimiento,
      articulos: [{ articuloId: item._id, nombre: item.nombre, cantidad: formCantidad }],
      fechaEntrega: formFecha,
      entregadoPor: currentUser?.nombre || 'Inspector SSA Duncan',
    };

    const updatedEntregas = [nuevaEntrega, ...entregas];
    setEntregas(updatedEntregas);
    localStorage.setItem('sgd_solicitudes_epp', JSON.stringify(updatedEntregas));

    gsApi.logAudit({
      usuario: currentUser?.nombre || 'Sistema',
      accion: 'ENTREGA_EPP',
      entidad: 'DotacionEPP',
      entidadId: nuevaEntrega._id,
      detalles: `Entregado ${formCantidad}x ${item.nombre} a ${nuevaEntrega.empleadoNombre} (${nuevaEntrega.cedula})`,
    });

    toast.success('Dotación de EPP registrada y stock descontado');
    setModalOpen(false);
  };

  const filteredInv = inventario.filter(i =>
    i.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
              <Package className="h-6 w-6" />
            </div>
            Dotación y Control de EPP
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestión de inventario de equipos de protección personal y registro de dotaciones al personal Duncan
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Nueva Entrega de EPP</span>
        </button>
      </div>

      {/* Tarjetas Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Artículos en Catálogo</p>
            <p className="text-2xl font-bold text-slate-900">{inventario.length}</p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4">
          <div className={`p-3 rounded-xl ${stockCriticoCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock Mínimo / Alerta</p>
            <p className="text-2xl font-bold text-slate-900">{stockCriticoCount} <span className="text-xs font-normal text-slate-400">artículos</span></p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Entregas Realizadas</p>
            <p className="text-2xl font-bold text-slate-900">{entregas.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('inventario')}
          className={`pb-3 text-sm font-semibold transition-colors relative ${
            activeTab === 'inventario'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Inventario de EPP ({inventario.length})
        </button>
        <button
          onClick={() => setActiveTab('entregas')}
          className={`pb-3 text-sm font-semibold transition-colors relative ${
            activeTab === 'entregas'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Historial de Entregas ({entregas.length})
        </button>
      </div>

      {/* TAB 1: INVENTARIO */}
      {activeTab === 'inventario' && (
        <div className="space-y-4">
          <div className="card p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por código, nombre o categoría de EPP..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="input pl-9 text-sm w-full"
              />
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Código</th>
                    <th className="py-3 px-4">Descripción del EPP</th>
                    <th className="py-3 px-4">Categoría</th>
                    <th className="py-3 px-4 text-center">Stock Actual</th>
                    <th className="py-3 px-4 text-center">Stock Mínimo</th>
                    <th className="py-3 px-4 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInv.map(item => {
                    const isLow = item.stockActual <= item.stockMinimo;
                    return (
                      <tr key={item._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-700">
                          {item.codigo}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-900">
                          {item.nombre}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600">
                          <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-medium">
                            {item.categoria}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-sm text-slate-900">
                          {item.stockActual} <span className="text-xs font-normal text-slate-500">{item.unidad}</span>
                        </td>
                        <td className="py-3.5 px-4 text-center text-xs text-slate-500">
                          {item.stockMinimo} {item.unidad}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            isLow
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isLow ? '⚠️ Stock Bajo' : '✓ Óptimo'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ENTREGAS */}
      {activeTab === 'entregas' && (
        <div className="space-y-4">
          {entregas.length === 0 ? (
            <div className="card p-12 text-center text-slate-400">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-semibold text-slate-600">No hay entregas registradas aún</p>
              <p className="text-xs text-slate-400 mt-1">Registra la primera dotación con el botón superior</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                      <th className="py-3 px-4">Fecha</th>
                      <th className="py-3 px-4">Trabajador Receptor</th>
                      <th className="py-3 px-4">Cédula</th>
                      <th className="py-3 px-4">Cargo / Ubicación</th>
                      <th className="py-3 px-4">Artículos Entregados</th>
                      <th className="py-3 px-4 text-right">Entregado Por</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {entregas.map(ent => (
                      <tr key={ent._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 text-xs font-medium text-slate-600 whitespace-nowrap">
                          {formatDate(ent.fechaEntrega)}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {ent.empleadoNombre}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                          {ent.cedula}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600">
                          <div>{ent.cargo}</div>
                          <div className="text-[11px] text-slate-400">{ent.establecimientoNombre}</div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-800">
                          {ent.articulos.map((a, idx) => (
                            <div key={idx} className="font-medium">
                              • {a.cantidad}x {a.nombre}
                            </div>
                          ))}
                        </td>
                        <td className="py-3.5 px-4 text-right text-xs font-semibold text-purple-700">
                          {ent.entregadoPor}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL NUEVA ENTREGA */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-400" />
                Registrar Dotación de EPP
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEntrega} className="p-6 space-y-4">
              {empleados.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Cargar desde Base de Empleados
                  </label>
                  <select
                    onChange={e => handleSelectEmpleado(e.target.value)}
                    className="input w-full text-xs"
                    defaultValue=""
                  >
                    <option value="" disabled>Seleccionar empleado registrado...</option>
                    {empleados.map(e => (
                      <option key={e._id} value={e._id}>
                        {e.nombre} — {e.cedula} ({e.cargo})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nombre del Trabajador *
                  </label>
                  <input
                    type="text"
                    required
                    value={formEmpleado}
                    onChange={e => setFormEmpleado(e.target.value)}
                    placeholder="Ej: Carlos Mendoza"
                    className="input w-full text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Cédula de Identidad *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCedula}
                    onChange={e => setFormCedula(e.target.value)}
                    placeholder="V-12345678"
                    className="input w-full text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Cargo
                  </label>
                  <input
                    type="text"
                    value={formCargo}
                    onChange={e => setFormCargo(e.target.value)}
                    placeholder="Operario de Formación"
                    className="input w-full text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Fecha de Entrega
                  </label>
                  <input
                    type="date"
                    required
                    value={formFecha}
                    onChange={e => setFormFecha(e.target.value)}
                    className="input w-full text-sm"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Artículo de EPP a Dotar *
                </label>
                <select
                  value={formArticuloId}
                  onChange={e => setFormArticuloId(e.target.value)}
                  className="input w-full text-sm"
                >
                  {inventario.map(item => (
                    <option key={item._id} value={item._id} disabled={item.stockActual <= 0}>
                      {item.codigo} — {item.nombre} (Stock: {item.stockActual} {item.unidad})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Cantidad a Entregar *
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  required
                  value={formCantidad}
                  onChange={e => setFormCantidad(parseInt(e.target.value) || 1)}
                  className="input w-full text-sm font-bold"
                />
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <span>La dotación quedará registrada bajo la responsabilidad de: <strong>{currentUser?.nombre}</strong></span>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-secondary text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary text-sm flex items-center gap-2"
                >
                  Confirmar Entrega
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}