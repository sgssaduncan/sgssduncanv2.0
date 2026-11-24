import React, { useState } from 'react';
import {
  X,
  SlidersHorizontal,
  Smartphone,
  LayoutGrid,
  Star,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Check,
  Save,
  Sparkles,
  Info
} from 'lucide-react';
import {
  menuPreferencesService,
  MenuPreferences,
  DEFAULT_BOTTOM_TABS,
  ALL_MENU_ROUTES
} from '../services/menuPreferencesService';
import toast from 'react-hot-toast';

interface ItemMeta {
  to: string;
  label: string;
  icon: any;
  color?: string;
  description?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  allItems: ItemMeta[];
}

export default function MenuCustomizerModal({ isOpen, onClose, userId, allItems }: Props) {
  const [activeTab, setActiveTab] = useState<'bottom_bar' | 'order_favorites'>('bottom_bar');
  const [prefs, setPrefs] = useState<MenuPreferences>(() => menuPreferencesService.getPreferences(userId));

  if (!isOpen) return null;

  // Mapa rápido de ruta a metadata
  const itemMap = new Map<string, ItemMeta>();
  allItems.forEach(it => itemMap.set(it.to, it));

  // Manejo de selección de barra inferior (exactamente 4)
  const toggleBottomTab = (route: string) => {
    if (prefs.bottomTabRoutes.includes(route)) {
      if (prefs.bottomTabRoutes.length <= 1) {
        toast.error('Debes mantener al menos 1 acceso directo');
        return;
      }
      setPrefs({
        ...prefs,
        bottomTabRoutes: prefs.bottomTabRoutes.filter(r => r !== route)
      });
    } else {
      if (prefs.bottomTabRoutes.length >= 4) {
        toast('Has alcanzado el límite de 4 accesos rápidos inferiores. Desmarca uno para agregar este.', { icon: 'ℹ️' });
        return;
      }
      setPrefs({
        ...prefs,
        bottomTabRoutes: [...prefs.bottomTabRoutes, route]
      });
    }
  };

  // Manejo de favoritos
  const toggleFavorite = (route: string) => {
    if (prefs.favorites.includes(route)) {
      setPrefs({
        ...prefs,
        favorites: prefs.favorites.filter(r => r !== route)
      });
    } else {
      setPrefs({
        ...prefs,
        favorites: [...prefs.favorites, route]
      });
    }
  };

  // Manejo de visibilidad (ocultar/mostrar)
  const toggleVisibility = (route: string) => {
    if (prefs.hiddenItems.includes(route)) {
      setPrefs({
        ...prefs,
        hiddenItems: prefs.hiddenItems.filter(r => r !== route)
      });
    } else {
      if (route === '/') {
        toast.error('El inicio no puede ocultarse');
        return;
      }
      setPrefs({
        ...prefs,
        hiddenItems: [...prefs.hiddenItems, route]
      });
    }
  };

  // Mover elemento en el orden
  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...prefs.itemOrder];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newOrder.length) return;

    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIdx];
    newOrder[targetIdx] = temp;

    setPrefs({
      ...prefs,
      itemOrder: newOrder
    });
  };

  const handleSave = () => {
    if (prefs.bottomTabRoutes.length !== 4) {
      toast.error('Por favor selecciona exactamente 4 accesos para la barra móvil');
      return;
    }
    menuPreferencesService.savePreferences(userId, prefs);
    toast.success('¡Preferencias de menú guardadas!');
    onClose();
  };

  const handleReset = () => {
    if (!confirm('¿Restablecer el orden y accesos de los menús a los valores predeterminados?')) return;
    const reset = menuPreferencesService.resetPreferences(userId);
    setPrefs(reset);
    toast.success('Menús restablecidos al orden estándar');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Cabecera del Modal */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-yellow-400/20 text-yellow-700 rounded-2xl">
              <SlidersHorizontal size={22} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <span>Personalizar Menús y Accesos Rápidos</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Configura el orden y tus herramientas favoritas a tu gusto en móvil y escritorio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Pestañas de configuración */}
        <div className="flex border-b border-slate-200 bg-white px-4 pt-2 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('bottom_bar')}
            className={`pb-3 px-4 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'bottom_bar'
                ? 'border-yellow-500 text-slate-950 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Smartphone size={16} />
            <span>Barra Inferior Móvil ({prefs.bottomTabRoutes.length}/4)</span>
          </button>

          <button
            onClick={() => setActiveTab('order_favorites')}
            className={`pb-3 px-4 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'order_favorites'
                ? 'border-yellow-500 text-slate-950 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <LayoutGrid size={16} />
            <span>Orden y Favoritos ⭐</span>
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* TAB 1: ACCESOS DE LA BARRA INFERIOR MÓVIL */}
          {activeTab === 'bottom_bar' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3">
                <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900 leading-relaxed font-medium">
                  <strong>Elige exactamente 4 accesos directos</strong> que estarán fijos en la parte inferior de la pantalla en tu teléfono (el 5to botón será siempre el menú <strong>Más</strong>).
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {allItems.map(it => {
                  const Icon = it.icon;
                  const isSelected = prefs.bottomTabRoutes.includes(it.to);
                  const selectedIndex = prefs.bottomTabRoutes.indexOf(it.to);

                  return (
                    <div
                      key={it.to}
                      onClick={() => toggleBottomTab(it.to)}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between group touch-active relative ${
                        isSelected
                          ? 'border-yellow-400 bg-yellow-50/60 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${it.color || 'bg-slate-700'}`}>
                          <Icon size={18} />
                        </div>
                        {isSelected ? (
                          <span className="w-6 h-6 rounded-full bg-yellow-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
                            {selectedIndex + 1}
                          </span>
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-slate-300 group-hover:border-slate-400" />
                        )}
                      </div>
                      <div>
                        <p className={`text-xs font-bold truncate ${isSelected ? 'text-slate-950' : 'text-slate-800'}`}>
                          {it.label}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {it.description || it.to}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: ORDEN Y FAVORITOS */}
          {activeTab === 'order_favorites' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                <Star size={18} className="text-amber-600 shrink-0 mt-0.5 fill-amber-500" />
                <div className="text-xs text-amber-900 leading-relaxed font-medium">
                  Marca con <strong>estrella ⭐</strong> los módulos que más utilizas para que aparezcan arriba de todo en <strong>Accesos Rápidos</strong>. Usa las flechas <strong>▲ / ▼</strong> para ajustar el orden en el menú lateral.
                </div>
              </div>

              <div className="space-y-1.5">
                {prefs.itemOrder.map((route, idx) => {
                  const it = itemMap.get(route);
                  if (!it) return null;
                  const Icon = it.icon;
                  const isFav = prefs.favorites.includes(route);
                  const isHidden = prefs.hiddenItems.includes(route);

                  return (
                    <div
                      key={route}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                        isHidden
                          ? 'bg-slate-50 border-slate-200 opacity-60'
                          : isFav
                          ? 'bg-amber-50/40 border-amber-200'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 ${it.color || 'bg-slate-700'}`}>
                          <Icon size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-bold truncate ${isHidden ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                            {it.label}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {it.description || route}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Botón Favorito ⭐ */}
                        <button
                          type="button"
                          onClick={() => toggleFavorite(route)}
                          className={`p-2 rounded-xl transition-colors cursor-pointer ${
                            isFav
                              ? 'text-amber-500 bg-amber-100/70 hover:bg-amber-200'
                              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                          }`}
                          title={isFav ? 'Quitar de favoritos' : 'Fijar como favorito prioritario'}
                        >
                          <Star size={16} className={isFav ? 'fill-amber-400' : ''} />
                        </button>

                        {/* Botón Ocultar / Mostrar 👁️ */}
                        <button
                          type="button"
                          onClick={() => toggleVisibility(route)}
                          disabled={route === '/'}
                          className={`p-2 rounded-xl transition-colors cursor-pointer disabled:opacity-30 ${
                            isHidden
                              ? 'text-rose-500 bg-rose-50 hover:bg-rose-100'
                              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                          }`}
                          title={isHidden ? 'Mostrar en menú' : 'Ocultar del menú'}
                        >
                          {isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>

                        {/* Botones de Orden ▲ / ▼ */}
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveItem(idx, 'up')}
                          className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg disabled:opacity-20 cursor-pointer"
                          title="Subir posición"
                        >
                          <ArrowUp size={15} />
                        </button>
                        <button
                          type="button"
                          disabled={idx === prefs.itemOrder.length - 1}
                          onClick={() => moveItem(idx, 'down')}
                          className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg disabled:opacity-20 cursor-pointer"
                          title="Bajar posición"
                        >
                          <ArrowDown size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer del Modal con Acciones */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Restablecer</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-yellow-400/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Save size={15} />
              <span>Guardar Menú</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
