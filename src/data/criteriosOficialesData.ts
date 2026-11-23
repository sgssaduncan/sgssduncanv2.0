// =========================================================================
// SGD DUNCAN 2.0 — CATÁLOGO MAESTRO DE CRITERIOS, LISTAS, FLOTA Y PESOS
// Extraído de la especificación oficial: CRITERIOS_SGD.xlsm
// =========================================================================

export interface CriterioEvaluacion {
  item: number;
  conjunto: number;
  num: string;
  aspecto: string;
  pregunta: string;
  preguntaResumida: string;
  aspectoLegal: string;
  grupoPilar: 'INFRA' | 'LEGAL' | 'SSA' | 'VEHCP' | string;
  areaResponsable: string;
}

export interface FrecuenciaInspeccion {
  item: number;
  ubicacion: 'Distribuidora' | 'Servicentro' | string;
  inspeccion: string;
  area: string;
  frecuencia: 'Diaria' | 'Quincenal' | 'Mensual' | 'Trimestral' | 'Semestral' | string;
  formularioLink: string;
  responsables: string;
}

export interface VehiculoFlotaOficial {
  item: number;
  placas: string;
  marca: string;
  modelo: string;
  ano: number;
  capacidadCargaKg: number;
  distribuidora: string;
  observaciones: string;
}

export interface ModeloBateriaOficial {
  num: number;
  mercado: string;
  marca: string;
  familia: string;
  denominacion: string;
  voltaje: number;
  pesoKg: number;
}

export interface ListasMaestras {
  agentesExtinguidores: string[];
  capacidadesExtintores: string[];
  condiciones: string[];
  operatividades: string[];
  accionesRequeridas: string[];
  meses: string[];
  anos: number[];
  empresas: { nombre: string; abrev: string; rif: string }[];
  distribuidoras: { nombre: string; tblNombre: string }[];
  servicentros: { localidad: string; nombre: string; abrev: string }[];
}

