import {
  CRITERIOS_DISTRIBUIDORAS_OFICIALES,
  CRITERIOS_SERVICENTROS_OFICIALES,
  LISTAS_MAESTRAS_SGD,
  CriterioEvaluacion
} from '../data/criteriosOficialesData';
import { criteriosService } from '../services/criteriosService';

function buildSectionsFromCriteria(criteria: CriterioEvaluacion[]): FormSection[] {
  const sectionsMap = new Map<number, { title: string; items: FormItem[] }>();

  criteria.forEach(c => {
    if (!sectionsMap.has(c.conjunto)) {
      sectionsMap.set(c.conjunto, {
        title: `${c.conjunto}. ${c.aspecto}`,
        items: []
      });
    }
    const sec = sectionsMap.get(c.conjunto)!;
    // Identificador canónico único oficial en SGD: `${c.conjunto}.${c.num}` (ej: "1.1", "1.2", "2.1")
    const canonicalId = `${c.conjunto}.${c.num}`;
    sec.items.push({
      id: canonicalId,
      label: c.preguntaResumida || c.pregunta,
      responseType: "C_NC_OM_NA",
      preguntaOriginal: c.pregunta,
      aspectoLegal: c.aspectoLegal,
      grupoPilar: c.grupoPilar,
      areaResponsable: c.areaResponsable,
      aspecto: c.aspecto,
      itemIndex: c.item,
      num: c.num,
      conjunto: c.conjunto
    });
  });

  return Array.from(sectionsMap.entries()).map(([conjunto, sec]) => ({
    id: `conjunto_${conjunto}`,
    title: sec.title,
    items: sec.items,
    hasObservations: true
  }));
}

/**
 * SGD Duncan - Definiciones de Formularios de Inspección
 * 
 * Cada tipo de inspección tiene una configuración que define:
 * - Secciones/grupos de preguntas
 * - Tipo de respuesta por item
 * - Campos adicionales específicos
 * - Reglas de calificación
 */

export type ResponseType = "C_NC_OM_NA" | "BUENO_DANADO_NA" | "SI_NO" | "SI_NO_NA" | "OPERATIVO_NO" | "SELECT" | "TEXT" | "DATE" | "NUMBER";

export interface FormItem {
  id: string;
  label: string;
  responseType: ResponseType;
  options?: string[];  // For SELECT type
  required?: boolean;
  placeholder?: string;
  preguntaOriginal?: string;
  aspectoLegal?: string;
  grupoPilar?: 'INFRA' | 'LEGAL' | 'SSA' | 'VEHCP' | string;
  areaResponsable?: string;
  aspecto?: string;
  itemIndex?: number;
  num?: string;
  conjunto?: number;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  items: FormItem[];
  hasObservations?: boolean;  // If section has an observations field
}

export interface AdditionalField {
  id: string;
  label: string;
  type: "text" | "select" | "date" | "number";
  options?: string[];
  required?: boolean;
  placeholder?: string;
}

export interface InspectionFormDef {
  code: string;
  name: string;
  description: string;
  additionalFields?: AdditionalField[];  // Extra fields beyond standard ones
  sections: FormSection[];
  scoring: {
    type: "percentage" | "operatividad" | "si_no_count" | "none";
    conformeThreshold?: number;  // % for C
    omThreshold?: number;       // % for OM
  };
  signatureFields?: string[];  // e.g. ["Elaborado por", "Revisado por"]
}

// ============================================================
// EXTINTORES (EXT)
// ============================================================
export const EXT_FORM: InspectionFormDef = {
  code: "EXT",
  name: "Inspección de Extintores",
  description: "Evaluación del estado y operatividad de extintores portátiles",
  additionalFields: [
    { id: "ubicacion", label: "Ubicación", type: "text", required: true, placeholder: "Ubicación del extintor" },
    { id: "agenteExtinguidor", label: "Agente Extinguidor", type: "select", options: LISTAS_MAESTRAS_SGD.agentesExtinguidores, required: true },
    { id: "capacidad", label: "Capacidad", type: "select", options: LISTAS_MAESTRAS_SGD.capacidadesExtintores, required: true },
    { id: "fechaVencimiento", label: "Fecha de Vencimiento", type: "date", required: true },
    { id: "accionRequerida", label: "Acción Requerida", type: "select", options: LISTAS_MAESTRAS_SGD.accionesRequeridas },
  ],
  sections: [
    {
      id: "estado_componentes",
      title: "Estado de Componentes",
      description: "Evalúe el estado de cada componente del extintor",
      items: [
        { id: "soporte", label: "Soporte", responseType: "BUENO_DANADO_NA" },
        { id: "senalizacion", label: "Señalización", responseType: "BUENO_DANADO_NA" },
        { id: "pintura", label: "Pintura", responseType: "BUENO_DANADO_NA" },
        { id: "precinto", label: "Precinto de Seguridad", responseType: "BUENO_DANADO_NA" },
        { id: "manguera", label: "Manguera", responseType: "BUENO_DANADO_NA" },
        { id: "valvula", label: "Válvula", responseType: "BUENO_DANADO_NA" },
        { id: "pasador", label: "Pasador", responseType: "BUENO_DANADO_NA" },
        { id: "boquilla", label: "Boquilla", responseType: "BUENO_DANADO_NA" },
        { id: "etiqueta", label: "Etiqueta de Recarga", responseType: "BUENO_DANADO_NA" },
      ],
      hasObservations: false,
    },
    {
      id: "resultado_extintor",
      title: "Resultado",
      items: [
        { id: "operatividad", label: "Operatividad", responseType: "OPERATIVO_NO" },
        { id: "accionRequerida", label: "Acción Requerida", responseType: "SELECT", options: ["Ninguna", "Recargar", "Reparar", "Sustituir", "No Aplica"] },
      ],
      hasObservations: true,
    },
  ],
  scoring: { type: "operatividad" },
  signatureFields: ["Elaborado por", "Revisado por"],
};

// ============================================================
// SSA DISTRIBUIDORAS (DD / DIST) — 173 Criterios Oficiales
// ============================================================
export const DD_FORM: InspectionFormDef = {
  code: "DD",
  name: "Inspección SSA Distribuidoras",
  description: "Inspección Integral de Seguridad, Salud y Ambiente para Distribuidoras Duncan (173 Criterios Oficiales)",
  additionalFields: [
    { id: "ronda", label: "Ronda N°", type: "number", required: true },
    { id: "fechaCierre", label: "Fecha de Cierre", type: "date" },
  ],
  sections: buildSectionsFromCriteria(CRITERIOS_DISTRIBUIDORAS_OFICIALES),
  scoring: {
    type: "percentage",
    conformeThreshold: 80,
    omThreshold: 70,
  },
  signatureFields: ["Inspector SSA", "Gerente de Distribuidora", "Delegado de Prevención"],
};

// ============================================================
// ORDEN Y LIMPIEZA (OL)
// ============================================================
export const OL_FORM: InspectionFormDef = {
  code: "OL",
  name: "Inspección de Orden y Limpieza",
  description: "Evaluación del orden y limpieza en instalaciones del Grupo Duncan",
  additionalFields: [
    { id: "ubicacion", label: "Ubicación", type: "text", required: true },
    { id: "lugarInspeccionar", label: "Lugar a Inspeccionar", type: "select", options: ["Distribuidora", "Servicentro", "Oficina", "Almacén", "Taller", "Otro"], required: true },
  ],
  sections: [
    {
      id: "area_general",
      title: "Área General",
      items: [
        { id: "ol.1", label: "¿El área se encuentra ordenada?", responseType: "SI_NO" },
        { id: "ol.2", label: "¿Las herramientas y equipos están en su lugar correspondiente?", responseType: "SI_NO" },
        { id: "ol.3", label: "¿Se ha realizado limpieza general?", responseType: "SI_NO" },
        { id: "ol.4", label: "¿Las estopas usadas y desechos con ácido son colocados en el contenedor de materiales misceláneos?", responseType: "SI_NO" },
        { id: "ol.5", label: "¿Se encuentra ordenado el cableado de los equipos?", responseType: "SI_NO" },
        { id: "ol.6", label: "¿Los cargadores están ubicados en el sitio correcto?", responseType: "SI_NO" },
      ],
      hasObservations: false,
    },
    {
      id: "area_carga",
      title: "Área de Carga / Baterías",
      items: [
        { id: "ol.7", label: "¿El área de carga está libre de filtraciones, humedad y botes de agua?", responseType: "SI_NO" },
        { id: "ol.8", label: "¿El área está libre de objetos ajenos o que no le pertenecen?", responseType: "SI_NO" },
        { id: "ol.9", label: "¿El almacén está libre de objetos ajenos o que no le pertenecen?", responseType: "SI_NO" },
        { id: "ol.10", label: "¿Las baterías están apiladas o distribuidas correctamente?", responseType: "SI_NO" },
        { id: "ol.11", label: "¿La cantidad de baterías inservibles está dentro del límite permitido?", responseType: "SI_NO" },
      ],
      hasObservations: false,
    },
    {
      id: "banos",
      title: "Baños",
      items: [
        { id: "ol.12", label: "¿Se encuentran aseados?", responseType: "SI_NO" },
        { id: "ol.13", label: "¿Cuenta con iluminación?", responseType: "SI_NO" },
        { id: "ol.14", label: "¿Las llaves del lavamanos se encuentran en óptimas condiciones?", responseType: "SI_NO" },
        { id: "ol.15", label: "¿Las piezas sanitarias están libres de malos olores?", responseType: "SI_NO" },
        { id: "ol.16", label: "¿El bajante de los inodoros se encuentra en funcionamiento normal?", responseType: "SI_NO" },
        { id: "ol.17", label: "¿Cuentan con insumo de papel higiénico?", responseType: "SI_NO" },
        { id: "ol.18", label: "¿Las duchas están libres de moho?", responseType: "SI_NO" },
      ],
      hasObservations: false,
    },
    {
      id: "oficinas",
      title: "Oficinas",
      items: [
        { id: "ol.19", label: "¿El mobiliario de trabajo se encuentra en óptimas condiciones?", responseType: "SI_NO" },
        { id: "ol.20", label: "¿Se encuentra ordenada las carpetas de trabajo, cableado del computador?", responseType: "SI_NO" },
        { id: "ol.21", label: "¿Se realiza el mantenimiento de limpieza constante?", responseType: "SI_NO" },
        { id: "ol.22", label: "¿Las oficinas están libres de equipos dañados o en desuso?", responseType: "SI_NO" },
      ],
      hasObservations: false,
    },
    {
      id: "comedor",
      title: "Comedor y Servicios",
      items: [
        { id: "ol.23", label: "¿Se les realiza limpieza constante a la nevera, microondas y fregadero?", responseType: "SI_NO" },
        { id: "ol.24", label: "¿Cuentan con suficientes contenedores de desechos comunes?", responseType: "SI_NO" },
        { id: "ol.25", label: "¿Cuentan con los productos de limpieza necesarios?", responseType: "SI_NO" },
        { id: "ol.26", label: "¿El área está libre de roedores, insectos y otros vectores?", responseType: "SI_NO" },
        { id: "ol.27", label: "¿El dispensador de agua potable está en buenas condiciones?", responseType: "SI_NO" },
        { id: "ol.28", label: "¿Al dispensador de agua se le realizó limpieza del sistema?", responseType: "SI_NO" },
      ],
      hasObservations: false,
    },
  ],
  scoring: { type: "si_no_count" },
  signatureFields: ["Elaborado por", "Revisado por"],
};

