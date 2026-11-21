import React, { useState, useEffect } from 'react';
import SignaturePad from './SignaturePad';
import { useAuth } from '../hooks/useAuth';
import { dbService } from '../services/db';
import { auditService } from '../services/auditService';
import { 
    Package, 
    Truck, 
    FileText, 
    Plus, 
    Search,
    AlertCircle,
    User,
    CheckCircle,
    XCircle,
    Clock,
    Camera,
    Share2,
    MessageCircle,
    Download,
    Mail,
    Shield,
    ShieldCheck,
    PenTool,
    FileCheck,
    CheckSquare,
    Layers,
    ChevronRight,
    Award
} from 'lucide-react';
import { cn } from '../lib/utils';
import type { 
    InventarioItem, 
    SolicitudEPP, 
    EntregaEPP, 
    Empleado,
    Localidad,
    Establecimiento,
    Empresa,
    FirmaActor
} from '../types';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DUNCAN_LOGO_BW } from '../lib/logos';
import SolicitudDetalleModal from './dotacion/SolicitudDetalleModal';
import SolicitudFormModal from './dotacion/SolicitudFormModal';

export const formatDateString = (dateObj: any) => {
    if (!dateObj) return 'N/A';
    if (dateObj.toDate) {
        return dateObj.toDate().toLocaleDateString();
    }
    const d = new Date(dateObj);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString();
};

function DotacionModule() {
    const { isAdmin, user } = useAuth();
    const [activeTab, setActiveTab] = useState<'inventario' | 'solicitudes' | 'reportes'>('solicitudes');
    const [stats, setStats] = useState({ pendingReqs: 0, lowStockItems: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [sol, inv] = await Promise.all([
                    dbService.getSolicitudesEPP(),
                    dbService.getInventario()
                ]);
                const pending = (sol || []).filter(s => s && s.estado !== 'Recibida' && s.estado !== 'Rechazada').length;
                const low = (inv || []).filter(i => {
                    const stockTotal = (i?.stock || []).reduce((a, c) => a + (c?.cantidad || 0), 0);
                    return stockTotal <= 5;
                }).length;
                setStats({ pendingReqs: pending, lowStockItems: low });
            } catch(e) {}
        };
        fetchStats();
    }, [activeTab]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dotación y EPP</h1>
                    <p className="text-sm text-slate-500">Gestión de inventario, equipos de protección y uniformes</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-1">
                <button
                    onClick={() => setActiveTab('solicitudes')}
                    className={cn(
                        "flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2",
                        activeTab === 'solicitudes' ? "bg-slate-100 text-duncan-blue" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                    )}
                >
                    <Truck size={18} />
                    Solicitudes y Entregas
                    {stats.pendingReqs > 0 && (
                        <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 leading-none rounded-full ml-1">{stats.pendingReqs}</span>
                    )}
                </button>
                {isAdmin && (
                    <button
                        onClick={() => setActiveTab('inventario')}
                        className={cn(
                            "flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2",
                            activeTab === 'inventario' ? "bg-slate-100 text-duncan-blue" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                        )}
                    >
                        <Package size={18} />
                        Inventario
                        {stats.lowStockItems > 0 && (
                            <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-1 leading-none rounded-full ml-1">{stats.lowStockItems}</span>
                        )}
                    </button>
                )}
                <button
                    onClick={() => setActiveTab('reportes')}
                    className={cn(
                        "flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2",
                        activeTab === 'reportes' ? "bg-slate-100 text-duncan-blue" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                    )}
                >
                    <FileText size={18} />
                    Reportes
                </button>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[500px]">
                {activeTab === 'solicitudes' && <SolicitudesTab />}
                {activeTab === 'inventario' && isAdmin && <InventarioTab />}
                {activeTab === 'reportes' && <ReportesDotacionTab />}
            </div>
        </div>
    );
}

export default DotacionModule;