// 1. CRITERIOS OFICIALES DE DISTRIBUIDORAS (173 ÍTEMS)
export const CRITERIOS_DISTRIBUIDORAS_OFICIALES: CriterioEvaluacion[] = [
  {
    "item": 1,
    "conjunto": 1,
    "num": "1",
    "aspecto": "Iluminación",
    "pregunta": "1.1 ¿En caso de no ser idónea la luz natural, son suficientes la luminarias encontradas en las distintas áreas de trabajo? COVENIN 2249",
    "preguntaResumida": "1.1 ¿Son suficientes las luminarias según la tarea visual?",
    "aspectoLegal": "COVENIN 2249:1993 (Iluminancias en tareas y áreas de trabajo).",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS"
  },
  {
    "item": 2,
    "conjunto": 1,
    "num": "2",
    "aspecto": "Iluminación",
    "pregunta": "1.2 ¿Las luminarias están limpias y en buenas condiciones?",
    "preguntaResumida": "1.2 ¿Luminarias limpias y en buen estado?",
    "aspectoLegal": "RCHST Art. 126; COVENIN 2249:1993.",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS"
  },
  {
    "item": 3,
    "conjunto": 1,
    "num": "3",
    "aspecto": "Iluminación",
    "pregunta": "1.3 ¿Las luminarias se encuentran protegidas (con guardas o dispositivos de sujeción), de manera que se previene riesgo de caída de elementos de las bombillas o fluorescentes?",
    "preguntaResumida": "1.3 ¿Luminarias con protección anti-caída/rotura?",
    "aspectoLegal": "RCHST (Reglamento de las Condiciones de Higiene y Seguridad).",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS"
  },
  {
    "item": 4,
    "conjunto": 2,
    "num": "1",
    "aspecto": "Ventilación",
    "pregunta": "2.1 ¿La ventilación y extracción de aire es adecuada en cada una de las áreas? (Área de servicio técnico, área de carga, oficina de ventas",
    "preguntaResumida": "2.1 ¿Ventilación/Extracción adecuada en todas las áreas?",
    "aspectoLegal": "RCHST Cap. III; COVENIN 2254:1995 (Calor y Frío).",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS"
  },
  {
    "item": 5,
    "conjunto": 2,
    "num": "2",
    "aspecto": "Ventilación",
    "pregunta": "2.2 ¿Se encuentran en buenas condiciones los extractores de aire y/o ventiladores? (Se comprueba si es adecuado el funcionamiento de los aires acondicionados en las oficinas administrativas y comedor) COVENIN 2254-95",
    "preguntaResumida": "2.2 ¿Estado funcional de extractores y aires acondicionados?",
    "aspectoLegal": "COVENIN 2254:1995; RCHST Art. 109-110.",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS"
  },
  {
    "item": 6,
    "conjunto": 3,
    "num": "1",
    "aspecto": "Avisos o Señalizaciones según Norma Covenin 187-2003",
    "pregunta": "3.1 ¿El Aviso de No Fumar se encuentra claramente visible y correctamente fijado a la pared?",
    "preguntaResumida": "3.1 ¿Aviso \"No Fumar\" visible?",
    "aspectoLegal": "Resolución Min. Salud 030; LOPCYMAT Art. 53.",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 7,
    "conjunto": 3,
    "num": "2",
    "aspecto": "Avisos o Señalizaciones según Norma Covenin 187-2003",
    "pregunta": "3.2 ¿El  Aviso de No Discriminación se encuentra claramente visible y correctamente fijado a la pared?",
    "preguntaResumida": "3.2 ¿Aviso \"No Discriminación\" visible?",
    "aspectoLegal": "LOTTT; Constitución RBV.",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 8,
    "conjunto": 3,
    "num": "3",
    "aspecto": "Avisos o Señalizaciones según Norma Covenin 187-2003",
    "pregunta": "3.3 ¿El Aviso de Prohibición de porte de armas se encuentra claramente visible y correctamente fijado a la pared?",
    "preguntaResumida": "3.3 ¿Aviso \"Prohibido Porte de Armas\" visible?",
    "aspectoLegal": "Ley para el Desarme y Control de Armas y Municiones.",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 9,
    "conjunto": 3,
    "num": "4",
    "aspecto": "Avisos o Señalizaciones según Norma Covenin 187-2003",
    "pregunta": "3.4 ¿El Aviso del 911* se encuentra claramente visible y correctamente fijado a la pared?",
    "preguntaResumida": "3.4 ¿Aviso \"Número 911\" visible?",
    "aspectoLegal": "COVENIN 2226:1990 (Plan de Emergencias).",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 10,
    "conjunto": 3,
    "num": "5",
    "aspecto": "Avisos o Señalizaciones según Norma Covenin 187-2003",
    "pregunta": "3.5 ¿El cartel de información de SSA se encuentra en las áreas operativas de forma visible y correctamente fijado a la pared?",
    "preguntaResumida": "3.5 ¿Cartelera/Información SSA visible en áreas operativas?",
    "aspectoLegal": "LOPCYMAT Art. 53 Num. 1; NT-04-2023.",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 11,
    "conjunto": 3,
    "num": "6",
    "aspecto": "Avisos o Señalizaciones según Norma Covenin 187-2003",
    "pregunta": "3.6 ¿Todas las áreas cuentan con su señalización de vía de escape y se encuentran claramente visibles y correctamente fijados a la pared?",
    "preguntaResumida": "3.6 ¿Señalización de vías de escape visible?",
    "aspectoLegal": "COVENIN 810:1998; COVENIN 187:1992.",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 12,
    "conjunto": 3,
    "num": "7",
    "aspecto": "Avisos o Señalizaciones según Norma Covenin 187-2003",
    "pregunta": "3.7 ¿Los equipos que puedan ocasionar daños a la salud de los trabajadores se encuentran claramente visibles y correctamente fijados a la pared (peligro elétrico, NFPA 704, DOT, entre otros)?",
    "preguntaResumida": "3.7 ¿Señalización de riesgos específicos (Eléctrico, NFPA)?",
    "aspectoLegal": "COVENIN 187:1992; NFPA 704.",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 13,
    "conjunto": 3,
    "num": "8",
    "aspecto": "Avisos o Señalizaciones según Norma Covenin 187-2003",
    "pregunta": "3.8 ¿Los equipos y sistemas de detección y extinción de incendios se encuentran claramente visibles y correctamente fijados a la pared, sin obstáculos que impidan su visualización (extintores, estaciones manuales, paños de manguera, tableros)? COVENIN 187 NORMA VENEZOLANA COLORES, SÍMBOLOS Y DIMENSIONES DE SEÑALES DE SEGURIDAD, punto 12 NOTA 2.",
    "preguntaResumida": "3.8 ¿Señalización visible de equipos contra incendio?",
    "aspectoLegal": "COVENIN 187:1992 (Punto 12, Nota 2); COVENIN 1040.",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 14,
    "conjunto": 3,
    "num": "9",
    "aspecto": "Avisos o Señalizaciones según Norma Covenin 187-2003",
    "pregunta": "3.9 ¿El contenedor de estopas usadas se encuentra claramente señalizado con el rombo DOT de la ONU, específicamente con el número 9?",
    "preguntaResumida": "3.9 ¿Contenedor de estopas con Rombo DOT 9?",
    "aspectoLegal": "COVENIN 3060:2002 (Materiales Peligrosos); Normas ONU.",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 15,
    "conjunto": 3,
    "num": "10",
    "aspecto": "Avisos o Señalizaciones según Norma Covenin 3060-2011",
    "pregunta": "3.10 ¿Las zonas de almacenamiento de acumuladores eléctricos cuentan con la señalización del tipo rombo de la NFPA 704?",
    "preguntaResumida": "3.10 ¿Área de baterías con Rombo NFPA 704?",
    "aspectoLegal": "NFPA 704; COVENIN 3060:2002.",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 16,
    "conjunto": 3,
    "num": "11",
    "aspecto": "Avisos o Señalizaciones según Norma Covenin 3060-2011",
    "pregunta": "3.11 ¿Los tanques de almacenamiento de combustible líquido y colmenas de almacenamiento de gas inflamable cuentan con su señalización correspondiente, claramente visible y las mismas están correctamente fijadas a la superficie que corresponda? (DOT rombo N° 3 y N°2 respectivamente - NFPA 704)",
    "preguntaResumida": "3.11 ¿Tanques/Cilindros con rombos DOT (3 y 2) y NFPA?",
    "aspectoLegal": "COVENIN 3060:2002; NFPA 704; Ley Sust. Materiales Peligrosos.",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 17,
    "conjunto": 3,
    "num": "12",
    "aspecto": "Avisos o Señalizaciones según Norma Covenin 3060-2011",
    "pregunta": "3.12 ¿Las áreas de almacenamiento cuentan con señalización adecuada y diferenciada conforme al tipo de artículo, en cumplimiento con las normas de seguridad aplicables (área de implementos para la higiene y limpieza, área de acumuladores aptos e inservibles, entre otros)?",
    "preguntaResumida": "3.12 ¿Señalización adecuada por tipo de almacén?",
    "aspectoLegal": "COVENIN 187:1992; RCHST.",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 18,
    "conjunto": 4,
    "num": "1",
    "aspecto": "Almacenamiento",
    "pregunta": "4.1 ¿El almacenamiento se observa correctamente apilado, organizado y distribuido convenientemente en los racks, estanterias y en otras zonas donde se puede almacenar?.",
    "preguntaResumida": "4.1 ¿Almacenamiento apilado, organizado y seguro?",
    "aspectoLegal": "COVENIN 2248:1987 (Manejo de Materiales); RCHST.",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 19,
    "conjunto": 4,
    "num": "2",
    "aspecto": "Almacenamiento",
    "pregunta": "4.2 ¿Las estanterías, racks o paletas se encuentran en buen estado? (Se revisa si han sufrido daños o si tienen alguna debilidad como no estar anclados al suelo).",
    "preguntaResumida": "4.2 ¿Estanterías/Racks en buen estado y anclados?",
    "aspectoLegal": "RCHST Art. 12; Normas de Ingeniería Civil.",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 20,
    "conjunto": 4,
    "num": "3",
    "aspecto": "Almacenamiento",
    "pregunta": "4.3 ¿Los racks de alamcenamiento de acumuladores electricos se encuentran debidamente anclados al suelo?",
    "preguntaResumida": "4.3 ¿Racks de baterías anclados al suelo?",
    "aspectoLegal": "RCHST; Normas de seguridad estructural.",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 21,
    "conjunto": 4,
    "num": "4",
    "aspecto": "Almacenamiento",
    "pregunta": "4.4 ¿Las baterías inservibles se mantienen protegidas de la intemperie?",
    "preguntaResumida": "4.4 ¿Baterías inservibles protegidas de intemperie?",
    "aspectoLegal": "Ley sobre Sustancias, Materiales y Desechos Peligrosos (Art. 32).",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 22,
    "conjunto": 4,
    "num": "5",
    "aspecto": "Almacenamiento",
    "pregunta": "4.5 ¿El  piso  o  la  superficie  donde  se  almacenan las baterías inservibles es impermeable o el material del piso no permite la filtración al suelo del ácido?",
    "preguntaResumida": "4.5 ¿Piso impermeable en área de baterías inservibles?",
    "aspectoLegal": "Ley sobre Sustancias, Materiales y Desechos Peligrosos; RCHST.",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS"
  },
  {
    "item": 23,
    "conjunto": 4,
    "num": "6",
    "aspecto": "Almacenamiento",
    "pregunta": "4.6 ¿El área de almacenamiento de baterías inservibles está alejada de fuentes de calor u otras fuentes  de  energía?",
    "preguntaResumida": "4.6 ¿Baterías alejadas de fuentes de calor/energía?",
    "aspectoLegal": "RCHST; COVENIN 2248.",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS"
  },
  {
    "item": 24,
    "conjunto": 4,
    "num": "7",
    "aspecto": "Almacenamiento",
    "pregunta": "4.7 ¿Se garantiza que el ácido contenido en los acumuladores no llegue a canales de agua de lluvia y/o servidas?",
    "preguntaResumida": "4.7 ¿Control de fugas de ácido a drenajes?",
    "aspectoLegal": "Ley de Aguas; Ley Penal del Ambiente.",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS"
  },
  {
    "item": 25,
    "conjunto": 4,
    "num": "8",
    "aspecto": "Almacenamiento",
    "pregunta": "4.8 ¿Las áreas destinadas al almacenamiento se mantienen en condiciones adecuadas de orden y limpieza?",
    "preguntaResumida": "4.8 ¿Orden y limpieza en áreas de almacenamiento?",
    "aspectoLegal": "RCHST Art. 54; Norma NT-04-2023.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 26,
    "conjunto": 5,
    "num": "1",
    "aspecto": "Herramientas y Equipos",
    "pregunta": "5.1 ¿Las zonas alrededor de los equipos y herramientas se encuentran en adecuado estado de orden y limpieza?",
    "preguntaResumida": "5.1 ¿Limpieza alrededor de equipos/herramientas?",
    "aspectoLegal": "RCHST Art. 54.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS"
  },
  {
    "item": 27,
    "conjunto": 5,
    "num": "2",
    "aspecto": "Herramientas y Equipos",
    "pregunta": "5.2 ¿Los equipos y herramientas se encuentran en buenas condiciones?",
    "preguntaResumida": "5.2 ¿Equipos y herramientas en buen estado?",
    "aspectoLegal": "RCHST Título VI.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS"
  },
  {
    "item": 28,
    "conjunto": 5,
    "num": "3",
    "aspecto": "Herramientas y Equipos",
    "pregunta": "5.3 ¿Cuentan con contenedor de estopas usadas? En distribuidora aplica para el área de ventas y almacén. (si esta respuesta es no conforme, entonces la 3.9 también lo es).",
    "preguntaResumida": "5.3 ¿Existencia de contenedor de estopas usadas?",
    "aspectoLegal": "Ley sobre Sustancias, Materiales y Desechos Peligrosos.",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 29,
    "conjunto": 5,
    "num": "4",
    "aspecto": "Herramientas y Equipos",
    "pregunta": "5.4 ¿El contenedor de estopas usadas contiene solo residuos de estopas sucias o desechos de acumuladores eléctricos de plomo ácido?",
    "preguntaResumida": "5.4 ¿Uso exclusivo del contenedor para estopas/residuos peligrosos?",
    "aspectoLegal": "Decreto 2635 (Manejo de desechos peligrosos).",
    "grupoPilar": "SSA",
    "areaResponsable": "OPERACIONES"
  },
  {
    "item": 30,
    "conjunto": 5,
    "num": "5",
    "aspecto": "Herramientas y Equipos",
    "pregunta": "5.5 ¿Las carretillas o transpaletas se encuentran en buenas condiciones (carretillas: estructura general, asas, cauchos; transpaletas: estructura general, asas, ruedas, gato)?",
    "preguntaResumida": "5.5 ¿Carretillas/Transpaletas en buen estado?",
    "aspectoLegal": "COVENIN 2248:1987.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 31,
    "conjunto": 6,
    "num": "1",
    "aspecto": "Sistema de extinción y detección de incendios",
    "pregunta": "6.1 ¿Los extintores están en su sitio y adecuadamente señalizados según el tipo de fuego (etiqueta con identificación, instrucciones de uso, clase de fuego para el cual es indicado su uso, fecha del ultimo mantenimiento, capacidad del extintor y potencial de efectividad)?",
    "preguntaResumida": "6.1 ¿Extintores en sitio y señalizados correctamente?",
    "aspectoLegal": "COVENIN 1040:2006; COVENIN 187.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 32,
    "conjunto": 6,
    "num": "2",
    "aspecto": "Sistema de extinción y detección de incendios",
    "pregunta": "6.2 ¿Los extintores se encuentran accesibles y sin elementos que obstaculicen su acceso? COVENIN 1213:98 PUNTO 4.1.",
    "preguntaResumida": "6.2 ¿Extintores accesibles sin obstáculos?",
    "aspectoLegal": "COVENIN 1213:1998 (Punto 4.1).",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 33,
    "conjunto": 6,
    "num": "3",
    "aspecto": "Sistema de extinción y detección de incendios",
    "pregunta": "6.3 ¿Los extintores se encuentran dentro de las fechas validas de servicio de mantenimiento? ANUAL, COVENIN 1213:98 PUNTO 4.3.",
    "preguntaResumida": "6.3 ¿Extintores con mantenimiento vigente (anual)?",
    "aspectoLegal": "COVENIN 1213:1998 (Punto 4.3).",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 34,
    "conjunto": 6,
    "num": "4",
    "aspecto": "Sistema de extinción y detección de incendios",
    "pregunta": "6.4 ¿Los extintores están correctamente instalados, colgados o montados a una altura no menor de 10 cm ni mayor de 1,30 m desde el nivel del suelo, conforme al punto 5.8.4 de la norma COVENIN 1040:2006?",
    "preguntaResumida": "6.4 ¿Altura de montaje de extintores (10cm - 1.30m)?",
    "aspectoLegal": "COVENIN 1040:2006 (Punto 5.8.4).",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 35,
    "conjunto": 6,
    "num": "5",
    "aspecto": "Sistema de extinción y detección de incendios",
    "pregunta": "6.5 ¿El local cuenta con sistema de detección y alarma de incendios?",
    "preguntaResumida": "6.5 ¿Posee sistema de detección y alarma?",
    "aspectoLegal": "COVENIN 1376; RCHST.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 36,
    "conjunto": 6,
    "num": "6",
    "aspecto": "Sistema de extinción y detección de incendios",
    "pregunta": "6.6 ¿El sistema de detección y alarma de incendios funciona correctamente?",
    "preguntaResumida": "6.6 ¿Sistema de detección funcionando correctamente?",
    "aspectoLegal": "COVENIN 1376; COVENIN 1041.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 37,
    "conjunto": 6,
    "num": "7",
    "aspecto": "Sistema de extinción y detección de incendios",
    "pregunta": "6.7 ¿Las luces de emergencia se encuentran operativas y en buen estado?",
    "preguntaResumida": "6.7 ¿Luces de emergencia operativas?",
    "aspectoLegal": "COVENIN 1110.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 38,
    "conjunto": 6,
    "num": "8",
    "aspecto": "Sistema de extinción y detección de incendios",
    "pregunta": "6.8 ¿La estaciones manuales se encuentran libres de obstáculos y en buen estado?",
    "preguntaResumida": "6.8 ¿Estaciones manuales accesibles?",
    "aspectoLegal": "COVENIN 758; COVENIN 1376.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 39,
    "conjunto": 6,
    "num": "9",
    "aspecto": "Sistema de extinción y detección de incendios",
    "pregunta": "6.9 ¿La Distribuidora cuenta con un sistema de extinción de incendios instalado de acuerdo a las dimensiones establecidas por la Norma COVENIN 1331:2001?",
    "preguntaResumida": "6.9 ¿Sistema de extinción acorde a COVENIN 1331?",
    "aspectoLegal": "COVENIN 1331:2001 (Extinción fija).",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 40,
    "conjunto": 6,
    "num": "10",
    "aspecto": "Sistema de extinción y detección de incendios",
    "pregunta": "6.10 ¿El sistema de extinción de incendios se encuentra operativo (Sistema de bombas)?",
    "preguntaResumida": "6.10 ¿Sistema de bombas contra incendio operativo?",
    "aspectoLegal": "COVENIN 1331; NFPA 20.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 41,
    "conjunto": 6,
    "num": "11",
    "aspecto": "Sistema de extinción y detección de incendios",
    "pregunta": "6.11 ¿La distribución de las tuberías y paños de manguera contra incendios es adecuada para garantizar cobertura efectiva, accesibilidad en caso de emergencia?",
    "preguntaResumida": "6.11 ¿Distribución adecuada de mangueras y tuberías?",
    "aspectoLegal": "COVENIN 1331:2001.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 42,
    "conjunto": 6,
    "num": "12",
    "aspecto": "Sistema de extinción y detección de incendios",
    "pregunta": "6.12 ¿Los paños de manguera contra incendios se encuentran en buen estado físico y funcional, con todas sus partes completas (pitón, válvula, acople, entre otras), listas para su uso en caso de emergencia?",
    "preguntaResumida": "6.12 ¿Paños de manguera completos y en buen estado?",
    "aspectoLegal": "COVENIN 1331:2001.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 43,
    "conjunto": 7,
    "num": "1",
    "aspecto": "Atención de Emergencias",
    "pregunta": "7.1 ¿ Se cuenta con plan de emergencia?  COVENIN 823-2:1997 SIST. DE PROTECCIÓN CONTRA INCENDIO, punto 4.3.1; COVENIN 2226:90 GUIA PARA LA ELABORACIÓN DE PLANES PARA EL CONTROL DE EMERGENCIAS, punto 5.1; 5.1.1",
    "preguntaResumida": "7.1 ¿Cuenta con Plan de Emergencia?",
    "aspectoLegal": "COVENIN 2226:1990 (Punto 5.1); COVENIN 823-2.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 44,
    "conjunto": 7,
    "num": "2",
    "aspecto": "Atención de Emergencias",
    "pregunta": "7.2 ¿Se cuenta con Brigada de emergencia? COVENIN 823-2:1997 SIST. DE PROTECCIÓN CONTRA INCENDIO punto 4.3.1 y 4.3.2 / COVENIN 3478:1999 SOCORRIMO EN LAS EMPRESAS puntos 4.1;4.1.1;4.1.2, en caso de contar con uno o dos trabajadores, todos deberán contar con formaciones relacionadas a emergencias (manejo de extinores, primeros auxilios, desalojo, manejo de materiales peligrosos).",
    "preguntaResumida": "7.2 ¿Cuenta con Brigada de Emergencia formada?",
    "aspectoLegal": "COVENIN 3478:1999; COVENIN 823-2 (Punto 4.3.1).",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 45,
    "conjunto": 7,
    "num": "3",
    "aspecto": "Atención de Emergencias",
    "pregunta": "7.3 ¿Se realiza el adiestramiento continuo a las brigadas de emergencia? COVENIN 3478:1999 SOCORRIMO EN LAS EMPRESAS punto 4.1.2",
    "preguntaResumida": "7.3 ¿Adiestramiento continuo a la brigada?",
    "aspectoLegal": "COVENIN 3478:1999 (Punto 4.1.2).",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 46,
    "conjunto": 7,
    "num": "4",
    "aspecto": "Atención de Emergencias",
    "pregunta": "7.4 ¿Se realizan simulacros de desalojo por lo menos una vez al año? COVENIN 2226:90 GUIA PARA LA ELABORACIÓN DE PLANES PARA EL CONTROL DE EMERGENCIAS Punto 5.1.3",
    "preguntaResumida": "7.4 ¿Simulacros de desalojo anuales?",
    "aspectoLegal": "COVENIN 2226:1990 (Punto 5.1.3).",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 47,
    "conjunto": 7,
    "num": "5",
    "aspecto": "Atención de Emergencias",
    "pregunta": "7.5 ¿Las puertas para salir se abren fácilmente desde el interior? NORMA COVENIN 810:1998 CARCATERISTICAS DE LOS MEDIOS DE ESCAPE EN EDIFICACIONES SEGÚN EL TIPO DE OCUPACIÓN punto 5",
    "preguntaResumida": "7.5 ¿Puertas de salida abren fácilmente desde el interior?",
    "aspectoLegal": "COVENIN 810:1998 (Medios de Escape, Punto 5).",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 48,
    "conjunto": 7,
    "num": "6",
    "aspecto": "Atención de Emergencias",
    "pregunta": "7.6 ¿Las puertas de emergencia se encuentran libres de obstáculos, en buen estado y su apertura es en dirección de escape? NORMA COVENIN 810:1998 CARCATERISTICAS DE LOS MEDIOS DE ESCAPE EN EDIFICACIONES SEGÚN EL TIPO DE OCUPACIÓN punto 5",
    "preguntaResumida": "7.6 ¿Puertas de emergencia libres y abren hacia afuera?",
    "aspectoLegal": "COVENIN 810:1998.",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 49,
    "conjunto": 7,
    "num": "7",
    "aspecto": "Atención de Emergencias",
    "pregunta": "7.7 ¿Se realizan y documentan mensualmente las pruebas de presurización del sistema de extinción de incendios, cumpliendo con los parámetros establecidos en la norma COVENIN 1040:2006 (Prueba mensual)?",
    "preguntaResumida": "7.7 ¿Pruebas mensuales de presurización documentadas?",
    "aspectoLegal": "COVENIN 1040:2006.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 50,
    "conjunto": 7,
    "num": "8",
    "aspecto": "Atención de Emergencias",
    "pregunta": "7.8 ¿Se cuenta con rayado peatonal en las áreas internas al local como lo son: rayado al área de Ofc de ventas área de aténción al cliente, almacén de Distribuidora?",
    "preguntaResumida": "7.8 ¿Existencia de rayado peatonal interno?",
    "aspectoLegal": "COVENIN 187:1992.",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS"
  },
  {
    "item": 51,
    "conjunto": 8,
    "num": "1",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.1 ¿El mobiliario de la oficina se encuentran en buenas condiciones (sillas, mesón de trabajo, gabinetes, entre otros)?",
    "preguntaResumida": "8.1 ¿Mobiliario de oficina en buenas condiciones?",
    "aspectoLegal": "LOPCYMAT (Ergonomía); Norma Técnica NT-01-2008 (Ref. Ergonomía).",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 52,
    "conjunto": 8,
    "num": "2",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.2 ¿La oficina de ventas se mantiene en condiciones adecuadas de orden y limpieza?",
    "preguntaResumida": "8.2 ¿Orden y limpieza en oficina?",
    "aspectoLegal": "RCHST Art. 54.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 53,
    "conjunto": 8,
    "num": "3",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.3 ¿Los tableros, tomacorrientes, conectores y cableado eléctrico se encuentran adecuadamente canalizados, protegidos y en buen estado?",
    "preguntaResumida": "8.3 ¿Sistema eléctrico canalizado y protegido?",
    "aspectoLegal": "Código Eléctrico Nacional (CEN); RCHST.",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 54,
    "conjunto": 8,
    "num": "4",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.4 ¿Las regletas y tomacorrientes se encuentran libres de sobrecarga eléctrica, con conexiones adecuadas y sin exceder la capacidad máxima permitida por sus especificaciones técnicas?",
    "preguntaResumida": "8.4 ¿Ausencia de sobrecarga en regletas/tomas?",
    "aspectoLegal": "Código Eléctrico Nacional; RCHST Art. 312.",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 55,
    "conjunto": 8,
    "num": "5",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.5 ¿Las puertas, cerraduras y manillas mantienen un funcionamiento adecuado?",
    "preguntaResumida": "8.5 ¿Cerraduras y puertas funcionales?",
    "aspectoLegal": "RCHST.",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 56,
    "conjunto": 8,
    "num": "6",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.6 ¿La localidad cuenta con tanque de almacenamiento de agua de uso sanitario en buenas condiciones, para el suministro continuo del vital líquido en caso de fallas eléctricas e interrupciones del suministro de agua local?",
    "preguntaResumida": "8.6 ¿Tanque de agua sanitario operativo?",
    "aspectoLegal": "RCHST Art. 67.",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 57,
    "conjunto": 8,
    "num": "7",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.7 ¿En caso de ser subterraneo el tanque, cuenta con bomba de agua en buenas condiciones, que permita el suministro del agua constante al momento de ser requerido (fallas en el suministro de agua)?",
    "preguntaResumida": "8.7 ¿Bomba de agua operativa (si aplica)?",
    "aspectoLegal": "RCHST.",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 58,
    "conjunto": 8,
    "num": "8",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.8 ¿Los baños cuentan con dispensador de jabón y papel higiénico?",
    "preguntaResumida": "8.8 ¿Baños con dispensadores de jabón/papel?",
    "aspectoLegal": "RCHST Art. 76.",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 59,
    "conjunto": 8,
    "num": "9",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.9 ¿las piezas sanitarias se encuentran en funcionamiento y en buen estado?",
    "preguntaResumida": "8.9 ¿Piezas sanitarias operativas?",
    "aspectoLegal": "RCHST Art. 73.",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 60,
    "conjunto": 8,
    "num": "10",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.10 ¿Los dispensadores de papel y jabón cuentan con suministro?",
    "preguntaResumida": "8.10 ¿Dispensadores dotados de insumos?",
    "aspectoLegal": "RCHST Art. 76.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 61,
    "conjunto": 8,
    "num": "11",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.11 ¿Los baños se mantienen en condiciones adecuadas de orden, limpieza e higiene, garantizando su uso seguro y confortable para el personal propio y para los clientes?",
    "preguntaResumida": "8.11 ¿Baños limpios e higienizados?",
    "aspectoLegal": "RCHST Art. 79-80.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 62,
    "conjunto": 8,
    "num": "12",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.12 ¿El suministro de papel higiénico, papel secante y jabón líquido es adecuado?",
    "preguntaResumida": "8.12 ¿Suministro adecuado de consumibles de baño?",
    "aspectoLegal": "RCHST Art. 76.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 63,
    "conjunto": 8,
    "num": "13",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.13 ¿El área destinada al suministro de papel higiénico, papel secante, jabón líquido y demás consumibles se mantiene en condiciones adecuadas de orden, limpieza e higiene?",
    "preguntaResumida": "8.13 ¿Área de consumibles ordenada y limpia?",
    "aspectoLegal": "RCHST.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 64,
    "conjunto": 8,
    "num": "14",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.14 ¿Cuentan con un espacio habilitado para ser usado como comedor?",
    "preguntaResumida": "8.14 ¿Espacio habilitado para comedor?",
    "aspectoLegal": "LOPCYMAT Art. 59; RCHST Art. 83.",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS"
  },
  {
    "item": 65,
    "conjunto": 8,
    "num": "15",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.15 ¿El área destinada al consumo de alimentos está debidamente separada de las áreas de trabajo, almacenamiento o agentes contaminantes?",
    "preguntaResumida": "8.15 ¿Comedor separado de áreas contaminantes?",
    "aspectoLegal": "RCHST Art. 83.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 66,
    "conjunto": 8,
    "num": "16",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.16 ¿El área de comedor se encuentra debidamente aclimatada para garantizar condiciones térmicas adecuadas durante el consumo de alimentos?",
    "preguntaResumida": "8.16 ¿Comedor con climatización adecuada?",
    "aspectoLegal": "RCHST Art. 84.",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 67,
    "conjunto": 8,
    "num": "17",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.17 El área destinada al consumo de alimentos dispone de los equipos e implementos pertinentes (nevera, microondas, mesa, sillas) y estos se encuentran en buen estado de funcionamiento e higiene?",
    "preguntaResumida": "8.17 ¿Equipos de comedor (nevera/mesa) en buen estado?",
    "aspectoLegal": "RCHST Art. 85.",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 68,
    "conjunto": 8,
    "num": "18",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.18 ¿El área destinada al consumo de alimentos y sus equipos se mantienen en condiciones adecuadas de orden, limpieza e higiene?",
    "preguntaResumida": "8.18 ¿Higiene y orden en el comedor?",
    "aspectoLegal": "RCHST Art. 88.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 69,
    "conjunto": 8,
    "num": "19",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.19 ¿El filtro de agua se encuentra en funcionamiento y se mantiene la higiene del mismo?",
    "preguntaResumida": "8.19 ¿Filtro de agua higiénico y funcional?",
    "aspectoLegal": "RCHST Art. 70.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 70,
    "conjunto": 8,
    "num": "20",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.20 ¿El filtro de agua y los botellones se encuentran correctamente ubicados, almacenados y separados de fuentes de contaminación?",
    "preguntaResumida": "8.20 ¿Ubicación segura de filtro y botellones?",
    "aspectoLegal": "RCHST Art. 71.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 71,
    "conjunto": 8,
    "num": "21",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.21 ¿El filtro de agua cuenta con dispensador de vasos cónicos en buen estado, con suministro disponible",
    "preguntaResumida": "8.21 ¿Dispensador de vasos cónicos disponible?",
    "aspectoLegal": "RCHST Art. 72.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 72,
    "conjunto": 8,
    "num": "22",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.22 ¿El filtro de agua, esta ubicado de forma accesible a los trabajadores y a los clientes?",
    "preguntaResumida": "8.22 ¿Acceso fácil al agua potable?",
    "aspectoLegal": "RCHST Art. 68.",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 73,
    "conjunto": 8,
    "num": "23",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.23 ¿El techo se encuentra en buenas condiciones, libre de goteras o filtraciones, y cuenta con sistemas adecuados de canalización de aguas pluviales?",
    "preguntaResumida": "8.23 ¿Techos sin goteras ni filtraciones?",
    "aspectoLegal": "RCHST Art. 9.",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 74,
    "conjunto": 8,
    "num": "24",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.24 ¿Las paredes se encuentran en buenas condiciones, libres de grietas, fracturas, filtraciones u otros signos de deterioro estructural o superficial?",
    "preguntaResumida": "8.24 ¿Paredes sin grietas ni deterioro?",
    "aspectoLegal": "RCHST Art. 9.",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 75,
    "conjunto": 8,
    "num": "25",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.25 ¿El piso del área de la distribuidora se encuentra en buenas condiciones, libre de desniveles, grietas, humedad o daños que comprometan la seguridad y limpieza del espacio?",
    "preguntaResumida": "8.25 ¿Piso nivelado y sin daños?",
    "aspectoLegal": "RCHST Art. 13.",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 76,
    "conjunto": 8,
    "num": "26",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.26 ¿La pintura del servicentro se encuentra en buen estado, libre de desprendimientos, manchas, deterioro o signos de falta de mantenimiento?",
    "preguntaResumida": "8.26 ¿Pintura general en buen estado?",
    "aspectoLegal": "RCHST Art. 17.",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 77,
    "conjunto": 8,
    "num": "27",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.27 ¿Las áreas de trabajo y circulación se mantienen en condiciones adecuadas de orden y limpieza, libres de obstrucciones, residuos, materiales innecesarios o peligrosos?",
    "preguntaResumida": "8.27 ¿Áreas libres de obstrucciones y residuos?",
    "aspectoLegal": "RCHST Art. 54.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 78,
    "conjunto": 8,
    "num": "28",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.28 ¿Las áreas operativas cuentan con demarcación de piso visible, continua y en buen estado, que permita identificar zonas de tránsito e identificación de puestos para vehículos?",
    "preguntaResumida": "8.28 ¿Demarcación de piso en áreas operativas?",
    "aspectoLegal": "COVENIN 187; RCHST.",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 79,
    "conjunto": 9,
    "num": "1",
    "aspecto": "Equipos de protección colectiva",
    "pregunta": "9.1 ¿Se cuenta con ducha o fuente lavaojos para casos de emergencia?",
    "preguntaResumida": "9.1 ¿Ducha/Lavaojos de emergencia disponible?",
    "aspectoLegal": "COVENIN 1056-1:1991; COVENIN 1056-2.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 80,
    "conjunto": 9,
    "num": "2",
    "aspecto": "Equipos de protección colectiva",
    "pregunta": "9.2 ¿Los componentes de la ducha y fuente lavaojos se encuentran completos y en buenas condiciones?",
    "preguntaResumida": "9.2 ¿Componentes de ducha/lavaojos completos?",
    "aspectoLegal": "COVENIN 1056.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 81,
    "conjunto": 9,
    "num": "3",
    "aspecto": "Equipos de protección colectiva",
    "pregunta": "9.3 ¿Es suficiente la presión de agua para la adecuada utilización de la ducha o fuente lava ojos?",
    "preguntaResumida": "9.3 ¿Presión de agua suficiente en ducha/lavaojos?",
    "aspectoLegal": "COVENIN 1056.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 82,
    "conjunto": 9,
    "num": "4",
    "aspecto": "Equipos de protección colectiva",
    "pregunta": "9.4 ¿Se cuenta con botiquín de primeros auxilios en buenas condiciones, señalizado y adherido a la pared de forma visible y accesible?",
    "preguntaResumida": "9.4 ¿Botiquín visible, señalizado y accesible?",
    "aspectoLegal": "COVENIN 3478:1999.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 83,
    "conjunto": 9,
    "num": "5",
    "aspecto": "Equipos de protección colectiva",
    "pregunta": "9.5 ¿El botiquín de primeros auxilios cuenta con todos los insumos descritos en la norma COVENIN 3478:199?",
    "preguntaResumida": "9.5 ¿Contenido del botiquín según norma?",
    "aspectoLegal": "COVENIN 3478:1999 (Tabla de contenido).",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 84,
    "conjunto": 9,
    "num": "6",
    "aspecto": "Equipos de protección colectiva",
    "pregunta": "9.6 ¿Se cuenta con los implementos necesarios para contener derrames de ácidos (Kit para caso de derrame)?",
    "preguntaResumida": "9.6 ¿Kit para derrames (ácidos) disponible?",
    "aspectoLegal": "Ley Sustancias Peligrosas; Normas MATPEL.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 85,
    "conjunto": 10,
    "num": "1",
    "aspecto": "Uniforme y equipo de protección personal",
    "pregunta": "10.1 ¿Los trabajadores hacen uso adecuado del uniforme?",
    "preguntaResumida": "10.1 ¿Uso adecuado del uniforme?",
    "aspectoLegal": "LOPCYMAT Art. 53; COVENIN 2237:1989.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES - SSA"
  },
  {
    "item": 86,
    "conjunto": 10,
    "num": "2",
    "aspecto": "Uniforme y equipo de protección personal",
    "pregunta": "10.2 ¿Los uniformes se encuentran en buen estado?",
    "preguntaResumida": "10.2 ¿Uniformes en buen estado?",
    "aspectoLegal": "LOPCYMAT Art. 53; COVENIN 2237.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES - SSA"
  },
  {
    "item": 87,
    "conjunto": 10,
    "num": "3",
    "aspecto": "Uniforme y equipo de protección personal",
    "pregunta": "10.3 ¿Los trabajadores hacen uso adecuado de los EPP, uniformes, lentes de seguridad, guantes y botas de seguridad?",
    "preguntaResumida": "10.3 ¿Uso correcto de EPP (lentes, guantes, botas)?",
    "aspectoLegal": "LOPCYMAT Art. 53; COVENIN 2237:1989.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES - SSA"
  },
  {
    "item": 88,
    "conjunto": 11,
    "num": "1",
    "aspecto": "Cartelera de Seguridad, Salud y Ambiente",
    "pregunta": "11.1 ¿La Política de SSL está disponible y actualizada según Norma NG-SST-002?",
    "preguntaResumida": "11.1 ¿Política de SSL disponible y actualizada?",
    "aspectoLegal": "Norma Técnica NT-04-2023 (Anterior NT-01-2008).",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES - SSA"
  },
  {
    "item": 89,
    "conjunto": 11,
    "num": "2",
    "aspecto": "Cartelera de Seguridad, Salud y Ambiente",
    "pregunta": "11.2 ¿Se cuenta con la Ficha de Datos de Seguridad FDS para acumuladores eléctricos Plomo-Ácido, AT-SSA-072, visible en la entrada de los álmacenes de acumuladores eléctricos plomo ácidos?",
    "preguntaResumida": "11.2 ¿Hoja de Datos de Seguridad (FDS) visible?",
    "aspectoLegal": "COVENIN 3059:2006 (FDS); LOPCYMAT.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES - SSA"
  },
  {
    "item": 90,
    "conjunto": 11,
    "num": "3",
    "aspecto": "Cartelera de Seguridad, Salud y Ambiente",
    "pregunta": "11.3 ¿Se cuenta con el plan de emergencia según la norma COVENIN 823-2:1997 SIST. DE PROTECCIÓN CONTRA INCENDIO:1997 punto 4.3.1?",
    "preguntaResumida": "11.3 ¿Plan de emergencia acorde a COVENIN?",
    "aspectoLegal": "COVENIN 823-2:1997.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES - SSA"
  },
  {
    "item": 91,
    "conjunto": 11,
    "num": "4",
    "aspecto": "Cartelera de Seguridad, Salud y Ambiente",
    "pregunta": "11.4 ¿Se encuentra publicado el permiso de bomberos en la cartelera fiscal?",
    "preguntaResumida": "11.4 ¿Permiso de Bomberos publicado?",
    "aspectoLegal": "Ley Cuerpo de Bomberos.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES - SSA"
  },
  {
    "item": 92,
    "conjunto": 11,
    "num": "5",
    "aspecto": "Cartelera de Seguridad, Salud y Ambiente",
    "pregunta": "11.5 ¿Se encuentra vigente el permiso de bomberos?",
    "preguntaResumida": "11.5 ¿Permiso de Bomberos vigente?",
    "aspectoLegal": "Ley Cuerpo de Bomberos.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES - SSA"
  },
  {
    "item": 93,
    "conjunto": 11,
    "num": "6",
    "aspecto": "Cartelera de Seguridad, Salud y Ambiente",
    "pregunta": "11.6 ¿Se cuenta con la accidentabilidad actualizada? (Norma Técnica de Programa de Seguridad y Salud en el Trabajo, numeral 2.6.1).",
    "preguntaResumida": "11.6 ¿Estadísticas de accidentabilidad actualizadas?",
    "aspectoLegal": "NT-04-2023 (Numeral 2.6.1); Norma COVENIN 474.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES - SSA"
  },
  {
    "item": 94,
    "conjunto": 11,
    "num": "7",
    "aspecto": "Cartelera de Seguridad, Salud y Ambiente",
    "pregunta": "11.7 ¿Se cuenta con la morbilidad actualizada? (Norma Técnica de Programa de Seguridad y Salud en el Trabajo, numeral 2.6.1).",
    "preguntaResumida": "11.7 ¿Estadísticas de morbilidad actualizadas?",
    "aspectoLegal": "NT-04-2023 (Numeral 2.6.1).",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES - SSA"
  },
  {
    "item": 95,
    "conjunto": 11,
    "num": "8",
    "aspecto": "Cartelera de Seguridad, Salud y Ambiente",
    "pregunta": "11.8 ¿Cuenta con Mapa de riesgo del local COVENIN 810:1998 CARACTERISTICAS DE LOS MEDIOS DE ESCAPE  EN EDIFICACIONES SEGÚN EL TIPO DE OCUPACIÓN punto 5.1.7; COVENIN 1642:2001 PLANOS DE USO BOMBERIL PARA EL SERVICIO CONTRA INCENDIO punto 4.1.5?",
    "preguntaResumida": "11.8 ¿Mapa de Riesgo visible?",
    "aspectoLegal": "COVENIN 810; NT-04-2023.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES - SSA"
  },
  {
    "item": 96,
    "conjunto": 12,
    "num": "1",
    "aspecto": "Gestión de Seguridad, Salud y Ambiente",
    "pregunta": "12.1 ¿Se ha realizado el programa de mantenimiento para los sistemas contra incendios de acuerdo a lo estipulado en la Norma Covenin 823:1997, en el punto 4.5.3 (Semestral)?",
    "preguntaResumida": "12.1 ¿Mantenimiento semestral sistema contra incendio?",
    "aspectoLegal": "COVENIN 823:1997 (Punto 4.5.3).",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS"
  },
  {
    "item": 97,
    "conjunto": 12,
    "num": "2",
    "aspecto": "Gestión de Seguridad, Salud y Ambiente",
    "pregunta": "12.2 ¿Se ha realizado la revisión de los extintores tal como lo indica el programa de inspección (cada 6 meses)?",
    "preguntaResumida": "12.2 ¿Inspección semestral de extintores?",
    "aspectoLegal": "COVENIN 1213.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 98,
    "conjunto": 12,
    "num": "3",
    "aspecto": "Gestión de Seguridad, Salud y Ambiente",
    "pregunta": "12.3 ¿Se ha realizado la revisión de Orden y limpieza tal como lo indica el programa de inspección (1 vez mensual)?",
    "preguntaResumida": "12.3 ¿Inspección mensual de orden y limpieza?",
    "aspectoLegal": "Programa de SST (NT-04-2023).",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 99,
    "conjunto": 12,
    "num": "4",
    "aspecto": "Gestión de Seguridad, Salud y Ambiente",
    "pregunta": "12.4 ¿Se ha realizado la revisión de herramientas y equipos tal como lo indica el programa de inspección (1 vez al mes)?",
    "preguntaResumida": "12.4 ¿Inspección mensual de herramientas?",
    "aspectoLegal": "RCHST; NT-04-2023.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 100,
    "conjunto": 12,
    "num": "5",
    "aspecto": "Gestión de Seguridad, Salud y Ambiente",
    "pregunta": "12.5 ¿Se ha realizado la revisión del sistema de detección de incendios tal como lo indica el programa de inspección (cada 3 meses)?",
    "preguntaResumida": "12.5 ¿Inspección trimestral detección incendios?",
    "aspectoLegal": "COVENIN 1376.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 101,
    "conjunto": 12,
    "num": "6",
    "aspecto": "Gestión de Seguridad, Salud y Ambiente",
    "pregunta": "12.6 ¿Se ha realizado la revisión de lamparas de emergencias tal como lo indica el programa de inspección ( 1 vez mes)?",
    "preguntaResumida": "12.6 ¿Inspección mensual luces de emergencia?",
    "aspectoLegal": "NT-04-2023; COVENIN 1110.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 102,
    "conjunto": 12,
    "num": "7",
    "aspecto": "Gestión de Seguridad, Salud y Ambiente",
    "pregunta": "12.7 ¿Se ha realizado la revisión del Kit para casos de derrame tal como lo indica el programa de inspección ( 1 vez mes)?",
    "preguntaResumida": "12.7 ¿Inspección mensual Kit derrames?",
    "aspectoLegal": "NT-04-2023; Gestión MATPEL.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 103,
    "conjunto": 12,
    "num": "8",
    "aspecto": "Gestión de Seguridad, Salud y Ambiente",
    "pregunta": "12.8 ¿Se ha realizado la revisión de la fuente lavaojos tal como lo indica el programa de inspección ( 1 vez mes)?",
    "preguntaResumida": "12.8 ¿Inspección mensual fuente lavaojos?",
    "aspectoLegal": "COVENIN 1056; NT-04-2023.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 104,
    "conjunto": 12,
    "num": "9",
    "aspecto": "Gestión de Seguridad, Salud y Ambiente",
    "pregunta": "12.9 ¿Se cuenta con el registro de delegado de prevención actualizado?",
    "preguntaResumida": "12.9 ¿Registro de Delegados vigente?",
    "aspectoLegal": "LOPCYMAT Art. 41.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 105,
    "conjunto": 12,
    "num": "10",
    "aspecto": "Gestión de Seguridad, Salud y Ambiente",
    "pregunta": "12.10 ¿Se cuenta con el registro de comité de seguridad y salud laboral actualizado?",
    "preguntaResumida": "12.10 ¿Registro de CSSL vigente?",
    "aspectoLegal": "LOPCYMAT Art. 46.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 106,
    "conjunto": 12,
    "num": "11",
    "aspecto": "Gestión de Seguridad, Salud y Ambiente",
    "pregunta": "12.11 ¿El CSSL lleva a cabo sus reuniones mensuales tal como lo indica el RLopcymat en su Art.76?",
    "preguntaResumida": "12.11 ¿Reuniones mensuales del CSSL?",
    "aspectoLegal": "RLOPCYMAT Art. 76.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 107,
    "conjunto": 12,
    "num": "12",
    "aspecto": "Gestión de Seguridad, Salud y Ambiente",
    "pregunta": "12.12 ¿El CSSL transcribe las minutas una vez firmadas y selladas al libro de actas tal como lo indica el RLopcymat en su Art.77?",
    "preguntaResumida": "12.12 ¿Libro de actas del CSSL al día?",
    "aspectoLegal": "RLOPCYMAT Art. 77.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 108,
    "conjunto": 12,
    "num": "13",
    "aspecto": "Gestión de Seguridad, Salud y Ambiente",
    "pregunta": "12.13 ¿El CSSL de forma mensual consigna ante el Inpsasel las minutas de las reuniones tal como lo indica el RLopcymat en su Art.77?",
    "preguntaResumida": "12.13 ¿Consignación mensual de minutas al INPSASEL?",
    "aspectoLegal": "RLOPCYMAT Art. 77.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 109,
    "conjunto": 12,
    "num": "14",
    "aspecto": "Gestión de Seguridad, Salud y Ambiente",
    "pregunta": "12.14 ¿Se cuenta con el Informe de Vigilancia Epidemiológica sellado por el INPSASEL?",
    "preguntaResumida": "12.14 ¿Informe Epidemiológico sellado por INPSASEL?",
    "aspectoLegal": "RLOPCYMAT Art. 34; NT-04-2023.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 110,
    "conjunto": 12,
    "num": "15",
    "aspecto": "Gestión de Seguridad, Salud y Ambiente",
    "pregunta": "12.15 ¿Los trabajadores reciben 16 horas trimestrales de formación en  SSA?",
    "preguntaResumida": "12.15 ¿16 horas trimestrales de formación cumplidas?",
    "aspectoLegal": "LOPCYMAT Art. 53 (Interpretación INPSASEL).",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 111,
    "conjunto": 12,
    "num": "16",
    "aspecto": "Gestión de Seguridad, Salud y Ambiente",
    "pregunta": "12.16 ¿Se cuenta con el Programa de Seguridad y Salud Laboral registrado ante el INPSASEL?",
    "preguntaResumida": "12.16 ¿Programa SST registrado en INPSASEL?",
    "aspectoLegal": "LOPCYMAT Art. 61; NT-04-2023.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 112,
    "conjunto": 12,
    "num": "17",
    "aspecto": "Gestión de Seguridad, Salud y Ambiente",
    "pregunta": "12.17 ¿Se cuenta con el registro actualizado del Servicio de Seguridad y Salud en el Trabajo, el cual incluye a la localidad evaluada?",
    "preguntaResumida": "12.17 ¿Servicio SST registrado y actualizado?",
    "aspectoLegal": "LOPCYMAT Art. 39; Norma Técnica Servicios SST.",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 113,
    "conjunto": 12,
    "num": "18",
    "aspecto": "Gestión de Seguridad, Salud y Ambiente",
    "pregunta": "12.18 ¿Cuentan con el documento actualizado RACDA que incluye a la localidad (Distribuidora o Servicentro que aplique)?",
    "preguntaResumida": "12.18 ¿RACDA actualizado para la localidad?",
    "aspectoLegal": "Ley Sobre Sustancias, Materiales y Desechos Peligrosos.",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 114,
    "conjunto": 12,
    "num": "19",
    "aspecto": "Gestión de Seguridad, Salud y Ambiente",
    "pregunta": "12.19 ¿Se consigna en su Unidad Territorial la póliza de seguros que cubra daños ambientales por lo menos una vez al año?",
    "preguntaResumida": "12.19 ¿Póliza de daños ambientales consignada anual?",
    "aspectoLegal": "Ley Orgánica del Ambiente.",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 115,
    "conjunto": 12,
    "num": "20",
    "aspecto": "Gestión de Seguridad, Salud y Ambiente",
    "pregunta": "12.20 ¿Se consigna en su Unidad Territorial el informe anual sobre la actividad relativa al Almacenamiento con indicación de las sustancias, cantidad, origen, destino, fecha de salida y de recepción?",
    "preguntaResumida": "12.20 ¿Informe anual de almacenamiento consignado?",
    "aspectoLegal": "Ley Sobre Sustancias, Materiales y Desechos Peligrosos.",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 116,
    "conjunto": 13,
    "num": "1",
    "aspecto": "Expedientes de los Colaboradores",
    "pregunta": "13.1 ¿Cuentan con evaluaciones médicas periódicas para los trabajadores: Ingreso, Pre- y Post-Vacacional (se verifica que la última evaluación médica este dentro del año en curso?",
    "preguntaResumida": "13.1 ¿Exámenes médicos periódicos vigentes?",
    "aspectoLegal": "RLOPCYMAT Art. 27; LOPCYMAT.",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 117,
    "conjunto": 13,
    "num": "2",
    "aspecto": "Expedientes de los Colaboradores",
    "pregunta": "13.2 ¿Las Hojas de Ruta de Trabajo se encuentran en el expediente de todos los trabajadores y se encuentran actualizadas (Lopcymat Art 69)?",
    "preguntaResumida": "13.2 ¿Hojas de Ruta de Trabajo en expedientes?",
    "aspectoLegal": "LOPCYMAT Art. 69.",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 118,
    "conjunto": 13,
    "num": "3",
    "aspecto": "Expedientes de los Colaboradores",
    "pregunta": "13.3 ¿Se cuenta con la descripción de cargo actualizada correspondiente en todos los expedientes de los trabajadores?",
    "preguntaResumida": "13.3 ¿Descripción de Cargo en expedientes?",
    "aspectoLegal": "NT-04-2023.",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 119,
    "conjunto": 13,
    "num": "4",
    "aspecto": "Expedientes de los Colaboradores",
    "pregunta": "13.4 ¿La constancia de entrega de EPP de la ultima dotación entregada se encuentra dentro del expediente de todos los trabajadores según la Norma NG-SST-004?",
    "preguntaResumida": "13.4 ¿Constancia de entrega de EPP en expedientes?",
    "aspectoLegal": "Norma Técnica NG-SST-004.",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 120,
    "conjunto": 13,
    "num": "5",
    "aspecto": "Expedientes de los Colaboradores",
    "pregunta": "13.5 ¿Se cuenta con la Notificación de los Principios de Prevención de las condiciones inseguras e insalubres y riesgo Biológico?",
    "preguntaResumida": "13.5 ¿Notificación de Riesgos en expedientes?",
    "aspectoLegal": "LOPCYMAT Art. 56.",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 121,
    "conjunto": 13,
    "num": "6",
    "aspecto": "Expedientes de los Colaboradores",
    "pregunta": "13.6 ¿Se cuenta con el análisis de riesgo de tareas específicas?",
    "preguntaResumida": "13.6 ¿Análisis de Riesgo de Tareas (ART)?",
    "aspectoLegal": "NT-04-2023.",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 122,
    "conjunto": 13,
    "num": "7",
    "aspecto": "Expedientes de los Colaboradores",
    "pregunta": "13.7 ¿La certificación de haber realizado el curso de manejo de Materiales Peligrosos reposa en los expedientes de los trabajadores y los mismos se encuentran vigentes? (2 años por vigencia del RACDA actualizado)",
    "preguntaResumida": "13.7 ¿Certificación MATPEL vigente en expedientes?",
    "aspectoLegal": "Ley Sobre Sustancias Peligrosas (Vigencia RACDA).",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 123,
    "conjunto": 13,
    "num": "8",
    "aspecto": "Expedientes de los Colaboradores",
    "pregunta": "13.8 ¿La Política de seguridad y salud laboral se encuentra firmada por los trabajadores?",
    "preguntaResumida": "13.8 ¿Política de SST firmada por trabajadores?",
    "aspectoLegal": "NT-04-2023.",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 124,
    "conjunto": 13,
    "num": "9",
    "aspecto": "Expedientes de los Colaboradores",
    "pregunta": "13.9 ¿La Política de seguridad vial se encuentra firmada por los trabajadores?",
    "preguntaResumida": "13.9 ¿Política vial firmada por trabajadores?",
    "aspectoLegal": "Ley de Transporte Terrestre / ISO 39001 (Ref).",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 125,
    "conjunto": 13,
    "num": "10",
    "aspecto": "Expedientes de los Colaboradores",
    "pregunta": "13.10 ¿Se realizan adecuadamente los cambios de condiciones acorde al lugar de trabajo?",
    "preguntaResumida": "13.10 ¿Notificación de cambios en condiciones de trabajo?",
    "aspectoLegal": "LOPCYMAT Art. 56.",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 126,
    "conjunto": 14,
    "num": "1",
    "aspecto": "Hoja de Seguimiento acumuladores inservibles",
    "pregunta": "14.1 ¿Las hojas de seguimiento cuentan con todos sus campos completados y en cumplimiento con los parámetros ambientales? (Rif del generador, número de manifiesto, RACDA del generador, descripción del material peligroso, número de providencia, fecha de providencia, sello de la empresa, descripción del material transportado).",
    "preguntaResumida": "14.1 ¿Hojas de seguimiento llenas correctamente?",
    "aspectoLegal": "Ley Sobre Sustancias y Desechos Peligrosos.",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - OPERACIONES - SSA"
  },
  {
    "item": 127,
    "conjunto": 14,
    "num": "2",
    "aspecto": "Hoja de Seguimiento acumuladores inservibles",
    "pregunta": "14.2 ¿Las hojas de seguimiento se encuentran impresas en material adecuado (no pueden ser hojas de reciclaje u hojas deterioradas)?",
    "preguntaResumida": "14.2 ¿Material de impresión hoja seguimiento adecuado?",
    "aspectoLegal": "Normativa Ambiental Vigente.",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - OPERACIONES - SSA"
  },
  {
    "item": 128,
    "conjunto": 14,
    "num": "3",
    "aspecto": "Hoja de Seguimiento acumuladores inservibles",
    "pregunta": "14.3 ¿Las hojas de transporte cuentan con todos sus campos completados y en cumplimiento con los parámetros ambientales? (Rif del generador, número de manifiesto, RACDA del generador, descripción del material peligroso, número de providencia, fecha de providencia, sello de la empresa, descripción del material transportado).",
    "preguntaResumida": "14.3 ¿Hojas de transporte llenas correctamente?",
    "aspectoLegal": "Ley Sobre Sustancias y Desechos Peligrosos.",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - OPERACIONES - SSA"
  },
  {
    "item": 129,
    "conjunto": 14,
    "num": "4",
    "aspecto": "Hoja de Seguimiento acumuladores inservibles",
    "pregunta": "14.4 ¿Las hojas de transporte se encuentran impresas en material adecuado (no pueden ser hojas de reciclaje u hojas deterioradas)?",
    "preguntaResumida": "14.4 ¿Material de impresión hoja transporte adecuado?",
    "aspectoLegal": "Normativa Ambiental Vigente.",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - OPERACIONES - SSA"
  },
  {
    "item": 130,
    "conjunto": 14,
    "num": "5",
    "aspecto": "Hoja de Seguimiento acumuladores inservibles",
    "pregunta": "14.5 ¿Las hojas de seguimiento y de transporte se encuentran debidamente organizadas cronológicamente en el archivo pertinente?",
    "preguntaResumida": "14.5 ¿Archivo cronológico de guías/hojas?",
    "aspectoLegal": "Ley Sobre Sustancias y Desechos Peligrosos.",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - OPERACIONES - SSA"
  },
  {
    "item": 131,
    "conjunto": 15,
    "num": "1",
    "aspecto": "Montacargas",
    "pregunta": "15.1 ¿Esta en buenas condiciones el/los montacargas (pintura, estructura, cauchos, asiento del operador, uñas de sujeción, torre, partes mecánicas, gancho de sujeción de cilindro de gas, condiciones del cilindro de gas, entre otras)?",
    "preguntaResumida": "15.1 ¿Montacargas en buenas condiciones generales?",
    "aspectoLegal": "COVENIN 3177:1995.",
    "grupoPilar": "VEHCP",
    "areaResponsable": "OPERACIONES"
  },
  {
    "item": 132,
    "conjunto": 15,
    "num": "2",
    "aspecto": "Montacargas",
    "pregunta": "15.2 ¿Se cuenta con extintor vigente, en buen estado y con ubicación fija?",
    "preguntaResumida": "15.2 ¿Extintor del montacargas vigente y fijo?",
    "aspectoLegal": "COVENIN 3177; COVENIN 1040.",
    "grupoPilar": "VEHCP",
    "areaResponsable": "OPERACIONES"
  },
  {
    "item": 133,
    "conjunto": 15,
    "num": "3",
    "aspecto": "Montacargas",
    "pregunta": "15.3 ¿Se cuenta con cinturón de seguridad en buen estado?",
    "preguntaResumida": "15.3 ¿Cinturón de seguridad en buen estado?",
    "aspectoLegal": "COVENIN 3177.",
    "grupoPilar": "VEHCP",
    "areaResponsable": "OPERACIONES"
  },
  {
    "item": 134,
    "conjunto": 15,
    "num": "4",
    "aspecto": "Montacargas",
    "pregunta": "15.4 ¿Los operadores de montacargas hacen uso adecuado del cinturón de seguridad?",
    "preguntaResumida": "15.4 ¿Uso del cinturón por el operador?",
    "aspectoLegal": "RCHST; COVENIN 3177.",
    "grupoPilar": "VEHCP",
    "areaResponsable": "OPERACIONES"
  },
  {
    "item": 135,
    "conjunto": 15,
    "num": "5",
    "aspecto": "Montacargas",
    "pregunta": "15.5 ¿Las luces frontales se encuentran en buenas condiciones?",
    "preguntaResumida": "15.5 ¿Luces frontales operativas?",
    "aspectoLegal": "COVENIN 3177.",
    "grupoPilar": "VEHCP",
    "areaResponsable": "OPERACIONES"
  },
  {
    "item": 136,
    "conjunto": 15,
    "num": "6",
    "aspecto": "Montacargas",
    "pregunta": "15.6 ¿El pito de circulación se encuentra en buenas condiciones?",
    "preguntaResumida": "15.6 ¿Alarma de retroceso/pito operativo?",
    "aspectoLegal": "COVENIN 3177.",
    "grupoPilar": "VEHCP",
    "areaResponsable": "OPERACIONES"
  },
  {
    "item": 137,
    "conjunto": 15,
    "num": "7",
    "aspecto": "Montacargas",
    "pregunta": "15.7 ¿La bocina o corneta de encuentra en buenas condiciones?",
    "preguntaResumida": "15.7 ¿Bocina operativa?",
    "aspectoLegal": "COVENIN 3177.",
    "grupoPilar": "VEHCP",
    "areaResponsable": "OPERACIONES"
  },
  {
    "item": 138,
    "conjunto": 15,
    "num": "8",
    "aspecto": "Montacargas",
    "pregunta": "15.8 ¿Se cuenta con el registro diario de inspecciones de montacargas?",
    "preguntaResumida": "15.8 ¿Registro de inspección diaria?",
    "aspectoLegal": "COVENIN 3177.",
    "grupoPilar": "VEHCP",
    "areaResponsable": "OPERACIONES"
  },
  {
    "item": 139,
    "conjunto": 15,
    "num": "9",
    "aspecto": "Montacargas",
    "pregunta": "15.9 ¿Se cuenta con el plan de mantenimiento del montacargas (trazabilidad)?",
    "preguntaResumida": "15.9 ¿Plan de mantenimiento (trazabilidad)?",
    "aspectoLegal": "COVENIN 3177.",
    "grupoPilar": "VEHCP",
    "areaResponsable": "OPERACIONES"
  },
  {
    "item": 140,
    "conjunto": 15,
    "num": "10",
    "aspecto": "Montacargas",
    "pregunta": "15.10 ¿Poseen licencia de 5ta vigente todos los operadores del montacargas (indicar quien opera el montacargas)?",
    "preguntaResumida": "15.10 ¿Licencia de 5ta grado vigente (Operador)?",
    "aspectoLegal": "Ley de Transporte Terrestre.",
    "grupoPilar": "VEHCP",
    "areaResponsable": "OPERACIONES"
  },
  {
    "item": 141,
    "conjunto": 15,
    "num": "11",
    "aspecto": "Montacargas",
    "pregunta": "15.11 ¿Todos los operadores de vehículos poseen certificados médicos vigentes?",
    "preguntaResumida": "15.11 ¿Certificado médico vigente (Operador)?",
    "aspectoLegal": "Ley de Transporte Terrestre.",
    "grupoPilar": "VEHCP",
    "areaResponsable": "OPERACIONES"
  },
  {
    "item": 142,
    "conjunto": 15,
    "num": "12",
    "aspecto": "Montacargas",
    "pregunta": "15.12 ¿Cuentan con evaluación médica especial todos los operadores de montacargas (Valoración oftalmológica, Evaluación auditiva)?. COVENIN 3331:2000, artículo 5.2.1. Evaluación médica. Esta norma regula los requisitos de seguridad para la operación de equipos de elevación, incluyendo montacargas.",
    "preguntaResumida": "15.12 ¿Evaluación médica especial (Visual/Auditiva)?",
    "aspectoLegal": "COVENIN 3331:2000 (Art. 5.2.1).",
    "grupoPilar": "VEHCP",
    "areaResponsable": "OPERACIONES"
  },
  {
    "item": 143,
    "conjunto": 15,
    "num": "13",
    "aspecto": "Montacargas",
    "pregunta": "15.13 ¿Todos los operadores de montacargas cuentan con la certificación correspondiente para su manejo?",
    "preguntaResumida": "15.13 ¿Certificación de manejo de montacargas?",
    "aspectoLegal": "LOPCYMAT (Formación); COVENIN 3177.",
    "grupoPilar": "VEHCP",
    "areaResponsable": "OPERACIONES"
  },
  {
    "item": 144,
    "conjunto": 16,
    "num": "1",
    "aspecto": "Almacenamiento - Cilindros de Gas Inflamable",
    "pregunta": "16.1 ¿Se observa en buenas condiciones los cilindros de gas inflamable?  Artículo 5.2 RCHST.",
    "preguntaResumida": "16.1 ¿Cilindros en buen estado?",
    "aspectoLegal": "RCHST Art. 5.2; COVENIN 3017.",
    "grupoPilar": "INFRA",
    "areaResponsable": "OPERACIONES - SSA"
  },
  {
    "item": 145,
    "conjunto": 16,
    "num": "2",
    "aspecto": "Almacenamiento - Cilindros de Gas Inflamable",
    "pregunta": "16.2 ¿Los cilindros de gas inflamable se almacenan en posición vertical y asegurados contra caídas?  Artículo 6.1 RCHST; NORMA 3017:2000. \nEn caso de estar inclinados se deberá garantizar:\nInclinación mínima y controlada:\n• El ángulo de inclinación debe ser lo más cercano posible a la vertical (idealmente menos de <15° - criterio de mitigación).\n• Se debe asegurar que la válvula permanezca por encima del nivel del líquido.",
    "preguntaResumida": "16.2 ¿Cilindros verticales y asegurados?",
    "aspectoLegal": "RCHST Art. 6.1; COVENIN 3017:2000 (<15° incl).",
    "grupoPilar": "INFRA",
    "areaResponsable": "OPERACIONES - SSA"
  },
  {
    "item": 146,
    "conjunto": 16,
    "num": "3",
    "aspecto": "Almacenamiento - Cilindros de Gas Inflamable",
    "pregunta": "16.3 ¿Los cilindros de gas inflamable están protegidos contra fuentes de calor, fuego o exposición directa al sol? Artículo 6.2 RCHST.",
    "preguntaResumida": "16.3 ¿Protección contra calor/sol?",
    "aspectoLegal": "RCHST Art. 6.2; COVENIN 3017.",
    "grupoPilar": "INFRA",
    "areaResponsable": "OPERACIONES - SSA"
  },
  {
    "item": 147,
    "conjunto": 16,
    "num": "4",
    "aspecto": "Almacenamiento - Cilindros de Gas Inflamable",
    "pregunta": "16.4 ¿Los cilindros de gas inflamable se encuentran en áreas ventiladas y alejadas de materiales combustibles? Artículo 6.3 RCHST.",
    "preguntaResumida": "16.4 ¿Área ventilada y sin combustibles cerca?",
    "aspectoLegal": "RCHST Art. 6.3.",
    "grupoPilar": "INFRA",
    "areaResponsable": "OPERACIONES - SSA"
  },
  {
    "item": 148,
    "conjunto": 16,
    "num": "5",
    "aspecto": "Almacenamiento - Cilindros de Gas Inflamable",
    "pregunta": "16.5 ¿Se utilizan equipos adecuados para mover los cilindros (cestas, carritos con barandas)? Artículo 7.1 RCHST.",
    "preguntaResumida": "16.5 ¿Uso de carros/cestas para traslado?",
    "aspectoLegal": "RCHST Art. 7.1.",
    "grupoPilar": "INFRA",
    "areaResponsable": "OPERACIONES - SSA"
  },
  {
    "item": 149,
    "conjunto": 16,
    "num": "6",
    "aspecto": "Almacenamiento - Cilindros de Gas Inflamable",
    "pregunta": "16.6 ¿Cada cilindro tiene claramente identificado el tipo de gas que contiene?  Artículo 4.3 RCHST",
    "preguntaResumida": "16.6 ¿Identificación del tipo de gas?",
    "aspectoLegal": "RCHST Art. 4.3.",
    "grupoPilar": "INFRA",
    "areaResponsable": "OPERACIONES - SSA"
  },
  {
    "item": 150,
    "conjunto": 16,
    "num": "7",
    "aspecto": "Almacenamiento - Cilindros de Gas Inflamable",
    "pregunta": "16.7 ¿Las estructuras utilizadas para el almacenamiento (colmenas) se encuentran en buenas condiciones sin evidencia de óxido o daños estructurales? Art. 6.3 COVENIN 3017:2000.",
    "preguntaResumida": "16.7 ¿Colmenas/Estructuras sin óxido/daños?",
    "aspectoLegal": "COVENIN 3017:2000 (Art. 6.3).",
    "grupoPilar": "INFRA",
    "areaResponsable": "OPERACIONES - SSA"
  },
  {
    "item": 151,
    "conjunto": 17,
    "num": "1",
    "aspecto": "Almacenamiento - Tanques de almacenamiento de combustible líquido",
    "pregunta": "17.1 ¿El o las estructuras de almacenamiento de combustibles líquidos presenta condiciones estructurales adecuadas (sin corrosión, fisuras o deformaciones)? Artículo 5.1.3 COVENIN 2842:91",
    "preguntaResumida": "17.1 ¿Tanques estructuralmente sanos?",
    "aspectoLegal": "COVENIN 2842:1991 (Art. 5.1.3).",
    "grupoPilar": "INFRA",
    "areaResponsable": "OPERACIONES - SSA"
  },
  {
    "item": 152,
    "conjunto": 17,
    "num": "2",
    "aspecto": "Almacenamiento - Tanques de almacenamiento de combustible líquido",
    "pregunta": "17.2 ¿El o las estructuras de almacenamiento de combustibles líquidos se encuentran sobre una superficie sólida, nivelada y especialmente construida para este propósito? Norma COVENIN 2842:91, Artículo 5.1.2",
    "preguntaResumida": "17.2 ¿Superficie sólida y nivelada?",
    "aspectoLegal": "COVENIN 2842:1991 (Art. 5.1.2).",
    "grupoPilar": "INFRA",
    "areaResponsable": "OPERACIONES - SSA"
  },
  {
    "item": 153,
    "conjunto": 17,
    "num": "3",
    "aspecto": "Almacenamiento - Tanques de almacenamiento de combustible líquido",
    "pregunta": "17.3 ¿Las estructuras destinadas al almacenamiento de combustibles líquidos cuentan con un muro de contención proporcional a su capacidad, conforme a lo establecido en el artículo 5.5.3 de la Norma COVENIN 2842:91? En caso de utilizarse pipotes, ¿estos se encuentran sobre paletas o bandejas de recolección adecuadas que impidan el derrame hacia el exterior?",
    "preguntaResumida": "17.3 ¿Muro de contención adecuado?",
    "aspectoLegal": "COVENIN 2842:1991 (Art. 5.5.3).",
    "grupoPilar": "INFRA",
    "areaResponsable": "OPERACIONES - SSA"
  },
  {
    "item": 154,
    "conjunto": 17,
    "num": "4",
    "aspecto": "Almacenamiento - Tanques de almacenamiento de combustible líquido",
    "pregunta": "17.4 ¿El muro o piscina de contención del tanque de almacenamiento de combustible líquido posee una capacidad mínima equivalente al 110% del volumen del tanque de mayor capacidad, está construido con materiales compatibles y resistentes al producto almacenado, y cumple con las medidas de seguridad necesarias para evitar la propagación de derrames, conforme a lo establecido en el artículo 5.5.3 de la Norma COVENIN 2842:91 y el artículo 55 del Reglamento de Higiene y Seguridad Industrial? En el caso de almacenamiento en pipotes, ¿estos se encuentran sobre paletas o bandejas de recolección adecuadas que impidan derrames hacia el exterior y garanticen contención efectiva ante posibles fugas?",
    "preguntaResumida": "17.4 ¿Capacidad del muro 110% del tanque mayor?",
    "aspectoLegal": "COVENIN 2842:1991; RCHST Art. 55.",
    "grupoPilar": "INFRA",
    "areaResponsable": "OPERACIONES - SSA"
  },
  {
    "item": 155,
    "conjunto": 17,
    "num": "5",
    "aspecto": "Almacenamiento - Tanques de almacenamiento de combustible líquido",
    "pregunta": "17.5 ¿Los tanques están alejados de fuentes de calor, llamas abiertas o equipos que generen chispas? Artículo 60 Reglamento de las Condiciones de Higiene y Seguridad en el Trabajo.",
    "preguntaResumida": "17.5 ¿Alejado de fuentes de ignición?",
    "aspectoLegal": "RCHST Art. 60.",
    "grupoPilar": "INFRA",
    "areaResponsable": "OPERACIONES - SSA"
  },
  {
    "item": 156,
    "conjunto": 17,
    "num": "6",
    "aspecto": "Almacenamiento - Tanques de almacenamiento de combustible líquido",
    "pregunta": "17.6 ¿El tanque de almacenamiento está ubicado fuera de edificaciones cerradas y en un área ventilada? Artículo 5.2.1: Los tanques deben instalarse en áreas abiertas para evitar acumulación de vapores inflamables COVENIN 2842:91",
    "preguntaResumida": "17.6 ¿Ubicación en área abierta/ventilada?",
    "aspectoLegal": "COVENIN 2842:1991 (Art. 5.2.1).",
    "grupoPilar": "INFRA",
    "areaResponsable": "OPERACIONES - SSA"
  },
  {
    "item": 157,
    "conjunto": 17,
    "num": "7",
    "aspecto": "Almacenamiento - Tanques de almacenamiento de combustible líquido",
    "pregunta": "17.7 ¿El tanque aéreo de almacenamiento de combustible líquido se encuentra a una distancia mínima de 6 metros de edificaciones, vías públicas o áreas de tránsito, salvo que se hayan implementado barreras físicas resistentes al fuego, muros de contención o sistemas de protección certificados por bomberos que permitan reducir dicha distancia según lo establecido en la Norma COVENIN 2842:91, artículo 5.3.2?",
    "preguntaResumida": "17.7 ¿Distancia mínima de 6m a edificaciones?",
    "aspectoLegal": "COVENIN 2842:1991 (Art. 5.3.2).",
    "grupoPilar": "INFRA",
    "areaResponsable": "OPERACIONES - SSA"
  },
  {
    "item": 158,
    "conjunto": 17,
    "num": "8",
    "aspecto": "Almacenamiento - Tanques de almacenamiento de combustible líquido",
    "pregunta": "17.8 ¿El tanque de almacenamiento de combustible líquido se encuentra libre de equipos eléctricos no clasificados y fuentes de ignición en su entorno inmediato, o en su defecto, dichos equipos están certificados para operar en atmósferas explosivas, conforme a lo establecido en la Norma COVENIN 2842:91 (artículo 5.6.2)? Además, ¿se han implementado medidas preventivas contra incendios y explosiones en el área circundante al tanque, según lo dispuesto en el Reglamento de las Condiciones de Higiene y Seguridad en el Trabajo (artículo 60)?",
    "preguntaResumida": "17.8 ¿Equipos eléctricos clasificados (antiexplosivos)?",
    "aspectoLegal": "COVENIN 2842:1991 (Art. 5.6.2); RCHST Art. 60.",
    "grupoPilar": "INFRA",
    "areaResponsable": "OPERACIONES - SSA"
  },
  {
    "item": 159,
    "conjunto": 17,
    "num": "9",
    "aspecto": "Almacenamiento - Tanques de almacenamiento de combustible líquido",
    "pregunta": "17.9 ¿La disposición final de aceites usados y combustibles líquidos se realiza conforme a lo establecido en el artículo 3 de la Norma Venezolana COVENIN 829:2024, garantizando que no se mezclen con residuos comunes y que sean entregados a gestores autorizados para su tratamiento o disposición final adecuada?",
    "preguntaResumida": "17.9 ¿Disposición final aceites según norma?",
    "aspectoLegal": "COVENIN 829:2024.",
    "grupoPilar": "INFRA",
    "areaResponsable": "OPERACIONES - SSA"
  },
  {
    "item": 160,
    "conjunto": 18,
    "num": "1",
    "aspecto": "Flota de Distribuidora",
    "pregunta": "18.1 ¿Se evidencia que se lleva la inspección diaria de vehículos de carga por parte de los vendedores de ruta y/o conductores?",
    "preguntaResumida": "18.1 ¿Inspección diaria de vehículos realizada?",
    "aspectoLegal": "Ley de Transporte Terrestre; ISO 39001 (Ref).",
    "grupoPilar": "VEHCP",
    "areaResponsable": "VENTAS - OPERACIONES - SSA"
  },
  {
    "item": 161,
    "conjunto": 18,
    "num": "2",
    "aspecto": "Flota de Distribuidora",
    "pregunta": "18.2 ¿El resultado de la inspección SSA vehículos de carga NG-SST-17 es satisfactoria o conforme?",
    "preguntaResumida": "18.2 ¿Resultado de inspección satisfactorio?",
    "aspectoLegal": "Norma Técnica NG-SST-17.",
    "grupoPilar": "VEHCP",
    "areaResponsable": "VENTAS - OPERACIONES - SSA"
  },
  {
    "item": 162,
    "conjunto": 18,
    "num": "3",
    "aspecto": "Flota de Distribuidora",
    "pregunta": "18.3 ¿El manejo de la capacidad de carga en la salida se encuentra dentro de los parámetros de la capacidad de carga específica de la unidad de transporte de carga? COVENIN 614:1997",
    "preguntaResumida": "18.3 ¿Carga de salida dentro de capacidad?",
    "aspectoLegal": "COVENIN 614:1997.",
    "grupoPilar": "VEHCP",
    "areaResponsable": "VENTAS - OPERACIONES - SSA"
  },
  {
    "item": 163,
    "conjunto": 18,
    "num": "4",
    "aspecto": "Flota de Distribuidora",
    "pregunta": "18.4 ¿El manejo de la capacidad de carga en el retorno se encuentra dentro de los parámetros de la capacidad de carga específica de la unidad de transporte de carga? COVENIN 614:1998",
    "preguntaResumida": "18.4 ¿Carga de retorno dentro de capacidad?",
    "aspectoLegal": "COVENIN 614:1997.",
    "grupoPilar": "VEHCP",
    "areaResponsable": "VENTAS - OPERACIONES - SSA"
  },
  {
    "item": 164,
    "conjunto": 18,
    "num": "5",
    "aspecto": "Flota de Distribuidora",
    "pregunta": "18.5 ¿El desgaste de la totalidad de los cauchos se encuentra dentro de parámetros aceptables y conformes?",
    "preguntaResumida": "18.5 ¿Desgaste de cauchos aceptable?",
    "aspectoLegal": "Ley de Transporte Terrestre; COVENIN 614.",
    "grupoPilar": "VEHCP",
    "areaResponsable": "VENTAS - OPERACIONES - SSA"
  },
  {
    "item": 165,
    "conjunto": 18,
    "num": "6",
    "aspecto": "Flota de Distribuidora",
    "pregunta": "18.6 ¿Se evidencia mantenimiento preventivo o correctivo con seguimiento de las unidades de carga (Trazabilidad)?",
    "preguntaResumida": "18.6 ¿Trazabilidad de mantenimiento?",
    "aspectoLegal": "Norma COVENIN 2500 (Mantenimiento).",
    "grupoPilar": "VEHCP",
    "areaResponsable": "VENTAS - OPERACIONES - SSA"
  },
  {
    "item": 166,
    "conjunto": 18,
    "num": "7",
    "aspecto": "Flota de Distribuidora",
    "pregunta": "18.7 ¿La flota cuenta con su kit para el lavado de ojos?",
    "preguntaResumida": "18.7 ¿Kit lavaojos en unidades?",
    "aspectoLegal": "Ley Sustancias Peligrosas.",
    "grupoPilar": "VEHCP",
    "areaResponsable": "VENTAS - OPERACIONES - SSA"
  },
  {
    "item": 167,
    "conjunto": 18,
    "num": "8",
    "aspecto": "Flota de Distribuidora",
    "pregunta": "18.8 ¿La flota cuenta con su kit para la atención de derrames?",
    "preguntaResumida": "18.8 ¿Kit de derrames en unidades?",
    "aspectoLegal": "Ley Sustancias Peligrosas.",
    "grupoPilar": "VEHCP",
    "areaResponsable": "VENTAS - OPERACIONES - SSA"
  },
  {
    "item": 168,
    "conjunto": 18,
    "num": "9",
    "aspecto": "Flota de Distribuidora",
    "pregunta": "18.9 ¿La flota cuenta con sus señalizaciones ONU en todos sus costados, Etiqueta RACDA actualizada, rombo N°9 en los costados laterales y posterior?",
    "preguntaResumida": "18.9 ¿Señalización ONU/RACDA/Rombo 9 visible?",
    "aspectoLegal": "Ley Sustancias Peligrosas; Normas Covenin/ONU.",
    "grupoPilar": "VEHCP",
    "areaResponsable": "VENTAS - OPERACIONES - SSA"
  },
  {
    "item": 169,
    "conjunto": 18,
    "num": "10",
    "aspecto": "Flota de Distribuidora",
    "pregunta": "18.10 ¿La documentación encontrada en la flota se encuentra completa y actualizada? (RACDA, certificaciones MAT-PEL, FDS, RCV, Póliza Ambiental, Plan de emergencia y urgencia para transporte)",
    "preguntaResumida": "18.10 ¿Documentación completa en flota?",
    "aspectoLegal": "Ley de Transporte Terrestre; RACDA.",
    "grupoPilar": "VEHCP",
    "areaResponsable": "VENTAS - OPERACIONES - SSA"
  },
  {
    "item": 170,
    "conjunto": 18,
    "num": "11",
    "aspecto": "Flota de Distribuidora",
    "pregunta": "18.11 ¿Cada unidad de la flota cuenta con los implementos requeridos para la atención de emergencias, incluyendo: extintor vigente y operativo acorde a las dimensiones de la unidad (10 a 20 lbs de capacidad), cono o triangúlo de seguridad, gato hidráulico en buen estado y adecuado al peso del vehículo (con su palanca de accionamiento), así como caucho de repuesto en condiciones óptimas de uso, llave de cruz o palanca?",
    "preguntaResumida": "18.11 ¿Implementos de emergencia (Gato, triángulo)?",
    "aspectoLegal": "Ley de Transporte Terrestre Art. 104; COVENIN.",
    "grupoPilar": "VEHCP",
    "areaResponsable": "VENTAS - OPERACIONES - SSA"
  },
  {
    "item": 171,
    "conjunto": 18,
    "num": "12",
    "aspecto": "Flota de Distribuidora",
    "pregunta": "18.12 ¿Los vehículos de la flota cuentan con cinturones de seguridad en buen estado, correctamente instalados, libres de daños visibles y plenamente funcionales para todos los ocupantes?",
    "preguntaResumida": "18.12 ¿Cinturones de seguridad operativos?",
    "aspectoLegal": "Ley de Transporte Terrestre.",
    "grupoPilar": "VEHCP",
    "areaResponsable": "VENTAS - OPERACIONES - SSA"
  },
  {
    "item": 172,
    "conjunto": 18,
    "num": "13",
    "aspecto": "Flota de Distribuidora",
    "pregunta": "18.13 ¿Los conductores de las unidades de transporte cuentan con la documentación legal vigente requerida para la operación de vehículos de carga pesada, incluyendo licencia de 5ta categoría, certificado médico correspondiente, y en caso de transportar cargas de alto riesgo o sobredimensionadas, el examen especializado conforme a lo establecido en el artículo 132 de la Ley de Transporte Terrestre (LTT)?",
    "preguntaResumida": "18.13 ¿Licencia 5ta y Certificado Médico vigentes?",
    "aspectoLegal": "Ley de Transporte Terrestre Art. 132.",
    "grupoPilar": "VEHCP",
    "areaResponsable": "VENTAS - OPERACIONES - SSA"
  },
  {
    "item": 173,
    "conjunto": 18,
    "num": "14",
    "aspecto": "Flota de Distribuidora",
    "pregunta": "18.14 ¿Los vehículos de la flota se encuentran en buenas condiciones para la operación (evaluar luces, parabrisas, estructura en general, habitaculos, entrevista con el conductor de la unidad que emita algún reporte relevante entre otros posibles hallazgos significativos)?",
    "preguntaResumida": "18.14 ¿Vehículos en buenas condiciones generales?",
    "aspectoLegal": "Ley de Transporte Terrestre.",
    "grupoPilar": "VEHCP",
    "areaResponsable": "VENTAS - OPERACIONES - SSA"
  }
];