// ============================================================
// SSA SERVICENTROS (SC / SERV) — 117 Criterios Oficiales
// ============================================================
export const SC_FORM: InspectionFormDef = {
  code: "SC",
  name: "Inspección SSA Servicentros",
  description: "Inspección Integral de Seguridad, Salud y Ambiente para Servicentros Duncan (117 Criterios Oficiales)",
  additionalFields: [
    { id: "ronda", label: "Ronda N°", type: "number", required: true },
    { id: "fechaCierre", label: "Fecha de Cierre", type: "date" },
  ],
  sections: buildSectionsFromCriteria(CRITERIOS_SERVICENTROS_OFICIALES),
  scoring: {
    type: "percentage",
    conformeThreshold: 80,
    omThreshold: 70,
  },
  signatureFields: ["Inspector SSA", "Encargado de Servicentro", "Delegado de Prevención"],
};

// ============================================================
// HERRAMIENTAS Y EQUIPOS (HEQ)
// ============================================================
export const HEQ_FORM: InspectionFormDef = {
  code: "HEQ",
  name: "Inspección de Herramientas y Equipos",
  description: "Evaluación del estado de herramientas manuales y eléctricas",
  additionalFields: [
    { id: "ubicacion", label: "Ubicación", type: "text", required: true },
    { id: "cantidadTrabajadores", label: "Cantidad de Trabajadores", type: "number" },
    { id: "equipoInspeccionar", label: "Equipo a inspeccionar", type: "text", required: true, placeholder: "Nombre del equipo o herramienta" },
  ],
  sections: [
    {
      id: "herramientas_electricas",
      title: "Herramientas Eléctricas",
      items: [
        { id: "pinzas", label: "Pinzas", responseType: "BUENO_DANADO_NA" },
        { id: "cables_conductores", label: "Cables / Conductores", responseType: "BUENO_DANADO_NA" },
        { id: "botones_interruptores", label: "Botones / Interruptores", responseType: "BUENO_DANADO_NA" },
        { id: "pantalla", label: "Pantalla", responseType: "BUENO_DANADO_NA" },
        { id: "resistencia", label: "Resistencia", responseType: "BUENO_DANADO_NA" },
        { id: "enchufe", label: "Enchufe", responseType: "BUENO_DANADO_NA" },
        { id: "guarda_protectora", label: "Guarda Protectora", responseType: "BUENO_DANADO_NA" },
        { id: "mango_agarre", label: "Mango de Agarre", responseType: "BUENO_DANADO_NA" },
      ],
      hasObservations: false,
    },
    {
      id: "herramientas_manuales",
      title: "Herramientas Manuales",
      items: [
        { id: "llaves_combinadas", label: "Llaves Combinadas", responseType: "BUENO_DANADO_NA" },
        { id: "rache", label: "Rache", responseType: "BUENO_DANADO_NA" },
        { id: "dados_extensiones", label: "Dados y extensiones", responseType: "BUENO_DANADO_NA" },
        { id: "alicate", label: "Alicate manual / de presión", responseType: "BUENO_DANADO_NA" },
        { id: "pinza_electricista", label: "Pinza de electricista", responseType: "BUENO_DANADO_NA" },
        { id: "tenaza", label: "Tenaza", responseType: "BUENO_DANADO_NA" },
        { id: "destornilladores_manuales", label: "Destornilladores manuales", responseType: "BUENO_DANADO_NA" },
        { id: "destornilladores_inalambricos", label: "Destornilladores inalámbricos", responseType: "BUENO_DANADO_NA" },
        { id: "martillo", label: "Martillo", responseType: "BUENO_DANADO_NA" },
        { id: "lima", label: "Lima", responseType: "BUENO_DANADO_NA" },
        { id: "navaja_exacto", label: "Navaja / Exacto", responseType: "BUENO_DANADO_NA" },
        { id: "tijera", label: "Tijera", responseType: "BUENO_DANADO_NA" },
        { id: "cegueta", label: "Cegueta", responseType: "BUENO_DANADO_NA" },
        { id: "nivel_gota", label: "Nivel de gota", responseType: "BUENO_DANADO_NA" },
        { id: "cinta_metrica", label: "Cinta métrica", responseType: "BUENO_DANADO_NA" },
        { id: "corta_cables", label: "Corta cables", responseType: "BUENO_DANADO_NA" },
      ],
      hasObservations: true,
    },
  ],
  scoring: { type: "percentage", conformeThreshold: 90, omThreshold: 70 },
  signatureFields: ["Elaborado por", "Revisado por"],
};

// ============================================================
// MONTACARGAS DIARIA (MTCG)
// ============================================================
export const MTCG_FORM: InspectionFormDef = {
  code: "MTCG",
  name: "Inspección Diaria de Montacargas",
  description: "Inspección diaria del estado y operatividad de montacargas",
  additionalFields: [
    { id: "ubicacion", label: "Ubicación", type: "text", required: true },
    { id: "equipoNumero", label: "Equipo Número", type: "text", required: true },
    { id: "marca", label: "Marca", type: "text", required: true },
    { id: "modelo", label: "Modelo", type: "text", required: true },
    { id: "serial", label: "Serial Número", type: "text" },
  ],
  sections: [
    {
      id: "estructura",
      title: "Estructura General",
      items: [
        { id: "estructura_360", label: "Estructura general vista de 360°", responseType: "BUENO_DANADO_NA" },
        { id: "placa_capacidad", label: "Placa de capacidad de carga", responseType: "BUENO_DANADO_NA" },
      ],
      hasObservations: false,
    },
    {
      id: "cauchos",
      title: "Cauchos",
      items: [
        { id: "cauchos_delanteros", label: "Cauchos delanteros y sus tuercas", responseType: "BUENO_DANADO_NA" },
        { id: "cauchos_traseros", label: "Cauchos traseros y sus tuercas", responseType: "BUENO_DANADO_NA" },
      ],
      hasObservations: false,
    },
    {
      id: "propano",
      title: "Sistema de Propano",
      items: [
        { id: "valvula_propano", label: "Válvula y boquilla del cilindro propano", responseType: "BUENO_DANADO_NA" },
        { id: "manguera_propano", label: "Manguera del cilindro de propano", responseType: "BUENO_DANADO_NA" },
        { id: "sujetadores_propano", label: "Sujetadores del cilindro de propano", responseType: "BUENO_DANADO_NA" },
      ],
      hasObservations: false,
    },
    {
      id: "fluidos",
      title: "Fluidos y Filtros",
      items: [
        { id: "aceite_motor", label: "Nivel de aceite motor", responseType: "BUENO_DANADO_NA" },
        { id: "aceite_hidraulico", label: "Nivel de aceite hidráulico", responseType: "BUENO_DANADO_NA" },
        { id: "liga_frenos", label: "Liga de frenos", responseType: "BUENO_DANADO_NA" },
        { id: "filtro_aire", label: "Filtro de aire", responseType: "BUENO_DANADO_NA" },
        { id: "bateria", label: "Batería", responseType: "BUENO_DANADO_NA" },
        { id: "agua_radiador", label: "Nivel de agua tanque radiador", responseType: "BUENO_DANADO_NA" },
      ],
      hasObservations: false,
    },
    {
      id: "elevacion",
      title: "Estructura de Elevación",
      items: [
        { id: "cadenas_manguera", label: "Cadenas y manguera hidráulicas", responseType: "BUENO_DANADO_NA" },
        { id: "mastil", label: "Mástil", responseType: "BUENO_DANADO_NA" },
        { id: "horquillas", label: "Estado de las horquillas", responseType: "BUENO_DANADO_NA" },
        { id: "espaldar", label: "Espaldar", responseType: "BUENO_DANADO_NA" },
        { id: "techo_protector", label: "Techo protector", responseType: "BUENO_DANADO_NA" },
      ],
      hasObservations: false,
    },
    {
      id: "operador",
      title: "Seguridad del Operador",
      items: [
        { id: "asiento", label: "Asiento del operador", responseType: "BUENO_DANADO_NA" },
        { id: "cinturon", label: "Cinturón de Seguridad", responseType: "BUENO_DANADO_NA" },
        { id: "espejo", label: "Espejo retrovisor", responseType: "BUENO_DANADO_NA" },
        { id: "extintor", label: "Extintor", responseType: "BUENO_DANADO_NA" },
      ],
      hasObservations: false,
    },
    {
      id: "controles",
      title: "Controles",
      items: [
        { id: "encendido", label: "Encendido del montacargas", responseType: "BUENO_DANADO_NA" },
        { id: "freno_mano", label: "Freno de mano", responseType: "BUENO_DANADO_NA" },
        { id: "pedal_freno", label: "Pedal de freno", responseType: "BUENO_DANADO_NA" },
        { id: "pedal_acelerador", label: "Pedal de acelerador", responseType: "BUENO_DANADO_NA" },
        { id: "pedal_embrague", label: "Pedal de embrague", responseType: "BUENO_DANADO_NA" },
        { id: "palanca_elevacion", label: "Palanca de elevación", responseType: "BUENO_DANADO_NA" },
        { id: "palanca_inclinacion", label: "Palanca de inclinación", responseType: "BUENO_DANADO_NA" },
      ],
      hasObservations: false,
    },
    {
      id: "luces_senales",
      title: "Luces y Señales",
      items: [
        { id: "luces_delanteras", label: "Luces delanteras", responseType: "BUENO_DANADO_NA" },
        { id: "luces_traseras", label: "Luces traseras", responseType: "BUENO_DANADO_NA" },
        { id: "pito_retroceso", label: "Pito de retroceso", responseType: "BUENO_DANADO_NA" },
        { id: "faro_giratorio", label: "Faro giratorio o coctelera", responseType: "BUENO_DANADO_NA" },
        { id: "corneta", label: "Corneta", responseType: "BUENO_DANADO_NA" },
      ],
      hasObservations: false,
    },
    {
      id: "resultado_mtcg",
      title: "Resultado",
      items: [
        { id: "operatividad", label: "Operatividad", responseType: "OPERATIVO_NO" },
      ],
      hasObservations: true,
    },
  ],
  scoring: { type: "operatividad" },
  signatureFields: ["Elaborado por", "Revisado por"],
};