function SolicitudesTab() {
    const { user, isAdmin } = useAuth();
    const [solicitudes, setSolicitudes] = useState<SolicitudEPP[]>([]);
    const [entregas, setEntregas] = useState<EntregaEPP[]>([]);
    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    const [inventario, setInventario] = useState<InventarioItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudEPP | null>(null);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    const loadData = async () => {
        setLoading(true);
        try {
            const [sol, ent, emp, inv] = await Promise.all([
                dbService.getSolicitudesEPP(),
                dbService.getEntregasEPP(),
                dbService.getEmpleados(), // need to add getEmpleados to dbService if it doesn't exist
                dbService.getInventario()
            ]);
            setSolicitudes(sol);
            setEntregas(ent);
            setEmpleados(emp);
            setInventario(inv);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const getEmpleadoInfo = (id: string) => {
        const emp = empleados.find(e => e.id === id);
        return emp ? `${emp.nombre} - ${emp.cargo}` : 'Desconocido';
    };

    const filteredSolicitudes = (solicitudes || []).filter(sol => {
        if (!sol) return false;
        // Status filter
        let statusMatch = true;
        if (statusFilter === 'IN_PROGRESS') statusMatch = !['Recibida', 'Rechazada'].includes(sol.estado);
        else if (statusFilter === 'COMPLETED') statusMatch = ['Recibida', 'Rechazada'].includes(sol.estado);
        else if (statusFilter !== 'ALL') statusMatch = sol.estado === statusFilter;

        // Search match
        let searchMatch = true;
        if (searchTerm.trim() !== '') {
            const empInfo = getEmpleadoInfo(sol.empleadoId).toLowerCase();
            const cedula = (empleados || []).find(e => e.id === sol.empleadoId)?.cedula || '';
            const searchLower = searchTerm.toLowerCase();
            const solId = (sol.id || '').toLowerCase();
            searchMatch = empInfo.includes(searchLower) || solId.includes(searchLower) || cedula.toLowerCase().includes(searchLower);
        }

        return statusMatch && searchMatch;
    }).sort((a, b) => new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime());

    return (
        <div className="p-6">
            {/* Quick Action & Workflow Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-duncan-blue to-slate-900 text-white rounded-2xl p-5 mb-6 shadow-md border border-slate-700">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="bg-yellow-400 text-slate-950 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                                SG-SST DUNCAN 2.0
                            </span>
                            <span className="text-xs text-slate-300">Flujo Normado LOPCYMAT Art. 53, 54, 59-62</span>
                        </div>
                        <h2 className="text-lg md:text-xl font-bold tracking-tight text-white">
                            Gestión de Requerimientos de Dotación, E.P.P. y Uniformes
                        </h2>
                        <p className="text-xs text-slate-300 max-w-2xl">
                            Flujo digital de 4 aprobaciones con firma electrónica trazable: Solicitud Supervisor → Validación Técnica SSA → Despacho Almacén → Recepción Conforme y Acta Oficial PDF.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold px-5 py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2.5 text-sm shrink-0 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Plus size={18} className="stroke-[2.5]" />
                        <span>Nueva Solicitud de Dotación</span>
                    </button>
                </div>

                {/* Workflow Stepper Preview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-white/10 text-xs">
                    <div className="flex items-center gap-2 bg-white/5 rounded-lg p-2">
                        <div className="w-6 h-6 rounded-full bg-blue-500/30 text-blue-300 flex items-center justify-center font-bold text-[11px] shrink-0">1</div>
                        <div>
                            <p className="font-bold text-white text-[11px]">Solicitud y Supervisor</p>
                            <p className="text-[9.5px] text-slate-300">Requerimiento y firma inicial</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 rounded-lg p-2">
                        <div className="w-6 h-6 rounded-full bg-purple-500/30 text-purple-300 flex items-center justify-center font-bold text-[11px] shrink-0">2</div>
                        <div>
                            <p className="font-bold text-white text-[11px]">Validación Técnica SSA</p>
                            <p className="text-[9.5px] text-slate-300">Matriz de riesgos y COVENIN</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 rounded-lg p-2">
                        <div className="w-6 h-6 rounded-full bg-amber-500/30 text-amber-300 flex items-center justify-center font-bold text-[11px] shrink-0">3</div>
                        <div>
                            <p className="font-bold text-white text-[11px]">Despacho de Almacén</p>
                            <p className="text-[9.5px] text-slate-300">Preparación de insumos físicos</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 rounded-lg p-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/30 text-emerald-300 flex items-center justify-center font-bold text-[11px] shrink-0">4</div>
                        <div>
                            <p className="font-bold text-white text-[11px]">Recepción & Acta PDF</p>
                            <p className="text-[9.5px] text-slate-300">Inducción y 4 firmas digitales</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Solicitudes y Entregas</h2>
                    <p className="text-sm text-slate-500">Historial general y trazabilidad de dotación</p>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-auto">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar empleado o ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg pl-9 pr-3 py-2 outline-none focus:border-duncan-blue w-full md:w-64"
                        />
                    </div>
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 outline-none focus:border-duncan-blue w-full md:w-auto"
                    >
                        <option value="ALL">Todas las Solicitudes</option>
                        <option value="IN_PROGRESS">En Curso</option>
                        <option value="COMPLETED">Finalizadas (Recibidas/Rechazadas)</option>
                        <option value="Solicitada">Pendientes de Supervisor</option>
                        <option value="Aprobada por Supervisor">Pendientes de SSA</option>
                        <option value="Aprobada por SSA">Pendientes de Despacho</option>
                        <option value="Despachada">Pendientes de Confirmación</option>
                    </select>
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="bg-duncan-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                    >
                        <Plus size={16} />
                        Nueva Solicitud
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-duncan-blue border-t-transparent rounded-full animate-spin"/></div>
            ) : filteredSolicitudes.length === 0 ? (
                <div className="text-center p-8 bg-slate-50 rounded-xl border border-slate-100">
                    <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-medium">No hay historial de solicitudes</p>
                </div>
            ) : (
                <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3">Fecha</th>
                                    <th className="px-4 py-3">Empleado</th>
                                    <th className="px-4 py-3">Items</th>
                                    <th className="px-4 py-3">Estado</th>
                                    <th className="px-4 py-3 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {filteredSolicitudes.map(sol => (
                                    <tr key={sol.id || String(Math.random())} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 text-slate-700">{formatDateString(sol.createdAt)}</td>
                                        <td className="px-4 py-3 text-slate-700 font-medium">{getEmpleadoInfo(sol.empleadoId)}</td>
                                        <td className="px-4 py-3 text-slate-500">{(sol.items || []).length} artículo(s)</td>
                                        <td className="px-4 py-3">
                                            <span className={cn(
                                                "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                                sol.estado === 'Solicitada' ? "bg-yellow-100 text-yellow-700" :
                                                sol.estado === 'Aprobada por Supervisor' ? "bg-blue-100 text-blue-700" :
                                                sol.estado === 'Aprobada por SSA' ? "bg-purple-100 text-purple-700" :
                                                sol.estado === 'Despachada' ? "bg-orange-100 text-orange-700" :
                                                sol.estado === 'Recibida' ? "bg-green-100 text-green-700" :
                                                "bg-red-100 text-red-700"
                                            )}>
                                                {sol.estado}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button 
                                                onClick={() => setSelectedSolicitud(sol)}
                                                className="text-duncan-blue font-semibold hover:underline text-xs"
                                            >
                                                Ver Detalles / Gestionar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Vista móvil (cards) */}
                    <div className="md:hidden flex flex-col divide-y divide-slate-100">
                        {filteredSolicitudes.map(sol => (
                            <div key={sol.id || String(Math.random())} className="p-4 hover:bg-slate-50 transition-colors flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-slate-800">{getEmpleadoInfo(sol.empleadoId)}</p>
                                        <p className="text-xs text-slate-500">{formatDateString(sol.createdAt)} &middot; {(sol.items || []).length} artículo(s)</p>
                                    </div>
                                    <span className={cn(
                                        "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ml-3",
                                        sol.estado === 'Solicitada' ? "bg-yellow-100 text-yellow-700" :
                                        sol.estado === 'Aprobada por Supervisor' ? "bg-blue-100 text-blue-700" :
                                        sol.estado === 'Aprobada por SSA' ? "bg-purple-100 text-purple-700" :
                                        sol.estado === 'Despachada' ? "bg-orange-100 text-orange-700" :
                                        sol.estado === 'Recibida' ? "bg-green-100 text-green-700" :
                                        "bg-red-100 text-red-700"
                                    )}>
                                        {sol.estado}
                                    </span>
                                </div>
                                <button 
                                    onClick={() => setSelectedSolicitud(sol)}
                                    className="w-full mt-2 py-2 border border-slate-200 rounded-lg text-duncan-blue font-semibold hover:bg-slate-100 bg-white text-xs transition-colors"
                                >
                                    Ver Detalles / Gestionar
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {isFormOpen && (
                <SolicitudFormModal 
                    empleados={empleados}
                    inventario={inventario}
                    onClose={() => setIsFormOpen(false)}
                    onSave={() => {
                        setIsFormOpen(false);
                        loadData();
                    }}
                />
            )}

            {selectedSolicitud && (
                <SolicitudDetalleModal 
                    solicitud={selectedSolicitud}
                    empleados={empleados}
                    inventario={inventario}
                    entregas={entregas}
                    onClose={() => setSelectedSolicitud(null)}
                    onUpdate={() => {
                        setSelectedSolicitud(null);
                        loadData();
                    }}
                />
            )}
        </div>
    );
}

function InventarioTab() {
    const [items, setItems] = useState<InventarioItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventarioItem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const loadInventario = async () => {
        setLoading(true);
        try {
            const data = await dbService.getInventario();
            setItems(data);
        } catch (error) {
            toast.error("Error al cargar inventario");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInventario();
    }, []);

    const handleSave = async () => {
        setIsFormOpen(false);
        setEditingItem(null);
        await loadInventario();
    };

    const filteredItems = (items || []).filter(item => {
        if (!item) return false;
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (item.nombre || '').toLowerCase().includes(searchLower) || 
               (item.codigo || '').toLowerCase().includes(searchLower) || 
               (item.categoria || '').toLowerCase().includes(searchLower);
    });

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Catálogo de Inventario</h2>
                    <p className="text-sm text-slate-500">Administra los EPP y Uniformes disponibles</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-auto">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar por código, nombre o categoría..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg pl-9 pr-3 py-2 outline-none focus:border-duncan-blue w-full md:w-80"
                        />
                    </div>
                    <button
                        onClick={() => {
                            setEditingItem(null);
                            setIsFormOpen(true);
                        }}
                        className="bg-duncan-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                    >
                        <Plus size={16} />
                        Añadir Artículo
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-duncan-blue border-t-transparent rounded-full animate-spin"/></div>
            ) : filteredItems.length === 0 ? (
                <div className="text-center p-8 bg-slate-50 rounded-xl border border-slate-100">
                    <Package size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-medium">No se encontraron artículos</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredItems.map(item => {
                        const totalStock = (item?.stock || []).reduce((acc, curr) => acc + (curr?.cantidad || 0), 0);
                        return (
                            <div key={item.id} className="border border-slate-200 rounded-xl p-4 flex flex-col hover:border-duncan-blue transition-colors bg-white">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        {item.fotoUrl ? (
                                            <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200">
                                                <img src={item.fotoUrl} alt={item.nombre} className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className="w-16 h-16 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-200">
                                                <Camera size={24} className="text-slate-300" />
                                            </div>
                                        )}
                                        <div>
                                            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{item.categoria}</span>
                                            <h3 className="font-bold text-slate-800 leading-tight mt-1">{item.nombre}</h3>
                                            <p className="text-xs text-slate-500 mt-1">Ref: {item.codigo}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 text-sm text-slate-600 mb-4 line-clamp-2">
                                    {item.descripcion}
                                </div>
                                <div className="mt-auto border-t border-slate-100 pt-4 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Stock Total</span>
                                        <span className={cn("text-lg font-black", totalStock === 0 ? "text-red-500" : "text-green-600")}>
                                            {totalStock} <span className="text-sm font-semibold text-slate-500">unds</span>
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setEditingItem(item);
                                            setIsFormOpen(true);
                                        }}
                                        className="text-duncan-blue text-sm font-semibold hover:underline"
                                    >
                                        Editar / Tallas
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {isFormOpen && (
                <InventarioFormModal 
                    item={editingItem} 
                    onClose={() => setIsFormOpen(false)} 
                    onSave={handleSave} 
                />
            )}
        </div>
    );
}

function InventarioFormModal({ item, onClose, onSave }: { item: InventarioItem | null, onClose: () => void, onSave: () => void }) {
    const [nombre, setNombre] = useState(item?.nombre || '');
    const [codigo, setCodigo] = useState(item?.codigo || '');
    const [categoria, setCategoria] = useState<import('../types').CategoriaInventario>(item?.categoria || 'EPP');
    const [descripcion, setDescripcion] = useState(item?.descripcion || '');
    const [fotoUrl, setFotoUrl] = useState(item?.fotoUrl || '');
    const [stk, setStk] = useState<{talla: string, cantidad: number}[]>(item?.stock && Array.isArray(item.stock) && item.stock.length > 0 ? item.stock : [{talla: 'UNICA', cantidad: 0}]);
    const [saving, setSaving] = useState(false);

    // Venezuelan SST Compliance State Properties (LOPCYMAT & NT-03-2016)
    const [fabricante, setFabricante] = useState(item?.fabricante || '');
    const [proveedor, setProveedor] = useState(item?.proveedor || '');
    const [documentoEficacia, setDocumentoEficacia] = useState(item?.documentoEficacia || '');
    const [nivelProteccion, setNivelProteccion] = useState(item?.nivelProteccion || '');
    const [instruccionesUsoMantenimiento, setInstruccionesUsoMantenimiento] = useState(item?.instruccionesUsoMantenimiento || '');
    
    // Joint tri-partite selection validations
    const [validoSsst, setValidoSsst] = useState(item?.validoSsst ?? false);
    const [validoDelegados, setValidoDelegados] = useState(item?.validoDelegados ?? false);
    const [validoTrabajadores, setValidoTrabajadores] = useState(item?.validoTrabajadores ?? false);
    const [firmaSsstNombre, setFirmaSsstNombre] = useState(item?.firmaSsstNombre || '');
    const [firmaDelegadoNombre, setFirmaDelegadoNombre] = useState(item?.firmaDelegadoNombre || '');
    const [esFajaLumbar, setEsFajaLumbar] = useState(item?.esFajaLumbar ?? false);

    const handleNombreChange = (val: string) => {
        setNombre(val);
        const lower = val.toLowerCase();
        if (lower.includes('faja') || lower.includes('lumbar') || lower.includes('faja lumbar')) {
            setEsFajaLumbar(true);
        }
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
             setFotoUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const addTalla = () => {
        setStk([...stk, {talla: '', cantidad: 0}]);
    };

    const removeTalla = (index: number) => {
        const n = [...stk];
        n.splice(index, 1);
        setStk(n.length > 0 ? n : [{talla: 'UNICA', cantidad: 0}]);
    };

    const updateTalla = (index: number, field: 'talla' | 'cantidad', value: string) => {
        const n = [...stk];
        if (field === 'cantidad') {
            n[index][field] = parseInt(value) || 0;
        } else {
            n[index][field] = value.toUpperCase();
        }
        setStk(n);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (!nombre || !codigo || !categoria) throw new Error("Faltan campos obligatorios");

            // Hard check for EPP tripartite rules (NT-03-2016)
            if (categoria === 'EPP') {
                if (!validoSsst || !validoDelegados || !validoTrabajadores) {
                    throw new Error("ERROR NORMADO NT-03-2016: Todo EPP debe estar previamente validado de manera conjunta por el SSST, los Delegados(as) de Prevención y la representación de los trabajadores.");
                }
                if (!firmaSsstNombre.trim() || !firmaDelegadoNombre.trim()) {
                    throw new Error("ERROR NORMADO LOPCYMAT: El Acta de Selección Conjunta debe incluir los nombres legibles de los representantes firmantes.");
                }
            }
            
            const formData = {
                nombre,
                codigo,
                categoria,
                descripcion,
                fotoUrl,
                stock: stk.filter(s => s.talla.trim() !== ''),
                // Compliance attributes
                fabricante: categoria === 'EPP' ? fabricante : '',
                proveedor: categoria === 'EPP' ? proveedor : '',
                documentoEficacia: categoria === 'EPP' ? documentoEficacia : '',
                nivelProteccion: categoria === 'EPP' ? nivelProteccion : '',
                instruccionesUsoMantenimiento: categoria === 'EPP' ? instruccionesUsoMantenimiento : '',
                validoSsst: categoria === 'EPP' ? validoSsst : false,
                validoDelegados: categoria === 'EPP' ? validoDelegados : false,
                validoTrabajadores: categoria === 'EPP' ? validoTrabajadores : false,
                firmaSsstNombre: categoria === 'EPP' ? firmaSsstNombre : '',
                firmaDelegadoNombre: categoria === 'EPP' ? firmaDelegadoNombre : '',
                esFajaLumbar: categoria === 'EPP' ? esFajaLumbar : false
            };

            if (item) {
                await dbService.updateInventarioItem(item.id, formData);
                toast.success("Artículo actualizado en catálogo");
            } else {
                await dbService.addInventarioItem(formData);
                toast.success("Nuevo artículo registrado con éxito");
            }
            onSave();
        } catch (error: any) {
             toast.error(error.message || "Error al guardar");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold tracking-tight text-slate-800">
                            {item ? 'Editar Artículo' : 'Nuevo Artículo de Inventario'}
                        </h2>
                        <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full">
                            <XCircle size={24} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="md:col-span-2 flex flex-col items-center">
                            {fotoUrl ? (
                                <div className="w-32 h-32 rounded-xl border-2 border-slate-200 overflow-hidden relative group">
                                    <img src={fotoUrl} alt="Preview" className="w-full h-full object-cover" />
                                    <label className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                        <Camera size={24} />
                                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                                    </label>
                                </div>
                            ) : (
                                <label className="w-32 h-32 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-duncan-blue hover:text-duncan-blue transition-colors bg-slate-50">
                                    <Camera size={32} className="mb-2" />
                                    <span className="text-xs font-semibold">Subir Foto</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                                </label>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Nombre del equipo/prenda <span className="text-red-500">*</span></label>
                            <input 
                                required type="text" value={nombre} onChange={e=>handleNombreChange(e.target.value)}
                                className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-duncan-blue focus:ring-1 focus:ring-duncan-blue"
                                placeholder="Ej: BOTA DE SEGURIDAD DIELÉCTRICA"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Código / Referencia <span className="text-red-500">*</span></label>
                            <input 
                                required type="text" value={codigo} onChange={e=>setCodigo(e.target.value)}
                                className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-duncan-blue focus:ring-1 focus:ring-duncan-blue"
                                placeholder="Ej: BT-001"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-1">Categoría <span className="text-red-500">*</span></label>
                            <select 
                                value={categoria} onChange={e=>setCategoria(e.target.value as any)}
                                className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-duncan-blue focus:ring-1 focus:ring-duncan-blue bg-white font-semibold text-slate-800"
                            >
                                <option value="EPP">Equipo de Protección Personal (EPP)</option>
                                <option value="Uniforme">Uniforme / Ropa de Trabajo (LOTTT)</option>
                            </select>
                        </div>

                        {/* MARCO LEGAL BANNER DE CATEGORIZACIÓN */}
                        <div className="md:col-span-2">
                            {categoria === 'Uniforme' ? (
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800 flex items-start gap-2.5">
                                    <AlertCircle className="shrink-0 mt-0.5 text-blue-600" size={16} />
                                    <div>
                                        <p className="font-bold">Beneficio Social de Carácter No Remunerativo (Art. 105 LOTTT)</p>
                                        <p className="mt-0.5 text-blue-700/90 leading-normal">
                                            Las vestimentas y uniformes constituyen un beneficio social para el desempeño laboral y no forman parte del salario del trabajador. No eximen del análisis y mitigación de Procesos Peligrosos.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-xs text-purple-800 flex items-start gap-2.5">
                                    <AlertCircle className="shrink-0 mt-0.5 text-purple-600" size={16} />
                                    <div>
                                        <p className="font-bold">Obligación Estricta de Protección de la Salud y Vida (Art. 59-62 LOPCYMAT)</p>
                                        <p className="mt-0.5 text-purple-700/90 leading-normal">
                                            Los EPP son de suministro patronal gratuito y obligatorio cuando los riesgos no puedan eliminarse en el origen. Su selección requiere obligatoriamente validación conjunta tripartita.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* REGISTRO DE DETALLES TÉCNICOS SÓLO PARA EPP */}
                        {categoria === 'EPP' && (
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <h3 className="md:col-span-2 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1.5 flex items-center gap-1">
                                    <Package size={14} /> Ficha Técnica y Registro de Fabricación (Art. 62 LOPCYMAT)
                                </h3>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Fabricante / Marca <span className="text-red-500">*</span></label>
                                    <input 
                                        required={categoria === 'EPP'} type="text" value={fabricante} onChange={e=>setFabricante(e.target.value)}
                                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs outline-none focus:border-duncan-blue"
                                        placeholder="Ej: 3M, Caterpillar, etc."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Proveedor Autorizado <span className="text-red-500">*</span></label>
                                    <input 
                                        required={categoria === 'EPP'} type="text" value={proveedor} onChange={e=>setProveedor(e.target.value)}
                                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs outline-none focus:border-duncan-blue"
                                        placeholder="Distribuidor local..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Certificado de Eficacia / Norma <span className="text-red-500">*</span></label>
                                    <input 
                                        required={categoria === 'EPP'} type="text" value={documentoEficacia} onChange={e=>setDocumentoEficacia(e.target.value)}
                                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs outline-none focus:border-duncan-blue"
                                        placeholder="Ej: Normas COVENIN 2237 / ANSI Z87.1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Nivel de Protección <span className="text-red-500">*</span></label>
                                    <input 
                                        required={categoria === 'EPP'} type="text" value={nivelProteccion} onChange={e=>setNivelProteccion(e.target.value)}
                                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs outline-none focus:border-duncan-blue"
                                        placeholder="Ej: Dieléctrico 15kV / Clase 2 / Nivel 4"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Instrucciones de Uso, Inspección y Mantenimiento <span className="text-red-500">*</span></label>
                                    <textarea 
                                        required={categoria === 'EPP'} value={instruccionesUsoMantenimiento} onChange={e=>setInstruccionesUsoMantenimiento(e.target.value)}
                                        rows={2}
                                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs outline-none focus:border-duncan-blue resize-none"
                                        placeholder="Lavar con agua tibia y jabón neutro, inspeccionar grietas antes de cada uso..."
                                    />
                                </div>

                                {/* RESTRECCIÓN FAJA LUMBAR */}
                                <div className="md:col-span-2 border-t border-slate-200 pt-3">
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input 
                                            type="checkbox" checked={esFajaLumbar} onChange={e=>setEsFajaLumbar(e.target.checked)}
                                            className="rounded border-slate-300 text-red-600 focus:ring-red-500 w-4 h-4"
                                        />
                                        <span className="text-xs font-bold text-slate-800">¿Este artículo es un soporte lumbar, faja de fuerza o corrector postural?</span>
                                    </label>

                                    {esFajaLumbar && (
                                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-800 flex items-start gap-2.5 mt-2.5">
                                            <AlertCircle className="shrink-0 mt-0.5 text-red-600" size={16} />
                                            <div>
                                                <p className="font-bold uppercase text-red-700">⚠️ ADVERTENCIA SST: Restricción Absoluta de Fajas Lumbares (SST - INPSASEL)</p>
                                                <p className="mt-0.5 text-red-700/90 leading-normal font-medium">
                                                    Las ciencias de la ergonomía y las directrices técnicas del INPSASEL prohíben catalogar las fajas lumbares como Equipos de Protección Personal (EPP) generalizados. Su provisión masiva está restringida por generar daños y atrofia muscular secundaria. La aplicación obligará a adjuntar una justificación médica temporal provista por el SSST para poder asignarlo.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ACTA DE APROBACIÓN CONJUNTA OBLIGATORIA (NT-03-2016) */}
                        {categoria === 'EPP' && (
                            <div className="md:col-span-2 bg-purple-50/50 border border-purple-200/50 rounded-xl p-4">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-800 border-b border-purple-200 pb-2 mb-3 flex items-center gap-1.5">
                                    🛡️ Acta de Validación y Selección Conjunta (NT-03-2016)
                                </h3>
                                <p className="text-[11px] text-purple-700 mb-4 leading-normal leading-relaxed">
                                    Por mandato de la Norma Técnica NT-03-2016 (Servicios de Seguridad y Salud en el Trabajo), la selección de todo EPP debe realizarse con la participación del SSST, los Delegados de Prevención y la consulta activa a los trabajadores expuestos. Su registro no será autorizado si no cuenta con este aval tripartito.
                                </p>
                                
                                <div className="space-y-3.5">
                                    <label className="flex items-start gap-2.5 cursor-pointer">
                                        <input 
                                            required type="checkbox" checked={validoSsst} onChange={e=>setValidoSsst(e.target.checked)}
                                            className="rounded border-purple-300 text-purple-600 focus:ring-purple-500 w-4.5 h-4.5 mt-0.5"
                                        />
                                        <div className="text-xs leading-none">
                                            <p className="font-bold text-slate-800">Avalado y seleccionado por el SSST</p>
                                            <p className="text-[10px] text-slate-500 mt-0.5">El Servicio de SST ha verificado su atenuación física y niveles de protección requeridos.</p>
                                        </div>
                                    </label>

                                    <label className="flex items-start gap-2.5 cursor-pointer">
                                        <input 
                                            required type="checkbox" checked={validoDelegados} onChange={e=>setValidoDelegados(e.target.checked)}
                                            className="rounded border-purple-300 text-purple-600 focus:ring-purple-500 w-4.5 h-4.5 mt-0.5"
                                        />
                                        <div className="text-xs leading-none">
                                            <p className="font-bold text-slate-800">Aprobado por los Delegados(as) de Prevención</p>
                                            <p className="text-[10px] text-slate-500 mt-0.5">Co-validado colectivamente por la representación democrática de los trabajadores.</p>
                                        </div>
                                    </label>

                                    <label className="flex items-start gap-2.5 cursor-pointer">
                                        <input 
                                            required type="checkbox" checked={validoTrabajadores} onChange={e=>setValidoTrabajadores(e.target.checked)}
                                            className="rounded border-purple-300 text-purple-600 focus:ring-purple-500 w-4.5 h-4.5 mt-0.5"
                                        />
                                        <div className="text-xs leading-none">
                                            <p className="font-bold text-slate-800">Evaluado por los Trabajadores Expuestos</p>
                                            <p className="text-[10px] text-slate-500 mt-0.5">Se han realizado pruebas de confort, visibilidad y adecuación funcional con la masa obrera.</p>
                                        </div>
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 border-t border-purple-200/55 pt-3.5">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Representante SSST firmante <span className="text-purple-600">*</span></label>
                                        <input 
                                            required={categoria === 'EPP'} type="text" value={firmaSsstNombre} onChange={e=>setFirmaSsstNombre(e.target.value)}
                                            className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs outline-none focus:border-purple-500"
                                            placeholder="Ing. de Higiene / Médico Ocupacional..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Delegado(a) de Prevención firmante <span className="text-purple-600">*</span></label>
                                        <input 
                                            required={categoria === 'EPP'} type="text" value={firmaDelegadoNombre} onChange={e=>setFirmaDelegadoNombre(e.target.value)}
                                            className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs outline-none focus:border-purple-500"
                                            placeholder="Nombre del Delegado(a) electo..."
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-1">Descripción corta o comentarios</label>
                            <textarea 
                                value={descripcion} onChange={e=>setDescripcion(e.target.value)}
                                rows={2}
                                className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-duncan-blue focus:ring-1 focus:ring-duncan-blue resize-none"
                                placeholder="Características, material, especificaciones generales..."
                            />
                        </div>
                        
                        <div className="md:col-span-2 border-t border-slate-200 pt-6">
                            <div className="flex justify-between items-center mb-4">
                                <label className="block text-sm font-bold text-slate-800">Tallas y Existencias <span className="text-red-500">*</span></label>
                                <button type="button" onClick={addTalla} className="text-xs font-bold text-duncan-blue bg-blue-50 px-3 py-1.5 rounded hover:bg-blue-100 flex items-center gap-1">
                                    <Plus size={14} /> Talla/Variante
                                </button>
                            </div>
                            
                            <div className="space-y-3">
                                {stk.map((s, idx) => (
                                    <div key={idx} className="flex gap-4 items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                                        <div className="flex-1">
                                            <label className="block text-xs font-semibold text-slate-500 mb-1">Talla / Referencia</label>
                                            <input 
                                                required type="text" value={s.talla} onChange={e=>updateTalla(idx, 'talla', e.target.value)}
                                                className="w-full border border-slate-300 rounded p-1.5 text-sm uppercase outline-none focus:border-duncan-blue focus:ring-1 focus:ring-duncan-blue"
                                                placeholder="S, M, L, 42, UNICA..."
                                            />
                                        </div>
                                        <div className="w-24">
                                            <label className="block text-xs font-semibold text-slate-500 mb-1">Cantidad</label>
                                            <input 
                                                required type="number" min="0" value={s.cantidad} onChange={e=>updateTalla(idx, 'cantidad', e.target.value)}
                                                className="w-full border border-slate-300 rounded p-1.5 text-sm outline-none focus:border-duncan-blue focus:ring-1 focus:ring-duncan-blue"
                                            />
                                        </div>
                                        <button type="button" onClick={() => removeTalla(idx)} className="mt-5 text-red-400 hover:text-red-600 p-1">
                                            <XCircle size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    <div className="flex justify-end gap-3 border-t border-slate-200 pt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cerrar</button>
                        <button type="submit" disabled={saving} className="bg-duncan-blue text-white px-6 py-2 font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}


function ReportesDotacionTab() {
    const [solicitudes, setSolicitudes] = useState<SolicitudEPP[]>([]);
    const [inventario, setInventario] = useState<InventarioItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const [sol, inv] = await Promise.all([
                    dbService.getSolicitudesEPP(),
                    dbService.getInventario()
                ]);
                setSolicitudes(sol);
                setInventario(inv);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const { user } = useAuth();
    
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

    const handleExportCSV = () => {
        const rows = [
            ["ID ARTICULO", "NOMBRE", "CATEGORIA", "STOCK DISPONIBLE"],
        ];
        (inventario || []).forEach(inv => {
            const stockTotal = (inv?.stock || []).reduce((a, c) => a + (c?.cantidad || 0), 0);
            rows.push([
                inv.codigo,
                `"${inv.nombre}"`,
                inv.categoria,
                stockTotal.toString()
            ]);
        });
        
        let csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Inventario_Dotacion_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPDF = async (method: 'download' | 'whatsapp' | 'email') => {
        setExporting(true);
        try {
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'letter'
            });

            const pageWidth = 279.4;
            const pageHeight = 215.9;
            const marginX = 14;
            const contentWidth = pageWidth - marginX * 2;
            let currentY = 14;

            // HEADER SAP/ISO
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.5);
            doc.rect(marginX, currentY, contentWidth, 22);

            const col1W = contentWidth * 0.20;
            const col2W = contentWidth * 0.55;
            const col3W = contentWidth * 0.25;

            doc.line(marginX + col1W, currentY, marginX + col1W, currentY + 22);
            doc.line(marginX + col1W + col2W, currentY, marginX + col1W + col2W, currentY + 22);

            // Logo Oficial Duncan B&W
            try {
              const logoW = 32;
              const logoH = 11.3;
              doc.addImage(DUNCAN_LOGO_BW, 'PNG', marginX + (col1W - logoW) / 2, currentY + 2, logoW, logoH);
            } catch (e) {
              console.warn('Error insertando logo en Consolidado Dotacion', e);
            }
            doc.setTextColor(51, 65, 85);
            doc.setFontSize(6.5);
            doc.text('CONTROL DE DOTACIÓN Y EPP', marginX + col1W / 2, currentY + 17.5, { align: 'center' });

            const centerColX = marginX + col1W + col2W / 2;
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(9);
            doc.text('PROGRAMA DE SEGURIDAD Y SALUD EN EL TRABAJO', centerColX, currentY + 8, { align: 'center' });
            doc.setTextColor(0, 40, 85);
            doc.setFontSize(12);
            doc.text('REPORTE CONSOLIDADO DE INVENTARIO SST / E.P.P.', centerColX, currentY + 15.5, { align: 'center' });

            const col3X = marginX + col1W + col2W;
            doc.setLineWidth(0.25);
            doc.line(col3X, currentY + 7.3, col3X + col3W, currentY + 7.3);
            doc.line(col3X, currentY + 14.6, col3X + col3W, currentY + 14.6);

            doc.setTextColor(0, 0, 0);
            doc.setFontSize(7);
            doc.setFont('helvetica', 'bold');
            doc.text('CÓDIGO DOC:', col3X + 3, currentY + 5);
            doc.text('FECHA EMISIÓN:', col3X + 3, currentY + 12.2);
            doc.text('EMISOR:', col3X + 3, currentY + 19.5);

            doc.setFont('helvetica', 'normal');
            doc.text('SST-DOT-INV', col3X + 26, currentY + 5);
            doc.text(new Date().toLocaleDateString(), col3X + 26, currentY + 12.2);
            doc.text((user?.email || 'SISTEMA').substring(0, 24), col3X + 26, currentY + 19.5);

            currentY += 27;

            const entregadasList = (solicitudes || []).filter(s => s && s.estado === 'Recibida');
            const totalEntregadasCount = entregadasList.length;
            const itemsEntregadosCount = entregadasList.reduce((acc, curr) => acc + (curr?.items || []).reduce((a, c) => a + (c?.cantidad || 0), 0), 0);

            // SECCIÓN 1.0 RESUMEN EJECUTIVO
            doc.setFillColor(0, 75, 147);
            doc.rect(marginX, currentY, contentWidth, 6, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.text('1.0 RESUMEN EJECUTIVO DE MOVIMIENTOS DE DOTACIÓN', marginX + 3, currentY + 4.2);
            currentY += 6;

            autoTable(doc, {
                startY: currentY,
                margin: { left: marginX, right: marginX },
                tableWidth: contentWidth,
                theme: 'grid',
                styles: {
                    font: 'helvetica',
                    fontSize: 9,
                    cellPadding: 3,
                    halign: 'center',
                    lineColor: [0, 0, 0],
                    lineWidth: 0.25
                },
                headStyles: {
                    fillColor: [241, 245, 249],
                    textColor: [71, 85, 105],
                    fontStyle: 'bold',
                    fontSize: 7.5
                },
                head: [['SOLICITUDES PROCESADAS', 'SOLICITUDES ENTREGADAS', 'ARTÍCULOS SUMINISTRADOS']],
                body: [[
                    { content: String((solicitudes || []).length), styles: { fontStyle: 'bold', fontSize: 12, textColor: [0, 0, 0] } },
                    { content: String(totalEntregadasCount), styles: { fontStyle: 'bold', fontSize: 12, textColor: [22, 101, 52] } },
                    { content: String(itemsEntregadosCount), styles: { fontStyle: 'bold', fontSize: 12, textColor: [30, 64, 175] } }
                ]]
            });

            currentY = (doc as any).lastAutoTable.finalY + 6;

            // SECCIÓN 2.0 TABLA DE INVENTARIO
            doc.setFillColor(0, 75, 147);
            doc.rect(marginX, currentY, contentWidth, 6, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.text('2.0 DISPONIBILIDAD DE MATERIALES Y RECURSOS SST / E.P.P.', marginX + 3, currentY + 4.2);
            currentY += 6;

            const invRows = (inventario || []).map(inv => {
                const stockTotal = (inv?.stock || []).reduce((a, c) => a + (c?.cantidad || 0), 0);
                const tallasDetalle = (inv?.stock || []).map(s => `${s?.talla || ''}: ${s?.cantidad || 0}`).join(' | ');
                return [
                    inv.codigo || '—',
                    String(inv.nombre || '').toUpperCase(),
                    String(inv.categoria || '').toUpperCase(),
                    tallasDetalle || 'N/A',
                    String(stockTotal)
                ];
            });

            autoTable(doc, {
                startY: currentY,
                margin: { left: marginX, right: marginX },
                tableWidth: contentWidth,
                theme: 'grid',
                headStyles: {
                    fillColor: [226, 232, 240],
                    textColor: [0, 0, 0],
                    fontStyle: 'bold',
                    fontSize: 8,
                    lineColor: [0, 0, 0],
                    lineWidth: 0.25
                },
                styles: {
                    font: 'helvetica',
                    fontSize: 8,
                    cellPadding: 2.5,
                    textColor: [0, 0, 0],
                    lineColor: [0, 0, 0],
                    lineWidth: 0.25
                },
                columnStyles: {
                    0: { cellWidth: 32, fontStyle: 'bold' },
                    1: { cellWidth: 95 },
                    2: { cellWidth: 35, halign: 'center' },
                    3: { cellWidth: 64.4, fontSize: 7.5 },
                    4: { cellWidth: 25, halign: 'center', fontStyle: 'bold' }
                },
                head: [['CÓDIGO', 'DESCRIPCIÓN DEL ARTÍCULO / E.P.P.', 'CATEGORÍA', 'DESGLOSE POR TALLAS', 'STOCK TOTAL']],
                body: invRows
            });

            const footerY = pageHeight - 10;
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.3);
            doc.line(marginX, footerY - 3.5, pageWidth - marginX, footerY - 3.5);
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(6.5);
            doc.text('ERP AUDIT: SST-DOT-INV-2026', marginX, footerY);
            doc.text('DOCUMENTO GENERADO POR SISTEMA SGD-DUNCAN', pageWidth / 2, footerY, { align: 'center' });
            doc.text('GRUPO EMPRESARIAL DUNCAN', pageWidth - marginX, footerY, { align: 'right' });

            const fileName = `Reporte_Dotacion_${new Date().toISOString().split('T')[0]}.pdf`;
            const pdfData = doc.output('datauristring');
            doc.save(fileName);

            if (user && pdfData) {
                try {
                    await dbService.saveReportePDF({
                        tipo: 'Dotacion_Consolidado',
                        fecha: new Date().toISOString(),
                        nombre: fileName,
                        referencia: 'General',
                        pdfData,
                        userId: user.uid
                    });
                } catch (e) {
                    console.warn(e);
                }
            }

            if (method === 'download') {
                toast.success("Reporte PDF descargado y guardado en historial");
            } else if (method === 'whatsapp') {
                const text = encodeURIComponent(`Hola, te comparto el Reporte Consolidado de Dotación: ${fileName}.\n(El archivo se ha descargado a tu dispositivo, por favor adjúntelo a este chat).`);
                window.open(`https://wa.me/?text=${text}`, '_blank');
                toast.success("PDF generado y descargado. Abriendo WhatsApp...");
            } else if (method === 'email') {
                const subject = encodeURIComponent(`Reporte Consolidado de Dotación`);
                const body = encodeURIComponent(`Estimados,\n\nSe ha generado el Reporte Consolidado de Dotación EPP.\n\n📄 Archivo: ${fileName}\n\n(Nota para el emisor: El archivo PDF correspondiente se ha guardado en su carpeta de descargas del equipo, por favor adjúntelo antes de enviar).\n\nAtentamente,\nControl de Dotación.`);
                window.location.href = `mailto:?subject=${subject}&body=${body}`;
                toast.success("PDF generado y descargado. Abriendo correo...");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error al generar reporte PDF");
        } finally {
            setExporting(false);
        }
    };

    if (loading) return <div className="p-8 text-center"><div className="w-8 h-8 border-4 border-duncan-blue border-t-transparent rounded-full animate-spin mx-auto"/></div>;

    const entregadas = (solicitudes || []).filter(s => s && s.estado === 'Recibida');
    const totalEntregadas = entregadas.length;
    const itemsEntregados = entregadas.reduce((acc, curr) => acc + (curr?.items || []).reduce((a, c) => a + (c?.cantidad || 0), 0), 0);

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Reportes de Dotación (Inventario / EPP)</h2>
                    <p className="text-sm text-slate-500">Consolidado de movimientos y consumo</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={handleExportCSV}
                        className="bg-blue-50 text-duncan-blue px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors flex items-center gap-2 border border-blue-200"
                    >
                        <Download size={16} /> Excel / CSV
                    </button>
                    <button
                        onClick={() => handleExportPDF('download')}
                        disabled={exporting}
                        className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {exporting ? <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /> : <Download size={16} />}
                        PDF
                    </button>
                    <button
                        onClick={() => handleExportPDF('whatsapp')}
                        disabled={exporting}
                        className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-200 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {exporting ? <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" /> : <MessageCircle size={16} />}
                        WhatsApp
                    </button>
                    <button
                        onClick={() => handleExportPDF('email')}
                        disabled={exporting}
                        className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-200 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {exporting ? <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" /> : <Mail size={16} />}
                        Email
                    </button>
                </div>
            </div>

            {/* VISTA EN PANTALLA (No PDF) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-6">
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl text-center">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Solicitudes Procesadas</p>
                    <p className="text-3xl font-black text-duncan-blue">{solicitudes.length}</p>
                </div>
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl text-center">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Solicitudes Entregadas</p>
                    <p className="text-3xl font-black text-green-600">{totalEntregadas}</p>
                </div>
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl text-center">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Artículos Entregados</p>
                    <p className="text-3xl font-black text-duncan-blue">{itemsEntregados}</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                <div className="p-4 md:p-6 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800">Stock de Inventario Principal</h3>
                </div>
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-xs tracking-wider text-slate-500 font-bold uppercase">Código</th>
                                <th className="px-6 py-4 text-xs tracking-wider text-slate-500 font-bold uppercase">Artículo</th>
                                <th className="px-6 py-4 text-xs tracking-wider text-slate-500 font-bold uppercase">Categoría</th>
                                <th className="px-6 py-4 text-xs tracking-wider text-slate-500 font-bold uppercase text-right">Stock Disponible</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(inventario || []).map(inv => {
                                const stockTotal = (inv?.stock || []).reduce((a, c) => a + (c?.cantidad || 0), 0);
                                return (
                                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-slate-500">{inv.codigo}</td>
                                        <td className="px-6 py-4 font-semibold text-slate-800">
                                            <div className="flex items-center gap-2">
                                                {inv.nombre}
                                                {stockTotal <= 5 && (
                                                    <span className="bg-red-100 text-red-600 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">
                                                        Bajo Stock
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider">
                                                {inv.categoria}
                                            </span>
                                        </td>
                                        <td className={cn("px-6 py-4 text-right font-black", stockTotal <= 5 ? "text-red-600" : "text-slate-700")}>{stockTotal}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View */}
                <div className="md:hidden flex flex-col divide-y divide-slate-100">
                    {(inventario || []).map(inv => {
                        const stockTotal = (inv?.stock || []).reduce((a, c) => a + (c?.cantidad || 0), 0);
                        return (
                            <div key={inv.id} className="p-4 hover:bg-slate-50 flex flex-col gap-2">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="text-xs font-mono text-slate-400 mb-1">{inv.codigo}</div>
                                        <div className="font-bold text-slate-800 flex items-center gap-2">
                                            {inv.nombre}
                                            {stockTotal <= 5 && (
                                                <span className="bg-red-100 text-red-600 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                    Bajo Stock
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={cn("text-xl font-black", stockTotal <= 5 ? "text-red-600" : "text-duncan-blue")}>{stockTotal}</div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unidades</div>
                                    </div>
                                </div>
                                <div>
                                    <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider">
                                        {inv.categoria}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