// 2. CRITERIOS OFICIALES DE SERVICENTROS (117 ÍTEMS)
export const CRITERIOS_SERVICENTROS_OFICIALES: CriterioEvaluacion[] = [
  {
    "item": 1,
    "conjunto": 1,
    "num": "1",
    "aspecto": "Iluminación",
    "pregunta": "1.1 ¿En caso de no ser idónea la luz natural, son suficientes la luminarias encontradas en las distintas áreas de trabajo? COVENIN 2249.",
    "preguntaResumida": "1.1 ¿Es suficiente la iluminación (natural o artificial) en las áreas?",
    "aspectoLegal": "COVENIN 2249:1993 / RCHST Art. 125",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS"
  },
  {
    "item": 2,
    "conjunto": 1,
    "num": "2",
    "aspecto": "Iluminación",
    "pregunta": "1.2 ¿Las luminarias están limpias y en buenas condiciones?",
    "preguntaResumida": "1.2 ¿Están las luminarias limpias y operativas?",
    "aspectoLegal": "RCHST Art. 126",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS"
  },
  {
    "item": 3,
    "conjunto": 1,
    "num": "3",
    "aspecto": "Iluminación",
    "pregunta": "1.3 ¿Las luminarias se encuentran protegidas (con guardas o dispositivos de sujeción), de manera que se previene riesgo de caída de elementos de las bombillas o fluorescentes?",
    "preguntaResumida": "1.3 ¿Tienen las luminarias protección contra caída o rotura?",
    "aspectoLegal": "RCHST Art. 128",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS"
  },
  {
    "item": 4,
    "conjunto": 2,
    "num": "1",
    "aspecto": "Ventilación",
    "pregunta": "2.1 ¿La ventilación y extracción de aire es adecuada en cada una de las áreas? (Área de servicio técnico, área de carga, oficina de ventas. COVENIN 2254-95).",
    "preguntaResumida": "2.1 ¿Es adecuada la ventilación/extracción en todas las áreas?",
    "aspectoLegal": "COVENIN 2254:1995 / RCHST Cap. III",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS"
  },
  {
    "item": 5,
    "conjunto": 2,
    "num": "2",
    "aspecto": "Ventilación",
    "pregunta": "2.2 ¿Se encuentran en buenas condiciones los extractores de aire y/o ventiladores? (Se comprueba si es adecuado el funcionamiento de los aires acondicionados en las oficinas administrativas y comedor) COVENIN 2254-95.",
    "preguntaResumida": "2.2 ¿Están operativos los extractores y aires acondicionados?",
    "aspectoLegal": "COVENIN 2254:1995 / RCHST Art. 109",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS"
  },
  {
    "item": 6,
    "conjunto": 3,
    "num": "1",
    "aspecto": "Avisos o Señalizaciones según Norma Covenin 187-2003",
    "pregunta": "3.1 ¿El Aviso de No Fumar se encuentra claramente visible y correctamente fijado a la pared?",
    "preguntaResumida": "3.1 ¿Aviso de \"No Fumar\" visible y fijado?",
    "aspectoLegal": "Resolución Min. Salud 030 / LOPCYMAT Art. 53",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 7,
    "conjunto": 3,
    "num": "2",
    "aspecto": "Avisos o Señalizaciones según Norma Covenin 187-2003",
    "pregunta": "3.2 ¿El  Aviso de No Discriminación se encuentra claramente visible y correctamente fijado a la pared?",
    "preguntaResumida": "3.2 ¿Aviso de \"No Discriminación\" visible?",
    "aspectoLegal": "Constitución RBV Art. 89 / LOTTT",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 8,
    "conjunto": 3,
    "num": "3",
    "aspecto": "Avisos o Señalizaciones según Norma Covenin 187-2003",
    "pregunta": "3.3 ¿El Aviso de Prohibición de porte de armas se encuentra claramente visible y correctamente fijado a la pared?",
    "preguntaResumida": "3.3 ¿Aviso de \"Prohibición de Armas\" visible?",
    "aspectoLegal": "Ley para el Desarme y Control de Armas y Municiones",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 9,
    "conjunto": 3,
    "num": "4",
    "aspecto": "Avisos o Señalizaciones según Norma Covenin 187-2003",
    "pregunta": "3.4 ¿El Aviso del 911* se encuentra claramente visible y correctamente fijado a la pared?",
    "preguntaResumida": "3.4 ¿Aviso del número de emergencia 911 visible?",
    "aspectoLegal": "COVENIN 2226:1990",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 10,
    "conjunto": 3,
    "num": "5",
    "aspecto": "Avisos o Señalizaciones según Norma Covenin 187-2003",
    "pregunta": "3.5 ¿El cartel de información de SSA se encuentra en las áreas operativas de forma visible y correctamente fijado a la pared?",
    "preguntaResumida": "3.5 ¿Cartelera informativa de SSA visible en áreas operativas?",
    "aspectoLegal": "LOPCYMAT Art. 53 / NT-04-2023",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 11,
    "conjunto": 3,
    "num": "6",
    "aspecto": "Avisos o Señalizaciones según Norma Covenin 187-2003",
    "pregunta": "3.6 ¿Todas las áreas cuentan con su señalización de vía de escape y se encuentran claramente visibles y correctamente fijados a la pared?",
    "preguntaResumida": "3.6 ¿Señalización de vías de escape visible y fijada?",
    "aspectoLegal": "COVENIN 810:1998 / COVENIN 187:1992",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 12,
    "conjunto": 3,
    "num": "7",
    "aspecto": "Avisos o Señalizaciones según Norma Covenin 187-2003",
    "pregunta": "3.7 ¿Los equipos que puedan ocasionar daños a la salud de los trabajadores se encuentran claramente visibles y correctamente fijados a la pared (peligro elétrico, NFPA 704, DOT, entre otros)?",
    "preguntaResumida": "3.7 ¿Señalización de riesgos específicos (Eléctrico, NFPA, DOT)?",
    "aspectoLegal": "COVENIN 187:1992 / NFPA 704",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 13,
    "conjunto": 3,
    "num": "8",
    "aspecto": "Avisos o Señalizaciones según Norma Covenin 187-2003",
    "pregunta": "3.8 ¿Los equipos y sistemas de detección y extinción de incendios se encuentran claramente visibles y correctamente fijados a la pared, sin obstáculos que impidan su visualización (extintores, estaciones manuales, paños de manguera, tableros)? COVENIN 187 NORMA VENEZOLANA COLORES, SÍMBOLOS Y DIMENSIONES DE SEÑALES DE SEGURIDAD, punto 12 NOTA 2.",
    "preguntaResumida": "3.8 ¿Señalización visible de equipos contra incendio (sin obstáculos)?",
    "aspectoLegal": "COVENIN 187:1992 / COVENIN 1040",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 14,
    "conjunto": 3,
    "num": "9",
    "aspecto": "Avisos o Señalizaciones según Norma Covenin 187-2003",
    "pregunta": "3.9 ¿El contenedor de estopas usadas se encuentra claramente señalizado con el rombo DOT de la ONU, específicamente con el número 9?",
    "preguntaResumida": "3.9 ¿Contenedor de estopas identificado con Rombo ONU 9?",
    "aspectoLegal": "COVENIN 3060:2002 / Normas ONU",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 15,
    "conjunto": 3,
    "num": "10",
    "aspecto": "Avisos o Señalizaciones según Norma Covenin 3060-2011",
    "pregunta": "3.10 ¿Las zonas de almacenamiento de acumuladores eléctricos cuentan con la señalización del tipo rombo de la NFPA 704?",
    "preguntaResumida": "3.10 ¿Área de baterías identificada con Rombo NFPA 704?",
    "aspectoLegal": "NFPA 704 / COVENIN 3060",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 16,
    "conjunto": 4,
    "num": "1",
    "aspecto": "Almacenamiento",
    "pregunta": "4.1 ¿El almacenamiento se observa correctamente apilado, organizado y distribuido convenientemente en los racks, estanterias y en otras zonas donde se puede almacenar?.",
    "preguntaResumida": "4.1 ¿Almacenamiento apilado y organizado en racks/zonas?",
    "aspectoLegal": "RCHST Art. 12 / COVENIN 2248:1987",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 17,
    "conjunto": 4,
    "num": "2",
    "aspecto": "Almacenamiento",
    "pregunta": "4.2 ¿Las estanterías, racks o paletas se encuentran en buen estado? (Se revisa si han sufrido daños o si tienen alguna debilidad como no estar anclados al suelo).",
    "preguntaResumida": "4.2 ¿Estanterías y racks en buen estado y anclados?",
    "aspectoLegal": "RCHST Art. 12 / Normas Ingeniería Civil",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 18,
    "conjunto": 4,
    "num": "3",
    "aspecto": "Almacenamiento",
    "pregunta": "4.3 ¿Las baterías inservibles se mantienen protegidas de la intemperie?",
    "preguntaResumida": "4.3 ¿Baterías inservibles protegidas de la intemperie?",
    "aspectoLegal": "Ley Sobre Sustancias, Materiales y Desechos Peligrosos",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 19,
    "conjunto": 4,
    "num": "4",
    "aspecto": "Almacenamiento",
    "pregunta": "4.4 ¿El  piso  o  la  superficie  donde  se  almacenan las baterías inservibles es impermeable o el material del piso no permite la filtración al suelo del ácido?",
    "preguntaResumida": "4.4 ¿Piso impermeable en área de baterías (evita filtración ácida)?",
    "aspectoLegal": "Ley Sobre Sustancias, Materiales y Desechos Peligrosos",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS"
  },
  {
    "item": 20,
    "conjunto": 4,
    "num": "5",
    "aspecto": "Almacenamiento",
    "pregunta": "4.5 ¿El área de almacenamiento de baterías inservibles está alejada de fuentes de calor u otras fuentes  de  energía?",
    "preguntaResumida": "4.5 ¿Baterías alejadas de fuentes de calor o energía?",
    "aspectoLegal": "RCHST / COVENIN 2248",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS"
  },
  {
    "item": 21,
    "conjunto": 4,
    "num": "6",
    "aspecto": "Almacenamiento",
    "pregunta": "4.6 ¿ Se garantiza que el ácido contenido en los acumuladores no llegue a canales de agua de lluvia y/o servidas?",
    "preguntaResumida": "4.6 ¿Se garantiza que el ácido no llegue a drenajes o aguas?",
    "aspectoLegal": "Ley Penal del Ambiente / Ley de Aguas",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS"
  },
  {
    "item": 22,
    "conjunto": 4,
    "num": "7",
    "aspecto": "Almacenamiento",
    "pregunta": "4.7 ¿Las áreas destinadas al almacenamiento se mantienen en condiciones adecuadas de orden y limpieza?",
    "preguntaResumida": "4.7 ¿Orden y limpieza en áreas de almacenamiento?",
    "aspectoLegal": "RCHST Art. 54 / NT-04-2023",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 23,
    "conjunto": 5,
    "num": "1",
    "aspecto": "Herramientas y Equipos",
    "pregunta": "5.1 ¿Las zonas alrededor de los equipos y herramientas se encuentran en adecuado estado de orden y limpieza?",
    "preguntaResumida": "5.1 ¿Áreas de equipos y herramientas limpias y ordenadas?",
    "aspectoLegal": "RCHST Art. 54",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS"
  },
  {
    "item": 24,
    "conjunto": 5,
    "num": "2",
    "aspecto": "Herramientas y Equipos",
    "pregunta": "5.2 ¿Los equipos y herramientas se encuentran en buenas condiciones?",
    "preguntaResumida": "5.2 ¿Equipos y herramientas en buenas condiciones?",
    "aspectoLegal": "RCHST Título VI",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS"
  },
  {
    "item": 25,
    "conjunto": 5,
    "num": "3",
    "aspecto": "Herramientas y Equipos",
    "pregunta": "5.3 ¿Cuentan con contenedor de estopas usadas? En distribuidora aplica para el área de ventas y almacén. (si esta respuesta es no conforme, entonces la 3.9 también lo es).",
    "preguntaResumida": "5.3 ¿Existe contenedor para estopas usadas?",
    "aspectoLegal": "Ley Sobre Sustancias y Desechos Peligrosos",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 26,
    "conjunto": 5,
    "num": "4",
    "aspecto": "Herramientas y Equipos",
    "pregunta": "5.4 ¿El contenedor de estopas usadas contiene solo residuos de estopas sucias o desechos de acumuladores eléctricos de plomo ácido?",
    "preguntaResumida": "5.4 ¿Contenedor de estopas solo tiene residuos permitidos?",
    "aspectoLegal": "Dec. 2635 (Manejo Desechos Peligrosos)",
    "grupoPilar": "SSA",
    "areaResponsable": "OPERACIONES"
  },
  {
    "item": 27,
    "conjunto": 5,
    "num": "5",
    "aspecto": "Herramientas y Equipos",
    "pregunta": "5.5 ¿Las carretillas o transpaletas se encuentran en buenas condiciones (carretillas: estructura general, asas, cauchos; transpaletas: estructura general, asas, ruedas, gato)?",
    "preguntaResumida": "5.5 ¿Carretillas y transpaletas en buen estado (ruedas, gatos)?",
    "aspectoLegal": "COVENIN 2248:1987",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 28,
    "conjunto": 5,
    "num": "6",
    "aspecto": "Herramientas y Equipos",
    "pregunta": "5.6 ¿Las áreas destinadas al almacenamiento se mantienen en condiciones adecuadas de orden y limpieza?",
    "preguntaResumida": "5.6 ¿Mantenimiento de orden y limpieza en almacenes?",
    "aspectoLegal": "RCHST Art. 54",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 29,
    "conjunto": 6,
    "num": "1",
    "aspecto": "Sistema de extinción y detección de incendios",
    "pregunta": "6.1 ¿Los extintores están en su sitio y adecuadamente señalizados según el tipo de fuego (etiqueta con identificación, instrucciones de uso, clase de fuego para el cual es indicado su uso, fecha del ultimo mantenimiento, capacidad del extintor y potencial de efectividad)?",
    "preguntaResumida": "6.1 ¿Extintores señalizados, con instrucciones y vigentes?",
    "aspectoLegal": "COVENIN 1040:2006 / COVENIN 1213",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 30,
    "conjunto": 6,
    "num": "2",
    "aspecto": "Sistema de extinción y detección de incendios",
    "pregunta": "6.2 ¿Los extintores se encuentran accesibles y sin elementos que obstaculicen su acceso? COVENIN 1213:98 PUNTO 4.1.",
    "preguntaResumida": "6.2 ¿Extintores accesibles y sin obstáculos?",
    "aspectoLegal": "COVENIN 1213:1998 Punto 4.1",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 31,
    "conjunto": 6,
    "num": "3",
    "aspecto": "Sistema de extinción y detección de incendios",
    "pregunta": "6.3 ¿Los extintores se encuentran dentro de las fechas validas de servicio de mantenimiento? ANUAL, COVENIN 1213:98 PUNTO 4.3.",
    "preguntaResumida": "6.3 ¿Extintores con mantenimiento anual vigente?",
    "aspectoLegal": "COVENIN 1213:1998 Punto 4.3",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 32,
    "conjunto": 6,
    "num": "4",
    "aspecto": "Sistema de extinción y detección de incendios",
    "pregunta": "6.4 ¿Los extintores están correctamente instalados, colgados o montados a una altura no menor de 10 cm ni mayor de 1,30 m desde el nivel del suelo, conforme al punto 5.8.4 de la norma COVENIN 1040:2006?",
    "preguntaResumida": "6.4 ¿Altura de extintores correcta (10cm a 1.30m)?",
    "aspectoLegal": "COVENIN 1040:2006 Punto 5.8.4",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 33,
    "conjunto": 6,
    "num": "5",
    "aspecto": "Sistema de extinción y detección de incendios",
    "pregunta": "6.5 ¿El local cuenta con sistema de detección y alarma de incendios?",
    "preguntaResumida": "6.5 ¿Existe sistema de detección y alarma de incendios?",
    "aspectoLegal": "COVENIN 1376 / RCHST",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 34,
    "conjunto": 6,
    "num": "6",
    "aspecto": "Sistema de extinción y detección de incendios",
    "pregunta": "6.6 ¿El sistema de detección y alarma de incendios funciona correctamente?",
    "preguntaResumida": "6.6 ¿El sistema de detección funciona correctamente?",
    "aspectoLegal": "COVENIN 1376 / COVENIN 1041",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 35,
    "conjunto": 6,
    "num": "7",
    "aspecto": "Sistema de extinción y detección de incendios",
    "pregunta": "6.7 ¿Las luces de emergencia se encuentran operativas y en buen estado?",
    "preguntaResumida": "6.7 ¿Luces de emergencia operativas y buen estado?",
    "aspectoLegal": "COVENIN 1110",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 36,
    "conjunto": 6,
    "num": "8",
    "aspecto": "Sistema de extinción y detección de incendios",
    "pregunta": "6.8 ¿La estaciones manuales se encuentran libres de obstáculos y en buen estado?",
    "preguntaResumida": "6.8 ¿Estaciones manuales libres de obstáculos y buen estado?",
    "aspectoLegal": "COVENIN 758 / COVENIN 1376",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 37,
    "conjunto": 7,
    "num": "1",
    "aspecto": "Atención de Emergencias",
    "pregunta": "7.1 ¿ Se cuenta con plan de emergencia?  COVENIN 823-2:1997 SIST. DE PROTECCIÓN CONTRA INCENDIO, punto 4.3.1; COVENIN 2226:90 GUIA PARA LA ELABORACIÓN DE PLANES PARA EL CONTROL DE EMERGENCIAS, punto 5.1; 5.1.1",
    "preguntaResumida": "7.1 ¿Se cuenta con Plan de Emergencia documentado?",
    "aspectoLegal": "COVENIN 2226:1990 / COVENIN 823-2",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 38,
    "conjunto": 7,
    "num": "2",
    "aspecto": "Atención de Emergencias",
    "pregunta": "7.2 ¿El personal del Servicientro cuenta con la formación completa en materia de brigada de emergencia? COVENIN 823-2:1997 SIST. DE PROTECCIÓN CONTRA INCENDIO punto 4.3.1 y 4.3.2 / COVENIN 3478:1999 SOCORRIMO EN LAS EMPRESAS puntos 4.1;4.1.1;4.1.2, en caso de contar con uno o dos trabajadores, todos deberán contar con formaciones relacionadas a emergencias (manejo de extinores, primeros auxilios, desalojo, manejo de materiales peligrosos).",
    "preguntaResumida": "7.2 ¿Personal formado en brigada de emergencia integral?",
    "aspectoLegal": "COVENIN 3478:1999 / COVENIN 823-2",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 39,
    "conjunto": 7,
    "num": "3",
    "aspecto": "Atención de Emergencias",
    "pregunta": "7.3 ¿Se realiza el adiestramiento continuo a los trabajadores en materia de brigada de emergencia? COVENIN 3478:1999 SOCORRIMO EN LAS EMPRESAS punto 4.1.2.",
    "preguntaResumida": "7.3 ¿Existe adiestramiento continuo para la brigada?",
    "aspectoLegal": "COVENIN 3478:1999 Punto 4.1.2",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 40,
    "conjunto": 7,
    "num": "4",
    "aspecto": "Atención de Emergencias",
    "pregunta": "7.4 ¿Se realizan simulacros de desalojo por lo menos una vez al año? COVENIN 2226:90 GUIA PARA LA ELABORACIÓN DE PLANES PARA EL CONTROL DE EMERGENCIAS Punto 5.1.3.",
    "preguntaResumida": "7.4 ¿Se realizan simulacros de desalojo anuales?",
    "aspectoLegal": "COVENIN 2226:1990 Punto 5.1.3",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 41,
    "conjunto": 7,
    "num": "5",
    "aspecto": "Atención de Emergencias",
    "pregunta": "7.5 ¿Las puertas para salir se abren fácilmente desde el interior? NORMA COVENIN 810:1998 CARCATERISTICAS DE LOS MEDIOS DE ESCAPE EN EDIFICACIONES SEGÚN EL TIPO DE OCUPACIÓN punto 5.",
    "preguntaResumida": "7.5 ¿Puertas de salida abren fácilmente desde el interior?",
    "aspectoLegal": "COVENIN 810:1998 Punto 5",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 42,
    "conjunto": 7,
    "num": "6",
    "aspecto": "Atención de Emergencias",
    "pregunta": "7.6 ¿Las puertas de emergencia se encuentran libres de obstáculos, en buen estado y su apertura es en dirección de escape? NORMA COVENIN 810:1998 CARCATERISTICAS DE LOS MEDIOS DE ESCAPE EN EDIFICACIONES SEGÚN EL TIPO DE OCUPACIÓN punto 5",
    "preguntaResumida": "7.6 ¿Puertas de emergencia libres y abren hacia afuera?",
    "aspectoLegal": "COVENIN 810:1998 Punto 5",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 43,
    "conjunto": 8,
    "num": "1",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.1 ¿ El mobiliario de la oficina se encuentran en buenas condiciones (sillas, mesón de trabajo, gabinetes, entre otros)?",
    "preguntaResumida": "8.1 ¿Mobiliario de oficina ergonómico y en buen estado?",
    "aspectoLegal": "LOPCYMAT (Ergonomía) / NT-04-2023",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 44,
    "conjunto": 8,
    "num": "2",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.2 ¿La oficina de ventas se mantiene en condiciones adecuadas de orden y limpieza?",
    "preguntaResumida": "8.2 ¿Oficina de ventas ordenada y limpia?",
    "aspectoLegal": "RCHST Art. 54",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 45,
    "conjunto": 8,
    "num": "3",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.3 ¿Los tableros, tomacorrientes, conectores y cableado eléctrico se encuentran adecuadamente canalizados, protegidos y en buen estado?",
    "preguntaResumida": "8.3 ¿Cableado eléctrico canalizado y protegido?",
    "aspectoLegal": "Código Eléctrico Nacional / RCHST",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 46,
    "conjunto": 8,
    "num": "4",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.4 ¿Las regletas y tomacorrientes se encuentran libres de sobrecarga eléctrica, con conexiones adecuadas y sin exceder la capacidad máxima permitida por sus especificaciones técnicas?",
    "preguntaResumida": "8.4 ¿Regletas y tomas sin sobrecarga eléctrica?",
    "aspectoLegal": "Código Eléctrico Nacional / RCHST",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 47,
    "conjunto": 8,
    "num": "5",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.5 ¿Las puertas, cerraduras y manillas mantienen un funcionamiento adecuado?",
    "preguntaResumida": "8.5 ¿Puertas y cerraduras funcionan correctamente?",
    "aspectoLegal": "RCHST (Condiciones Generales)",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 48,
    "conjunto": 8,
    "num": "6",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.6 ¿La localidad cuenta con tanque de almacenamiento de agua de uso sanitario en buenas condiciones, para el suministro continuo del vital líquido en caso de fallas eléctricas e interrupciones del suministro de agua local?",
    "preguntaResumida": "8.6 ¿Tanque de agua sanitario operativo para contingencias?",
    "aspectoLegal": "RCHST Art. 67",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 49,
    "conjunto": 8,
    "num": "7",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.7 ¿En caso de ser subterraneo el tanque, cuenta con bomba de agua en buenas condiciones, que permita el suministro del agua constante al momento de ser requerido (fallas en el suministro de agua)?",
    "preguntaResumida": "8.7 ¿Bomba de agua operativa (si aplica tanque subterráneo)?",
    "aspectoLegal": "RCHST Art. 67",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 50,
    "conjunto": 8,
    "num": "8",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.8 ¿Los baños cuentan con dispensador de jabón y papel higiénico?",
    "preguntaResumida": "8.8 ¿Baños con dispensadores de jabón y papel?",
    "aspectoLegal": "RCHST Art. 76",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 51,
    "conjunto": 8,
    "num": "9",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.9 ¿las piezas sanitarias se encuentran en funcionamiento y en buen estado?",
    "preguntaResumida": "8.9 ¿Piezas sanitarias funcionales y en buen estado?",
    "aspectoLegal": "RCHST Art. 73",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 52,
    "conjunto": 8,
    "num": "10",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.10 ¿Los dispensadores de papel y jabón cuentan con suministro?",
    "preguntaResumida": "8.10 ¿Dispensadores de baños con suministro activo?",
    "aspectoLegal": "RCHST Art. 76",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 53,
    "conjunto": 8,
    "num": "11",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.11 ¿Los baños se mantienen en condiciones adecuadas de orden, limpieza e higiene, garantizando su uso seguro y confortable para el personal propio y para los clientes?",
    "preguntaResumida": "8.11 ¿Higiene y limpieza garantizada en baños?",
    "aspectoLegal": "RCHST Art. 79-80",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 54,
    "conjunto": 8,
    "num": "12",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.12 ¿El suministro de papel higiénico, papel secante y jabón líquido es adecuado?",
    "preguntaResumida": "8.12 ¿Suministro adecuado de papel, jabón y secante?",
    "aspectoLegal": "RCHST Art. 76",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 55,
    "conjunto": 8,
    "num": "13",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.13 ¿El área destinada al suministro de papel higiénico, papel secante, jabón líquido y demás consumibles se mantiene en condiciones adecuadas de orden, limpieza e higiene?",
    "preguntaResumida": "8.13 ¿Almacén de consumibles de limpieza ordenado?",
    "aspectoLegal": "RCHST Art. 54",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 56,
    "conjunto": 8,
    "num": "14",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.14 ¿Cuentan con un espacio habilitado para ser usado como comedor?",
    "preguntaResumida": "8.14 ¿Existe espacio habilitado para comedor?",
    "aspectoLegal": "LOPCYMAT Art. 59 / RCHST Art. 83",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS"
  },
  {
    "item": 57,
    "conjunto": 8,
    "num": "15",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.15 ¿El área destinada al consumo de alimentos está debidamente separada de las áreas de trabajo, almacenamiento o agentes contaminantes?",
    "preguntaResumida": "8.15 ¿Comedor separado de áreas de trabajo/contaminantes?",
    "aspectoLegal": "RCHST Art. 83",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 58,
    "conjunto": 8,
    "num": "16",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.16 ¿El área de comedor se encuentra debidamente aclimatada para garantizar condiciones térmicas adecuadas durante el consumo de alimentos?",
    "preguntaResumida": "8.16 ¿Comedor con temperatura/clima adecuado?",
    "aspectoLegal": "RCHST Art. 84",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 59,
    "conjunto": 8,
    "num": "17",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.17 ¿El área destinada al consumo de alimentos dispone de los equipos e implementos pertinentes (nevera, microondas, mesa, sillas) y estos se encuentran en buen estado de funcionamiento e higiene?",
    "preguntaResumida": "8.17 ¿Equipos de comedor (nevera, microondas) higiénicos?",
    "aspectoLegal": "RCHST Art. 85",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 60,
    "conjunto": 8,
    "num": "18",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.18 ¿El área destinada al consumo de alimentos y sus equipos se mantienen en condiciones adecuadas de orden, limpieza e higiene?",
    "preguntaResumida": "8.18 ¿Orden y limpieza en el área de comedor?",
    "aspectoLegal": "RCHST Art. 88",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 61,
    "conjunto": 8,
    "num": "19",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.19 ¿ El filtro de agua se encuentra en funcionamiento y se mantiene la higiene del mismo?",
    "preguntaResumida": "8.19 ¿Filtro de agua funcional e higiénico?",
    "aspectoLegal": "RCHST Art. 70",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 62,
    "conjunto": 8,
    "num": "20",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.20 ¿El filtro de agua y los botellones se encuentran correctamente ubicados, almacenados y separados de fuentes de contaminación?",
    "preguntaResumida": "8.20 ¿Filtro y botellones alejados de contaminación?",
    "aspectoLegal": "RCHST Art. 71",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 63,
    "conjunto": 8,
    "num": "21",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.21 ¿El filtro de agua cuenta con dispensador de vasos cónicos en buen estado, con suministro disponible?",
    "preguntaResumida": "8.21 ¿Dispensador de vasos cónicos disponible?",
    "aspectoLegal": "RCHST Art. 72",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 64,
    "conjunto": 8,
    "num": "22",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.22 ¿El filtro de agua, esta ubicado de forma accesible a los trabajadores y a los clientes?",
    "preguntaResumida": "8.22 ¿Filtro de agua accesible a todos?",
    "aspectoLegal": "RCHST Art. 68",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 65,
    "conjunto": 8,
    "num": "23",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.23 ¿El techo se encuentra en buenas condiciones, libre de goteras o filtraciones, y cuenta con sistemas adecuados de canalización de aguas pluviales?",
    "preguntaResumida": "8.23 ¿Techo sin goteras y con drenaje pluvial?",
    "aspectoLegal": "RCHST Art. 9",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 66,
    "conjunto": 8,
    "num": "24",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.24 ¿Las paredes se encuentran en buenas condiciones, libres de grietas, fracturas, filtraciones u otros signos de deterioro estructural o superficial?",
    "preguntaResumida": "8.24 ¿Paredes sin grietas ni deterioro?",
    "aspectoLegal": "RCHST Art. 9",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 67,
    "conjunto": 8,
    "num": "25",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.25 ¿El piso del área de la distribuidora se encuentra en buenas condiciones, libre de desniveles, grietas, humedad o daños que comprometan la seguridad y limpieza del espacio?",
    "preguntaResumida": "8.25 ¿Piso nivelado, sin grietas ni humedad?",
    "aspectoLegal": "RCHST Art. 13",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 68,
    "conjunto": 8,
    "num": "26",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.26 ¿La pintura del servicentro se encuentra en buen estado, libre de desprendimientos, manchas, deterioro o signos de falta de mantenimiento?",
    "preguntaResumida": "8.26 ¿Pintura general en buen estado?",
    "aspectoLegal": "RCHST Art. 17",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 69,
    "conjunto": 8,
    "num": "27",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.27 ¿Las áreas de trabajo y circulación se mantienen en condiciones adecuadas de orden y limpieza, libres de obstrucciones, residuos, materiales innecesarios o peligrosos?",
    "preguntaResumida": "8.27 ¿Áreas de circulación libres de obstáculos?",
    "aspectoLegal": "RCHST Art. 54",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 70,
    "conjunto": 8,
    "num": "28",
    "aspecto": "Instalaciones del local",
    "pregunta": "8.28 ¿Las áreas operativas cuentan con demarcación de piso visible, continua y en buen estado, que permita identificar zonas de tránsito e identificación de puestos para vehículos?",
    "preguntaResumida": "8.28 ¿Demarcación de pisos visible y en buen estado?",
    "aspectoLegal": "COVENIN 187 / RCHST",
    "grupoPilar": "INFRA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 71,
    "conjunto": 9,
    "num": "1",
    "aspecto": "Equipos de protección colectiva",
    "pregunta": "9.1 ¿Se cuenta con ducha o fuente lavaojos para casos de emergencia?",
    "preguntaResumida": "9.1 ¿Existe ducha o fuente lavaojos de emergencia?",
    "aspectoLegal": "COVENIN 1056-1 / COVENIN 1056-2",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 72,
    "conjunto": 9,
    "num": "2",
    "aspecto": "Equipos de protección colectiva",
    "pregunta": "9.2 ¿Los componentes de la ducha y fuente lavaojos se encuentran completos y en buenas condiciones?",
    "preguntaResumida": "9.2 ¿Ducha/Lavaojos completa y en buen estado?",
    "aspectoLegal": "COVENIN 1056",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 73,
    "conjunto": 9,
    "num": "3",
    "aspecto": "Equipos de protección colectiva",
    "pregunta": "9.3 ¿Es suficiente la presión de agua para la adecuada utilización de la ducha o fuente lava ojos?",
    "preguntaResumida": "9.3 ¿Presión de agua suficiente en ducha/lavaojos?",
    "aspectoLegal": "COVENIN 1056",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 74,
    "conjunto": 9,
    "num": "4",
    "aspecto": "Equipos de protección colectiva",
    "pregunta": "9.4 ¿Se cuenta con botiquín de primeros auxilios en buenas condiciones, señalizado y adherido a la pared de forma visible y accesible?",
    "preguntaResumida": "9.4 ¿Botiquín visible, señalizado y adherido a pared?",
    "aspectoLegal": "COVENIN 3478:1999",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 75,
    "conjunto": 9,
    "num": "5",
    "aspecto": "Equipos de protección colectiva",
    "pregunta": "9.5 ¿ El botiquín de primeros auxilios cuenta con todos los insumos descritos en la norma COVENIN 3478:199?",
    "preguntaResumida": "9.5 ¿Contenido del botiquín completo según norma?",
    "aspectoLegal": "COVENIN 3478:1999 (Tablas 1, 2 o 3)",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 76,
    "conjunto": 9,
    "num": "6",
    "aspecto": "Equipos de protección colectiva",
    "pregunta": "9.6 ¿Se cuenta con los implementos necesarios para contener derrames de ácidos (Kit para caso de derrame)?",
    "preguntaResumida": "9.6 ¿Kit para control de derrames ácidos disponible?",
    "aspectoLegal": "Ley Sust. Materiales Peligrosos / MATPEL",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES"
  },
  {
    "item": 77,
    "conjunto": 10,
    "num": "1",
    "aspecto": "Uniforme y equipo de protección personal",
    "pregunta": "10.1 ¿Los trabajadores hacen uso adecuado del uniforme?",
    "preguntaResumida": "10.1 ¿Uso adecuado del uniforme por trabajadores?",
    "aspectoLegal": "LOPCYMAT Art. 53 / COVENIN 2237",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES - SSA"
  },
  {
    "item": 78,
    "conjunto": 10,
    "num": "2",
    "aspecto": "Uniforme y equipo de protección personal",
    "pregunta": "10.2 ¿Los uniformes se encuentran en buen estado?",
    "preguntaResumida": "10.2 ¿Uniformes en buen estado?",
    "aspectoLegal": "LOPCYMAT Art. 53",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES - SSA"
  },
  {
    "item": 79,
    "conjunto": 10,
    "num": "3",
    "aspecto": "Uniforme y equipo de protección personal",
    "pregunta": "10.3 ¿Los trabajadores hacen uso adecuado de los EPP, uniformes, lentes de seguridad, guantes y botas de seguridad?",
    "preguntaResumida": "10.3 ¿Uso correcto de EPP (lentes, guantes, botas)?",
    "aspectoLegal": "LOPCYMAT Art. 53 / COVENIN 2237",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES - SSA"
  },
  {
    "item": 80,
    "conjunto": 11,
    "num": "1",
    "aspecto": "Cartelera de Seguridad, Salud y Ambiente",
    "pregunta": "11.1 ¿La Política de SSL está disponible y actualizada según la Norma NG-SST-002?",
    "preguntaResumida": "11.1 ¿Política de SSL disponible y actualizada?",
    "aspectoLegal": "NT-04-2023 (Deroga NT-01-2008)",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES - SSA"
  },
  {
    "item": 81,
    "conjunto": 11,
    "num": "2",
    "aspecto": "Cartelera de Seguridad, Salud y Ambiente",
    "pregunta": "11.2 ¿Se cuenta con la Ficha de Datos de Seguridad FDS para acumuladores eléctricos Plomo-Ácido, AT-SSA-072, en la entrada de los álmacenes de acumuladores eléctricos plomo ácidos?",
    "preguntaResumida": "11.2 ¿FDS (Hoja de Seguridad) de Baterías visible en almacén?",
    "aspectoLegal": "COVENIN 3059 / LOPCYMAT",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES - SSA"
  },
  {
    "item": 82,
    "conjunto": 11,
    "num": "3",
    "aspecto": "Cartelera de Seguridad, Salud y Ambiente",
    "pregunta": "11.3 ¿Se cuenta con el plan de emergencia según la norma COVENIN 823-2:1997 SIST. DE PROTECCIÓN CONTRA INCENDIO:1997 punto 4.3.1?",
    "preguntaResumida": "11.3 ¿Plan de Emergencia cumple COVENIN 823-2?",
    "aspectoLegal": "COVENIN 823-2:1997",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES - SSA"
  },
  {
    "item": 83,
    "conjunto": 11,
    "num": "4",
    "aspecto": "Cartelera de Seguridad, Salud y Ambiente",
    "pregunta": "11.4 ¿Se encuentra publicado el permiso de bomberos en la cartelera fiscal?",
    "preguntaResumida": "11.4 ¿Permiso de Bomberos publicado en cartelera?",
    "aspectoLegal": "Ley Orgánica del Servicio de Bomberos",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES - SSA"
  },
  {
    "item": 84,
    "conjunto": 11,
    "num": "5",
    "aspecto": "Cartelera de Seguridad, Salud y Ambiente",
    "pregunta": "11.5 ¿Se encuentra vigente el permiso de bomberos?",
    "preguntaResumida": "11.5 ¿Permiso de Bomberos vigente?",
    "aspectoLegal": "Ley Orgánica del Servicio de Bomberos",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES - SSA"
  },
  {
    "item": 85,
    "conjunto": 11,
    "num": "6",
    "aspecto": "Cartelera de Seguridad, Salud y Ambiente",
    "pregunta": "11.6 ¿Se cuenta con la accidentabilidad actualizada? (Norma Técnica de Programa de Seguridad y Salud en el Trabajo, numeral 2.6.1).",
    "preguntaResumida": "11.6 ¿Índices de accidentabilidad actualizados?",
    "aspectoLegal": "NT-04-2023 (Num. 2.6.1) / COVENIN 474",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES - SSA"
  },
  {
    "item": 86,
    "conjunto": 11,
    "num": "7",
    "aspecto": "Cartelera de Seguridad, Salud y Ambiente",
    "pregunta": "11.7 ¿Se cuenta con la morbilidad actualizada? (Norma Técnica de Programa de Seguridad y Salud en el Trabajo, numeral 2.6.1).",
    "preguntaResumida": "11.7 ¿Índices de morbilidad actualizados?",
    "aspectoLegal": "NT-04-2023 (Num. 2.6.1)",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES - SSA"
  },
  {
    "item": 87,
    "conjunto": 11,
    "num": "8",
    "aspecto": "Cartelera de Seguridad, Salud y Ambiente",
    "pregunta": "11.8 ¿Cuenta con Mapa de riesgo del local COVENIN 810:1998 CARACTERISTICAS DE LOS MEDIOS DE ESCAPE  EN EDIFICACIONES SEGÚN EL TIPO DE OCUPACIÓN punto 5.1.7; COVENIN 1642:2001 PLANOS DE USO BOMBERIL PARA EL SERVICIO CONTRA INCENDIO punto 4.1.5?",
    "preguntaResumida": "11.8 ¿Mapa de riesgos publicado y visible?",
    "aspectoLegal": "COVENIN 810 / NT-04-2023",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - OPERACIONES - SSA"
  },
  {
    "item": 88,
    "conjunto": 12,
    "num": "1",
    "aspecto": "Gestión de Seguridad, Salud y Ambiente",
    "pregunta": "12.1 ¿Se ha realizado el programa de mantenimiento para los sistemas contra incendios de acuerdo a lo estipulado en la Norma Covenin 823:1997, en el punto 4.5.3 (Semestral)?",
    "preguntaResumida": "12.1 ¿Mantenimiento semestral sistema contra incendios?",
    "aspectoLegal": "COVENIN 823:1997 Punto 4.5.3",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS"
  },
  {
    "item": 89,
    "conjunto": 12,
    "num": "2",
    "aspecto": "Gestión de Seguridad, Salud y Ambiente",
    "pregunta": "12.2 ¿Se ha realizado la revisión de los extintores tal como lo indica el programa de inspección (cada 6 meses)?",
    "preguntaResumida": "12.2 ¿Inspección de extintores (Semestral)?",
    "aspectoLegal": "COVENIN 1213:1998",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 90,
    "conjunto": 12,
    "num": "3",
    "aspecto": "Gestión de Seguridad, Salud y Ambiente",
    "pregunta": "12.3 ¿Se ha realizado la revisión de Orden y limpieza tal como lo indica el programa de inspección (1 vez mensual)?",
    "preguntaResumida": "12.3 ¿Inspección mensual de Orden y Limpieza?",
    "aspectoLegal": "NT-04-2023 (Programa SST)",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 91,
    "conjunto": 12,
    "num": "4",
    "aspecto": "Gestión de Seguridad, Salud y Ambiente",
    "pregunta": "12.4 ¿Se ha realizado la revisión de herramientas y equipos tal como lo indica el programa de inspección (1 vez al mes)?",
    "preguntaResumida": "12.4 ¿Inspección mensual de herramientas?",
    "aspectoLegal": "RCHST / NT-04-2023",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 92,
    "conjunto": 12,
    "num": "5",
    "aspecto": "Gestión de Seguridad, Salud y Ambiente",
    "pregunta": "12.5 ¿Se ha realizado la revisión del sistema de detección de incendios tal como lo indica el programa de inspección (cada 3 meses)?",
    "preguntaResumida": "12.5 ¿Inspección trimestral detección de incendios?",
    "aspectoLegal": "COVENIN 1376",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 93,
    "conjunto": 12,
    "num": "6",
    "aspecto": "Gestión de Seguridad, Salud y Ambiente",
    "pregunta": "12.6 ¿Se ha realizado la revisión de lamparas de emergencias tal como lo indica el programa de inspección ( 1 vez mes)?",
    "preguntaResumida": "12.6 ¿Inspección mensual luces de emergencia?",
    "aspectoLegal": "COVENIN 1110 / NT-04-2023",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 94,
    "conjunto": 12,
    "num": "7",
    "aspecto": "Gestión de Seguridad, Salud y Ambiente",
    "pregunta": "12.7 ¿Se ha realizado la revisión del Kit para casos de derrame tal como lo indica el programa de inspección ( 1 vez mes)?",
    "preguntaResumida": "12.7 ¿Inspección mensual Kit de derrames?",
    "aspectoLegal": "NT-04-2023 / Normativa MATPEL",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 95,
    "conjunto": 12,
    "num": "8",
    "aspecto": "Gestión de Seguridad, Salud y Ambiente",
    "pregunta": "12.8 ¿Se ha realizado la revisión de la fuente lavaojos tal como lo indica el programa de inspección ( 1 vez mes)?",
    "preguntaResumida": "12.8 ¿Inspección mensual fuente lavaojos?",
    "aspectoLegal": "COVENIN 1056 / NT-04-2023",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 96,
    "conjunto": 12,
    "num": "9",
    "aspecto": "Gestión de Seguridad, Salud y Ambiente",
    "pregunta": "12.9 ¿Se cuenta con el registro de delegado de prevención actualizado?",
    "preguntaResumida": "12.9 ¿Registro de Delegados de Prevención vigente?",
    "aspectoLegal": "LOPCYMAT Art. 41",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 97,
    "conjunto": 12,
    "num": "10",
    "aspecto": "Gestión de Seguridad, Salud y Ambiente",
    "pregunta": "12.10 ¿Se cuenta con el registro de comité de seguridad y salud laboral actualizado?",
    "preguntaResumida": "12.10 ¿Registro de CSSL vigente?",
    "aspectoLegal": "LOPCYMAT Art. 46",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 98,
    "conjunto": 12,
    "num": "11",
    "aspecto": "Gestión de Seguridad, Salud y Ambiente",
    "pregunta": "12.11 ¿El CSSL lleva a cabo sus reuniones mensuales tal como lo indica el RLopcymat en su Art.76?",
    "preguntaResumida": "12.11 ¿Reuniones mensuales del CSSL realizadas?",
    "aspectoLegal": "RLOPCYMAT Art. 76",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 99,
    "conjunto": 12,
    "num": "12",
    "aspecto": "Gestión de Seguridad, Salud y Ambiente",
    "pregunta": "12.12 ¿El CSSL transcribe las minutas una vez firmadas y selladas al libro de actas tal como lo indica el RLopcymat en su Art.77?",
    "preguntaResumida": "12.12 ¿Minutas del CSSL transcritas al Libro de Actas?",
    "aspectoLegal": "RLOPCYMAT Art. 77",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 100,
    "conjunto": 12,
    "num": "13",
    "aspecto": "Gestión de Seguridad, Salud y Ambiente",
    "pregunta": "12.13 ¿El CSSL de forma mensual consigna ante el Inpsasel las minutas de las reuniones tal como lo indica el RLopcymat en su Art.77?",
    "preguntaResumida": "12.13 ¿Minutas consignadas mensualmente al INPSASEL?",
    "aspectoLegal": "RLOPCYMAT Art. 77",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 101,
    "conjunto": 12,
    "num": "14",
    "aspecto": "Gestión de Seguridad, Salud y Ambiente",
    "pregunta": "12.14 ¿Se cuenta con el Informe de Vigilancia Epidemiológica sellado por el INPSASEL?",
    "preguntaResumida": "12.14 ¿Informe Epidemiológico sellado por INPSASEL?",
    "aspectoLegal": "RLOPCYMAT Art. 34 / NT-04-2023",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 102,
    "conjunto": 12,
    "num": "15",
    "aspecto": "Gestión de Seguridad, Salud y Ambiente",
    "pregunta": "12.15 ¿Los trabajadores reciben 16 horas trimestrales de formación en  SSA?",
    "preguntaResumida": "12.15 ¿Cumplimiento de 16 horas trimestrales de formación?",
    "aspectoLegal": "LOPCYMAT Art. 53 (Interpretación INPSASEL)",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 103,
    "conjunto": 12,
    "num": "16",
    "aspecto": "Gestión de Seguridad, Salud y Ambiente",
    "pregunta": "12.16 ¿Se cuenta con el Programa de Seguridad y Salud Laboral registrado ante el INPSASEL?",
    "preguntaResumida": "12.16 ¿Programa de SST registrado ante INPSASEL?",
    "aspectoLegal": "LOPCYMAT Art. 61 / NT-04-2023",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 104,
    "conjunto": 12,
    "num": "17",
    "aspecto": "Gestión de Seguridad, Salud y Ambiente",
    "pregunta": "12.17 ¿Se cuenta con el registro actualizado del Servicio de Seguridad y Salud en el Trabajo, el cual incluye a la localidad evaluada?",
    "preguntaResumida": "12.17 ¿Servicio de SST registrado y actualizado?",
    "aspectoLegal": "LOPCYMAT Art. 39 / Norma Técnica Servicios",
    "grupoPilar": "SSA",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 105,
    "conjunto": 12,
    "num": "18",
    "aspecto": "Gestión de Seguridad, Salud y Ambiente",
    "pregunta": "12.18 ¿Cuentan con el documento actualizado RACDA que incluye a la localidad (Distribuidora o Servicentro que aplique)?",
    "preguntaResumida": "12.18 ¿RACDA actualizado para la localidad?",
    "aspectoLegal": "Ley Sobre Sustancias, Materiales y Desechos Peligrosos",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 106,
    "conjunto": 12,
    "num": "19",
    "aspecto": "Gestión de Seguridad, Salud y Ambiente",
    "pregunta": "12.19 ¿Se consigna en su Unidad Territorial la póliza de seguros que cubra daños ambientales por lo menos una vez al año?",
    "preguntaResumida": "12.19 ¿Póliza de Daños Ambientales consignada (anual)?",
    "aspectoLegal": "Ley Orgánica del Ambiente",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 107,
    "conjunto": 12,
    "num": "20",
    "aspecto": "Gestión de Seguridad, Salud y Ambiente",
    "pregunta": "12.20 ¿Se consigna en su Unidad Territorial el informe anual sobre la actividad relativa al Almacenamiento con indicación de las sustancias, cantidad, origen, destino, fecha de salida y de recepción?",
    "preguntaResumida": "12.20 ¿Informe Anual de Almacenamiento consignado?",
    "aspectoLegal": "Ley Sobre Sustancias, Materiales y Desechos Peligrosos",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 108,
    "conjunto": 13,
    "num": "1",
    "aspecto": "Expedientes de los Colaboradores",
    "pregunta": "13.1 ¿Cuentan con evaluaciones médicas periódicas para los trabajadores: Ingreso, Pre- y Post-Vacacional (se verifica que la última evaluación médica este dentro del año en curso?",
    "preguntaResumida": "13.1 ¿Exámenes médicos (Pre, Post, Vacacional) vigentes?",
    "aspectoLegal": "RLOPCYMAT Art. 27 / LOPCYMAT",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 109,
    "conjunto": 13,
    "num": "2",
    "aspecto": "Expedientes de los Colaboradores",
    "pregunta": "13.2 ¿Las Hojas de Ruta de Trabajo se encuentran en el expediente de todos los trabajadores y se encuentran actualizadas (Lopcymat Art 69)?",
    "preguntaResumida": "13.2 ¿Hojas de Ruta de Trabajo en expedientes?",
    "aspectoLegal": "LOPCYMAT Art. 69",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 110,
    "conjunto": 13,
    "num": "3",
    "aspecto": "Expedientes de los Colaboradores",
    "pregunta": "13.3 ¿Se cuenta con la descripción de cargo actualizada correspondiente en todos los expedientes de los trabajadores?",
    "preguntaResumida": "13.3 ¿Descripción de Cargo en expedientes?",
    "aspectoLegal": "NT-04-2023",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 111,
    "conjunto": 13,
    "num": "4",
    "aspecto": "Expedientes de los Colaboradores",
    "pregunta": "13.4 ¿La constancia de entrega de EPP de la ultima dotación entregada se encuentra dentro del expediente de todos los trabajadores según la Norma NG-SST-004?",
    "preguntaResumida": "13.4 ¿Constancia de entrega de EPP en expedientes?",
    "aspectoLegal": "Norma Técnica NG-SST-004",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 112,
    "conjunto": 13,
    "num": "5",
    "aspecto": "Expedientes de los Colaboradores",
    "pregunta": "13.5 ¿Se cuenta con la Notificación de los Principios de Prevención de las condiciones inseguras e insalubres y riesgo biológico?",
    "preguntaResumida": "13.5 ¿Notificación de Riesgos (Principios de Prevención)?",
    "aspectoLegal": "LOPCYMAT Art. 56",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 113,
    "conjunto": 13,
    "num": "6",
    "aspecto": "Expedientes de los Colaboradores",
    "pregunta": "13.6 ¿Se cuenta con el análisis de riesgo de tareas específicas?",
    "preguntaResumida": "13.6 ¿Análisis de Riesgo de Tareas (ART) disponible?",
    "aspectoLegal": "NT-04-2023",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 114,
    "conjunto": 13,
    "num": "7",
    "aspecto": "Expedientes de los Colaboradores",
    "pregunta": "13.7 ¿La certificación de haber realizado el curso de manejo de Materiales Peligrosos reposa en los expedientes de los trabajadores y los mismos se encuentran vigente? (2 años por vigencia del RACDA actualizado)",
    "preguntaResumida": "13.7 ¿Certificación MATPEL vigente en expedientes?",
    "aspectoLegal": "Ley Sust. Peligrosas / RACDA",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 115,
    "conjunto": 13,
    "num": "8",
    "aspecto": "Expedientes de los Colaboradores",
    "pregunta": "13.8 ¿La Política de seguridad y salud laboral se encuentra firmada por los trabajadores?",
    "preguntaResumida": "13.8 ¿Política de SST firmada por trabajadores?",
    "aspectoLegal": "NT-04-2023",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 116,
    "conjunto": 13,
    "num": "9",
    "aspecto": "Expedientes de los Colaboradores",
    "pregunta": "13.9 ¿La Política de seguridad vial se encuentra firmada por los trabajadores?",
    "preguntaResumida": "13.9 ¿Política de Seguridad Vial firmada?",
    "aspectoLegal": "Ley de Transporte Terrestre / ISO 39001 (Ref)",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - SSA"
  },
  {
    "item": 117,
    "conjunto": 13,
    "num": "10",
    "aspecto": "Expedientes de los Colaboradores",
    "pregunta": "13.10 ¿Se realizan adecuadamente los cambios de condiciones acorde al lugar de trabajo?",
    "preguntaResumida": "13.10 ¿Notificación de cambios de condiciones realizada?",
    "aspectoLegal": "LOPCYMAT Art. 56",
    "grupoPilar": "LEGAL",
    "areaResponsable": "VENTAS - SSA"
  }
];

