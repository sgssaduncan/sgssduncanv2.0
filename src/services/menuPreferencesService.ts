// =========================================================================
// SGD DUNCAN 2.0 — SERVICIO DE PREFERENCIAS Y PERSONALIZACIÓN DE MENÚS
// Permite a cada usuario ordenar, priorizar, ocultar y configurar sus accesos
// rápidos tanto en la barra inferior móvil como en el menú lateral de escritorio.
// =========================================================================

export interface MenuPreferences {
  // Lista ordenada de rutas ('/inspecciones', '/criterios', etc.)
  itemOrder: string[];
  // Rutas marcadas como favoritas (aparecen arriba en la sección rápida)
  favorites: string[];
  // Rutas ocultas por el usuario para simplificar su interfaz
  hiddenItems: string[];
  // Exactamente 4 rutas para la barra de navegación inferior en móviles
  bottomTabRoutes: string[];
}

export const DEFAULT_BOTTOM_TABS = [
  '/',
  '/inspecciones',
  '/criterios',
  '/plan-accion'
];

export const DEFAULT_FAVORITES = [
  '/inspecciones',
  '/criterios',
  '/plan-accion'
];

export const ALL_MENU_ROUTES = [
  '/',
  '/inspecciones',
  '/criterios',
  '/plan-accion',
  '/transporte',
  '/loto',
  '/permisos',
  '/carga-fuego',
  '/trabajadores',
  '/dotacion',
  '/medico',
  '/accidentes',
  '/formacion',
  '/comites',
  '/consolidador',
  '/reportes',
  '/auditoria',
  '/usuarios',
  '/ajustes'
];

const PREF_KEY_PREFIX = 'sgd_menu_preferences_';

export const menuPreferencesService = {
  getPreferences(userId?: string): MenuPreferences {
    const key = `${PREF_KEY_PREFIX}${userId || 'default'}`;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') {
            return {
              itemOrder: Array.isArray(parsed.itemOrder) && parsed.itemOrder.length > 0 ? parsed.itemOrder : ALL_MENU_ROUTES,
              favorites: Array.isArray(parsed.favorites) ? parsed.favorites : DEFAULT_FAVORITES,
              hiddenItems: Array.isArray(parsed.hiddenItems) ? parsed.hiddenItems : [],
              bottomTabRoutes: Array.isArray(parsed.bottomTabRoutes) && parsed.bottomTabRoutes.length === 4 ? parsed.bottomTabRoutes : DEFAULT_BOTTOM_TABS
            };
          }
        }
      } catch (e) {
        console.warn('Error reading menu preferences:', e);
      }
    }

    return {
      itemOrder: [...ALL_MENU_ROUTES],
      favorites: [...DEFAULT_FAVORITES],
      hiddenItems: [],
      bottomTabRoutes: [...DEFAULT_BOTTOM_TABS]
    };
  },

  savePreferences(userId: string | undefined, prefs: MenuPreferences): void {
    const key = `${PREF_KEY_PREFIX}${userId || 'default'}`;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(prefs));
        window.dispatchEvent(new CustomEvent('sgd_menu_prefs_updated', { detail: prefs }));
      } catch (e) {
        console.warn('Error saving menu preferences:', e);
      }
    }
  },

  resetPreferences(userId?: string): MenuPreferences {
    const defaultPrefs: MenuPreferences = {
      itemOrder: [...ALL_MENU_ROUTES],
      favorites: [...DEFAULT_FAVORITES],
      hiddenItems: [],
      bottomTabRoutes: [...DEFAULT_BOTTOM_TABS]
    };
    this.savePreferences(userId, defaultPrefs);
    return defaultPrefs;
  }
};