// ============================================================
// VEHÍCULOS TRANSPORTE DIARIO (VHT)
// ============================================================
export const VHT_FORM: InspectionFormDef = {
  code: "VHT",
  name: "Inspección Diaria Vehículos de Transporte",
  description: "Inspección diaria de vehículos de transporte de carga, ventas y operaciones",
  additionalFields: [
    { id: "marca", label: "Marca", type: "text", required: true },
    { id: "modelo", label: "Modelo", type: "text", required: true },
    { id: "anio", label: "Año", type: "text" },
    { id: "placas", label: "Placas", type: "text", required: true },
    { id: "capacidadCarga", label: "Capacidad de Carga (Kg)", type: "text" },
    { id: "ruta", label: "Ruta", type: "text" },
    { id: "tipoConductor", label: "Tipo Vendedor de Ruta - Conductor", type: "select", options: ["Habitual", "Titular", "Suplente", "Otro"] },
    { id: "motivoNoConductor", label: "Motivo de no ser el titular/habitual", type: "text" },
    { id: "conductorNombre", label: "Vendedor de Ruta - Conductor Nombre y Apellidos", type: "text" },
    { id: "conductorCedula", label: "Vendedor de Ruta - Conductor Cédula", type: "text" },
    { id: "tipoAuxiliar", label: "Tipo de Auxiliar de Ruta", type: "select", options: ["Habitual", "Titular", "Suplente", "Otro"] },
    { id: "motivoNoAuxiliar", label: "Motivo de no ser el auxiliar titular/habitual", type: "text" },
    { id: "auxiliarNombre", label: "Auxiliar de Ruta - Copiloto Nombre y Apellidos", type: "text" },
    { id: "auxiliarCedula", label: "Auxiliar de Ruta - Copiloto Cédula", type: "text" },
  ],
  sections: [
    {
      id: "neumaticos",
      title: "Neumáticos",
      items: [
        { id: "neum_dir_izq", label: "Direccional Izquierdo", responseType: "SI_NO" },
        { id: "neum_dir_der", label: "Direccional Derecho", responseType: "SI_NO" },
        { id: "neum_tras_int_izq", label: "Trasero interno Izquierdo", responseType: "SI_NO" },
        { id: "neum_tras_ext_izq", label: "Trasero externo Izquierdo", responseType: "SI_NO" },
        { id: "neum_tras_int_der", label: "Trasero interno Derecho", responseType: "SI_NO" },
        { id: "neum_tras_ext_der", label: "Trasero externo Derecho", responseType: "SI_NO" },
        { id: "neum_repuesto", label: "Repuesto", responseType: "SI_NO" },
      ],
      hasObservations: false,
    },
    {
      id: "seguridad",
      title: "Seguridad",
      items: [
        { id: "cinturon", label: "Cinturón de Seguridad (piloto, copiloto, central)", responseType: "SI_NO" },
        { id: "extintor", label: "Extintor P.Q.S (10 lbs o más)", responseType: "SI_NO" },
        { id: "triangulo", label: "Triángulo de emergencia / Conos de Seguridad", responseType: "SI_NO" },
        { id: "herramientas", label: "Herramientas (gato, llave de cruz, juego de llaves, etc.)", responseType: "SI_NO" },
        { id: "kit_lavaojos", label: "Kit de lavado de ojos", responseType: "SI_NO" },
        { id: "kit_emergencia", label: "Kit de emergencia foráneos", responseType: "SI_NO" },
        { id: "kit_derrames", label: "Kit para atención de derrames", responseType: "SI_NO" },
      ],
      hasObservations: false,
    },
    {
      id: "luces",
      title: "Luces",
      items: [
        { id: "luces_bajas", label: "Bajas", responseType: "SI_NO" },
        { id: "luces_altas", label: "Altas", responseType: "SI_NO" },
        { id: "intermi_delanteras", label: "Intermitentes delanteras", responseType: "SI_NO" },
        { id: "intermi_traseras", label: "Intermitentes traseras", responseType: "SI_NO" },
        { id: "cruce_der_del", label: "Cruce derecha delantera", responseType: "SI_NO" },
        { id: "cruce_izq_del", label: "Cruce izquierda delantera", responseType: "SI_NO" },
        { id: "cocuyos_del", label: "Cocuyos cava delanteros", responseType: "SI_NO" },
        { id: "traseras_stop", label: "Traseras Stop", responseType: "SI_NO" },
        { id: "retroceso", label: "Retroceso", responseType: "SI_NO" },
        { id: "cruce_der_tras", label: "Cruce derecha trasera", responseType: "SI_NO" },
        { id: "cruce_izq_tras", label: "Cruce izquierda trasera", responseType: "SI_NO" },
        { id: "cocuyos_tras", label: "Cocuyos Cava Traseros", responseType: "SI_NO" },
        { id: "interna_habitaculo", label: "Interna Habitáculo", responseType: "SI_NO" },
        { id: "interna_furgon", label: "Interna furgón o cabina de carga", responseType: "SI_NO" },
      ],
      hasObservations: false,
    },
    {
      id: "parabrisas",
      title: "Parabrisas y Cristales",
      items: [
        { id: "parabrisas_del", label: "Delantero", responseType: "SI_NO" },
        { id: "parabrisas_tras", label: "Trasero", responseType: "SI_NO" },
        { id: "limpia_parabrisas", label: "Limpia parabrisas", responseType: "SI_NO" },
        { id: "estado_cristal", label: "Estado del Cristal", responseType: "SI_NO" },
      ],
      hasObservations: false,
    },
    {
      id: "espejos",
      title: "Espejos",
      items: [
        { id: "espejo_der", label: "Derecho", responseType: "SI_NO" },
        { id: "espejo_izq", label: "Izquierdo", responseType: "SI_NO" },
      ],
      hasObservations: false,
    },
    {
      id: "frenos",
      title: "Frenos",
      items: [
        { id: "freno_mano", label: "Freno de Mano o auxiliar", responseType: "SI_NO" },
        { id: "frenos_general", label: "Frenos en General", responseType: "SI_NO" },
      ],
      hasObservations: false,
    },
    {
      id: "habitaculo",
      title: "Habitáculo",
      items: [
        { id: "aire_acondicionado", label: "Aire acondicionado", responseType: "SI_NO" },
        { id: "asientos", label: "Asientos", responseType: "SI_NO" },
        { id: "palanca_cambios", label: "Palanca de cambios", responseType: "SI_NO" },
        { id: "pedal_freno", label: "Pedal de freno", responseType: "SI_NO" },
        { id: "pedal_acelerador", label: "Pedal de acelerador", responseType: "SI_NO" },
        { id: "pedal_embrague", label: "Pedal de embrague", responseType: "SI_NO" },
        { id: "corneta", label: "Corneta/Bocina", responseType: "SI_NO" },
      ],
      hasObservations: false,
    },
    {
      id: "furgon",
      title: "Furgón / Cava",
      items: [
        { id: "barandas", label: "Barandas de Protección", responseType: "SI_NO" },
        { id: "eslingas", label: "Eslingas de sujeción de mercancía", responseType: "SI_NO" },
        { id: "plataforma", label: "Plataforma", responseType: "SI_NO" },
        { id: "furgon_externo", label: "Estructura del furgón externo", responseType: "SI_NO" },
        { id: "furgon_interno", label: "Estructura del furgón interno", responseType: "SI_NO" },
        { id: "salpicaderas", label: "Salpicaderas o Chapaletas", responseType: "SI_NO" },
        { id: "sistema_acido", label: "Sistema de recolección de ácido de baterías", responseType: "SI_NO" },
      ],
      hasObservations: false,
    },
    {
      id: "instrumentos",
      title: "Instrumentos",
      items: [
        { id: "med_combustible", label: "Medidor de combustible", responseType: "SI_NO" },
        { id: "contador_km", label: "Contador de kilometraje", responseType: "SI_NO" },
        { id: "med_temperatura", label: "Medidor de temperatura", responseType: "SI_NO" },
        { id: "med_presion_aire", label: "Medidor de presión de aire", responseType: "SI_NO" },
        { id: "med_presion_aceite", label: "Medidor de presión de aceite", responseType: "SI_NO" },
        { id: "med_rpm", label: "Medidor de RPM", responseType: "SI_NO" },
        { id: "med_velocidad", label: "Medidor de Velocidad", responseType: "SI_NO" },
      ],
      hasObservations: false,
    },
    {
      id: "fluidos",
      title: "Fluidos",
      items: [
        { id: "nivel_aceite", label: "Nivel de aceite motor", responseType: "SI_NO" },
        { id: "nivel_agua", label: "Nivel de agua tanque radiador", responseType: "SI_NO" },
      ],
      hasObservations: false,
    },
    {
      id: "senalizacion",
      title: "Señalización",
      items: [
        { id: "numero_onu", label: "Número ONU (2794) en los cuatro costados", responseType: "SI_NO" },
        { id: "racda", label: "N° R.A.C.D.A. actual en laterales", responseType: "SI_NO" },
        { id: "rombo_nfpa_dot", label: "Rombo NFPA y Rombo DOT N°8 (laterales y posterior)", responseType: "SI_NO" },
        { id: "placa_vehiculo", label: "Placa del Vehículo anterior y posterior", responseType: "SI_NO" },
      ],
      hasObservations: false,
    },
    {
      id: "carga_docs",
      title: "Carga y Documentación",
      items: [
        { id: "carga_salida", label: "Carga de salida según manifiesto (kg)", responseType: "SI_NO" },
        { id: "carga_retorno_aptos", label: "Carga de retorno (acumuladores aptos y devoluciones)", responseType: "SI_NO" },
        { id: "carga_retorno_inserv", label: "Carga de retorno (acumuladores inservibles)", responseType: "SI_NO" },
        { id: "curso_matpel", label: "Curso Manejador Materiales Peligrosos actualizado", responseType: "SI_NO" },
        { id: "curso_manejo", label: "Curso de Manejo defensivo", responseType: "SI_NO" },
        { id: "fds", label: "Hoja de seguridad de materiales (FDS) AT-SSA072", responseType: "SI_NO" },
        { id: "poliza_rc", label: "Póliza de Responsabilidad Civil", responseType: "SI_NO" },
        { id: "poliza_ambiental", label: "Póliza de Seguros (cobertura daño ambiental)", responseType: "SI_NO" },
        { id: "sencamer", label: "Registro de SENCAMER vigente", responseType: "SI_NO" },
        { id: "norma_desechos", label: "Norma de Disposición de Desechos Peligrosos NG-SST-067", responseType: "SI_NO" },
        { id: "registro_racda", label: "Registro R.A.C.D.A actualizado (2 años)", responseType: "SI_NO" },
        { id: "plan_emergencia", label: "Plan de Emergencia y Contingencia", responseType: "SI_NO" },
        { id: "registro_rot", label: "Registro R.O.T vigente", responseType: "SI_NO" },
        { id: "politica_vial", label: "Política de Prevención y Seguridad Vial", responseType: "SI_NO" },
        { id: "docs_personales", label: "Documentos Personales (autorización, carnet, licencia 5ta, certificado médico)", responseType: "SI_NO" },
      ],
      hasObservations: true,
    },
  ],
  scoring: { type: "si_no_count" },
  signatureFields: ["Elaborado por", "Revisado por"],
};

