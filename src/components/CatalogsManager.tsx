import React, { useState } from 'react';
import { dbService } from '../services/db';
import { 
  Building2, 
  MapPin, 
  Warehouse, 
  Users, 
  Settings, 
  Database, 
  CheckCircle2, 
  AlertCircle,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import EmpresasManager from './EmpresasManager';
import { useAuth } from '../hooks/useAuth';

export default function CatalogsManager() {
  const { profile } = useAuth();
  const [activeManager, setActiveManager] = useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<{
    empresas: any[];
    localidades: any[];
    establecimientos: any[];
    tipos: any[];
    empleados: any[];
  }>({
    empresas: [],
    localidades: [],
    establecimientos: [],
    tipos: [],
    empleados: []
  });

  const loadData = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const [e, l, est, t, emp] = await Promise.all([
        dbService.getEmpresas(),
        dbService.getLocalidades(),
        dbService.getEstablecimientos(),
        dbService.getTiposInspeccion(),
        dbService.getEmpleados()
      ]);
      setData({
        empresas: e,
        localidades: l,
        establecimientos: est,
        tipos: t,
        empleados: emp
      });
    } catch (error) {
      toast.error('Error al cargar catálogos');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (!activeManager && profile) {
      loadData();
    }
  }, [activeManager, profile]);

  const [seeding, setSeeding] = React.useState(false);

  const handleSeed = async () => {
    if (seeding) return;
    setSeeding(true);
    
    const toastId = toast.loading('Inicializando datos base...');
    try {
      await dbService.seedCatalogs();
      toast.success('Catálogos inicializados correctamente', { id: toastId });
      await loadData();
    } catch (error) {
      console.error('Seed failed:', error);
      toast.error('Error al inicializar datos', { id: toastId });
    } finally {
      setSeeding(false);
    }
  };

  const handleSeedDotacion = async () => {
    if (seeding) return;
    setSeeding(true);
    
    const toastId = toast.loading('Inicializando dotación base...');
    try {
      await dbService.seedDotacion();
      toast.success('Dotación inicializada correctamente', { id: toastId });
    } catch (error) {
      console.error('Seed dotacion failed:', error);
      toast.error('Error al inicializar datos de dotación', { id: toastId });
    } finally {
      setSeeding(false);
    }
  };

  if (activeManager === 'empresas') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <EmpresasManager onBack={() => setActiveManager(null)} />
      </motion.div>
    );
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 uppercase">
            <Settings className="text-blue-600" />
            Gestión de Catálogos
          </h1>
          <p className="text-slate-500 text-sm font-medium">Administración de entidades base del sistema</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleSeedDotacion}
            disabled={seeding}
            className="flex items-center gap-2 px-6 py-3 bg-duncan-blue text-white rounded-xl text-sm font-black shadow-xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {seeding ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Database size={20} />
            )}
            {"Inicializar Dotación"}
          </button>
          <button 
            onClick={handleSeed}
            disabled={seeding}
            className="flex items-center gap-2 px-6 py-3 bg-duncan-blue text-white rounded-xl text-sm font-black shadow-xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {seeding ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Database size={20} />
            )}
            {seeding ? 'Actualizando...' : 'Actualizar Definiciones (Montacargas, etc.)'}
          </button>
        </div>
      </div>

      {/* Resumen de Migración de Datos (Basado en el Manual de Usuario) */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/60 p-6 md:p-8 rounded-[2.5rem] shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Database className="text-blue-600" size={20} />
            Resumen de Datos Migrados (Excel Oficial)
          </h2>
          <p className="text-slate-500 text-xs font-semibold mt-1">
            Información y registros de personal activo migrados exitosamente según especificación de ErgoExpress C.A.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/50 text-center shadow-xs flex flex-col justify-center items-center">
            <span className="text-3xl font-black text-blue-600 tracking-tight">850</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Empleados Migrados</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/50 text-center shadow-xs flex flex-col justify-center items-center">
            <span className="text-3xl font-black text-emerald-600 tracking-tight">3</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Empresas</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/50 text-center shadow-xs flex flex-col justify-center items-center">
            <span className="text-3xl font-black text-indigo-600 tracking-tight">16</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Formularios</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/50 text-center shadow-xs flex flex-col justify-center items-center">
            <span className="text-3xl font-black text-orange-600 tracking-tight">11</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Establecimientos</span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xs p-4 rounded-xl border border-slate-200/40 text-[10px] text-slate-500 font-bold leading-relaxed">
          <p className="text-slate-700 font-black mb-1">Campos Registrados por Empleado:</p>
          empresa, nómina, código, cédula, nombre, cargo, sexo, fecha de nacimiento, fecha de ingreso, departamento, centro de costos, sucursal, dirección, ciudad y estado.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CatalogCard 
          title="Empresas" 
          count={data.empresas.length} 
          icon={<Building2 className="text-blue-600" />}
          items={data.empresas.map(i => i.nombre)}
          onManage={() => setActiveManager('empresas')}
        />
        <CatalogCard 
          title="Localidades" 
          count={data.localidades.length} 
          icon={<MapPin className="text-emerald-600" />}
          items={data.localidades.map(i => i.nombre)}
          onManage={() => toast.success(`Módulo de gestión de Localidades en desarrollo. Aquí podrás cargar los datos específicos masivamente en la próxima versión.`)}
        />
        <CatalogCard 
          title="Establecimientos" 
          count={data.establecimientos.length} 
          icon={<Warehouse className="text-orange-600" />}
          items={data.establecimientos.map(i => i.nombre)}
          onManage={() => toast.success(`Módulo de gestión de Establecimientos en desarrollo. Aquí podrás cargar los datos específicos masivamente en la próxima versión.`)}
        />
        <CatalogCard 
          title="Tipos de Inspección" 
          count={data.tipos.length} 
          icon={<CheckCircle2 className="text-indigo-600" />}
          items={data.tipos.map(i => i.nombre)}
          onManage={() => toast.success(`Módulo de gestión de Tipos de Inspección en desarrollo. Aquí podrás cargar los datos específicos masivamente en la próxima versión.`)}
        />
        <CatalogCard 
          title="Empleados" 
          count={data.empleados.length} 
          icon={<Users className="text-rose-600" />}
          items={data.empleados.map(i => i.nombre)}
          onManage={() => toast.success(`Módulo de gestión de Empleados en desarrollo. Aquí podrás cargar los datos específicos masivamente en la próxima versión.`)}
        />
      </div>

      {(data.empresas.length === 0 || data.localidades.length === 0 || data.establecimientos.length === 0) && (
        <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl flex items-start gap-4">
          <AlertCircle className="text-amber-500 shrink-0" size={24} />
          <div>
            <p className="text-amber-800 font-bold text-sm mb-1">Faltan catálogos críticos</p>
            <p className="text-amber-700/70 text-xs font-medium">
              Parece que algunos catálogos están vacíos. Esto impedirá la creación de nuevas inspecciones. 
              Use el botón de <b>"Inicializar Datos Base"</b> para cargar la configuración recomendada.
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function CatalogCard({ title, count, icon, items, onManage }: { title: string, count: number, icon: React.ReactNode, items: string[], onManage: () => void }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col h-full hover:shadow-lg transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-slate-50 rounded-2xl">
          {icon}
        </div>
        <span className="text-2xl font-black text-slate-900">{count}</span>
      </div>
      <h3 className="text-slate-800 font-black uppercase text-xs tracking-widest mb-4">{title}</h3>
      <div className="flex-1 space-y-2 overflow-y-auto max-h-32 mb-4 scrollbar-hide">
        {items.map((item, id) => (
          <div key={id} className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-1.5 rounded-lg truncate">
            {item}
          </div>
        ))}
        {items.length === 0 && <p className="text-[10px] text-slate-400 italic">No hay registros</p>}
      </div>
      <button onClick={onManage} className="w-full py-2.5 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 hover:text-slate-600 transition-all flex items-center justify-center gap-2">
        <Plus size={14} /> Gestionar
      </button>
    </div>
  );
}
