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
    { id: "agenteExtinguidor", label: "Agente Extinguidor", type: "select", options: ["PQS", "CO2", "H2O"], required: true },
    { id: "capacidad", label: "Capacidad", type: "select", options: ["10 Lbs", "15 Lbs", "20 Lbs", "50 Lbs", "150 Lbs"], required: true },
    { id: "fechaVencimiento", label: "Fecha de Vencimiento", type: "date", required: true },
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
// SSA DISTRIBUIDORAS (DD)
// ============================================================
export const DD_FORM: InspectionFormDef = {
  code: "DD",
  name: "Inspección SSA Distribuidoras",
  description: "Inspección de Seguridad, Salud y Ambiente para distribuidoras del Grupo Duncan",
  additionalFields: [
    { id: "ronda", label: "Ronda N°", type: "number", required: true },
    { id: "fechaCierre", label: "Fecha de Cierre", type: "date" },
  ],
  sections: [
    {
      id: "1_iluminacion",
      title: "1. Iluminación",
      items: [
        { id: "1.1", label: "¿Son suficientes las luminarias según la tarea visual?", responseType: "C_NC_OM_NA" },
        { id: "1.2", label: "¿Luminarias limpias y en buen estado?", responseType: "C_NC_OM_NA" },
        { id: "1.3", label: "¿Luminarias con protección anti-caída/rotura?", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: true,
    },
    {
      id: "2_ventilacion",
      title: "2. Ventilación",
      items: [
        { id: "2.1", label: "¿Ventilación/Extracción adecuada en todas las áreas?", responseType: "C_NC_OM_NA" },
        { id: "2.2", label: "¿Estado funcional de extractores y aires acondicionados?", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: true,
    },
    {
      id: "3_avisos",
      title: "3. Avisos o Señalizaciones",
      items: [
        { id: "3.1", label: '¿Aviso "No Fumar" visible?', responseType: "C_NC_OM_NA" },
        { id: "3.2", label: '¿Aviso "No Discriminación" visible?', responseType: "C_NC_OM_NA" },
        { id: "3.3", label: '¿Aviso "Prohibido Porte de Armas" visible?', responseType: "C_NC_OM_NA" },
        { id: "3.4", label: '¿Aviso "Número 911" visible?', responseType: "C_NC_OM_NA" },
        { id: "3.5", label: "¿Cartelera/Información SSA visible en áreas operativas?", responseType: "C_NC_OM_NA" },
        { id: "3.6", label: "¿Señalización de vías de escape visible?", responseType: "C_NC_OM_NA" },
        { id: "3.7", label: "¿Señalización de riesgos específicos (Eléctrico, NFPA)?", responseType: "C_NC_OM_NA" },
        { id: "3.8", label: "¿Señalización visible de equipos contra incendio?", responseType: "C_NC_OM_NA" },
        { id: "3.9", label: "¿Contenedor de estopas con Rombo DOT 9?", responseType: "C_NC_OM_NA" },
        { id: "3.10", label: "¿Área de baterías con Rombo NFPA 704?", responseType: "C_NC_OM_NA" },
        { id: "3.11", label: "¿Tanques/Cilindros con rombos DOT (3 y 2) y NFPA?", responseType: "C_NC_OM_NA" },
        { id: "3.12", label: "¿Señalización adecuada por tipo de almacén?", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: true,
    },
    {
      id: "4_almacenamiento",
      title: "4. Almacenamiento",
      items: [
        { id: "4.1", label: "¿Almacenamiento apilado, organizado y seguro?", responseType: "C_NC_OM_NA" },
        { id: "4.2", label: "¿Estanterías/Racks en buen estado y anclados?", responseType: "C_NC_OM_NA" },
        { id: "4.3", label: "¿Racks de baterías anclados al suelo?", responseType: "C_NC_OM_NA" },
        { id: "4.4", label: "¿Baterías inservibles protegidas de intemperie?", responseType: "C_NC_OM_NA" },
        { id: "4.5", label: "¿Piso impermeable en área de baterías inservibles?", responseType: "C_NC_OM_NA" },
        { id: "4.6", label: "¿Baterías alejadas de fuentes de calor/energía?", responseType: "C_NC_OM_NA" },
        { id: "4.7", label: "¿Control de fugas de ácido a drenajes?", responseType: "C_NC_OM_NA" },
        { id: "4.8", label: "¿Orden y limpieza en áreas de almacenamiento?", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: true,
    },
    {
      id: "5_herramientas",
      title: "5. Herramientas y Equipos",
      items: [
        { id: "5.1", label: "¿Limpieza alrededor de equipos/herramientas?", responseType: "C_NC_OM_NA" },
        { id: "5.2", label: "¿Equipos y herramientas en buen estado?", responseType: "C_NC_OM_NA" },
        { id: "5.3", label: "¿Existencia de contenedor de estopas usadas?", responseType: "C_NC_OM_NA" },
        { id: "5.4", label: "¿Uso exclusivo del contenedor para estopas/residuos peligrosos?", responseType: "C_NC_OM_NA" },
        { id: "5.5", label: "¿Carretillas/Transpaletas en buen estado?", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: true,
    },
    {
      id: "6_extincion",
      title: "6. Sistemas de Extinción y Detección de Incendios",
      items: [
        { id: "6.1", label: "¿Extintores en sitio y señalizados correctamente?", responseType: "C_NC_OM_NA" },
        { id: "6.2", label: "¿Extintores accesibles sin obstáculos?", responseType: "C_NC_OM_NA" },
        { id: "6.3", label: "¿Extintores con mantenimiento vigente (anual)?", responseType: "C_NC_OM_NA" },
        { id: "6.4", label: "¿Altura de montaje de extintores (10cm - 1.30m)?", responseType: "C_NC_OM_NA" },
        { id: "6.5", label: "¿Posee sistema de detección y alarma?", responseType: "C_NC_OM_NA" },
        { id: "6.6", label: "¿Sistema de detección funcionando correctamente?", responseType: "C_NC_OM_NA" },
        { id: "6.7", label: "¿Luces de emergencia operativas?", responseType: "C_NC_OM_NA" },
        { id: "6.8", label: "¿Estaciones manuales accesibles?", responseType: "C_NC_OM_NA" },
        { id: "6.9", label: "¿Sistema de extinción acorde a COVENIN 1331?", responseType: "C_NC_OM_NA" },
        { id: "6.10", label: "¿Sistema de bombas contra incendio operativo?", responseType: "C_NC_OM_NA" },
        { id: "6.11", label: "¿Distribución adecuada de mangueras y tuberías?", responseType: "C_NC_OM_NA" },
        { id: "6.12", label: "¿Paños de manguera completos y en buen estado?", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: true,
    },
    {
      id: "7_emergencia",
      title: "7. Plan de Emergencia",
      items: [
        { id: "7.1", label: "¿Cuenta con Plan de Emergencia?", responseType: "C_NC_OM_NA" },
        { id: "7.2", label: "¿Cuenta con Brigada de Emergencia formada?", responseType: "C_NC_OM_NA" },
        { id: "7.3", label: "¿Adiestramiento continuo a la brigada?", responseType: "C_NC_OM_NA" },
        { id: "7.4", label: "¿Simulacros de desalojo anuales?", responseType: "C_NC_OM_NA" },
        { id: "7.5", label: "¿Puertas de salida abren fácilmente desde el interior?", responseType: "C_NC_OM_NA" },
        { id: "7.6", label: "¿Puertas de emergencia libres y abren hacia afuera?", responseType: "C_NC_OM_NA" },
        { id: "7.7", label: "¿Pruebas mensuales de presurización documentadas?", responseType: "C_NC_OM_NA" },
        { id: "7.8", label: "¿Existencia de rayado peatonal interno?", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: true,
    },
    {
      id: "8_instalaciones",
      title: "8. Instalaciones y Servicios",
      items: [
        { id: "8.1", label: "¿Mobiliario de oficina en buenas condiciones?", responseType: "C_NC_OM_NA" },
        { id: "8.2", label: "¿Orden y limpieza en oficina?", responseType: "C_NC_OM_NA" },
        { id: "8.3", label: "¿Sistema eléctrico canalizado y protegido?", responseType: "C_NC_OM_NA" },
        { id: "8.4", label: "¿Las regletas y tomas están sin sobrecarga eléctrica?", responseType: "C_NC_OM_NA" },
        { id: "8.5", label: "¿Cerraduras y puertas funcionales?", responseType: "C_NC_OM_NA" },
        { id: "8.6", label: "¿Tanque de agua sanitario operativo?", responseType: "C_NC_OM_NA" },
        { id: "8.7", label: "¿Bomba de agua operativa (si aplica)?", responseType: "C_NC_OM_NA" },
        { id: "8.8", label: "¿Baños con dispensadores de jabón/papel?", responseType: "C_NC_OM_NA" },
        { id: "8.9", label: "¿Piezas sanitarias operativas?", responseType: "C_NC_OM_NA" },
        { id: "8.10", label: "¿Dispensadores dotados de insumos?", responseType: "C_NC_OM_NA" },
        { id: "8.11", label: "¿Baños limpios e higienizados?", responseType: "C_NC_OM_NA" },
        { id: "8.12", label: "¿Suministro adecuado de consumibles de baño?", responseType: "C_NC_OM_NA" },
        { id: "8.13", label: "¿Área de consumibles ordenada y limpia?", responseType: "C_NC_OM_NA" },
        { id: "8.14", label: "¿Espacio habilitado para comedor?", responseType: "C_NC_OM_NA" },
        { id: "8.15", label: "¿Comedor separado de áreas contaminantes?", responseType: "C_NC_OM_NA" },
        { id: "8.16", label: "¿Comedor con climatización adecuada?", responseType: "C_NC_OM_NA" },
        { id: "8.17", label: "¿Equipos de comedor (nevera/mesa) en buen estado?", responseType: "C_NC_OM_NA" },
        { id: "8.18", label: "¿Higiene y orden en el comedor?", responseType: "C_NC_OM_NA" },
        { id: "8.19", label: "¿Filtro de agua higiénico y funcional?", responseType: "C_NC_OM_NA" },
        { id: "8.20", label: "¿Ubicación segura de filtro y botellones?", responseType: "C_NC_OM_NA" },
        { id: "8.21", label: "¿Dispensador de vasos cónicos disponible?", responseType: "C_NC_OM_NA" },
        { id: "8.22", label: "¿Acceso fácil al agua potable?", responseType: "C_NC_OM_NA" },
        { id: "8.23", label: "¿Techos sin goteras ni filtraciones?", responseType: "C_NC_OM_NA" },
        { id: "8.24", label: "¿Paredes sin grietas ni deterioro?", responseType: "C_NC_OM_NA" },
        { id: "8.25", label: "¿Piso nivelado y sin daños?", responseType: "C_NC_OM_NA" },
        { id: "8.26", label: "¿Pintura general en buen estado?", responseType: "C_NC_OM_NA" },
        { id: "8.27", label: "¿Áreas libres de obstrucciones y residuos?", responseType: "C_NC_OM_NA" },
        { id: "8.28", label: "¿Demarcación de piso en áreas operativas?", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: true,
    },
    {
      id: "9_primeros_auxilios",
      title: "9. Primeros Auxilios y Emergencias Químicas",
      items: [
        { id: "9.1", label: "¿Ducha/Lavaojos de emergencia disponible?", responseType: "C_NC_OM_NA" },
        { id: "9.2", label: "¿Componentes de ducha/lavaojos completos?", responseType: "C_NC_OM_NA" },
        { id: "9.3", label: "¿Presión de agua suficiente en ducha/lavaojos?", responseType: "C_NC_OM_NA" },
        { id: "9.4", label: "¿Botiquín visible, señalizado y accesible?", responseType: "C_NC_OM_NA" },
        { id: "9.5", label: "¿Contenido del botiquín según norma?", responseType: "C_NC_OM_NA" },
        { id: "9.6", label: "¿Kit para derrames (ácidos) disponible?", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: true,
    },
    {
      id: "10_epp",
      title: "10. Equipos de Protección Personal",
      items: [
        { id: "10.1", label: "¿Uso adecuado del uniforme?", responseType: "C_NC_OM_NA" },
        { id: "10.2", label: "¿Uniformes en buen estado?", responseType: "C_NC_OM_NA" },
        { id: "10.3", label: "¿Uso correcto de EPP (lentes, guantes, botas)?", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: true,
    },
    {
      id: "11_documentacion",
      title: "11. Documentación Legal y Normativa",
      items: [
        { id: "11.1", label: "¿Política de SSL disponible y actualizada?", responseType: "C_NC_OM_NA" },
        { id: "11.2", label: "¿Hoja de Datos de Seguridad (FDS) visible?", responseType: "C_NC_OM_NA" },
        { id: "11.3", label: "¿Plan de emergencia acorde a COVENIN?", responseType: "C_NC_OM_NA" },
        { id: "11.4", label: "¿Permiso de Bomberos publicado?", responseType: "C_NC_OM_NA" },
        { id: "11.5", label: "¿Permiso de Bomberos vigente?", responseType: "C_NC_OM_NA" },
        { id: "11.6", label: "¿Estadísticas de accidentabilidad actualizadas?", responseType: "C_NC_OM_NA" },
        { id: "11.7", label: "¿Estadísticas de morbilidad actualizadas?", responseType: "C_NC_OM_NA" },
        { id: "11.8", label: "¿Mapa de Riesgo visible?", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: true,
    },
    {
      id: "12_cumplimiento",
      title: "12. Cumplimiento de Inspecciones y Registros",
      items: [
        { id: "12.1", label: "¿Mantenimiento semestral sistema contra incendio?", responseType: "C_NC_OM_NA" },
        { id: "12.2", label: "¿Inspección semestral de extintores?", responseType: "C_NC_OM_NA" },
        { id: "12.3", label: "¿Inspección mensual de orden y limpieza?", responseType: "C_NC_OM_NA" },
        { id: "12.4", label: "¿Inspección mensual de herramientas?", responseType: "C_NC_OM_NA" },
        { id: "12.5", label: "¿Inspección trimestral detección incendios?", responseType: "C_NC_OM_NA" },
        { id: "12.6", label: "¿Inspección mensual luces de emergencia?", responseType: "C_NC_OM_NA" },
        { id: "12.7", label: "¿Inspección mensual Kit derrames?", responseType: "C_NC_OM_NA" },
        { id: "12.8", label: "¿Inspección mensual fuente lavaojos?", responseType: "C_NC_OM_NA" },
        { id: "12.9", label: "¿Registro de Delegados vigente?", responseType: "C_NC_OM_NA" },
        { id: "12.10", label: "¿Registro de CSSL vigente?", responseType: "C_NC_OM_NA" },
        { id: "12.11", label: "¿Reuniones mensuales del CSSL?", responseType: "C_NC_OM_NA" },
        { id: "12.12", label: "¿Libro de actas del CSSL al día?", responseType: "C_NC_OM_NA" },
        { id: "12.13", label: "¿Consignación mensual de minutas al INPSASEL?", responseType: "C_NC_OM_NA" },
        { id: "12.14", label: "¿Informe Epidemiológico sellado por INPSASEL?", responseType: "C_NC_OM_NA" },
        { id: "12.15", label: "¿16 horas trimestrales de formación cumplidas?", responseType: "C_NC_OM_NA" },
        { id: "12.16", label: "¿Programa SST registrado en INPSASEL?", responseType: "C_NC_OM_NA" },
        { id: "12.17", label: "¿Servicio SST registrado y actualizado?", responseType: "C_NC_OM_NA" },
        { id: "12.18", label: "¿RACDA actualizado para la localidad?", responseType: "C_NC_OM_NA" },
        { id: "12.19", label: "¿Póliza de daños ambientales consignada anual?", responseType: "C_NC_OM_NA" },
        { id: "12.20", label: "¿Informe anual de almacenamiento consignado?", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: true,
    },
    {
      id: "13_expedientes",
      title: "13. Expedientes del Trabajador",
      items: [
        { id: "13.1", label: "¿Exámenes médicos periódicos vigentes?", responseType: "C_NC_OM_NA" },
        { id: "13.2", label: "¿Hojas de Ruta de Trabajo en expedientes?", responseType: "C_NC_OM_NA" },
        { id: "13.3", label: "¿Descripción de Cargo en expedientes?", responseType: "C_NC_OM_NA" },
        { id: "13.4", label: "¿Constancia de entrega de EPP en expedientes?", responseType: "C_NC_OM_NA" },
        { id: "13.5", label: "¿Notificación de Riesgos en expedientes?", responseType: "C_NC_OM_NA" },
        { id: "13.6", label: "¿Análisis de Riesgo de Tareas (ART)?", responseType: "C_NC_OM_NA" },
        { id: "13.7", label: "¿Certificación MATPEL vigente en expedientes?", responseType: "C_NC_OM_NA" },
        { id: "13.8", label: "¿Política de SST firmada por trabajadores?", responseType: "C_NC_OM_NA" },
        { id: "13.9", label: "¿Política vial firmada por trabajadores?", responseType: "C_NC_OM_NA" },
        { id: "13.10", label: "¿Notificación de cambios en condiciones de trabajo?", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: true,
    },
    {
      id: "14_hojas_seguimiento",
      title: "14. Hojas de Seguimiento y Transporte",
      items: [
        { id: "14.1", label: "¿Hojas de seguimiento llenas correctamente?", responseType: "C_NC_OM_NA" },
        { id: "14.2", label: "¿Material de impresión hoja seguimiento adecuado?", responseType: "C_NC_OM_NA" },
        { id: "14.3", label: "¿Hojas de transporte llenas correctamente?", responseType: "C_NC_OM_NA" },
        { id: "14.4", label: "¿Material de impresión hoja transporte adecuado?", responseType: "C_NC_OM_NA" },
        { id: "14.5", label: "¿Archivo cronológico de guías/hojas?", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: true,
    },
    {
      id: "15_montacargas",
      title: "15. Montacargas",
      items: [
        { id: "15.1", label: "¿Montacargas en buenas condiciones generales?", responseType: "C_NC_OM_NA" },
        { id: "15.2", label: "¿Extintor del montacargas vigente y fijo?", responseType: "C_NC_OM_NA" },
        { id: "15.3", label: "¿Cinturón de seguridad en buen estado?", responseType: "C_NC_OM_NA" },
        { id: "15.4", label: "¿Uso del cinturón por el operador?", responseType: "C_NC_OM_NA" },
        { id: "15.5", label: "¿Luces frontales operativas?", responseType: "C_NC_OM_NA" },
        { id: "15.6", label: "¿Alarma de retroceso/pito operativo?", responseType: "C_NC_OM_NA" },
        { id: "15.7", label: "¿Bocina operativa?", responseType: "C_NC_OM_NA" },
        { id: "15.8", label: "¿Registro de inspección diaria?", responseType: "C_NC_OM_NA" },
        { id: "15.9", label: "¿Plan de mantenimiento (trazabilidad)?", responseType: "C_NC_OM_NA" },
        { id: "15.10", label: "¿Licencia de 5ta grado vigente (Operador)?", responseType: "C_NC_OM_NA" },
        { id: "15.11", label: "¿Certificado médico vigente (Operador)?", responseType: "C_NC_OM_NA" },
        { id: "15.12", label: "¿Evaluación médica especial (Visual/Auditiva)?", responseType: "C_NC_OM_NA" },
        { id: "15.13", label: "¿Certificación de manejo de montacargas?", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: true,
    },
    {
      id: "16_cilindros",
      title: "16. Cilindros de Gas",
      items: [
        { id: "16.1", label: "¿Cilindros en buen estado?", responseType: "C_NC_OM_NA" },
        { id: "16.2", label: "¿Cilindros verticales y asegurados?", responseType: "C_NC_OM_NA" },
        { id: "16.3", label: "¿Protección contra calor/sol?", responseType: "C_NC_OM_NA" },
        { id: "16.4", label: "¿Área ventilada y sin combustibles cerca?", responseType: "C_NC_OM_NA" },
        { id: "16.5", label: "¿Uso de carros/cestas para traslado?", responseType: "C_NC_OM_NA" },
        { id: "16.6", label: "¿Identificación del tipo de gas?", responseType: "C_NC_OM_NA" },
        { id: "16.7", label: "¿Colmenas/Estructuras sin óxido/daños?", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: true,
    },
    {
      id: "17_tanques",
      title: "17. Tanques de Combustible",
      items: [
        { id: "17.1", label: "¿Tanques estructuralmente sanos?", responseType: "C_NC_OM_NA" },
        { id: "17.2", label: "¿Superficie sólida y nivelada?", responseType: "C_NC_OM_NA" },
        { id: "17.3", label: "¿Muro de contención adecuado?", responseType: "C_NC_OM_NA" },
        { id: "17.4", label: "¿Capacidad del muro 110% del tanque mayor?", responseType: "C_NC_OM_NA" },
        { id: "17.5", label: "¿Alejado de fuentes de ignición?", responseType: "C_NC_OM_NA" },
        { id: "17.6", label: "¿Ubicación en área abierta/ventilada?", responseType: "C_NC_OM_NA" },
        { id: "17.7", label: "¿Distancia mínima de 6m a edificaciones?", responseType: "C_NC_OM_NA" },
        { id: "17.8", label: "¿Equipos eléctricos clasificados (antiexplosivos)?", responseType: "C_NC_OM_NA" },
        { id: "17.9", label: "¿Disposición final aceites según norma?", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: true,
    },
    {
      id: "18_vehiculos",
      title: "18. Flota Vehicular",
      items: [
        { id: "18.1", label: "¿Inspección diaria de vehículos realizada?", responseType: "C_NC_OM_NA" },
        { id: "18.3", label: "¿Carga de salida dentro de capacidad?", responseType: "C_NC_OM_NA" },
        { id: "18.4", label: "¿Carga de retorno dentro de capacidad?", responseType: "C_NC_OM_NA" },
        { id: "18.5", label: "¿Desgaste de cauchos aceptable?", responseType: "C_NC_OM_NA" },
        { id: "18.6", label: "¿Trazabilidad de mantenimiento?", responseType: "C_NC_OM_NA" },
        { id: "18.7", label: "¿Kit lavaojos en unidades?", responseType: "C_NC_OM_NA" },
        { id: "18.8", label: "¿Kit de derrames en unidades?", responseType: "C_NC_OM_NA" },
        { id: "18.9", label: "¿Señalización ONU/RACDA/Rombo 9 visible?", responseType: "C_NC_OM_NA" },
        { id: "18.10", label: "¿Documentación completa en flota?", responseType: "C_NC_OM_NA" },
        { id: "18.11", label: "¿Implementos de emergencia (Gato, triángulo)?", responseType: "C_NC_OM_NA" },
        { id: "18.12", label: "¿Cinturones de seguridad operativos?", responseType: "C_NC_OM_NA" },
        { id: "18.13", label: "¿Licencia 5ta y Certificado Médico vigentes?", responseType: "C_NC_OM_NA" },
        { id: "18.14", label: "¿Vehículos en buenas condiciones generales?", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: true,
    },
  ],
  scoring: { type: "percentage", conformeThreshold: 90, omThreshold: 70 },
  signatureFields: ["Elaborado por", "Revisado por"],
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
// SSA SERVICENTROS (SC)
// ============================================================
export const SC_FORM: InspectionFormDef = {
  code: "SC",
  name: "Inspección SSA Servicentros",
  description: "Inspección de Seguridad, Salud y Ambiente para servicentros del Grupo Duncan (117 criterios)",
  additionalFields: [
    { id: "ronda", label: "Ronda N°", type: "number", required: true },
    { id: "fechaCierre", label: "Fecha de Cierre", type: "date" },
  ],
  sections: [
    {
      id: "1_iluminacion",
      title: "1. Iluminación",
      items: [
        { id: "1.1", label: "¿Es suficiente la iluminación (natural o artificial) en las áreas?", responseType: "C_NC_OM_NA" },
        { id: "1.2", label: "¿Están las luminarias limpias y operativas?", responseType: "C_NC_OM_NA" },
        { id: "1.3", label: "¿Tienen las luminarias protección contra caída o rotura?", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: true,
    },
    {
      id: "2_ventilacion",
      title: "2. Ventilación",
      items: [
        { id: "2.1", label: "¿Es adecuada la ventilación/extracción en todas las áreas?", responseType: "C_NC_OM_NA" },
        { id: "2.2", label: "¿Están operativos los extractores y aires acondicionados?", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: true,
    },
    {
      id: "3_avisos",
      title: "3. Avisos o Señalizaciones",
      items: [
        { id: "3.1", label: "¿Aviso de \"No Fumar\" visible y fijado?", responseType: "C_NC_OM_NA" },
        { id: "3.2", label: "¿Aviso de \"No Discriminación\" visible?", responseType: "C_NC_OM_NA" },
        { id: "3.3", label: "¿Aviso de \"Prohibición de Armas\" visible?", responseType: "C_NC_OM_NA" },
        { id: "3.4", label: "¿Aviso del número de emergencia 911 visible?", responseType: "C_NC_OM_NA" },
        { id: "3.5", label: "¿Cartelera informativa de SSA visible en áreas operativas?", responseType: "C_NC_OM_NA" },
        { id: "3.6", label: "¿Señalización de vías de escape visible y fijada?", responseType: "C_NC_OM_NA" },
        { id: "3.7", label: "¿Señalización de riesgos específicos (Eléctrico, NFPA, DOT)?", responseType: "C_NC_OM_NA" },
        { id: "3.8", label: "¿Señalización visible de equipos contra incendio (sin obstáculos)?", responseType: "C_NC_OM_NA" },
        { id: "3.9", label: "¿Contenedor de estopas identificado con Rombo ONU 9?", responseType: "C_NC_OM_NA" },
        { id: "3.10", label: "¿Área de baterías identificada con Rombo NFPA 704?", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: true,
    },
    {
      id: "4_almacenamiento",
      title: "4. Almacenamiento",
      items: [
        { id: "4.1", label: "¿Almacenamiento apilado y organizado en racks/zonas?", responseType: "C_NC_OM_NA" },
        { id: "4.2", label: "¿Estanterías y racks en buen estado y anclados?", responseType: "C_NC_OM_NA" },
        { id: "4.3", label: "¿Baterías inservibles protegidas de la intemperie?", responseType: "C_NC_OM_NA" },
        { id: "4.4", label: "¿Piso impermeable en área de baterías (evita filtración ácida)?", responseType: "C_NC_OM_NA" },
        { id: "4.5", label: "¿Baterías alejadas de fuentes de calor o energía?", responseType: "C_NC_OM_NA" },
        { id: "4.6", label: "¿Se garantiza que el ácido no llegue a drenajes o aguas?", responseType: "C_NC_OM_NA" },
        { id: "4.7", label: "¿Orden y limpieza en áreas de almacenamiento?", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: true,
    },
    {
      id: "5_herramientas",
      title: "5. Herramientas y Equipos",
      items: [
        { id: "5.1", label: "¿Áreas de equipos y herramientas limpias y ordenadas?", responseType: "C_NC_OM_NA" },
        { id: "5.2", label: "¿Equipos y herramientas en buenas condiciones?", responseType: "C_NC_OM_NA" },
        { id: "5.3", label: "¿Existe contenedor para estopas usadas?", responseType: "C_NC_OM_NA" },
        { id: "5.4", label: "¿Contenedor de estopas solo tiene residuos permitidos?", responseType: "C_NC_OM_NA" },
        { id: "5.5", label: "¿Carretillas y transpaletas en buen estado (ruedas, gatos)?", responseType: "C_NC_OM_NA" },
        { id: "5.6", label: "¿Mantenimiento de orden y limpieza en almacenes?", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: true,
    },
    {
      id: "6_extincion",
      title: "6. Sistemas de Extinción y Detección de Incendios",
      items: [
        { id: "6.1", label: "¿Extintores señalizados, con instrucciones y vigentes?", responseType: "C_NC_OM_NA" },
        { id: "6.2", label: "¿Extintores accesibles y sin obstáculos?", responseType: "C_NC_OM_NA" },
        { id: "6.3", label: "¿Extintores con mantenimiento anual vigente?", responseType: "C_NC_OM_NA" },
        { id: "6.4", label: "¿Altura de extintores correcta (10cm a 1.30m)?", responseType: "C_NC_OM_NA" },
        { id: "6.5", label: "¿Existe sistema de detección y alarma de incendios?", responseType: "C_NC_OM_NA" },
        { id: "6.6", label: "¿El sistema de detección funciona correctamente?", responseType: "C_NC_OM_NA" },
        { id: "6.7", label: "¿Luces de emergencia operativas y buen estado?", responseType: "C_NC_OM_NA" },
        { id: "6.8", label: "¿Estaciones manuales libres de obstáculos y buen estado?", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: true,
    },
    {
      id: "7_emergencias",
      title: "7. Atención de Emergencias",
      items: [
        { id: "7.1", label: "¿Se cuenta con Plan de Emergencia documentado?", responseType: "C_NC_OM_NA" },
        { id: "7.2", label: "¿Personal formado en brigada de emergencia integral?", responseType: "C_NC_OM_NA" },
        { id: "7.3", label: "¿Existe adiestramiento continuo para la brigada?", responseType: "C_NC_OM_NA" },
        { id: "7.4", label: "¿Se realizan simulacros de desalojo anuales?", responseType: "C_NC_OM_NA" },
        { id: "7.5", label: "¿Puertas de salida abren fácilmente desde el interior?", responseType: "C_NC_OM_NA" },
        { id: "7.6", label: "¿Puertas de emergencia libres y abren hacia afuera?", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: true,
    },
    {
      id: "8_instalaciones",
      title: "8. Instalaciones del Local",
      items: [
        { id: "8.1", label: "¿Mobiliario de oficina ergonómico y en buen estado?", responseType: "C_NC_OM_NA" },
        { id: "8.2", label: "¿Oficina de ventas ordenada y limpia?", responseType: "C_NC_OM_NA" },
        { id: "8.3", label: "¿Cableado eléctrico canalizado y protegido?", responseType: "C_NC_OM_NA" },
        { id: "8.4", label: "¿Regletas y tomas sin sobrecarga eléctrica?", responseType: "C_NC_OM_NA" },
        { id: "8.5", label: "¿Puertas y cerraduras funcionan correctamente?", responseType: "C_NC_OM_NA" },
        { id: "8.6", label: "¿Tanque de agua sanitario operativo para contingencias?", responseType: "C_NC_OM_NA" },
        { id: "8.7", label: "¿Bomba de agua operativa (si aplica tanque subterráneo)?", responseType: "C_NC_OM_NA" },
        { id: "8.8", label: "¿Baños con dispensadores de jabón y papel?", responseType: "C_NC_OM_NA" },
        { id: "8.9", label: "¿Piezas sanitarias funcionales y en buen estado?", responseType: "C_NC_OM_NA" },
        { id: "8.10", label: "¿Dispensadores de baños con suministro activo?", responseType: "C_NC_OM_NA" },
        { id: "8.11", label: "¿Higiene y limpieza garantizada en baños?", responseType: "C_NC_OM_NA" },
        { id: "8.12", label: "¿Suministro adecuado de papel, jabón y secante?", responseType: "C_NC_OM_NA" },
        { id: "8.13", label: "¿Almacén de consumibles de limpieza ordenado?", responseType: "C_NC_OM_NA" },
        { id: "8.14", label: "¿Existe espacio habilitado para comedor?", responseType: "C_NC_OM_NA" },
        { id: "8.15", label: "¿Comedor separado de áreas de trabajo/contaminantes?", responseType: "C_NC_OM_NA" },
        { id: "8.16", label: "¿Comedor con temperatura/clima adecuado?", responseType: "C_NC_OM_NA" },
        { id: "8.17", label: "¿Equipos de comedor (nevera, microondas) higiénicos?", responseType: "C_NC_OM_NA" },
        { id: "8.18", label: "¿Orden y limpieza en el área de comedor?", responseType: "C_NC_OM_NA" },
        { id: "8.19", label: "¿Filtro de agua funcional e higiénico?", responseType: "C_NC_OM_NA" },
        { id: "8.20", label: "¿Filtro y botellones alejados de contaminación?", responseType: "C_NC_OM_NA" },
        { id: "8.21", label: "¿Dispensador de vasos cónicos disponible?", responseType: "C_NC_OM_NA" },
        { id: "8.22", label: "¿Filtro de agua accesible a todos?", responseType: "C_NC_OM_NA" },
        { id: "8.23", label: "¿Techo sin goteras y con drenaje pluvial?", responseType: "C_NC_OM_NA" },
        { id: "8.24", label: "¿Paredes sin grietas ni deterioro?", responseType: "C_NC_OM_NA" },
        { id: "8.25", label: "¿Piso nivelado, sin grietas ni humedad?", responseType: "C_NC_OM_NA" },
        { id: "8.26", label: "¿Pintura general en buen estado?", responseType: "C_NC_OM_NA" },
        { id: "8.27", label: "¿Áreas de circulación libres de obstáculos?", responseType: "C_NC_OM_NA" },
        { id: "8.28", label: "¿Demarcación de pisos visible y en buen estado?", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: true,
    },
    {
      id: "9_proteccion_colectiva",
      title: "9. Equipos de Protección Colectiva",
      items: [
        { id: "9.1", label: "¿Existe ducha o fuente lavaojos de emergencia?", responseType: "C_NC_OM_NA" },
        { id: "9.2", label: "¿Ducha/Lavaojos completa y en buen estado?", responseType: "C_NC_OM_NA" },
        { id: "9.3", label: "¿Presión de agua suficiente en ducha/lavaojos?", responseType: "C_NC_OM_NA" },
        { id: "9.4", label: "¿Botiquín visible, señalizado y adherido a pared?", responseType: "C_NC_OM_NA" },
        { id: "9.5", label: "¿El botiquín cuenta con todos los insumos según norma COVENIN 3478?", responseType: "C_NC_OM_NA" },
        { id: "9.6", label: "¿Kit para control de derrames ácidos disponible?", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: true,
    },
    {
      id: "10_epp",
      title: "10. Uniforme y Equipo de Protección Personal",
      items: [
        { id: "10.1", label: "¿Uso adecuado del uniforme por trabajadores?", responseType: "C_NC_OM_NA" },
        { id: "10.2", label: "¿Uniformes en buen estado?", responseType: "C_NC_OM_NA" },
        { id: "10.3", label: "¿Uso correcto de EPP (lentes, guantes, botas)?", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: true,
    },
    {
      id: "11_cartelera",
      title: "11. Cartelera de Seguridad, Salud y Ambiente",
      items: [
        { id: "11.1", label: "¿Política de SSL disponible y actualizada?", responseType: "C_NC_OM_NA" },
        { id: "11.2", label: "¿FDS (Hoja de Seguridad) de Baterías visible en almacén?", responseType: "C_NC_OM_NA" },
        { id: "11.3", label: "¿Plan de Emergencia cumple COVENIN 823-2?", responseType: "C_NC_OM_NA" },
        { id: "11.4", label: "¿Permiso de Bomberos publicado en cartelera?", responseType: "C_NC_OM_NA" },
        { id: "11.5", label: "¿Permiso de Bomberos vigente?", responseType: "C_NC_OM_NA" },
        { id: "11.6", label: "¿Índices de accidentabilidad actualizados?", responseType: "C_NC_OM_NA" },
        { id: "11.7", label: "¿Índices de morbilidad actualizados?", responseType: "C_NC_OM_NA" },
        { id: "11.8", label: "¿Mapa de riesgos publicado y visible?", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: true,
    },
    {
      id: "12_gestion",
      title: "12. Gestión de Seguridad, Salud y Ambiente",
      items: [
        { id: "12.1", label: "¿Mantenimiento semestral sistema contra incendios?", responseType: "C_NC_OM_NA" },
        { id: "12.2", label: "¿Inspección de extintores (Semestral)?", responseType: "C_NC_OM_NA" },
        { id: "12.3", label: "¿Inspección mensual de Orden y Limpieza?", responseType: "C_NC_OM_NA" },
        { id: "12.4", label: "¿Inspección mensual de herramientas?", responseType: "C_NC_OM_NA" },
        { id: "12.5", label: "¿Inspección trimestral detección de incendios?", responseType: "C_NC_OM_NA" },
        { id: "12.6", label: "¿Inspección mensual luces de emergencia?", responseType: "C_NC_OM_NA" },
        { id: "12.7", label: "¿Inspección mensual Kit de derrames?", responseType: "C_NC_OM_NA" },
        { id: "12.8", label: "¿Inspección mensual fuente lavaojos?", responseType: "C_NC_OM_NA" },
        { id: "12.9", label: "¿Registro de Delegados de Prevención vigente?", responseType: "C_NC_OM_NA" },
        { id: "12.10", label: "¿Registro de CSSL vigente?", responseType: "C_NC_OM_NA" },
        { id: "12.11", label: "¿Reuniones mensuales del CSSL realizadas?", responseType: "C_NC_OM_NA" },
        { id: "12.12", label: "¿Minutas del CSSL transcritas al Libro de Actas?", responseType: "C_NC_OM_NA" },
        { id: "12.13", label: "¿Minutas consignadas mensualmente al INPSASEL?", responseType: "C_NC_OM_NA" },
        { id: "12.14", label: "¿Informe Epidemiológico sellado por INPSASEL?", responseType: "C_NC_OM_NA" },
        { id: "12.15", label: "¿Cumplimiento de 16 horas trimestrales de formación?", responseType: "C_NC_OM_NA" },
        { id: "12.16", label: "¿Programa de SST registrado ante INPSASEL?", responseType: "C_NC_OM_NA" },
        { id: "12.17", label: "¿Servicio de SST registrado y actualizado?", responseType: "C_NC_OM_NA" },
        { id: "12.18", label: "¿RACDA actualizado para la localidad?", responseType: "C_NC_OM_NA" },
        { id: "12.19", label: "¿Póliza de Daños Ambientales consignada (anual)?", responseType: "C_NC_OM_NA" },
        { id: "12.20", label: "¿Informe Anual de Almacenamiento consignado?", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: true,
    },
    {
      id: "13_expedientes",
      title: "13. Expedientes de los Colaboradores",
      items: [
        { id: "13.1", label: "¿Exámenes médicos (Pre, Post, Vacacional) vigentes?", responseType: "C_NC_OM_NA" },
        { id: "13.2", label: "¿Hojas de Ruta de Trabajo en expedientes?", responseType: "C_NC_OM_NA" },
        { id: "13.3", label: "¿Descripción de Cargo en expedientes?", responseType: "C_NC_OM_NA" },
        { id: "13.4", label: "¿Constancia de entrega de EPP en expedientes?", responseType: "C_NC_OM_NA" },
        { id: "13.5", label: "¿Notificación de Riesgos (Principios de Prevención)?", responseType: "C_NC_OM_NA" },
        { id: "13.6", label: "¿Análisis de Riesgo de Tareas (ART) disponible?", responseType: "C_NC_OM_NA" },
        { id: "13.7", label: "¿Certificación MATPEL vigente en expedientes?", responseType: "C_NC_OM_NA" },
        { id: "13.8", label: "¿Política de SST firmada por trabajadores?", responseType: "C_NC_OM_NA" },
        { id: "13.9", label: "¿Política de Seguridad Vial firmada?", responseType: "C_NC_OM_NA" },
        { id: "13.10", label: "¿Notificación de cambios de condiciones realizada?", responseType: "C_NC_OM_NA" },
      ],
      hasObservations: true,
    },
  ],
  scoring: { type: "percentage", conformeThreshold: 90, omThreshold: 70 },
  signatureFields: ["Inspección realizada por", "Acompañante de la Inspección"],
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
  EXT: EXT_FORM,
  DD: DD_FORM,
  OL: OL_FORM,
  SC: SC_FORM,
  HEQ: HEQ_FORM,
  MTCG: MTCG_FORM,
  VHT: VHT_FORM,
  VTC: VTC_FORM,
  FLP: FLP_FORM,
  FYD: FYD_FORM,
  KPD: KPD_FORM,
  LEM: LEM_FORM,
  DI: DI_FORM,
  PB: PB_FORM,
  DP: DP_FORM,
  MTCG_SSA: MTCG_SSA_FORM,
};

// Helper: get total items count
export function getTotalItems(form: InspectionFormDef): number {
  return form.sections.reduce((sum, s) => sum + s.items.length, 0);
}

// Helper: calculate score from responses
export function calculateScore(
  form: InspectionFormDef,
  responses: Record<string, string>
): { puntuacion: number; resultado: "C" | "NC" | "OM" | "NA"; conformes: number; noConformes: number; observaciones: number; noAplica: number; total: number } {
  let conformes = 0, noConformes = 0, observaciones = 0, noAplica = 0;
  
  if (form.scoring.type === "percentage") {
    for (const section of form.sections) {
      for (const item of section.items) {
        const val = responses[item.id];
        if (val === "C") conformes++;
        else if (val === "NC") noConformes++;
        else if (val === "OM") observaciones++;
        else if (val === "NA") noAplica++;
      }
    }
    const evaluated = conformes + noConformes + observaciones;
    const puntuacion = evaluated > 0 ? Math.round((conformes / evaluated) * 100) : 0;
    const resultado = puntuacion >= (form.scoring.conformeThreshold ?? 90) ? "C" : puntuacion >= (form.scoring.omThreshold ?? 70) ? "OM" : "NC";
    return { puntuacion, resultado, conformes, noConformes, observaciones, noAplica, total: evaluated + noAplica };
  }
  
  if (form.scoring.type === "operatividad") {
    const op = responses["operatividad"];
    const bueno = Object.entries(responses).filter(([k, v]) => k !== "operatividad" && k !== "accionRequerida" && v === "Bueno").length;
    const danado = Object.entries(responses).filter(([_k, v]) => v === "Dañado").length;
    const total = bueno + danado;
    const puntuacion = total > 0 ? Math.round((bueno / total) * 100) : (op === "Operativo" ? 100 : 0);
    return { puntuacion, resultado: op === "Operativo" ? "C" : "NC", conformes: bueno, noConformes: danado, observaciones: 0, noAplica: 0, total };
  }
  
  if (form.scoring.type === "si_no_count") {
    // For Sí/No type, "Sí" on positive questions = conforme
    const si = Object.values(responses).filter(v => v === "Si").length;
    const no = Object.values(responses).filter(v => v === "No").length;
    const total = si + no;
    const puntuacion = total > 0 ? Math.round((si / total) * 100) : 0;
    const resultado = puntuacion >= 90 ? "C" : puntuacion >= 70 ? "OM" : "NC";
    return { puntuacion, resultado, conformes: si, noConformes: no, observaciones: 0, noAplica: 0, total };
  }
  
  return { puntuacion: 0, resultado: "NA", conformes: 0, noConformes: 0, observaciones: 0, noAplica: 0, total: 0 };
}