// ============================================================
// VEHÍCULOS DE CARGA SSA (VTC)
// ============================================================
export const VTC_FORM: InspectionFormDef = {
  code: "VTC",
  name: "Inspección SSA Vehículos de Carga",
  description: "Inspección SSA detallada de vehículos de carga (semestral)",
  additionalFields: [
    { id: "ronda", label: "Ronda N°", type: "number" },
    { id: "vehiculoInfo", label: "Marca - Modelo - Año - Placas - Capacidad Kgs", type: "text", required: true },
    { id: "numRuta", label: "Número de Ruta", type: "text" },
    { id: "descRuta", label: "Descripción de Ruta", type: "text" },
    { id: "tipoConductor", label: "Tipo Vendedor de Ruta - Conductor", type: "select", options: ["Habitual", "Titular", "Suplente", "Otro"] },
    { id: "motivoNoConductor", label: "Motivo de no ser titular/habitual", type: "text" },
    { id: "conductorNombre", label: "Conductor Nombre y Apellidos", type: "text" },
    { id: "conductorCedula", label: "Conductor Cédula", type: "text" },
    { id: "tipoAuxiliar", label: "Tipo de Auxiliar de Ruta", type: "select", options: ["Habitual", "Titular", "Suplente", "Otro"] },
    { id: "motivoNoAuxiliar", label: "Motivo de no ser auxiliar titular/habitual", type: "text" },
    { id: "auxiliarNombre", label: "Auxiliar Nombre y Apellidos", type: "text" },
    { id: "auxiliarCedula", label: "Auxiliar Cédula", type: "text" },
  ],
  sections: [
    {
      id: "neumaticos",
      title: "Neumáticos",
      items: [
        { id: "neum_dir_izq", label: "Direccional Izquierdo", responseType: "SI_NO" },
        { id: "neum_dir_der", label: "Direccional Derecho", responseType: "SI_NO" },
        { id: "neum_tras_int_izq", label: "Trasero interno Izquierdo", responseType: "SI_NO" },
        { id: "neum_tras_ext_izq", label: "Trasero externo Izquierdo", responseType: "SI_NO" },
        { id: "neum_tras_int_der", label: "Trasero interno Derecho", responseType: "SI_NO" },
        { id: "neum_tras_ext_der", label: "Trasero externo Derecho", responseType: "SI_NO" },
        { id: "neum_repuesto", label: "Repuesto", responseType: "SI_NO" },
      ],
      hasObservations: false,
    },
    {
      id: "seguridad",
      title: "Seguridad",
      items: [
        { id: "cinturon", label: "Cinturón de Seguridad", responseType: "SI_NO" },
        { id: "extintor", label: "Extintor P.Q.S", responseType: "SI_NO" },
        { id: "triangulo", label: "Triángulo de emergencia / Conos de Seguridad", responseType: "SI_NO" },
        { id: "herramientas", label: "Disponibilidad de Herramientas", responseType: "SI_NO" },
        { id: "kit_lavaojos", label: "Disponibilidad de Kit de lavado de ojos", responseType: "SI_NO" },
        { id: "kit_emergencia", label: "Disponibilidad de kit de emergencia foráneos", responseType: "SI_NO" },
        { id: "kit_derrames", label: "Disponibilidad de kit para atención de derrames", responseType: "SI_NO" },
      ],
      hasObservations: false,
    },
    {
      id: "luces",
      title: "Luces",
      items: [
        { id: "luces_bajas", label: "Bajas", responseType: "SI_NO" },
        { id: "luces_altas", label: "Altas", responseType: "SI_NO" },
        { id: "intermi_delanteras", label: "Intermitentes delanteras", responseType: "SI_NO" },
        { id: "intermi_traseras", label: "Intermitentes traseras", responseType: "SI_NO" },
        { id: "cruce_der_del", label: "Cruce derecha delantera", responseType: "SI_NO" },
        { id: "cruce_izq_del", label: "Cruce izquierda delantera", responseType: "SI_NO" },
        { id: "cocuyos_del", label: "Cocuyos cava delanteros", responseType: "SI_NO" },
        { id: "traseras_stop", label: "Traseras Stop", responseType: "SI_NO" },
        { id: "retroceso", label: "Retroceso", responseType: "SI_NO" },
        { id: "cruce_der_tras", label: "Cruce derecha trasera", responseType: "SI_NO" },
        { id: "cruce_izq_tras", label: "Cruce izquierda trasera", responseType: "SI_NO" },
        { id: "cocuyos_tras", label: "Cocuyos Cava Traseros", responseType: "SI_NO" },
        { id: "interna_habitaculo", label: "Interna Habitáculo", responseType: "SI_NO" },
        { id: "interna_furgon", label: "Interna furgón o cabina de carga", responseType: "SI_NO" },
      ],
      hasObservations: false,
    },
    {
      id: "parabrisas",
      title: "Parabrisas y Cristales",
      items: [
        { id: "parabrisas_del", label: "Delantero", responseType: "SI_NO" },
        { id: "parabrisas_tras", label: "Trasero", responseType: "SI_NO" },
        { id: "limpia_parabrisas", label: "Limpia parabrisas", responseType: "SI_NO" },
        { id: "estado_cristal", label: "Estado del Cristal", responseType: "SI_NO" },
      ],
      hasObservations: false,
    },
    {
      id: "espejos",
      title: "Espejos",
      items: [
        { id: "espejo_der", label: "Derecho", responseType: "SI_NO" },
        { id: "espejo_izq", label: "Izquierdo", responseType: "SI_NO" },
      ],
      hasObservations: false,
    },
    {
      id: "frenos",
      title: "Frenos",
      items: [
        { id: "freno_mano", label: "Freno de Mano o auxiliar", responseType: "SI_NO" },
        { id: "frenos_general", label: "Frenos en General", responseType: "SI_NO" },
      ],
      hasObservations: false,
    },
    {
      id: "habitaculo",
      title: "Habitáculo",
      items: [
        { id: "aire_acondicionado", label: "Aire acondicionado", responseType: "SI_NO" },
        { id: "asientos", label: "Asientos", responseType: "SI_NO" },
        { id: "corneta", label: "Corneta/Bocina", responseType: "SI_NO" },
        { id: "manijas_vidrios", label: "Manijas de regulación vidrios laterales", responseType: "SI_NO" },
        { id: "vidrios_laterales", label: "Vidrios laterales piloto y copiloto", responseType: "SI_NO" },
        { id: "manijas_externas", label: "Manijas externas de apertura de puertas", responseType: "SI_NO" },
        { id: "manijas_internas", label: "Manijas internas de apertura de puertas", responseType: "SI_NO" },
        { id: "palanca_cambios", label: "Palanca de cambios", responseType: "SI_NO" },
        { id: "pedal_acelerador", label: "Pedal de acelerador", responseType: "SI_NO" },
        { id: "pedal_embrague", label: "Pedal de embrague", responseType: "SI_NO" },
        { id: "pedal_freno", label: "Pedal de freno", responseType: "SI_NO" },
        { id: "radio", label: "Radio", responseType: "SI_NO" },
      ],
      hasObservations: false,
    },
    {
      id: "furgon",
      title: "Furgón / Cava",
      items: [
        { id: "barandas", label: "Barandas de Protección", responseType: "SI_NO" },
        { id: "eslingas", label: "Eslingas de sujeción de mercancía", responseType: "SI_NO" },
        { id: "plataforma", label: "Plataforma", responseType: "SI_NO" },
        { id: "furgon_externo", label: "Estructura del furgón externo", responseType: "SI_NO" },
        { id: "furgon_interno", label: "Estructura del furgón interno", responseType: "SI_NO" },
        { id: "salpicaderas", label: "Salpicaderas o Chapaletas", responseType: "SI_NO" },
        { id: "sistema_acido", label: "Sistema de recolección de ácido de baterías", responseType: "SI_NO" },
      ],
      hasObservations: false,
    },
    {
      id: "instrumentos",
      title: "Instrumentos",
      items: [
        { id: "med_combustible", label: "Medidor de combustible", responseType: "SI_NO" },
        { id: "contador_km", label: "Contador de kilometraje", responseType: "SI_NO" },
        { id: "med_temperatura", label: "Medidor de temperatura", responseType: "SI_NO" },
        { id: "med_presion_aire", label: "Medidor de presión de aire", responseType: "SI_NO" },
        { id: "med_presion_aceite", label: "Medidor de presión de aceite", responseType: "SI_NO" },
        { id: "med_rpm", label: "Medidor de RPM", responseType: "SI_NO" },
        { id: "med_velocidad", label: "Medidor de Velocidad", responseType: "SI_NO" },
      ],
      hasObservations: false,
    },
    {
      id: "fluidos",
      title: "Fluidos",
      items: [
        { id: "nivel_agua", label: "Nivel de agua tanque radiador", responseType: "SI_NO" },
        { id: "nivel_aceite", label: "Nivel de aceite motor", responseType: "SI_NO" },
      ],
      hasObservations: false,
    },
    {
      id: "senalizacion",
      title: "Señalización",
      items: [
        { id: "numero_onu", label: "Número ONU 2794", responseType: "SI_NO" },
        { id: "racda", label: "N° R.A.C.D.A. actual", responseType: "SI_NO" },
        { id: "rombo_nfpa_dot", label: "Rombo NFPA y Rombo DOT N°8", responseType: "SI_NO" },
        { id: "placa_vehiculo", label: "Placa del Vehículo anterior y posterior", responseType: "SI_NO" },
      ],
      hasObservations: false,
    },
    {
      id: "kit_derrames_detalle",
      title: "Kit para Derrames (Detalle)",
      items: [
        { id: "kd_lentes", label: "Lentes", responseType: "SI_NO" },
        { id: "kd_guantes", label: "Guantes", responseType: "SI_NO" },
        { id: "kd_mascarilla", label: "Mascarilla", responseType: "SI_NO" },
        { id: "kd_cinta", label: "Cinta de demarcación", responseType: "SI_NO" },
        { id: "kd_cepillo", label: "Cepillo", responseType: "SI_NO" },
        { id: "kd_pala", label: "Pala", responseType: "SI_NO" },
        { id: "kd_bolsas", label: "Bolsas plásticas", responseType: "SI_NO" },
        { id: "kd_cal", label: "Cal (≥3 kg)", responseType: "SI_NO" },
        { id: "kd_recipiente", label: "Recipiente de almacenamiento del kit", responseType: "SI_NO" },
      ],
      hasObservations: false,
    },
    {
      id: "documentacion",
      title: "Documentación",
      items: [
        { id: "licencia_conducir", label: "Licencia de conducir vigente (conductor)", responseType: "SI_NO" },
        { id: "grado_licencia", label: "Grado de Licencia de 5ta", responseType: "SI_NO" },
        { id: "certificado_medico", label: "Certificado médico vigente (conductor)", responseType: "SI_NO" },
        { id: "cert_matpel", label: "Certificado Manejador de Sustancias Peligrosas (ambos)", responseType: "SI_NO" },
        { id: "curso_manejo", label: "Curso de Manejo defensivo (ambos)", responseType: "SI_NO" },
        { id: "politica_vial", label: "Política de Prevención y Seguridad Vial (ambos)", responseType: "SI_NO" },
        { id: "fds", label: "Hoja de seguridad de materiales (FDS) AT-SSA-072", responseType: "SI_NO" },
        { id: "registro_racda", label: "Registro R.A.C.D.A actualizado (2 años)", responseType: "SI_NO" },
        { id: "poliza_rc", label: "Póliza de Responsabilidad Civil", responseType: "SI_NO" },
        { id: "plan_emergencia", label: "Plan de Emergencia y Contingencia", responseType: "SI_NO" },
        { id: "poliza_ambiental", label: "Póliza de Seguros (cobertura daño ambiental)", responseType: "SI_NO" },
        { id: "sencamer", label: "Registro de SENCAMER vigente", responseType: "SI_NO" },
        { id: "registro_rot", label: "Registro R.O.T vigente", responseType: "SI_NO" },
        { id: "norma_desechos", label: "Norma de Disposición de Desechos Peligrosos NG-SST-067", responseType: "SI_NO" },
        { id: "formato_inspeccion", label: "Formato de inspección diaria (NG-SST-185)", responseType: "SI_NO" },
      ],
      hasObservations: true,
    },
    {
      id: "carga_capacidad",
      title: "Inspección de Capacidad de Carga",
      items: [
        { id: "carga_supera", label: "¿La carga inspeccionada está dentro de la capacidad neta del vehículo?", responseType: "SI_NO" },
        { id: "cantidad_ocupantes", label: "Cantidad de ocupantes de la unidad", responseType: "NUMBER" },
        { id: "cantidad_semanas", label: "Cantidad de semanas evaluadas", responseType: "NUMBER" },
        { id: "tipo_unidad", label: "Tipo de unidad", responseType: "TEXT" },
      ],
      hasObservations: true,
    },
    {
      id: "incidentes",
      title: "Incidentes",
      items: [
        { id: "desc_incidentes", label: "Descripción de los Incidentes", responseType: "TEXT" },
      ],
      hasObservations: false,
    },
    {
      id: "mantenimiento",
      title: "Mantenimiento",
      items: [
        { id: "cumple_planes", label: "¿Se cumple con los planes de mantenimiento?", responseType: "SI_NO" },
        { id: "plan_mantenimiento", label: "¿Se lleva plan de mantenimiento y cambio de cauchos?", responseType: "SI_NO" },
        { id: "soportes_mantenimiento", label: "Soportes de mantenimiento (con fechas)", responseType: "SI_NO" },
      ],
      hasObservations: true,
    },
  ],
  scoring: { type: "si_no_count" },
  signatureFields: ["Elaborado por", "Gerente de Distribuidora / Supervisor", "Vendedor de Ruta (Conductor)", "Auxiliar de Ruta (Ayudante)"],
};