// 3. FRECUENCIAS DE EJECUCIÓN DE INSPECCIONES (24 FORMULARIOS)
export const FRECUENCIAS_INSPECCIONES_OFICIALES: FrecuenciaInspeccion[] = [
  {
    "item": 1,
    "ubicacion": "Distribuidora",
    "inspeccion": "Montacargas",
    "area": "Almacén",
    "frecuencia": "Diaria",
    "formularioLink": "https://forms.office.com/r/3QaYVrdJKr",
    "responsables": "Operaciones - Ventas"
  },
  {
    "item": 2,
    "ubicacion": "Distribuidora",
    "inspeccion": "Vehículos",
    "area": "Todas",
    "frecuencia": "Diaria",
    "formularioLink": "https://forms.office.com/r/iXSdDhy8B4",
    "responsables": "Operaciones - Ventas"
  },
  {
    "item": 3,
    "ubicacion": "Servicentro",
    "inspeccion": "Herramientas y equipos",
    "area": "Area de Carga",
    "frecuencia": "Mensual",
    "formularioLink": "https://forms.office.com/r/F8Rhms8iEa",
    "responsables": "Operaciones - Ventas"
  },
  {
    "item": 4,
    "ubicacion": "Servicentro",
    "inspeccion": "Herramientas y equipos",
    "area": "Servicio Tecnico",
    "frecuencia": "Mensual",
    "formularioLink": "https://forms.office.com/r/F8Rhms8iEa",
    "responsables": "Operaciones - Ventas"
  },
  {
    "item": 5,
    "ubicacion": "Distribuidora",
    "inspeccion": "Herramientas y equipos",
    "area": "Area de Carga",
    "frecuencia": "Mensual",
    "formularioLink": "https://forms.office.com/r/F8Rhms8iEa",
    "responsables": "Operaciones - Ventas"
  },
  {
    "item": 6,
    "ubicacion": "Distribuidora",
    "inspeccion": "Herramientas y equipos",
    "area": "Servicio Tecnico",
    "frecuencia": "Mensual",
    "formularioLink": "https://forms.office.com/r/F8Rhms8iEa",
    "responsables": "Operaciones - Ventas"
  },
  {
    "item": 7,
    "ubicacion": "Servicentro",
    "inspeccion": "Seguridad Orden y Limpieza",
    "area": "Todas",
    "frecuencia": "Quincenal",
    "formularioLink": "https://forms.office.com/r/0Y9DQ6ggki",
    "responsables": "Operaciones - Ventas"
  },
  {
    "item": 8,
    "ubicacion": "Distribuidora",
    "inspeccion": "Seguridad Orden y Limpieza",
    "area": "Todas",
    "frecuencia": "Quincenal",
    "formularioLink": "https://forms.office.com/r/0Y9DQ6ggki",
    "responsables": "Operaciones - Ventas"
  },
  {
    "item": 9,
    "ubicacion": "Distribuidora",
    "inspeccion": "Vehículos Transporte de Cargas",
    "area": "Flota de vehículos",
    "frecuencia": "Semestral",
    "formularioLink": "https://forms.office.com/r/GPt9czZNHD",
    "responsables": "SSA"
  },
  {
    "item": 10,
    "ubicacion": "Distribuidora",
    "inspeccion": "Inspección SSA",
    "area": "Todas",
    "frecuencia": "Semestral",
    "formularioLink": "https://forms.office.com/r/aY8pZYRVSm",
    "responsables": "SSA"
  },
  {
    "item": 11,
    "ubicacion": "Servicentro",
    "inspeccion": "Inspección SSA",
    "area": "Todas",
    "frecuencia": "Semestral",
    "formularioLink": "https://forms.office.com/r/mxXtF3hZZ9",
    "responsables": "SSA"
  },
  {
    "item": 12,
    "ubicacion": "Servicentro",
    "inspeccion": "Extintores",
    "area": "Instalaciones",
    "frecuencia": "Semestral",
    "formularioLink": "https://forms.office.com/r/ti6X2sdjeh",
    "responsables": "Operaciones - Ventas"
  },
  {
    "item": 13,
    "ubicacion": "Distribuidora",
    "inspeccion": "Extintores",
    "area": "Instalaciones",
    "frecuencia": "Semestral",
    "formularioLink": "https://forms.office.com/r/ti6X2sdjeh",
    "responsables": "Operaciones - Ventas"
  },
  {
    "item": 14,
    "ubicacion": "Distribuidora",
    "inspeccion": "Extintores",
    "area": "Flota de vehículos",
    "frecuencia": "Semestral",
    "formularioLink": "https://forms.office.com/r/ti6X2sdjeh",
    "responsables": "Operaciones - Ventas"
  },
  {
    "item": 15,
    "ubicacion": "Servicentro",
    "inspeccion": "Sistema de detección de incendios",
    "area": "Todas",
    "frecuencia": "Trimestral",
    "formularioLink": "https://forms.office.com/r/DGCCtiBjVb",
    "responsables": "Operaciones - Ventas"
  },
  {
    "item": 16,
    "ubicacion": "Distribuidora",
    "inspeccion": "Sistema de detección de incendios",
    "area": "Todas",
    "frecuencia": "Trimestral",
    "formularioLink": "https://forms.office.com/r/n1d9BvSiB8",
    "responsables": "Operaciones - Ventas"
  },
  {
    "item": 17,
    "ubicacion": "Distribuidora",
    "inspeccion": "Lámparas de emergencia",
    "area": "Todas",
    "frecuencia": "Mensual",
    "formularioLink": "https://forms.office.com/r/XyMRMDzN8C",
    "responsables": "Operaciones - Ventas"
  },
  {
    "item": 18,
    "ubicacion": "Servicentro",
    "inspeccion": "Lámparas de emergencia",
    "area": "Todas",
    "frecuencia": "Mensual",
    "formularioLink": "https://forms.office.com/r/XyMRMDzN8C",
    "responsables": "Operaciones - Ventas"
  },
  {
    "item": 19,
    "ubicacion": "Distribuidora",
    "inspeccion": "Inspección Kit de Derrames",
    "area": "Todas",
    "frecuencia": "Mensual",
    "formularioLink": "https://forms.office.com/r/M4yv01YtsB",
    "responsables": "Operaciones - Ventas"
  },
  {
    "item": 20,
    "ubicacion": "Servicentro",
    "inspeccion": "Inspección Kit de Derrames",
    "area": "Todas",
    "frecuencia": "Mensual",
    "formularioLink": "https://forms.office.com/r/M4yv01YtsB",
    "responsables": "Operaciones - Ventas"
  },
  {
    "item": 21,
    "ubicacion": "Distribuidora",
    "inspeccion": "Inspección de Fuente Lavaojos  y Ducha de Emeregencia",
    "area": "Todas",
    "frecuencia": "Mensual",
    "formularioLink": "https://forms.office.com/r/94UM3Dp0zu",
    "responsables": "Operaciones - Ventas"
  },
  {
    "item": 22,
    "ubicacion": "Servicentro",
    "inspeccion": "Inspección de Fuente Lavaojos  y Ducha de Emeregencia",
    "area": "Todas",
    "frecuencia": "Mensual",
    "formularioLink": "https://forms.office.com/r/94UM3Dp0zu",
    "responsables": "Operaciones - Ventas"
  },
  {
    "item": 23,
    "ubicacion": "Distribuidora",
    "inspeccion": "Inspección de Fuente Lavaojos Portátil",
    "area": "Todas",
    "frecuencia": "Mensual",
    "formularioLink": "https://forms.office.com/r/ZvB7kH9T81",
    "responsables": "Operaciones - Ventas"
  },
  {
    "item": 24,
    "ubicacion": "Servicentro",
    "inspeccion": "Inspección de Fuente Lavaojos Portátil",
    "area": "Todas",
    "frecuencia": "Mensual",
    "formularioLink": "https://forms.office.com/r/ZvB7kH9T81",
    "responsables": "Operaciones - Ventas"
  }
];