// ============================================================
// FUENTE LAVAOJOS PORTÁTIL (FLP)
// ============================================================
export const FLP_FORM: InspectionFormDef = {
  code: "FLP",
  name: "Inspección de Fuente Lavaojos Portátil",
  description: "Evaluación del estado de fuentes lavaojos portátiles",
  additionalFields: [
    { id: "ubicacionFuente", label: "Ubicación de la fuente", type: "text", required: true },
    { id: "fechaUltimaInspeccion", label: "Fecha de última inspección", type: "date" },
    { id: "fechaUltimoCambioAgua", label: "Fecha del último cambio de agua", type: "date" },
  ],
  sections: [
    {
      id: "componentes",
      title: "Estado de Componentes",
      items: [
        { id: "cabezales_duales", label: "Cabezales duales", responseType: "C_NC_OM_NA" },
        { id: "bandeja_plastico", label: "Bandeja de plástico", responseType: "C_NC_OM_NA" },
        { id: "cuerpo_envase", label: "Cuerpo envase de polietileno", responseType: "C_NC_OM_NA" },
        { id: "tapa_superior", label: "Tapa superior", responseType: "C_NC_OM_NA" },
        { id: "base_pared", label: "Base de pared", responseType: "C_NC_OM_NA" },
        { id: "presion_agua", label: "Presión de agua", responseType: "C_NC_OM_NA" },
        { id: "tapa_plastica", label: "Tapa plástica (si aplica)", responseType: "C_NC_OM_NA" },
        { id: "senalizacion", label: "Señalización", responseType: "C_NC_OM_NA" },
        { id: "accesibilidad", label: "Accesibilidad", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: false,
    },
    {
      id: "condiciones",
      title: "Condiciones de Operación",
      items: [
        { id: "agua_filtrada", label: "¿Es agua filtrada o solución especial?", responseType: "SI_NO" },
        { id: "cambio_30dias", label: "¿Se realizó cambio de agua en los últimos 30 días?", responseType: "SI_NO" },
        { id: "limpia_sin_polvo", label: "¿Se encuentra limpia y sin polvo?", responseType: "SI_NO" },
        { id: "sin_fuga", label: "¿Sin fuga en cabezales?", responseType: "SI_NO" },
      ],
      hasObservations: true,
    },
  ],
  scoring: { type: "percentage", conformeThreshold: 90, omThreshold: 70 },
  signatureFields: ["Elaborado por", "Revisado por"],
};

// ============================================================
// FUENTE LAVAOJOS Y DUCHA DE EMERGENCIA (FYD)
// ============================================================
export const FYD_FORM: InspectionFormDef = {
  code: "FYD",
  name: "Inspección de Fuente Lavaojos y Ducha de Emergencia",
  description: "Evaluación del estado de fuentes lavaojos fijas y duchas de emergencia",
  additionalFields: [
    { id: "ubicacionFuente", label: "Ubicación de fuente y ducha", type: "text", required: true },
    { id: "fechaUltimaInspeccion", label: "Fecha de última inspección", type: "date" },
  ],
  sections: [
    {
      id: "fuente_lavaojos",
      title: "Fuente Lavaojos",
      items: [
        { id: "boquilla_rociadora", label: "Boquilla rociadora", responseType: "C_NC_OM_NA" },
        { id: "aireador", label: "Aireador", responseType: "C_NC_OM_NA" },
        { id: "funda_antipolvo", label: "Funda anti polvo", responseType: "C_NC_OM_NA" },
        { id: "receptor_plastico", label: "Receptor plástico", responseType: "C_NC_OM_NA" },
        { id: "manija_valvula", label: "Manija / Válvula", responseType: "C_NC_OM_NA" },
        { id: "tuberia_drenaje", label: "Tubería de drenaje", responseType: "C_NC_OM_NA" },
        { id: "presion_agua_fuente", label: "Presión de agua", responseType: "C_NC_OM_NA" },
        { id: "accesibilidad_fuente", label: "Accesibilidad", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: true,
    },
    {
      id: "ducha",
      title: "Ducha de Emergencia",
      items: [
        { id: "cabezal", label: "Cabezal", responseType: "C_NC_OM_NA" },
        { id: "accionador_regadera", label: "Accionador de regadera", responseType: "C_NC_OM_NA" },
        { id: "tuberia_ducha", label: "Tubería", responseType: "C_NC_OM_NA" },
        { id: "senalizacion_ducha", label: "Señalización", responseType: "C_NC_OM_NA" },
        { id: "pintura_demarcacion", label: "Pintura / Demarcación", responseType: "C_NC_OM_NA" },
        { id: "presion_agua_ducha", label: "Presión de agua", responseType: "C_NC_OM_NA" },
        { id: "accesibilidad_ducha", label: "Accesibilidad", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: true,
    },
  ],
  scoring: { type: "percentage", conformeThreshold: 90, omThreshold: 70 },
  signatureFields: ["Elaborado por", "Revisado por"],
};

// ============================================================
// KIT PARA DERRAMES (KPD)
// ============================================================
export const KPD_FORM: InspectionFormDef = {
  code: "KPD",
  name: "Inspección del Kit para Casos de Derrame",
  description: "Verificación del contenido y estado del kit para atención de derrames",
  additionalFields: [
    { id: "ubicacionKit", label: "Ubicación del Kit", type: "text", required: true },
    { id: "fechaUltimaInspeccion", label: "Fecha de última inspección", type: "date" },
  ],
  sections: [
    {
      id: "contenido_kit",
      title: "Contenido del Kit",
      items: [
        { id: "bolsas_plasticas", label: "Bolsas plásticas", responseType: "C_NC_OM_NA" },
        { id: "cepillo_barrer", label: "Cepillo para barrer", responseType: "C_NC_OM_NA" },
        { id: "cinta_seguridad", label: "Cinta de seguridad", responseType: "C_NC_OM_NA" },
        { id: "condiciones_contenedor", label: "Condiciones del contenedor (plástico o aéreo)", responseType: "C_NC_OM_NA" },
        { id: "guantes", label: "Guantes", responseType: "C_NC_OM_NA" },
        { id: "lentes", label: "Lentes", responseType: "C_NC_OM_NA" },
        { id: "mascarillas", label: "Mascarillas", responseType: "C_NC_OM_NA" },
        { id: "material_neutralizante", label: "Material neutralizante (CAL)", responseType: "C_NC_OM_NA" },
        { id: "pala", label: "Pala", responseType: "C_NC_OM_NA" },
        { id: "kit_libre_obstaculos", label: "¿El kit se encuentra libre de obstáculos y de fácil acceso?", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: true,
    },
  ],
  scoring: { type: "percentage", conformeThreshold: 90, omThreshold: 70 },
  signatureFields: ["Elaborado por", "Revisado por"],
};

// ============================================================
// LÁMPARAS DE EMERGENCIA (LEM)
// ============================================================
export const LEM_FORM: InspectionFormDef = {
  code: "LEM",
  name: "Inspección de Lámparas de Emergencia",
  description: "Evaluación del estado y funcionamiento de lámparas de emergencia",
  additionalFields: [
    { id: "fechaUltimaInspeccion", label: "Fecha de última inspección", type: "date" },
  ],
  sections: [
    {
      id: "lampara_1",
      title: "Lámpara N° 1",
      items: [
        { id: "l1_ubicacion", label: "Ubicación N° 1", responseType: "TEXT" },
        { id: "l1_estado_fisico", label: "Estado físico de lámpara N° 1", responseType: "C_NC_OM_NA" },
        { id: "l1_indicador_normal", label: "Indicador Función Normal activo N° 1", responseType: "C_NC_OM_NA" },
        { id: "l1_indicador_averia", label: "Indicador de avería N° 1", responseType: "C_NC_OM_NA" },
        { id: "l1_boton_prueba", label: "Botón de prueba N° 1", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: false,
    },
    {
      id: "lampara_2",
      title: "Lámpara N° 2",
      items: [
        { id: "l2_ubicacion", label: "Ubicación N° 2", responseType: "TEXT" },
        { id: "l2_estado_fisico", label: "Estado físico de lámpara N° 2", responseType: "C_NC_OM_NA" },
        { id: "l2_indicador_normal", label: "Indicador Función Normal activo N° 2", responseType: "C_NC_OM_NA" },
        { id: "l2_indicador_averia", label: "Indicador de avería N° 2", responseType: "C_NC_OM_NA" },
        { id: "l2_boton_prueba", label: "Botón de prueba N° 2", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: false,
    },
    {
      id: "lampara_3",
      title: "Lámpara N° 3",
      items: [
        { id: "l3_ubicacion", label: "Ubicación N° 3", responseType: "TEXT" },
        { id: "l3_estado_fisico", label: "Estado físico de lámpara N° 3", responseType: "C_NC_OM_NA" },
        { id: "l3_indicador_normal", label: "Indicador Función Normal activo N° 3", responseType: "C_NC_OM_NA" },
        { id: "l3_indicador_averia", label: "Indicador de avería N° 3", responseType: "C_NC_OM_NA" },
        { id: "l3_boton_prueba", label: "Botón de prueba N° 3", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: false,
    },
    {
      id: "lampara_4",
      title: "Lámpara N° 4",
      items: [
        { id: "l4_ubicacion", label: "Ubicación N° 4", responseType: "TEXT" },
        { id: "l4_estado_fisico", label: "Estado físico de lámpara N° 4", responseType: "C_NC_OM_NA" },
        { id: "l4_indicador_normal", label: "Indicador Función Normal activo N° 4", responseType: "C_NC_OM_NA" },
        { id: "l4_indicador_averia", label: "Indicador de avería N° 4", responseType: "C_NC_OM_NA" },
        { id: "l4_boton_prueba", label: "Botón de prueba N° 4", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: false,
    },
  ],
  scoring: { type: "percentage", conformeThreshold: 90, omThreshold: 70 },
  signatureFields: ["Elaborado por", "Revisado por"],
};

// ============================================================
// DETECCIÓN DE INCENDIOS (DI) - Servicentros y Distribuidoras
// ============================================================
export const DI_FORM: InspectionFormDef = {
  code: "DI",
  name: "Inspección Sistema de Detección de Incendios",
  description: "Inspección del sistema de detección de incendios (incluye tablero, alarma, extinción fija y estaciones manuales)",
  additionalFields: [
    { id: "ubicacion", label: "Ubicación", type: "text", required: true },
    { id: "tipoEstablecimiento", label: "Tipo de Establecimiento", type: "select", options: ["Servicentro", "Distribuidora"], required: true },
  ],
  sections: [
    {
      id: "tablero",
      title: "Tablero de Control",
      items: [
        { id: "boton_silenciador", label: "Botón silenciador de alarma general", responseType: "C_NC_OM_NA" },
        { id: "boton_reposicion", label: "Botón de reposición", responseType: "C_NC_OM_NA" },
        { id: "boton_prueba", label: "Botón de prueba", responseType: "C_NC_OM_NA" },
        { id: "boton_silenciador_averia", label: "Botón silenciador de avería", responseType: "C_NC_OM_NA" },
        { id: "llave_alarma", label: "Llave de la alarma general", responseType: "C_NC_OM_NA" },
        { id: "estado_general_panel", label: "Estado general del panel", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: true,
    },
    {
      id: "alarma",
      title: "Sistema de Alarma",
      items: [
        { id: "alarma_general", label: "Alarma general", responseType: "C_NC_OM_NA" },
        { id: "funcion_auxiliar", label: "Función auxiliar", responseType: "C_NC_OM_NA" },
        { id: "difusor", label: "Difusor", responseType: "C_NC_OM_NA" },
        { id: "emisor_senal", label: "Emisor de señal", responseType: "C_NC_OM_NA" },
        { id: "bateria", label: "Batería", responseType: "C_NC_OM_NA" },
        { id: "puesta_tierra", label: "Puesta a tierra", responseType: "C_NC_OM_NA" },
        { id: "voltaje_linea", label: "Voltaje de línea", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: false,
    },
    {
      id: "extincion_fija_1",
      title: "Extinción Fija N° 1 (Distribuidoras)",
      description: "Solo aplica para distribuidoras",
      items: [
        { id: "ef1_ubicacion", label: "Ubicación Extinción Fija N° 1", responseType: "TEXT" },
        { id: "ef1_gabinete", label: "Gabinete", responseType: "C_NC_OM_NA" },
        { id: "ef1_vidrio", label: "Vidrio", responseType: "C_NC_OM_NA" },
        { id: "ef1_manguera", label: "Manguera", responseType: "C_NC_OM_NA" },
        { id: "ef1_piston", label: "Pistón", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: true,
    },
    {
      id: "extincion_fija_2",
      title: "Extinción Fija N° 2 (Distribuidoras)",
      description: "Solo aplica para distribuidoras",
      items: [
        { id: "ef2_ubicacion", label: "Ubicación Extinción Fija N° 2", responseType: "TEXT" },
        { id: "ef2_gabinete", label: "Gabinete", responseType: "C_NC_OM_NA" },
        { id: "ef2_vidrio", label: "Vidrio", responseType: "C_NC_OM_NA" },
        { id: "ef2_manguera", label: "Manguera", responseType: "C_NC_OM_NA" },
        { id: "ef2_piston", label: "Pistón", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: true,
    },
    {
      id: "estacion_manual_1",
      title: "Estación Manual N° 1",
      items: [
        { id: "em1_ubicacion", label: "Ubicación Estación Manual N° 1", responseType: "TEXT" },
        { id: "em1_pintura", label: "Pintura", responseType: "C_NC_OM_NA" },
        { id: "em1_vidrio", label: "Vidrio", responseType: "C_NC_OM_NA" },
        { id: "em1_boton_pulsador", label: "Botón pulsador de señal", responseType: "C_NC_OM_NA" },
        { id: "em1_senalizacion", label: "Señalización", responseType: "C_NC_OM_NA" },
        { id: "em1_prueba", label: "Prueba", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: true,
    },
    {
      id: "estacion_manual_2",
      title: "Estación Manual N° 2",
      items: [
        { id: "em2_ubicacion", label: "Ubicación Estación Manual N° 2", responseType: "TEXT" },
        { id: "em2_pintura", label: "Pintura", responseType: "C_NC_OM_NA" },
        { id: "em2_vidrio", label: "Vidrio", responseType: "C_NC_OM_NA" },
        { id: "em2_boton_pulsador", label: "Botón pulsador de señal", responseType: "C_NC_OM_NA" },
        { id: "em2_senalizacion", label: "Señalización", responseType: "C_NC_OM_NA" },
        { id: "em2_prueba", label: "Prueba", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: true,
    },
    {
      id: "estacion_manual_3",
      title: "Estación Manual N° 3",
      items: [
        { id: "em3_ubicacion", label: "Ubicación Estación Manual N° 3", responseType: "TEXT" },
        { id: "em3_pintura", label: "Pintura", responseType: "C_NC_OM_NA" },
        { id: "em3_vidrio", label: "Vidrio", responseType: "C_NC_OM_NA" },
        { id: "em3_boton_pulsador", label: "Botón pulsador de señal", responseType: "C_NC_OM_NA" },
        { id: "em3_senalizacion", label: "Señalización", responseType: "C_NC_OM_NA" },
        { id: "em3_prueba", label: "Prueba", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: true,
    },
    {
      id: "estacion_manual_4",
      title: "Estación Manual N° 4",
      items: [
        { id: "em4_ubicacion", label: "Ubicación Estación Manual N° 4", responseType: "TEXT" },
        { id: "em4_pintura", label: "Pintura", responseType: "C_NC_OM_NA" },
        { id: "em4_vidrio", label: "Vidrio", responseType: "C_NC_OM_NA" },
        { id: "em4_boton_pulsador", label: "Botón pulsador de señal", responseType: "C_NC_OM_NA" },
        { id: "em4_senalizacion", label: "Señalización", responseType: "C_NC_OM_NA" },
        { id: "em4_prueba", label: "Prueba", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: true,
    },
  ],
  scoring: { type: "percentage", conformeThreshold: 90, omThreshold: 70 },
  signatureFields: ["Elaborado por", "Revisado por"],
};

// ============================================================
// PERMISOS DE BOMBEROS (PB)
// ============================================================
export const PB_FORM: InspectionFormDef = {
  code: "PB",
  name: "Seguimiento de Permisos de Bomberos",
  description: "Control y seguimiento de permisos de bomberos por establecimiento",
  additionalFields: [],
  sections: [
    {
      id: "datos_permiso",
      title: "Datos del Permiso",
      items: [
        { id: "fecha_emision", label: "Fecha de Emisión", responseType: "DATE" },
        { id: "fecha_vencimiento", label: "Fecha de Vencimiento", responseType: "DATE" },
        { id: "periodicidad", label: "Periodicidad", responseType: "SELECT", options: ["Anual", "Bianual", "Trianual"] },
        { id: "area_m2", label: "Área (m²)", responseType: "NUMBER" },
        { id: "estado", label: "Estado", responseType: "SELECT", options: ["Vigente", "Vencido", "En Trámite", "No Aplica"] },
        { id: "municipio", label: "Municipio", responseType: "TEXT" },
        { id: "vigencia", label: "Vigencia", responseType: "TEXT" },
      ],
      hasObservations: false,
    },
    {
      id: "contacto",
      title: "Información de Contacto",
      items: [
        { id: "contacto_nombre", label: "Nombre de Contacto Bomberos", responseType: "TEXT" },
        { id: "contacto_telefono", label: "Teléfono de Contacto", responseType: "TEXT" },
        { id: "contacto_email", label: "Email de Contacto", responseType: "TEXT" },
        { id: "numero_permiso", label: "Número de Permiso", responseType: "TEXT" },
      ],
      hasObservations: true,
    },
  ],
  scoring: { type: "none" },
  signatureFields: ["Elaborado por", "Revisado por"],
};

// ============================================================
// DOTACIÓN PERIÓDICA (DP)
// ============================================================
export const DP_FORM: InspectionFormDef = {
  code: "DP",
  name: "Dotación Periódica de Uniformes y Protecciones Personales",
  description: "Control de entrega de dotación de uniformes y EPP a trabajadores",
  additionalFields: [
    { id: "cedula", label: "Cédula de Identidad", type: "text", required: true },
  ],
  sections: [
    {
      id: "tallas",
      title: "Tallas del Trabajador",
      items: [
        { id: "talla_camisa", label: "Talla de camisa o chemise", responseType: "TEXT" },
        { id: "talla_pantalon", label: "Talla de pantalón", responseType: "TEXT" },
        { id: "talla_calzado", label: "Talla de calzado de seguridad", responseType: "TEXT" },
      ],
      hasObservations: false,
    },
    {
      id: "dotacion",
      title: "Dotación Entregada",
      items: [
        { id: "dotacion_tipo", label: "Tipo de Dotación", responseType: "SELECT", options: ["Primera dotación", "Renovación", "Reposición", "Dotación especial"] },
        { id: "cantidad_camisas", label: "Cantidad de camisas o chemise", responseType: "NUMBER" },
        { id: "cantidad_pantalones", label: "Cantidad de pantalones", responseType: "NUMBER" },
        { id: "cantidad_calzado", label: "Cantidad de calzado de seguridad o botas", responseType: "NUMBER" },
      ],
      hasObservations: false,
    },
    {
      id: "responsables",
      title: "Responsables",
      items: [
        { id: "recibida_por", label: "Recibida por", responseType: "TEXT" },
        { id: "realizado_por", label: "Realizado por", responseType: "TEXT" },
      ],
      hasObservations: true,
    },
  ],
  scoring: { type: "none" },
  signatureFields: ["Recibida por", "Realizado por"],
};

// ============================================================
// MONTACARGAS SSA (MTCG_SSA)
// ============================================================
export const MTCG_SSA_FORM: InspectionFormDef = {
  code: "MTCG_SSA",
  name: "Inspección SSA de Montacargas",
  description: "Inspección SSA detallada de montacargas (semestral)",
  additionalFields: [
    { id: "ubicacion", label: "Ubicación", type: "text", required: true },
    { id: "equipoNumero", label: "Equipo Número", type: "text", required: true },
    { id: "marca", label: "Marca", type: "text", required: true },
    { id: "modelo", label: "Modelo", type: "text", required: true },
    { id: "serial", label: "Serial Número", type: "text" },
  ],
  sections: [
    {
      id: "documentacion",
      title: "Documentación y Certificación",
      items: [
        { id: "placa_capacidad", label: "Placa y Tabla de Capacidad", responseType: "C_NC_OM_NA" },
        { id: "certificado_operacion", label: "Certificado de Operación", responseType: "C_NC_OM_NA" },
        { id: "libro_vida", label: "Libro de Vida", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: false,
    },
    {
      id: "seguridad",
      title: "Seguridad del Operador",
      items: [
        { id: "techo_protector", label: "Techo Protector", responseType: "C_NC_OM_NA" },
        { id: "asiento_cinturon", label: "Asiento y Cinturón", responseType: "C_NC_OM_NA" },
        { id: "extintor_portatil", label: "Extintor portátil", responseType: "C_NC_OM_NA" },
        { id: "alarma_retroceso", label: "Alarma de Retroceso", responseType: "C_NC_OM_NA" },
        { id: "luces_advertencia", label: "Luces de Advertencia", responseType: "C_NC_OM_NA" },
        { id: "bocina", label: "Bocina (Corneta)", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: false,
    },
    {
      id: "estructura",
      title: "Estructura y Mecánica",
      items: [
        { id: "horquillas", label: "Horquillas (Uñas)", responseType: "C_NC_OM_NA" },
        { id: "alineacion_horquillas", label: "Alineación de Horquillas", responseType: "C_NC_OM_NA" },
        { id: "cadenas_elevacion", label: "Cadenas de Elevación", responseType: "C_NC_OM_NA" },
        { id: "mangueras_hidraulicas", label: "Mangueras Hidráulicas", responseType: "C_NC_OM_NA" },
        { id: "frenos", label: "Frenos (Servicio y Estacionamiento)", responseType: "C_NC_OM_NA" },
        { id: "direccion", label: "Dirección", responseType: "C_NC_OM_NA" },
        { id: "cauchos", label: "Cauchos", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: false,
    },
    {
      id: "motor_escape",
      title: "Motor y Escape",
      items: [
        { id: "integridad_escape", label: "Integridad y Diseño del Escape", responseType: "C_NC_OM_NA" },
        { id: "aislamiento_termico", label: "Aislamiento Térmico", responseType: "C_NC_OM_NA" },
        { id: "emisiones_escape", label: "Emisiones de Escape (Criterio Cualitativo)", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: true,
    },
  ],
  scoring: { type: "percentage", conformeThreshold: 90, omThreshold: 70 },
  signatureFields: ["Elaborado por", "Revisado por"],
};

// ============================================================
// REGISTRY OF ALL FORM DEFINITIONS
// ============================================================
export const FORM_REGISTRY: Record<string, InspectionFormDef> = {
  // Extintores
  EXT: EXT_FORM,
  ti_ext: EXT_FORM,

  // SSA Distribuidoras
  DD: DD_FORM,
  DIST: DD_FORM,
  ti_dd: DD_FORM,
  ti_dist: DD_FORM,

  // Orden y Limpieza
  OL: OL_FORM,
  ti_ol: OL_FORM,

  // SSA Servicentros
  SC: SC_FORM,
  SERV: SC_FORM,
  ti_sc: SC_FORM,
  ti_serv: SC_FORM,

  // Herramientas y Equipos
  HEQ: HEQ_FORM,
  HE: HEQ_FORM,
  IHE: HEQ_FORM,
  ti_he: HEQ_FORM,
  ti_ihe: HEQ_FORM,

  // Montacargas Operacional
  MTCG: MTCG_FORM,
  MC: MTCG_FORM,
  IMC: MTCG_FORM,
  ti_mc: MTCG_FORM,
  ti_imc: MTCG_FORM,

  // Inspección Diaria Vehículo / Vehículo Transporte
  VHT: VHT_FORM,
  IDV: VHT_FORM,
  IDVTC: VHT_FORM,
  ti_idv: VHT_FORM,
  ti_idvtc: VHT_FORM,

  // Evaluación Transporte de Carga
  VTC: VTC_FORM,
  ETC: VTC_FORM,
  ti_etc: VTC_FORM,

  // Fuente Lavaojos Portátil
  FLP: FLP_FORM,
  ti_flp: FLP_FORM,

  // Fuente y Ducha de Emergencia
  FYD: FYD_FORM,
  FD: FYD_FORM,
  FLDE: FYD_FORM,
  ti_fd: FYD_FORM,
  ti_flde: FYD_FORM,

  // Kit para Derrames
  KPD: KPD_FORM,
  KD: KPD_FORM,
  KCD: KPD_FORM,
  ti_kd: KPD_FORM,
  ti_kcd: KPD_FORM,

  // Lámparas de Emergencia
  LEM: LEM_FORM,
  LE: LEM_FORM,
  ILE: LEM_FORM,
  ti_le: LEM_FORM,
  ti_ile: LEM_FORM,

  // Detección de Incendios
  DI: DI_FORM,
  SDID: DI_FORM,
  SDIS: DI_FORM,
  ti_di: DI_FORM,
  ti_sdid: DI_FORM,
  ti_sdis: DI_FORM,

  // Permisos de Bomberos
  PB: PB_FORM,
  ti_pb: PB_FORM,

  // Dotación de Personal y EPP
  DP: DP_FORM,
  DOT: DP_FORM,
  IEP: DP_FORM,
  ti_iep: DP_FORM,

  // Montacargas SSA
  MTCG_SSA: MTCG_SSA_FORM,
  MCSSA: MTCG_SSA_FORM,
  ti_mc_ssa: MTCG_SSA_FORM,

  // Inspección General / Base
  GEN: DD_FORM,
  ti_gen: DD_FORM,
};

/**
 * Resuelve de forma robusta la definición del formulario a partir de cualquier
 * código, ID o texto descriptivo del tipo de inspección.
 */
export function getFormDefinition(identifier?: string): InspectionFormDef | null {
  if (!identifier) return null;
  const raw = identifier.trim();
  const upper = raw.toUpperCase();
  const lower = raw.toLowerCase();

  // Interceptar Distribuidoras (DD) para inyectar criterios en tiempo real administrables
  if (upper === 'DD' || upper === 'DIST' || upper === 'TI_DD' || upper === 'TI_DIST' || lower.includes('distribuidora')) {
    const liveCriterios = criteriosService.getCriteriosDistribuidoras();
    return {
      ...DD_FORM,
      sections: buildSectionsFromCriteria(liveCriterios)
    };
  }

  // Interceptar Servicentros (SC) para inyectar criterios en tiempo real administrables
  if (upper === 'SC' || upper === 'SERV' || upper === 'TI_SC' || upper === 'TI_SERV' || lower.includes('servicentro')) {
    const liveCriterios = criteriosService.getCriteriosServicentros();
    return {
      ...SC_FORM,
      sections: buildSectionsFromCriteria(liveCriterios)
    };
  }

  // 1. Coincidencia directa por código exacto, mayúsculas o minúsculas
  if (FORM_REGISTRY[upper]) return FORM_REGISTRY[upper];
  if (FORM_REGISTRY[raw]) return FORM_REGISTRY[raw];
  if (FORM_REGISTRY[lower]) return FORM_REGISTRY[lower];

  // 2. Coincidencia semántica inteligente por palabras clave
  if (lower.includes('ducha') || lower.includes('lavaojo') || lower.includes('fuente') || lower.includes('flde')) {
    if (lower.includes('portatil') || lower.includes('portátil') || lower === 'flp') return FLP_FORM;
    return FYD_FORM;
  }
  if (lower.includes('extintor') || lower === 'ext') return EXT_FORM;
  if (lower.includes('montacarga') || lower === 'mtcg' || lower === 'imc') {
    if (lower.includes('ssa')) return MTCG_SSA_FORM;
    return MTCG_FORM;
  }
  if (lower.includes('derrame') || lower.includes('kpd') || lower.includes('kcd') || lower.includes('kit')) return KPD_FORM;
  if (lower.includes('lampara') || lower.includes('lámpara') || lower.includes('iluminacion') || lower.includes('iluminación') || lower === 'lem' || lower === 'ile') return LEM_FORM;
  if (lower.includes('vehiculo') || lower.includes('vehículo') || lower.includes('transporte') || lower.includes('idvtc')) {
    if (lower.includes('carga')) return VTC_FORM;
    return VHT_FORM;
  }
  if (lower.includes('herramienta') || lower.includes('equipo') || lower === 'heq' || lower === 'ihe') return HEQ_FORM;
  if (lower.includes('incendio') || lower.includes('deteccion') || lower.includes('detección') || lower.includes('alarma') || lower === 'sdid' || lower === 'sdis' || lower === 'di') return DI_FORM;
  if (lower.includes('orden') || lower.includes('limpieza') || lower === 'ol') return OL_FORM;
  if (lower.includes('distribuidora') || lower === 'dist' || lower === 'dd') return DD_FORM;
  if (lower.includes('servicentro') || lower === 'serv' || lower === 'sc') return SC_FORM;
  if (lower.includes('bombero') || lower === 'pb') return PB_FORM;
  if (lower.includes('dotacion') || lower.includes('dotación') || lower.includes('epp') || lower === 'dp' || lower === 'iep') return DP_FORM;

  return null;
}

// Helper: get total items count
export function getTotalItems(form: InspectionFormDef): number {
  return form.sections.reduce((sum, s) => sum + s.items.length, 0);
}

export interface ScoreResult {
  puntuacion: number;
  resultado: "C" | "NC" | "OM" | "NA";
  nivelCumplimiento?: "ALTO" | "MEDIO" | "BAJO";
  conformes: number;
  noConformes: number;
  observaciones: number; // Oportunidades de Mejora (OM)
  noAplica: number;
  total: number; // Total general de ítems
  totalEvaluados: number; // Base evaluable = C + NC + OM (excluye NA)
  puntosObtenidos: number; // Puntos ponderados: C*1.0 + OM*0.5
  porcentajeConforme: number;
  porcentajeNoConforme: number;
  porcentajeOM: number;
  porcentajeNoAplica: number;
}

/**
 * Normaliza y clasifica cualquier texto o código de respuesta en los 4 cuadrantes estándar:
 * C (Conforme: +1.0 pto)
 * NC (No Conforme: 0 ptos)
 * OM (Oportunidad de Mejora: +0.5 ptos positivos)
 * NA (No Aplica: Excluido de la base evaluable)
 */
export function classifyResponse(raw: string | undefined | null): 'C' | 'NC' | 'OM' | 'NA' | null {
  if (raw === undefined || raw === null || raw === '') return null;
  const v = String(raw).trim().toUpperCase();
  if (['C', 'BUENO', 'SI', 'SÍ', 'OPERATIVO', 'OK', 'CONFORME', 'EXISTE', '1'].includes(v)) return 'C';
  if (['OM', 'OPORTUNIDAD DE MEJORA', 'REGULAR', 'REQUIERE ATENCION', 'OBSERVACION', 'OBSERVACIÓN', 'MEJORA'].includes(v)) return 'OM';
  if (['NC', 'DANADO', 'DAÑADO', 'NO', 'NO OPERATIVO', 'NO CONFORME', 'CRITICO', 'CRÍTICO', 'NO_EXISTE', '0'].includes(v)) return 'NC';
  if (['NA', 'N/A', 'NO APLICA'].includes(v)) return 'NA';
  return null;
}

/**
 * Búsqueda ultra-resiliente de la respuesta asociada a un ítem.
 * Soporta IDs canónicos ("1.1"), claves numéricas simples ("1"), alias ("1_1", "item_1_1"),
 * índice correlativo general (1..173) y prefijos extraídos del label ("1.1 ¿...").
 */
export function resolveItemResponse(
  responses: Record<string, any> | undefined | null,
  item: FormItem
): string | undefined {
  if (!responses || typeof responses !== 'object') return undefined;

  // 1. Coincidencia directa por id canónico (ej: "1.1")
  if (responses[item.id] !== undefined && responses[item.id] !== null && responses[item.id] !== '') {
    return String(responses[item.id]);
  }

  // 2. Coincidencia por alias con guión bajo (ej: "1_1")
  const underId = item.id.replace(/\./g, '_');
  if (responses[underId] !== undefined && responses[underId] !== null && responses[underId] !== '') {
    return String(responses[underId]);
  }

  // 3. Coincidencia con prefijo "item_" (ej: "item_1_1", "item_1.1")
  if (responses[`item_${underId}`] !== undefined && responses[`item_${underId}`] !== null && responses[`item_${underId}`] !== '') {
    return String(responses[`item_${underId}`]);
  }
  if (responses[`item_${item.id}`] !== undefined && responses[`item_${item.id}`] !== null && responses[`item_${item.id}`] !== '') {
    return String(responses[`item_${item.id}`]);
  }

  // 4. Coincidencia por prefijo numérico extraído del label (ej: "1.1 ¿Son suficientes...?" -> "1.1")
  const prefixMatch = item.label ? item.label.match(/^(\d+\.\d+)/) : null;
  if (prefixMatch && responses[prefixMatch[1]] !== undefined && responses[prefixMatch[1]] !== null && responses[prefixMatch[1]] !== '') {
    return String(responses[prefixMatch[1]]);
  }

  // 5. Coincidencia por índice secuencial del criterio (1 a 173) si existe
  if (item.itemIndex !== undefined && responses[String(item.itemIndex)] !== undefined && responses[String(item.itemIndex)] !== null && responses[String(item.itemIndex)] !== '') {
    return String(responses[String(item.itemIndex)]);
  }

  // 6. Coincidencia por num si no hay ambigüedad (ej: en formularios simples)
  if (item.num !== undefined && responses[item.num] !== undefined && responses[item.num] !== null && responses[item.num] !== '') {
    return String(responses[item.num]);
  }

  return undefined;
}

// Helper: calculate score from responses incorporating 0.5 pts for OM and complete indicators
export function calculateScore(
  form: InspectionFormDef,
  responses: Record<string, string>
): ScoreResult {
  let conformes = 0;
  let noConformes = 0;
  let observaciones = 0; // Oportunidad de Mejora (OM) -> Vale 0.5 puntos positivos
  let noAplica = 0;

  // Recorrer las secciones y preguntas del formulario
  for (const section of form.sections) {
    for (const item of section.items) {
      const resolvedVal = resolveItemResponse(responses, item);
      const classification = classifyResponse(resolvedVal);
      if (classification === 'C') conformes++;
      else if (classification === 'NC') noConformes++;
      else if (classification === 'OM') observaciones++;
      else if (classification === 'NA') noAplica++;
    }
  }

  // Base evaluable: C + NC + OM (los ítems NA se excluyen de la base)
  const totalEvaluados = conformes + noConformes + observaciones;
  const totalGeneral = totalEvaluados + noAplica;

  // REGLA CRÍTICA DEL SISTEMA:
  // Cada Conforme (C) = 1.0 punto positivo
  // Cada Oportunidad de Mejora (OM) = 0.5 puntos positivos
  // Cada No Conforme (NC) = 0.0 puntos
  const puntosObtenidos = Number((conformes + (observaciones * 0.5)).toFixed(1));

  // Puntuación global en base 100%
  const puntuacion = totalEvaluados > 0 
    ? Math.round((puntosObtenidos / totalEvaluados) * 100) 
    : (totalGeneral > 0 ? 100 : 0);

  // Porcentajes de distribución técnica
  const porcentajeConforme = totalEvaluados > 0 
    ? Math.round((conformes / totalEvaluados) * 1000) / 10 
    : 0;
  const porcentajeNoConforme = totalEvaluados > 0 
    ? Math.round((noConformes / totalEvaluados) * 1000) / 10 
    : 0;
  const porcentajeOM = totalEvaluados > 0 
    ? Math.round((observaciones / totalEvaluados) * 1000) / 10 
    : 0;
  const porcentajeNoAplica = totalGeneral > 0 
    ? Math.round((noAplica / totalGeneral) * 1000) / 10 
    : 0;

  // REGLA FUNDAMENTAL DE SEGURIDAD INDUSTRIAL DUNCAN:
  // Si existen No Conformidades (NC > 0), el dictamen oficial de la inspección es NO CONFORME (NC).
  // Si no hay NC pero hay Oportunidades de Mejora (OM > 0), el dictamen es OPORTUNIDAD DE MEJORA (OM).
  // Solo se dictamina CONFORME (C) si se cumple el umbral Y no hay No Conformidades.
  const confThresh = form.scoring?.conformeThreshold ?? 80;
  const omThresh = form.scoring?.omThreshold ?? 70;
  let resultado: "C" | "NC" | "OM" | "NA";
  if (totalEvaluados === 0) {
    resultado = "NA";
  } else if (noConformes > 0) {
    resultado = "NC";
  } else if (observaciones > 0 || puntuacion < confThresh) {
    resultado = (puntuacion < omThresh) ? "NC" : "OM";
  } else {
    resultado = "C";
  }

  // Nivel de cumplimiento técnico (ALTO / MEDIO / BAJO)
  let nivelCumplimiento: "ALTO" | "MEDIO" | "BAJO";
  if (noConformes > 0) {
    // Si hay NCs, NUNCA puede ser ALTO
    nivelCumplimiento = (noConformes >= 3 || puntuacion < 70) ? "BAJO" : "MEDIO";
  } else if (observaciones > 3 || puntuacion < 85) {
    nivelCumplimiento = "MEDIO";
  } else if (puntuacion >= 90) {
    nivelCumplimiento = "ALTO";
  } else {
    nivelCumplimiento = "MEDIO";
  }

  return {
    puntuacion,
    resultado,
    nivelCumplimiento,
    conformes,
    noConformes,
    observaciones,
    noAplica,
    total: totalGeneral,
    totalEvaluados,
    puntosObtenidos,
    porcentajeConforme,
    porcentajeNoConforme,
    porcentajeOM,
    porcentajeNoAplica
  };
}