// 4. FLOTA NACIONAL OFICIAL DUNCAN (65 VEHÍCULOS)
export const FLOTA_NACIONAL_DUNCAN: VehiculoFlotaOficial[] = [
  {
    "item": 1,
    "placas": "A49CO2D",
    "marca": "FORD",
    "modelo": "F-350 TRITON",
    "ano": 2009,
    "capacidadCargaKg": 2660.0,
    "distribuidora": "LOS RUICES",
    "observaciones": ""
  },
  {
    "item": 2,
    "placas": "A81A00G",
    "marca": "FORD",
    "modelo": "F-350 TRITON",
    "ano": 2009,
    "capacidadCargaKg": 2660.0,
    "distribuidora": "LOS RUICES",
    "observaciones": ""
  },
  {
    "item": 3,
    "placas": "A80AO6G",
    "marca": "FORD",
    "modelo": "F-350 TRITON",
    "ano": 2009,
    "capacidadCargaKg": 2660.0,
    "distribuidora": "LOS RUICES",
    "observaciones": ""
  },
  {
    "item": 4,
    "placas": "A54AO3U",
    "marca": "CHEVROLET",
    "modelo": "SILVERADO 3500",
    "ano": 2014,
    "capacidadCargaKg": 489.0,
    "distribuidora": "LOS RUICES",
    "observaciones": ""
  },
  {
    "item": 5,
    "placas": "A78DL3G",
    "marca": "CHEVROLET",
    "modelo": "SILVERADO 3500",
    "ano": 2015,
    "capacidadCargaKg": 526.0,
    "distribuidora": "LOS RUICES",
    "observaciones": ""
  },
  {
    "item": 6,
    "placas": "A05AY9D",
    "marca": "FORD",
    "modelo": "SUPER DUTY",
    "ano": 2011,
    "capacidadCargaKg": 3326.0,
    "distribuidora": "LOS RUICES",
    "observaciones": ""
  },
  {
    "item": 7,
    "placas": "A15AY5D",
    "marca": "FORD",
    "modelo": "SUPER DUTY",
    "ano": 2011,
    "capacidadCargaKg": 3326.0,
    "distribuidora": "LOS RUICES",
    "observaciones": ""
  },
  {
    "item": 8,
    "placas": "A01AY3D",
    "marca": "FORD",
    "modelo": "SUPER DUTY",
    "ano": 2011,
    "capacidadCargaKg": 3326.0,
    "distribuidora": "LOS RUICES",
    "observaciones": ""
  },
  {
    "item": 9,
    "placas": "A83AG9H",
    "marca": "FORD",
    "modelo": "SUPER DUTY",
    "ano": 2011,
    "capacidadCargaKg": 3096.0,
    "distribuidora": "LOS RUICES",
    "observaciones": "PERDIDA TOTAL ACCIDENTE"
  },
  {
    "item": 10,
    "placas": "A00AY2D",
    "marca": "FORD",
    "modelo": "SUPER DUTY",
    "ano": 2011,
    "capacidadCargaKg": 3326.0,
    "distribuidora": "LOS RUICES",
    "observaciones": ""
  },
  {
    "item": 11,
    "placas": "A26BD2M",
    "marca": "FORD",
    "modelo": "SUPER DUTY",
    "ano": 2011,
    "capacidadCargaKg": 3326.0,
    "distribuidora": "LOS RUICES",
    "observaciones": ""
  },
  {
    "item": 12,
    "placas": "A91AF9L",
    "marca": "FORD",
    "modelo": "SUPER DUTY",
    "ano": 2011,
    "capacidadCargaKg": 3326.0,
    "distribuidora": "LOS RUICES",
    "observaciones": ""
  },
  {
    "item": 13,
    "placas": "A66A03G",
    "marca": "FORD",
    "modelo": "F-350 TRITON",
    "ano": 2008,
    "capacidadCargaKg": 2660.0,
    "distribuidora": "LOS RUICES",
    "observaciones": "EN BARCELONA"
  },
  {
    "item": 14,
    "placas": "A66DZ5A",
    "marca": "JAC",
    "modelo": "HFC1061K",
    "ano": 2013,
    "capacidadCargaKg": 4200.0,
    "distribuidora": "LOS RUICES",
    "observaciones": ""
  },
  {
    "item": 15,
    "placas": "53F ABJ",
    "marca": "FORD",
    "modelo": "F-350 TRITON",
    "ano": 2006,
    "capacidadCargaKg": 2640.0,
    "distribuidora": "LOS RUICES",
    "observaciones": ""
  },
  {
    "item": 16,
    "placas": "A30BW8G",
    "marca": "FORD",
    "modelo": "CARGO 815",
    "ano": 2012,
    "capacidadCargaKg": 4650.0,
    "distribuidora": "LOS RUICES",
    "observaciones": ""
  },
  {
    "item": 17,
    "placas": "A91BB5G",
    "marca": "MITSUBISHI",
    "modelo": "L-300 PANEL",
    "ano": 2015,
    "capacidadCargaKg": 800.0,
    "distribuidora": "LOS RUICES",
    "observaciones": ""
  },
  {
    "item": 18,
    "placas": "A27BD2M",
    "marca": "FORD",
    "modelo": "SUPER DUTY",
    "ano": 2011,
    "capacidadCargaKg": 3326.0,
    "distribuidora": "VALENCIA",
    "observaciones": "EN LOS RUICES"
  },
  {
    "item": 19,
    "placas": "A91AF8L",
    "marca": "FORD",
    "modelo": "SUPER DUTY",
    "ano": 2011,
    "capacidadCargaKg": 3326.0,
    "distribuidora": "VALENCIA",
    "observaciones": ""
  },
  {
    "item": 20,
    "placas": "A00AY1D",
    "marca": "FORD",
    "modelo": "SUPER DUTY",
    "ano": 2011,
    "capacidadCargaKg": 3326.0,
    "distribuidora": "VALENCIA",
    "observaciones": ""
  },
  {
    "item": 21,
    "placas": "A17AY6D",
    "marca": "FORD",
    "modelo": "SUPER DUTY",
    "ano": 2011,
    "capacidadCargaKg": 3326.0,
    "distribuidora": "VALENCIA",
    "observaciones": ""
  },
  {
    "item": 22,
    "placas": "A39AS3M",
    "marca": "MITSUBISHI",
    "modelo": "CANTER",
    "ano": 2011,
    "capacidadCargaKg": 5045.0,
    "distribuidora": "VALENCIA",
    "observaciones": "EN MARACAY"
  },
  {
    "item": 23,
    "placas": "A23DT5M",
    "marca": "FORD",
    "modelo": "CARGO 815",
    "ano": 2007,
    "capacidadCargaKg": 4650.0,
    "distribuidora": "VALENCIA",
    "observaciones": ""
  },
  {
    "item": 24,
    "placas": "A22AF90",
    "marca": "FORD",
    "modelo": "F-350 TRITON",
    "ano": 2010,
    "capacidadCargaKg": 2660.0,
    "distribuidora": "MARACAY",
    "observaciones": ""
  },
  {
    "item": 25,
    "placas": "A72ABOE",
    "marca": "FORD",
    "modelo": "F-350 TRITON",
    "ano": 2009,
    "capacidadCargaKg": 2660.0,
    "distribuidora": "MARACAY",
    "observaciones": "EN VALENCIA"
  },
  {
    "item": 26,
    "placas": "A84AS9D",
    "marca": "FORD",
    "modelo": "CARGO 1721",
    "ano": 2010,
    "capacidadCargaKg": 10000.0,
    "distribuidora": "MARACAY",
    "observaciones": ""
  },
  {
    "item": 27,
    "placas": "A12DM2A",
    "marca": "FORD",
    "modelo": "CARGO 815",
    "ano": 2011,
    "capacidadCargaKg": 4650.0,
    "distribuidora": "MARACAY",
    "observaciones": ""
  },
  {
    "item": 28,
    "placas": "A76BB0H",
    "marca": "MITSUBISHI",
    "modelo": "CANTER",
    "ano": 2011,
    "capacidadCargaKg": 5045.0,
    "distribuidora": "MARACAY",
    "observaciones": ""
  },
  {
    "item": 29,
    "placas": "A75BB7H",
    "marca": "FORD",
    "modelo": "F-350 TRITON",
    "ano": 2010,
    "capacidadCargaKg": 2660.0,
    "distribuidora": "MARACAY",
    "observaciones": ""
  },
  {
    "item": 30,
    "placas": "A35AY6K",
    "marca": "FORD",
    "modelo": "CARGO 815",
    "ano": 2010,
    "capacidadCargaKg": 4650.0,
    "distribuidora": "BARQUISIMETO",
    "observaciones": "EN VALENCIA"
  },
  {
    "item": 31,
    "placas": "35LABJ",
    "marca": "CHEVROLET",
    "modelo": "KODIAK",
    "ano": 2007,
    "capacidadCargaKg": 10000.0,
    "distribuidora": "BARQUISIMETO",
    "observaciones": ""
  },
  {
    "item": 32,
    "placas": "A01AY2D",
    "marca": "FORD",
    "modelo": "SUPER DUTY",
    "ano": 2011,
    "capacidadCargaKg": 3326.0,
    "distribuidora": "BARQUISIMETO",
    "observaciones": ""
  },
  {
    "item": 33,
    "placas": "A58AZ8D",
    "marca": "FORD",
    "modelo": "SUPER DUTY",
    "ano": 2011,
    "capacidadCargaKg": 3326.0,
    "distribuidora": "BARQUISIMETO",
    "observaciones": ""
  },
  {
    "item": 34,
    "placas": "50YABZ",
    "marca": "CHEVROLET",
    "modelo": "CHEYENNE",
    "ano": 2004,
    "capacidadCargaKg": 2623.0,
    "distribuidora": "BARQUISIMETO",
    "observaciones": ""
  },
  {
    "item": 35,
    "placas": "A94BK2M",
    "marca": "MITSUBISHI",
    "modelo": "CANTER",
    "ano": 2012,
    "capacidadCargaKg": 5045.0,
    "distribuidora": "PTO ORDAZ",
    "observaciones": ""
  },
  {
    "item": 36,
    "placas": "A37AH2P",
    "marca": "FORD",
    "modelo": "SUPER DUTY",
    "ano": 2011,
    "capacidadCargaKg": 3326.0,
    "distribuidora": "PTO ORDAZ",
    "observaciones": ""
  },
  {
    "item": 37,
    "placas": "A88AP5V",
    "marca": "CHEVROLET",
    "modelo": "NPR",
    "ano": 2013,
    "capacidadCargaKg": 4200.0,
    "distribuidora": "PTO ORDAZ",
    "observaciones": ""
  },
  {
    "item": 38,
    "placas": "A42BP2G",
    "marca": "FORD",
    "modelo": "CARGO 815",
    "ano": 2011,
    "capacidadCargaKg": 4650.0,
    "distribuidora": "PTO ORDAZ",
    "observaciones": ""
  },
  {
    "item": 39,
    "placas": "A20BPID",
    "marca": "CHEVROLET",
    "modelo": "KODIAK",
    "ano": 1995,
    "capacidadCargaKg": 10000.0,
    "distribuidora": "PTO ORDAZ",
    "observaciones": ""
  },
  {
    "item": 40,
    "placas": "A00AY0D",
    "marca": "FORD",
    "modelo": "SUPER DUTY",
    "ano": 2011,
    "capacidadCargaKg": 3326.0,
    "distribuidora": "PTO ORDAZ",
    "observaciones": ""
  },
  {
    "item": 41,
    "placas": "A32AS7M",
    "marca": "MITSUBISHI",
    "modelo": "CANTER",
    "ano": 2010,
    "capacidadCargaKg": 5045.0,
    "distribuidora": "MARACAIBO",
    "observaciones": ""
  },
  {
    "item": 42,
    "placas": "93H-AAY",
    "marca": "CHEVROLET",
    "modelo": "CHEYENNE",
    "ano": 2007,
    "capacidadCargaKg": 2623.0,
    "distribuidora": "MARACAIBO",
    "observaciones": ""
  },
  {
    "item": 43,
    "placas": "A26BD1M",
    "marca": "FORD",
    "modelo": "SUPER DUTY",
    "ano": 2011,
    "capacidadCargaKg": 3326.0,
    "distribuidora": "MARACAIBO",
    "observaciones": ""
  },
  {
    "item": 44,
    "placas": "A01AY0D",
    "marca": "FORD",
    "modelo": "SUPER DUTY",
    "ano": 2011,
    "capacidadCargaKg": 3326.0,
    "distribuidora": "MARACAIBO",
    "observaciones": "EN EL VIGIA"
  },
  {
    "item": 45,
    "placas": "A17AY7D",
    "marca": "FORD",
    "modelo": "SUPER DUTY",
    "ano": 2011,
    "capacidadCargaKg": 3326.0,
    "distribuidora": "MARACAIBO",
    "observaciones": ""
  },
  {
    "item": 46,
    "placas": "A37AH5P",
    "marca": "FORD",
    "modelo": "SUPER DUTY",
    "ano": 2011,
    "capacidadCargaKg": 3326.0,
    "distribuidora": "MARACAIBO",
    "observaciones": ""
  },
  {
    "item": 47,
    "placas": "98X-DAN",
    "marca": "FORD",
    "modelo": "CARGO 815",
    "ano": 2004,
    "capacidadCargaKg": 4650.0,
    "distribuidora": "MARACAIBO",
    "observaciones": ""
  },
  {
    "item": 48,
    "placas": "A56BI0K",
    "marca": "FORD",
    "modelo": "CARGO 1721",
    "ano": 2011,
    "capacidadCargaKg": 10000.0,
    "distribuidora": "BARCELONA",
    "observaciones": ""
  },
  {
    "item": 49,
    "placas": "A30BLOA",
    "marca": "FORD",
    "modelo": "CARGO 815",
    "ano": 2010,
    "capacidadCargaKg": 4650.0,
    "distribuidora": "BARCELONA",
    "observaciones": ""
  },
  {
    "item": 50,
    "placas": "A25BD3M",
    "marca": "FORD",
    "modelo": "SUPER DUTY",
    "ano": 211,
    "capacidadCargaKg": 3326.0,
    "distribuidora": "BARCELONA",
    "observaciones": ""
  },
  {
    "item": 51,
    "placas": "A70BK6A",
    "marca": "FORD",
    "modelo": "F-350 TRITON",
    "ano": 2010,
    "capacidadCargaKg": 2660.0,
    "distribuidora": "BARCELONA",
    "observaciones": "PERDIDA TOTAL ACCIDENTE"
  },
  {
    "item": 52,
    "placas": "A37AS5M",
    "marca": "MITSUBISHI",
    "modelo": "CANTER",
    "ano": 2011,
    "capacidadCargaKg": 5045.0,
    "distribuidora": "BARCELONA",
    "observaciones": ""
  },
  {
    "item": 53,
    "placas": "A01AY1D",
    "marca": "FORD",
    "modelo": "SUPER DUTY",
    "ano": 2011,
    "capacidadCargaKg": 3326.0,
    "distribuidora": "EL VIGIA",
    "observaciones": ""
  },
  {
    "item": 54,
    "placas": "A27BD4M",
    "marca": "FORD",
    "modelo": "SUPER DUTY",
    "ano": 2011,
    "capacidadCargaKg": 3326.0,
    "distribuidora": "EL VIGIA",
    "observaciones": ""
  },
  {
    "item": 55,
    "placas": "53I-SAL",
    "marca": "CHEVROLET",
    "modelo": "CHEYENNE",
    "ano": 2007,
    "capacidadCargaKg": 2623.0,
    "distribuidora": "EL VIGIA",
    "observaciones": ""
  },
  {
    "item": 56,
    "placas": "A59AO8G",
    "marca": "FORD",
    "modelo": "F-350 TRITON",
    "ano": 2009,
    "capacidadCargaKg": 2660.0,
    "distribuidora": "EL VIGIA",
    "observaciones": ""
  },
  {
    "item": 57,
    "placas": "15I-CAD",
    "marca": "CHEVROLET",
    "modelo": "CHEYENNE",
    "ano": 2007,
    "capacidadCargaKg": 2623.0,
    "distribuidora": "SAN CRISTOBAL",
    "observaciones": ""
  },
  {
    "item": 58,
    "placas": "A15AY6D",
    "marca": "FORD",
    "modelo": "SUPER DUTY",
    "ano": 2011,
    "capacidadCargaKg": 3326.0,
    "distribuidora": "SAN CRISTOBAL",
    "observaciones": ""
  },
  {
    "item": 59,
    "placas": "A37AH1P",
    "marca": "FORD",
    "modelo": "SUPER DUTY",
    "ano": 2011,
    "capacidadCargaKg": 3326.0,
    "distribuidora": "SAN CRISTOBAL",
    "observaciones": ""
  },
  {
    "item": 60,
    "placas": "A44CS1K",
    "marca": "FORD",
    "modelo": "CARGO 815",
    "ano": 2013,
    "capacidadCargaKg": 4650.0,
    "distribuidora": "SAN CRISTOBAL",
    "observaciones": "EN BARQUISIMETO"
  },
  {
    "item": 61,
    "placas": "49Y-ABL",
    "marca": "CHEVROLET",
    "modelo": "CHEYENNE",
    "ano": 1997,
    "capacidadCargaKg": 2623.0,
    "distribuidora": "PUNTO FIJO",
    "observaciones": ""
  },
  {
    "item": 62,
    "placas": "A12AY6D",
    "marca": "FORD",
    "modelo": "SUPER DUTY",
    "ano": 2011,
    "capacidadCargaKg": 3326.0,
    "distribuidora": "PUNTO FIJO",
    "observaciones": ""
  },
  {
    "item": 63,
    "placas": "A84AG8H",
    "marca": "FORD",
    "modelo": "CARGO 815",
    "ano": 2011,
    "capacidadCargaKg": 4650.0,
    "distribuidora": "PUNTO FIJO",
    "observaciones": ""
  },
  {
    "item": 64,
    "placas": "A38AC4F",
    "marca": "FORD",
    "modelo": "SUPER DUTY",
    "ano": 2011,
    "capacidadCargaKg": 3326.0,
    "distribuidora": "PORLAMAR",
    "observaciones": "EN BARCELONA"
  },
  {
    "item": 65,
    "placas": "A48A01G",
    "marca": "FORD",
    "modelo": "CARGO 815",
    "ano": 2009,
    "capacidadCargaKg": 4650.0,
    "distribuidora": "PORLAMAR",
    "observaciones": ""
  }
];

// 5. CATÁLOGO OFICIAL DE ACUMULADORES DUNCAN Y PESOS NOMINALES (70 MODELOS)
export const PESO_ACUMULADORES_DUNCAN: ModeloBateriaOficial[] = [
  {
    "num": 1,
    "mercado": "Nacional",
    "marca": "Duncan",
    "familia": "22",
    "denominacion": "22-800",
    "voltaje": 12.0,
    "pesoKg": 13.9
  },
  {
    "num": 2,
    "mercado": "Nacional",
    "marca": "Duncan",
    "familia": "22",
    "denominacion": "22R-800",
    "voltaje": 12.0,
    "pesoKg": 13.9
  },
  {
    "num": 3,
    "mercado": "Nacional",
    "marca": "Duncan",
    "familia": "24",
    "denominacion": "24 NAVIGATOR",
    "voltaje": 12.0,
    "pesoKg": 19.5
  },
  {
    "num": 4,
    "mercado": "Nacional",
    "marca": "Duncan",
    "familia": "24",
    "denominacion": "24-1100",
    "voltaje": 12.0,
    "pesoKg": 19.5
  },
  {
    "num": 5,
    "mercado": "Nacional",
    "marca": "Duncan",
    "familia": "24",
    "denominacion": "24R-1100",
    "voltaje": 12.0,
    "pesoKg": 19.5
  },
  {
    "num": 6,
    "mercado": "Nacional",
    "marca": "Duncan",
    "familia": "24",
    "denominacion": "24-800",
    "voltaje": 12.0,
    "pesoKg": 16.5
  },
  {
    "num": 7,
    "mercado": "Nacional",
    "marca": "Duncan",
    "familia": "24",
    "denominacion": "24R-800",
    "voltaje": 12.0,
    "pesoKg": 16.5
  },
  {
    "num": 8,
    "mercado": "Nacional",
    "marca": "Duncan",
    "familia": "27",
    "denominacion": "27 QUATTRO",
    "voltaje": 12.0,
    "pesoKg": 23.5
  },
  {
    "num": 9,
    "mercado": "Nacional",
    "marca": "Duncan",
    "familia": "27",
    "denominacion": "27-950",
    "voltaje": 12.0,
    "pesoKg": 19.5
  },
  {
    "num": 10,
    "mercado": "Nacional",
    "marca": "Duncan",
    "familia": "27",
    "denominacion": "27R-950",
    "voltaje": 12.0,
    "pesoKg": 19.5
  },
  {
    "num": 11,
    "mercado": "Nacional",
    "marca": "Duncan",
    "familia": "30",
    "denominacion": "30H-1100",
    "voltaje": 12.0,
    "pesoKg": 25.5
  },
  {
    "num": 12,
    "mercado": "Nacional",
    "marca": "Duncan",
    "familia": "31",
    "denominacion": "31-1100",
    "voltaje": 12.0,
    "pesoKg": 25.5
  },
  {
    "num": 13,
    "mercado": "Nacional",
    "marca": "Duncan",
    "familia": "34",
    "denominacion": "34-900",
    "voltaje": 12.0,
    "pesoKg": 16.0
  },
  {
    "num": 14,
    "mercado": "Nacional",
    "marca": "Duncan",
    "familia": "34",
    "denominacion": "34R-900",
    "voltaje": 12.0,
    "pesoKg": 16.0
  },
  {
    "num": 15,
    "mercado": "Nacional",
    "marca": "Duncan",
    "familia": "36",
    "denominacion": "36R-700",
    "voltaje": 12.0,
    "pesoKg": 11.8
  },
  {
    "num": 16,
    "mercado": "Nacional",
    "marca": "Duncan",
    "familia": "42",
    "denominacion": "42-800",
    "voltaje": 12.0,
    "pesoKg": 13.5
  },
  {
    "num": 17,
    "mercado": "Nacional",
    "marca": "Duncan",
    "familia": "42",
    "denominacion": "42R-800",
    "voltaje": 12.0,
    "pesoKg": 13.5
  },
  {
    "num": 18,
    "mercado": "Nacional",
    "marca": "Duncan",
    "familia": "43",
    "denominacion": "43-750",
    "voltaje": 12.0,
    "pesoKg": 14.3
  },
  {
    "num": 19,
    "mercado": "Nacional",
    "marca": "Duncan",
    "familia": "43",
    "denominacion": "43R-750",
    "voltaje": 12.0,
    "pesoKg": 14.3
  },
  {
    "num": 20,
    "mercado": "Nacional",
    "marca": "Duncan",
    "familia": "43",
    "denominacion": "43-900",
    "voltaje": 12.0,
    "pesoKg": 16.0
  },
  {
    "num": 21,
    "mercado": "Nacional",
    "marca": "Duncan",
    "familia": "43",
    "denominacion": "43R-900",
    "voltaje": 12.0,
    "pesoKg": 16.0
  },
  {
    "num": 22,
    "mercado": "Nacional",
    "marca": "Duncan",
    "familia": "45",
    "denominacion": "45-650",
    "voltaje": 12.0,
    "pesoKg": 12.8
  },
  {
    "num": 23,
    "mercado": "Nacional",
    "marca": "Duncan",
    "familia": "45",
    "denominacion": "45R-650",
    "voltaje": 12.0,
    "pesoKg": 12.8
  },
  {
    "num": 24,
    "mercado": "Nacional",
    "marca": "Duncan",
    "familia": "45",
    "denominacion": "45-800",
    "voltaje": 12.0,
    "pesoKg": 14.14
  },
  {
    "num": 25,
    "mercado": "Nacional",
    "marca": "Duncan",
    "familia": "45",
    "denominacion": "45R-800",
    "voltaje": 12.0,
    "pesoKg": 14.14
  },
  {
    "num": 26,
    "mercado": "Nacional",
    "marca": "Duncan",
    "familia": "48",
    "denominacion": "48-1000",
    "voltaje": 12.0,
    "pesoKg": 18.5
  },
  {
    "num": 27,
    "mercado": "Nacional",
    "marca": "Duncan",
    "familia": "48",
    "denominacion": "48R-1000",
    "voltaje": 12.0,
    "pesoKg": 18.5
  },
  {
    "num": 28,
    "mercado": "Nacional",
    "marca": "Duncan",
    "familia": "49",
    "denominacion": "49-1100",
    "voltaje": 12.0,
    "pesoKg": 24.0
  },
  {
    "num": 29,
    "mercado": "Nacional",
    "marca": "Duncan",
    "familia": "49",
    "denominacion": "49R-1100",
    "voltaje": 12.0,
    "pesoKg": 24.0
  },
  {
    "num": 30,
    "mercado": "Nacional",
    "marca": "Duncan",
    "familia": "4D",
    "denominacion": "4D-1250",
    "voltaje": 12.0,
    "pesoKg": 41.0
  },
  {
    "num": 31,
    "mercado": "Nacional",
    "marca": "Duncan",
    "familia": "4D",
    "denominacion": "4DLT-1200",
    "voltaje": 12.0,
    "pesoKg": 36.0
  },
  {
    "num": 32,
    "mercado": "Nacional",
    "marca": "Duncan",
    "familia": "59",
    "denominacion": "59-800",
    "voltaje": 12.0,
    "pesoKg": 15.5
  },
  {
    "num": 33,
    "mercado": "Nacional",
    "marca": "Duncan",
    "familia": "65",
    "denominacion": "65-1000",
    "voltaje": 12.0,
    "pesoKg": 19.8
  },
  {
    "num": 34,
    "mercado": "Nacional",
    "marca": "Duncan",
    "familia": "78",
    "denominacion": "78-800",
    "voltaje": 12.0,
    "pesoKg": 15.8
  },
  {
    "num": 35,
    "mercado": "Nacional",
    "marca": "Duncan",
    "familia": "8D",
    "denominacion": "8D-1500",
    "voltaje": 12.0,
    "pesoKg": 54.0
  },
  {
    "num": 36,
    "mercado": "Nacional",
    "marca": "Duncan",
    "familia": "N40",
    "denominacion": "N40R-600",
    "voltaje": 12.0,
    "pesoKg": 11.8
  },
  {
    "num": 37,
    "mercado": "Nacional",
    "marca": "Duncan",
    "familia": "NS40",
    "denominacion": "NS40-550",
    "voltaje": 12.0,
    "pesoKg": 11.0
  },
  {
    "num": 38,
    "mercado": "Nacional",
    "marca": "Duncan",
    "familia": "NS40",
    "denominacion": "NS40R-550",
    "voltaje": 12.0,
    "pesoKg": 11.0
  },
  {
    "num": 39,
    "mercado": "Colombia",
    "marca": "Duncan",
    "familia": "22",
    "denominacion": "22-800",
    "voltaje": 12.0,
    "pesoKg": 13.9
  },
  {
    "num": 40,
    "mercado": "Colombia",
    "marca": "Duncan",
    "familia": "22",
    "denominacion": "22R-800",
    "voltaje": 12.0,
    "pesoKg": 13.9
  },
  {
    "num": 41,
    "mercado": "Colombia",
    "marca": "Duncan",
    "familia": "24",
    "denominacion": "24 NAVIGATOR",
    "voltaje": 12.0,
    "pesoKg": 19.5
  },
  {
    "num": 42,
    "mercado": "Colombia",
    "marca": "Duncan",
    "familia": "24",
    "denominacion": "24-1150",
    "voltaje": 12.0,
    "pesoKg": 19.5
  },
  {
    "num": 43,
    "mercado": "Colombia",
    "marca": "Duncan",
    "familia": "24",
    "denominacion": "24R-1150",
    "voltaje": 12.0,
    "pesoKg": 19.5
  },
  {
    "num": 44,
    "mercado": "Colombia",
    "marca": "Duncan",
    "familia": "27",
    "denominacion": "27 QUATTRO",
    "voltaje": 12.0,
    "pesoKg": 23.5
  },
  {
    "num": 45,
    "mercado": "Colombia",
    "marca": "Duncan",
    "familia": "27",
    "denominacion": "27-1100",
    "voltaje": 12.0,
    "pesoKg": 19.5
  },
  {
    "num": 46,
    "mercado": "Colombia",
    "marca": "Duncan",
    "familia": "27",
    "denominacion": "27R-1100",
    "voltaje": 12.0,
    "pesoKg": 19.5
  },
  {
    "num": 47,
    "mercado": "Colombia",
    "marca": "Duncan",
    "familia": "30",
    "denominacion": "30H-1250",
    "voltaje": 12.0,
    "pesoKg": 25.5
  },
  {
    "num": 48,
    "mercado": "Colombia",
    "marca": "Duncan",
    "familia": "31",
    "denominacion": "31-1250",
    "voltaje": 12.0,
    "pesoKg": 25.5
  },
  {
    "num": 49,
    "mercado": "Colombia",
    "marca": "Duncan",
    "familia": "34",
    "denominacion": "34-950",
    "voltaje": 12.0,
    "pesoKg": 16.0
  },
  {
    "num": 50,
    "mercado": "Colombia",
    "marca": "Duncan",
    "familia": "34",
    "denominacion": "34R-950",
    "voltaje": 12.0,
    "pesoKg": 16.0
  },
  {
    "num": 51,
    "mercado": "Colombia",
    "marca": "Duncan",
    "familia": "36",
    "denominacion": "36R-700",
    "voltaje": 12.0,
    "pesoKg": 10.8
  },
  {
    "num": 52,
    "mercado": "Colombia",
    "marca": "Duncan",
    "familia": "36",
    "denominacion": "36R-750",
    "voltaje": 12.0,
    "pesoKg": 11.8
  },
  {
    "num": 53,
    "mercado": "Colombia",
    "marca": "Titán",
    "familia": "42",
    "denominacion": "42R-670",
    "voltaje": 12.0,
    "pesoKg": 12.7
  },
  {
    "num": 54,
    "mercado": "Colombia",
    "marca": "Duncan",
    "familia": "42",
    "denominacion": "42-750",
    "voltaje": 12.0,
    "pesoKg": 12.85
  },
  {
    "num": 55,
    "mercado": "Colombia",
    "marca": "Duncan",
    "familia": "42",
    "denominacion": "42R-750",
    "voltaje": 12.0,
    "pesoKg": 12.85
  },
  {
    "num": 56,
    "mercado": "Colombia",
    "marca": "Duncan",
    "familia": "42",
    "denominacion": "42-850",
    "voltaje": 12.0,
    "pesoKg": 14.2
  },
  {
    "num": 57,
    "mercado": "Colombia",
    "marca": "Duncan",
    "familia": "42",
    "denominacion": "42R-850",
    "voltaje": 12.0,
    "pesoKg": 14.2
  },
  {
    "num": 58,
    "mercado": "Colombia",
    "marca": "Duncan",
    "familia": "42",
    "denominacion": "42-900",
    "voltaje": 12.0,
    "pesoKg": 14.5
  },
  {
    "num": 59,
    "mercado": "Colombia",
    "marca": "Duncan",
    "familia": "42",
    "denominacion": "42R-900",
    "voltaje": 12.0,
    "pesoKg": 14.5
  },
  {
    "num": 60,
    "mercado": "Colombia",
    "marca": "Duncan",
    "familia": "45",
    "denominacion": "N60-700",
    "voltaje": 12.0,
    "pesoKg": 12.8
  },
  {
    "num": 61,
    "mercado": "Colombia",
    "marca": "Duncan",
    "familia": "45",
    "denominacion": "N60R-700",
    "voltaje": 12.0,
    "pesoKg": 12.8
  },
  {
    "num": 62,
    "mercado": "Colombia",
    "marca": "Duncan",
    "familia": "48",
    "denominacion": "48-950",
    "voltaje": 12.0,
    "pesoKg": 18.2
  },
  {
    "num": 63,
    "mercado": "Colombia",
    "marca": "Duncan",
    "familia": "48",
    "denominacion": "48R-950",
    "voltaje": 12.0,
    "pesoKg": 18.2
  },
  {
    "num": 64,
    "mercado": "Colombia",
    "marca": "Duncan",
    "familia": "49",
    "denominacion": "49R-1200",
    "voltaje": 12.0,
    "pesoKg": 24.0
  },
  {
    "num": 65,
    "mercado": "Colombia",
    "marca": "Duncan",
    "familia": "4D",
    "denominacion": "4D-1500",
    "voltaje": 12.0,
    "pesoKg": 41.0
  },
  {
    "num": 66,
    "mercado": "Colombia",
    "marca": "Duncan",
    "familia": "4D",
    "denominacion": "4DLT-1450",
    "voltaje": 12.0,
    "pesoKg": 36.0
  },
  {
    "num": 67,
    "mercado": "Colombia",
    "marca": "Duncan",
    "familia": "65",
    "denominacion": "65-1100",
    "voltaje": 12.0,
    "pesoKg": 19.8
  },
  {
    "num": 68,
    "mercado": "Colombia",
    "marca": "Duncan",
    "familia": "8D",
    "denominacion": "8D-1600",
    "voltaje": 12.0,
    "pesoKg": 54.0
  },
  {
    "num": 69,
    "mercado": "Colombia",
    "marca": "Duncan",
    "familia": "N40",
    "denominacion": "N40R-670",
    "voltaje": 12.0,
    "pesoKg": 11.8
  },
  {
    "num": 70,
    "mercado": "Colombia",
    "marca": "Duncan",
    "familia": "NS40",
    "denominacion": "NS40R-670",
    "voltaje": 12.0,
    "pesoKg": 11.0
  }
];

// 6. LISTAS MAESTRAS DE SELECCIÓN PARA FORMULARIOS
export const LISTAS_MAESTRAS_SGD: ListasMaestras = {
  "agentesExtinguidores": [
    "H2O",
    "CO2",
    "PQS"
  ],
  "capacidadesExtintores": [
    "2,5 Gal",
    "10 Lbs",
    "20 Lbs",
    "50 Lbs"
  ],
  "condiciones": [
    "Bueno",
    "Dañado",
    "No Aplica"
  ],
  "operatividades": [
    "Operativo",
    "No Operativo"
  ],
  "accionesRequeridas": [
    "Recargar",
    "Retirar",
    "Reubicar",
    "Sustituir",
    "Pintar",
    "Reparar",
    "Ninguna",
    "No Aplica"
  ],
  "meses": [
    "ENERO",
    "FEBRERO",
    "MARZO",
    "ABRIL",
    "MAYO",
    "JUNIO",
    "JULIO",
    "AGOSTO",
    "SEPTIEMBRE",
    "OCTUBRE",
    "NOVIEMBRE",
    "DICIEMBRE",
    "Todos los Meses"
  ],
  "anos": [
    2023,
    2024,
    2025,
    2026,
    2027,
    2028,
    2029,
    2030,
    2031,
    2032,
    2033,
    2034,
    2035,
    2036,
    2037,
    2038,
    2039,
    2040,
    2041,
    2042,
    2043,
    2044,
    2045,
    2046,
    2047,
    2048
  ],
  "empresas": [
    {
      "nombre": "ACUMULADORES DUNCAN, C.A.",
      "abrev": "ADCA",
      "rif": "J-00000350-5"
    },
    {
      "nombre": "DISTRIBUIDORA DUNCAN, C.A.",
      "abrev": "DDCA",
      "rif": "J-00100047-0"
    },
    {
      "nombre": "INVERSIONES 1286, C.A.",
      "abrev": "INV1286",
      "rif": "J-00239353-0"
    }
  ],
  "distribuidoras": [
    {
      "nombre": "DD BARCELONA",
      "tblNombre": "DDBarcelona"
    },
    {
      "nombre": "DD BARQUISIMETO",
      "tblNombre": "DDBarquisimeto"
    },
    {
      "nombre": "DD CARACAS",
      "tblNombre": "DDCaracas"
    },
    {
      "nombre": "DD EL VIGIA",
      "tblNombre": "DDElVigia"
    },
    {
      "nombre": "DD MARACAIBO",
      "tblNombre": "DDMaracaibo"
    },
    {
      "nombre": "DD MARACAY",
      "tblNombre": "DDMaracay"
    },
    {
      "nombre": "DD PORLAMAR",
      "tblNombre": "DDPorlamar"
    },
    {
      "nombre": "DD PUERTO ORDAZ",
      "tblNombre": "DDPuertoOrdaz"
    },
    {
      "nombre": "DD PUNTO FIJO",
      "tblNombre": "DDPuntoFijo"
    },
    {
      "nombre": "DD SAN CRISTOBAL",
      "tblNombre": "DDSanCristobal"
    },
    {
      "nombre": "DD VALENCIA",
      "tblNombre": "DDValencia"
    }
  ],
  "servicentros": [
    {
      "localidad": "MARACAIBO",
      "nombre": "CABIMAS",
      "abrev": "SCCABIMAS"
    },
    {
      "localidad": "MARACAIBO",
      "nombre": "CIUDAD OJEDAD",
      "abrev": "SCCOJD"
    },
    {
      "localidad": "MARACAIBO",
      "nombre": "DR. PORTILLO",
      "abrev": "SCDRPRT"
    },
    {
      "localidad": "MARACAIBO",
      "nombre": "LA LIMPIA",
      "abrev": "SCLL"
    },
    {
      "localidad": "MARACAIBO",
      "nombre": "VILLA DEL ROSARIO",
      "abrev": "SCVDR"
    },
    {
      "localidad": "MARACAIBO",
      "nombre": "VALERA",
      "abrev": "SCVDR"
    },
    {
      "localidad": "MARACAIBO",
      "nombre": "MONTE CLARO",
      "abrev": "SCMNTC"
    },
    {
      "localidad": "PUNTO FIJO",
      "nombre": "CORO",
      "abrev": "SCCR"
    },
    {
      "localidad": "SAN CRISTOBAL",
      "nombre": "PUERTA DEL SOL",
      "abrev": "SCPDS"
    },
    {
      "localidad": "EL VIGIA",
      "nombre": "MERIDA",
      "abrev": "SCMRD"
    },
    {
      "localidad": "EL VIGIA",
      "nombre": "VALERA",
      "abrev": "SCVLR"
    },
    {
      "localidad": "BARQUISIMETO",
      "nombre": "BARQUISIMETO",
      "abrev": "SCBQMT"
    },
    {
      "localidad": "BARQUISIMETO",
      "nombre": "GUANARE",
      "abrev": "SCGNR"
    },
    {
      "localidad": "BARQUISIMETO",
      "nombre": "BARINAS",
      "abrev": "SCBRN"
    },
    {
      "localidad": "VALENCIA",
      "nombre": "LA QUIZANDA",
      "abrev": "SCLMCHLN"
    },
    {
      "localidad": "VALENCIA",
      "nombre": "SANTA CECILIA",
      "abrev": "SCLQZND"
    },
    {
      "localidad": "VALENCIA",
      "nombre": "PUERTO CABELLO",
      "abrev": "SCSTACCL"
    },
    {
      "localidad": "VALENCIA",
      "nombre": "GUACARA",
      "abrev": "SCPTOCBLL"
    },
    {
      "localidad": "MARACAY",
      "nombre": "TAPA TAPA",
      "abrev": "SCTPTP"
    },
    {
      "localidad": "MARACAY",
      "nombre": "LOS OLIVOS",
      "abrev": "SCLOLV"
    },
    {
      "localidad": "MARACAY",
      "nombre": "VALLE DE LA PASCUA",
      "abrev": "SCVDLP"
    },
    {
      "localidad": "MARACAY",
      "nombre": "SAN FERNANDO",
      "abrev": "SCSFRND"
    },
    {
      "localidad": "MARACAY",
      "nombre": "VALLE DE LA PASCUA",
      "abrev": "SCVDLP"
    },
    {
      "localidad": "CARACAS",
      "nombre": "CATIA",
      "abrev": "SCCT"
    },
    {
      "localidad": "CARACAS",
      "nombre": "GUARENAS",
      "abrev": "SCGRNS"
    },
    {
      "localidad": "CARACAS",
      "nombre": "GUATIRE",
      "abrev": "SCGTR"
    },
    {
      "localidad": "CARACAS",
      "nombre": "LA CALIFORNIA",
      "abrev": "SCLCLFRN"
    },
    {
      "localidad": "CARACAS",
      "nombre": "LA GUAIRA",
      "abrev": "SCLGR"
    },
    {
      "localidad": "CARACAS",
      "nombre": "LA TRINIDAD",
      "abrev": "SCLTRND"
    },
    {
      "localidad": "CARACAS",
      "nombre": "LAS ACACIAS",
      "abrev": "SCLACCS"
    },
    {
      "localidad": "CARACAS",
      "nombre": "LOS CHAGUARAMOS",
      "abrev": "SCLCHGRMS"
    },
    {
      "localidad": "CARACAS",
      "nombre": "LOS RUICES",
      "abrev": "SCLRC"
    },
    {
      "localidad": "CARACAS",
      "nombre": "LOS TEQUES",
      "abrev": "SCLTQS"
    },
    {
      "localidad": "CARACAS",
      "nombre": "ALTAMIRA",
      "abrev": "SCALTMR"
    },
    {
      "localidad": "CARACAS",
      "nombre": "CEMENTERIO",
      "abrev": "SCCMNTR"
    },
    {
      "localidad": "CARACAS",
      "nombre": "CERRO VERDE",
      "abrev": "SCCRRVRD"
    },
    {
      "localidad": "CARACAS",
      "nombre": "LOS RUICES EXPRESS",
      "abrev": "SCLRXPRSS"
    },
    {
      "localidad": "CARACAS",
      "nombre": "MARIPEREZ",
      "abrev": "SCMRPRZ"
    },
    {
      "localidad": "CARACAS",
      "nombre": "SAN MARTIN",
      "abrev": "SCSNMRTN"
    },
    {
      "localidad": "CARACAS",
      "nombre": "CHARALLAVE",
      "abrev": "SCCHRLLV"
    },
    {
      "localidad": "BARCELONA",
      "nombre": "ANACO",
      "abrev": "SCANC"
    },
    {
      "localidad": "BARCELONA",
      "nombre": "BARCELONA",
      "abrev": "SCBRCLN"
    },
    {
      "localidad": "BARCELONA",
      "nombre": "CUMANA",
      "abrev": "SCCMN"
    },
    {
      "localidad": "BARCELONA",
      "nombre": "EL TIGRE",
      "abrev": "SCELTGRT"
    },
    {
      "localidad": "BARCELONA",
      "nombre": "PUERTO LA CRUZ",
      "abrev": "SCPLC"
    },
    {
      "localidad": "PUERTO ORDAZ",
      "nombre": "UNARE",
      "abrev": "SCCBLVR"
    },
    {
      "localidad": "PUERTO ORDAZ",
      "nombre": "SAN FELIX",
      "abrev": "SCMTRN"
    },
    {
      "localidad": "PUERTO ORDAZ",
      "nombre": "UPATA",
      "abrev": "SCPTORDZ"
    },
    {
      "localidad": "PUERTO ORDAZ",
      "nombre": "CIUDAD BOLIVAR",
      "abrev": "SCSNFLX"
    },
    {
      "localidad": "PUERTO ORDAZ",
      "nombre": "MATURIN",
      "abrev": "SCUNR"
    },
    {
      "localidad": "PORLAMAR",
      "nombre": "LOS ROBLES",
      "abrev": "SCLRBLS"
    },
    {
      "localidad": "Consolidado",
      "nombre": "Consolidado",
      "abrev": ""
    }
  ]
};
