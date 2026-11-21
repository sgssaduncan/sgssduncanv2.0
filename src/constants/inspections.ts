import type { TipoInspeccion } from '../types';

export const TIPOS_INSPECCION_SEED: Omit<TipoInspeccion, 'id'>[] = [
  {
    codigo: 'EXT',
    nombre: 'Extintores Portátiles',
    frecuencia: 'Mensual',
    categoria: 'Contra incendios',
    secciones: [
      {
        id: 's1',
        titulo: 'Estado General del Equipo',
        items: [
          { id: 'i1', pregunta: '¿El extintor se encuentra en su ubicación asignada?', tipoRespuesta: 'SI_NO' },
          { id: 'i2', pregunta: '¿El acceso al extintor está despejado y libre de obstáculos?', tipoRespuesta: 'SI_NO' },
          { id: 'i3', pregunta: '¿La señalización del extintor es visible y está en buen estado?', tipoRespuesta: 'SI_NO' },
          { id: 'i4', pregunta: '¿La aguja del manómetro indica presión correcta (zona verde)?', tipoRespuesta: 'SI_NO' },
          { id: 'i5', pregunta: '¿El precinto de seguridad y el pasador están intactos?', tipoRespuesta: 'SI_NO' },
          { id: 'i6', pregunta: '¿La manguera o corneta de descarga está libre de grietas y obstrucciones?', tipoRespuesta: 'ESTADO_EQUIPO' },
          { id: 'i7', pregunta: '¿El cilindro se encuentra libre de corrosión o abolladuras significativas?', tipoRespuesta: 'ESTADO_EQUIPO' }
        ]
      }
    ]
  },
  {
    codigo: 'OL',
    nombre: 'Inspección de Orden y Limpieza',
    frecuencia: 'Mensual',
    categoria: 'Condiciones',
    secciones: [
      {
        id: 's_servicio_tecnico',
        titulo: 'SERVICIO TÉCNICO ASPECTOS A CONSIDERAR',
        items: [
          { id: 'st_orden', pregunta: '¿El área se encuentran ordenada?', tipoRespuesta: 'SI_NO_NA' },
          { id: 'st_herramientas', pregunta: '¿Las herramientas y equipos están en su lugar correspondiente?', tipoRespuesta: 'SI_NO_NA' },
          { id: 'st_limpieza', pregunta: '¿Se ha realizado limpieza general?', tipoRespuesta: 'SI_NO_NA' },
          { id: 'st_estopas', pregunta: '¿Las estopas usadas y demás desechos que contengan acido son colocados en el contenedor de materiales misceláneos?', tipoRespuesta: 'SI_NO_NA' }
        ]
      },
      {
        id: 's_area_carga',
        titulo: 'ÁREA DE CARGA ASPECTOS A CONSIDERAR',
        items: [
          { id: 'ac_cableado', pregunta: '¿Se encuentra ordenado el cableado de los equipos?', tipoRespuesta: 'SI_NO_NA' },
          { id: 'ac_cargadores', pregunta: '¿Los cargadores están ubicados en el sitio correcto?', tipoRespuesta: 'SI_NO_NA' },
          { id: 'ac_filtracion', pregunta: '¿Hay presencia de filtración, humedad o bote de agua en el área de carga?', tipoRespuesta: 'SI_NO_NA' },
          { id: 'ac_objetos', pregunta: '¿Se encuentran objetos que no pertenezcan a esta área?', tipoRespuesta: 'SI_NO_NA' }
        ]
      },
      {
        id: 's_almacen',
        titulo: 'ALMACÉN ASPECTOS A CONSIDERAR',
        items: [
          { id: 'al_objetos', pregunta: '¿Se encuentran objetos que no pertenezcan a esta área?', tipoRespuesta: 'SI_NO_NA' },
          { id: 'al_baterias', pregunta: '¿Las baterías están apiladas o distribuidas en las estanterías o paletas correctamente?', tipoRespuesta: 'SI_NO_NA' }
        ]
      },
      {
        id: 's_area_bateria_inservibles',
        titulo: 'ÁREA BATERIA INSERVIBLES ASPECTOS A CONSIDERAR',
        items: [
          { id: 'abi_cantidad', pregunta: '¿Se ha sobrepasado la cantidad de baterías inservibles permitidas?', tipoRespuesta: 'SI_NO_NA' }
        ]
      },
      {
        id: 's_banos',
        titulo: 'BAÑOS ASPECTOS A CONSIDERAR',
        items: [
          { id: 'b_aseados', pregunta: '¿Se encuentra aseados?', tipoRespuesta: 'SI_NO_NA' },
          { id: 'b_iluminacion', pregunta: '¿Cuenta con iluminación?', tipoRespuesta: 'SI_NO_NA' },
          { id: 'b_llaves', pregunta: '¿Las llaves del lavamanos se encuentran en optimas condiciones?', tipoRespuesta: 'SI_NO_NA' },
          { id: 'b_olor', pregunta: '¿Se puede percibir mal olor proveniente de las piezas sanitarias?', tipoRespuesta: 'SI_NO_NA' },
          { id: 'b_bajante', pregunta: '¿El bajante de los inodoros se encuentra en funcionamiento normal?', tipoRespuesta: 'SI_NO_NA' },
          { id: 'b_papel', pregunta: '¿Cuentan con insumo de papel higiénico?', tipoRespuesta: 'SI_NO_NA' },
          { id: 'b_moho', pregunta: '¿Se observa presencia de moho en las duchas?', tipoRespuesta: 'SI_NO_NA' }
        ]
      },
      {
        id: 's_oficinas',
        titulo: 'OFICINAS',
        items: [
          { id: 'of_mobiliario', pregunta: '¿El mobiliario de trabajo se encuentra en óptimas condiciones (sillas, escritorio y archivos)?', tipoRespuesta: 'SI_NO_NA' },
          { id: 'of_carpetas', pregunta: '¿Se encuentra ordenada las capetas de trabajo, cableado del computado y demás elementos de la oficin?', tipoRespuesta: 'SI_NO_NA' },
          { id: 'of_mantenimiento', pregunta: '¿Se realiza el mantenimiento de limpieza constante?', tipoRespuesta: 'SI_NO_NA' },
          { id: 'of_equipos', pregunta: '¿Se encuentran equipos de dañados y sin uso dentro de las oficinas?', tipoRespuesta: 'SI_NO_NA' }
        ]
      },
      {
        id: 's_comedor',
        titulo: 'AREA DE COMEDOR',
        items: [
          { id: 'com_limpieza', pregunta: '¿Se les realiza constante limpieza a la nevera, microondas y fregadero?', tipoRespuesta: 'SI_NO_NA' }
        ]
      },
      {
        id: 's_contenedores',
        titulo: 'CONTENEDORES PARA DESECHOS',
        items: [
          { id: 'cont_suficientes', pregunta: '¿Cuentan con suficientes contenedores de desechos comunes?', tipoRespuesta: 'SI_NO_NA' }
        ]
      },
      {
        id: 's_insumos',
        titulo: 'INSUMOS PARA LIMPIEZA',
        items: [
          { id: 'ins_productos', pregunta: '¿Cuentan con los productos de limpieza necesarios para mantener limpia las áreas?', tipoRespuesta: 'SI_NO_NA' }
        ]
      },
      {
        id: 's_vectores',
        titulo: 'PRESENCIA DE VECTORES',
        items: [
          { id: 'vec_observado', pregunta: '¿Se ha observado presencia de roedores, insectos u otros vectores?', tipoRespuesta: 'SI_NO_NA' }
        ]
      },
      {
        id: 's_agua_potable',
        titulo: 'FUENTES DE AGUA POTABLE',
        items: [
          { id: 'ap_condiciones', pregunta: '¿Al dispensador de agua potable esta en buenas condiciones?', tipoRespuesta: 'SI_NO_NA' },
          { id: 'ap_limpieza', pregunta: '¿Al dispensador de agua potable se le realizó la limpieza del sistema?', tipoRespuesta: 'SI_NO_NA' },
          { id: 'ap_fecha', pregunta: 'Fecha de última limpieza realizada al sistema del dispensador de agua potable', tipoRespuesta: 'DATE' }
        ]
      },
      {
        id: 's_firmas',
        titulo: 'Personal que realizó la Inspección',
        items: [
          { id: 'f_realizado', pregunta: 'Realizada por', tipoRespuesta: 'TEXT' },
          { id: 'f_revisado', pregunta: 'Revisado por', tipoRespuesta: 'TEXT' }
        ]
      }
    ]
  },
  {
    codigo: 'MTCG',
    nombre: 'Montacargas Diaria',
    frecuencia: 'Diaria',
    categoria: 'Equipos',
    secciones: [
      {
        id: 's1',
        titulo: 'Inspección de Seguridad Pre-operacional',
        items: [
          { id: 'i1', pregunta: '¿Los niveles de fluidos (aceite, refrigerante, hidráulico) están en el rango seguro?', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'i2', pregunta: '¿Los neumáticos presentan una condición segura de uso (sin cortes profundos)?', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'i3', pregunta: '¿Los sistemas de advertencia (luces y bocina) funcionan correctamente?', tipoRespuesta: 'SI_NO' },
          { id: 'i4', pregunta: '¿El cinturón de seguridad engancha y sujeta firmemente?', tipoRespuesta: 'SI_NO' },
          { id: 'i5', pregunta: '¿El sistema de frenado responde de manera inmediata y efectiva?', tipoRespuesta: 'OPERATIVO_NO' }
        ]
      }
    ]
  },
  {
    codigo: 'SDID',
    nombre: 'Sistema de Detección de Incendios Distribuidoras',
    frecuencia: 'Mensual',
    categoria: 'Contra incendios',
    secciones: [
      {
        id: 's1',
        titulo: 'Tablero Central de Detección y Alarma de Incendio (Condición de Operatividad)',
        items: [
          { id: 't_ubi', pregunta: 'Ubicación del Tablero', tipoRespuesta: 'TEXT' },
          { id: 't_b_sil', pregunta: 'Botón silenciador de alarma general', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 't_b_rep', pregunta: 'Botón de reposición', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 't_b_pru', pregunta: 'Botón de prueba', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 't_b_aver', pregunta: 'Botón silenciador de avería', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 't_llave', pregunta: 'Llave de la alarma general', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 't_est', pregunta: 'Estado general del panel', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 't_obs', pregunta: 'Observaciones del Tablero', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's2',
        titulo: 'Tablero Central de Detección y Alarma de Incendio (Indicaciones de Averías Activas)',
        items: [
          { id: 'a_gen', pregunta: 'Alarma general', tipoRespuesta: 'SI_NO_NA' },
          { id: 'a_aux', pregunta: 'Función auxiliar', tipoRespuesta: 'SI_NO_NA' },
          { id: 'a_dif', pregunta: 'Difusor', tipoRespuesta: 'SI_NO_NA' },
          { id: 'a_emi', pregunta: 'Emisor de señal', tipoRespuesta: 'SI_NO_NA' },
          { id: 'a_bat', pregunta: 'Batería', tipoRespuesta: 'SI_NO_NA' },
          { id: 'a_pt', pregunta: 'Puesta a tierra', tipoRespuesta: 'SI_NO_NA' },
          { id: 'a_volt', pregunta: 'Voltaje de linea', tipoRespuesta: 'SI_NO_NA' },
          { id: 'a_obs', pregunta: 'Observaciones de Averías', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's3',
        titulo: 'Sistema de Extinción Fijo (Condición de los Gabinetes)',
        items: [
          { id: 'g1_ubi', pregunta: 'Gabinete 1: Ubicación', tipoRespuesta: 'TEXT' },
          { id: 'g1_gab', pregunta: 'Gabinete 1: Gabinete', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'g1_vid', pregunta: 'Gabinete 1: Vidrio', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'g1_man', pregunta: 'Gabinete 1: Manguera', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'g1_pis', pregunta: 'Gabinete 1: Pistón', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'g1_obs', pregunta: 'Gabinete 1: Observaciones', tipoRespuesta: 'TEXT' },
          { id: 'g2_ubi', pregunta: 'Gabinete 2: Ubicación', tipoRespuesta: 'TEXT' },
          { id: 'g2_gab', pregunta: 'Gabinete 2: Gabinete', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'g2_vid', pregunta: 'Gabinete 2: Vidrio', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'g2_man', pregunta: 'Gabinete 2: Manguera', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'g2_pis', pregunta: 'Gabinete 2: Pistón', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'g2_obs', pregunta: 'Gabinete 2: Observaciones', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's4',
        titulo: 'Detección y Alarma (Condición de Estaciones Manuales)',
        items: [
          { id: 'e1_ubi', pregunta: 'Estación 1: Ubicación', tipoRespuesta: 'TEXT' },
          { id: 'e1_pin', pregunta: 'Estación 1: Pintura', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e1_vid', pregunta: 'Estación 1: Vidrio', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e1_bot', pregunta: 'Estación 1: Botón pulsador', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e1_sen', pregunta: 'Estación 1: Señalización', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e1_pru', pregunta: 'Estación 1: Prueba', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e1_obs', pregunta: 'Estación 1: Observaciones', tipoRespuesta: 'TEXT' },
          { id: 'e2_ubi', pregunta: 'Estación 2: Ubicación', tipoRespuesta: 'TEXT' },
          { id: 'e2_pin', pregunta: 'Estación 2: Pintura', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e2_vid', pregunta: 'Estación 2: Vidrio', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e2_bot', pregunta: 'Estación 2: Botón pulsador', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e2_sen', pregunta: 'Estación 2: Señalización', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e2_pru', pregunta: 'Estación 2: Prueba', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e2_obs', pregunta: 'Estación 2: Observaciones', tipoRespuesta: 'TEXT' },
          { id: 'e3_ubi', pregunta: 'Estación 3: Ubicación', tipoRespuesta: 'TEXT' },
          { id: 'e3_pin', pregunta: 'Estación 3: Pintura', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e3_vid', pregunta: 'Estación 3: Vidrio', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e3_bot', pregunta: 'Estación 3: Botón pulsador', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e3_sen', pregunta: 'Estación 3: Señalización', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e3_pru', pregunta: 'Estación 3: Prueba', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e3_obs', pregunta: 'Estación 3: Observaciones', tipoRespuesta: 'TEXT' },
          { id: 'e4_ubi', pregunta: 'Estación 4: Ubicación', tipoRespuesta: 'TEXT' },
          { id: 'e4_pin', pregunta: 'Estación 4: Pintura', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e4_vid', pregunta: 'Estación 4: Vidrio', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e4_bot', pregunta: 'Estación 4: Botón pulsador', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e4_sen', pregunta: 'Estación 4: Señalización', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e4_pru', pregunta: 'Estación 4: Prueba', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e4_obs', pregunta: 'Estación 4: Observaciones', tipoRespuesta: 'TEXT' }
        ]
      }
    ]
  },
  {
    codigo: 'SDIS',
    nombre: 'Sistema de Detección de Incendios Servicentros',
    frecuencia: 'Mensual',
    categoria: 'Contra incendios',
    secciones: [
      {
        id: 's1',
        titulo: 'Tablero Central de Detección y Alarma de Incendio (Condición de Operatividad)',
        items: [
          { id: 't_ubi', pregunta: 'Ubicación del Tablero', tipoRespuesta: 'TEXT' },
          { id: 't_b_sil', pregunta: 'Botón silenciador de alarma general', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 't_b_rep', pregunta: 'Botón de reposición', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 't_b_pru', pregunta: 'Botón de prueba', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 't_b_aver', pregunta: 'Botón silenciador de avería', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 't_llave', pregunta: 'Llave de la alarma general', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 't_est', pregunta: 'Estado general del panel', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 't_obs', pregunta: 'Observaciones del Tablero', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's2',
        titulo: 'Tablero Central de Detección y Alarma de Incendio (Indicaciones de Averías Activas)',
        items: [
          { id: 'a_gen', pregunta: 'Alarma general', tipoRespuesta: 'SI_NO_NA' },
          { id: 'a_aux', pregunta: 'Función auxiliar', tipoRespuesta: 'SI_NO_NA' },
          { id: 'a_dif', pregunta: 'Difusor', tipoRespuesta: 'SI_NO_NA' },
          { id: 'a_emi', pregunta: 'Emisor de señal', tipoRespuesta: 'SI_NO_NA' },
          { id: 'a_bat', pregunta: 'Batería', tipoRespuesta: 'SI_NO_NA' },
          { id: 'a_pt', pregunta: 'Puesta a tierra', tipoRespuesta: 'SI_NO_NA' },
          { id: 'a_volt', pregunta: 'Voltaje de linea', tipoRespuesta: 'SI_NO_NA' }
        ]
      },
      {
        id: 's3',
        titulo: 'Detección y Alarma (Condición de Estaciones Manuales)',
        items: [
          { id: 'e1_ubi', pregunta: 'Estación 1: Ubicación', tipoRespuesta: 'TEXT' },
          { id: 'e1_pin', pregunta: 'Estación 1: Pintura', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e1_vid', pregunta: 'Estación 1: Vidrio', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e1_bot', pregunta: 'Estación 1: Botón pulsador', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e1_sen', pregunta: 'Estación 1: Señalización', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e1_pru', pregunta: 'Estación 1: Prueba', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e1_obs', pregunta: 'Estación 1: Observaciones', tipoRespuesta: 'TEXT' },
          { id: 'e2_ubi', pregunta: 'Estación 2: Ubicación', tipoRespuesta: 'TEXT' },
          { id: 'e2_pin', pregunta: 'Estación 2: Pintura', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e2_vid', pregunta: 'Estación 2: Vidrio', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e2_bot', pregunta: 'Estación 2: Botón pulsador', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e2_sen', pregunta: 'Estación 2: Señalización', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e2_pru', pregunta: 'Estación 2: Prueba', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e2_obs', pregunta: 'Estación 2: Observaciones', tipoRespuesta: 'TEXT' },
          { id: 'e3_ubi', pregunta: 'Estación 3: Ubicación', tipoRespuesta: 'TEXT' },
          { id: 'e3_pin', pregunta: 'Estación 3: Pintura', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e3_vid', pregunta: 'Estación 3: Vidrio', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e3_bot', pregunta: 'Estación 3: Botón pulsador', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e3_sen', pregunta: 'Estación 3: Señalización', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e3_pru', pregunta: 'Estación 3: Prueba', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e3_obs', pregunta: 'Estación 3: Observaciones', tipoRespuesta: 'TEXT' },
          { id: 'e4_ubi', pregunta: 'Estación 4: Ubicación', tipoRespuesta: 'TEXT' },
          { id: 'e4_pin', pregunta: 'Estación 4: Pintura', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e4_vid', pregunta: 'Estación 4: Vidrio', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e4_bot', pregunta: 'Estación 4: Botón pulsador', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e4_sen', pregunta: 'Estación 4: Señalización', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e4_pru', pregunta: 'Estación 4: Prueba', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e4_obs', pregunta: 'Estación 4: Observaciones', tipoRespuesta: 'TEXT' }
        ]
      }
    ]
  },
  {
    codigo: 'VTC',
    nombre: 'Inspección SSA de Vehículo de Transporte de Carga',
    frecuencia: 'Mensual',
    categoria: 'Vehículos',
    secciones: [
      {
        id: 's_vehiculo',
        titulo: 'Datos del Vehículo de Carga',
        items: [
          { id: 'v_ronda', pregunta: 'Ronda Nº', tipoRespuesta: 'TEXT' },
          { id: 'v_marca_modelo', pregunta: 'Marca - Modelo - Año - Placas - Capacidad Kgs', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_ruta',
        titulo: 'Datos de la Ruta',
        items: [
          { id: 'v_num_ruta', pregunta: 'Número de Ruta', tipoRespuesta: 'TEXT' },
          { id: 'v_desc_ruta', pregunta: 'Descripción de Ruta', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_conductor',
        titulo: 'Datos del Vendedor - Conductor',
        items: [
          { id: 'c_tipo', pregunta: 'Tipo de Vendedor de Ruta - Conductor', tipoRespuesta: 'TEXT' }, 
          { id: 'c_cedula', pregunta: 'Cédula de Identidad', tipoRespuesta: 'TEXT' },
          { id: 'c_nombre', pregunta: 'Nombre y Apellidos', tipoRespuesta: 'TEXT' },
          { id: 'c_motivo', pregunta: 'En caso de no ser el Titular indique el motivo', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_copiloto',
        titulo: 'Datos del Auxiliar de la Ruta - Copiloto',
        items: [
          { id: 'cp_tipo', pregunta: 'Tipo de Auxiliar de Ruta', tipoRespuesta: 'TEXT' }, 
          { id: 'cp_cedula', pregunta: 'Cédula de Identidad', tipoRespuesta: 'TEXT' },
          { id: 'cp_nombre', pregunta: 'Nombre y Apellidos', tipoRespuesta: 'TEXT' },
          { id: 'cp_motivo', pregunta: 'En caso de no ser el Titular indique el motivo', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_cauchos',
        titulo: 'Condiciones de los Cauchos del vehículo',
        items: [
          { id: 'ca_di', pregunta: 'Direccional Izquierdo (*)', tipoRespuesta: 'SI_NO_NA' },
          { id: 'ca_dd', pregunta: 'Direccional Derecho (*)', tipoRespuesta: 'SI_NO_NA' },
          { id: 'ca_tii', pregunta: 'Trasero interno Izquierdo (*)', tipoRespuesta: 'SI_NO_NA' },
          { id: 'ca_tei', pregunta: 'Trasero externo Izquierdo (*)', tipoRespuesta: 'SI_NO_NA' },
          { id: 'ca_tid', pregunta: 'Trasero interno Derecho (*)', tipoRespuesta: 'SI_NO_NA' },
          { id: 'ca_ted', pregunta: 'Trasero externo Derecho (*)', tipoRespuesta: 'SI_NO_NA' },
          { id: 'ca_rep', pregunta: 'Repuesto (*)', tipoRespuesta: 'SI_NO_NA' }
        ]
      },
      {
        id: 's_seguridad',
        titulo: 'Condiciones de los Equipos de seguridad y prevención',
        items: [
          { id: 'sq_cinturon', pregunta: 'Cinturón de Seguridad', tipoRespuesta: 'SI_NO_NA' },
          { id: 'sq_extintor', pregunta: 'Extintor P.Q.S', tipoRespuesta: 'SI_NO_NA' },
          { id: 'sq_triangulo', pregunta: 'Triángulo de emergencia / Conos de Seguridad (*)', tipoRespuesta: 'SI_NO_NA' },
          { id: 'sq_herram', pregunta: 'Disponibilidad de Herramientas', tipoRespuesta: 'SI_NO_NA' },
          { id: 'sq_lavadoojos', pregunta: 'Disponibilidad de Kit de lavado de ojos', tipoRespuesta: 'SI_NO_NA' },
          { id: 'sq_kit_emerg', pregunta: 'Disponibilidad de kit de emergencia foráneos', tipoRespuesta: 'SI_NO_NA' },
          { id: 'sq_kit_derram', pregunta: 'Disponibilidad de kit para atención de derrames', tipoRespuesta: 'SI_NO_NA' }
        ]
      },
      {
        id: 's_luces',
        titulo: 'Condiciones de las Luces del Vehículo',
        items: [
          { id: 'lu_bajas', pregunta: 'Bajas', tipoRespuesta: 'SI_NO_NA' },
          { id: 'lu_altas', pregunta: 'Altas', tipoRespuesta: 'SI_NO_NA' },
          { id: 'lu_int_del', pregunta: 'Intermitentes delanteras', tipoRespuesta: 'SI_NO_NA' },
          { id: 'lu_int_tra', pregunta: 'Intermitentes Traseras', tipoRespuesta: 'SI_NO_NA' },
          { id: 'lu_cruce_dd', pregunta: 'Cruce derecha delantera', tipoRespuesta: 'SI_NO_NA' },
          { id: 'lu_cruce_id', pregunta: 'Cruce Izquierda delantera', tipoRespuesta: 'SI_NO_NA' },
          { id: 'lu_coc_del', pregunta: 'Cocuyos cava delanteros', tipoRespuesta: 'SI_NO_NA' },
          { id: 'lu_stop', pregunta: 'Traseras Stop', tipoRespuesta: 'SI_NO_NA' },
          { id: 'lu_retro', pregunta: 'Retroceso', tipoRespuesta: 'SI_NO_NA' },
          { id: 'lu_cruce_dt', pregunta: 'Cruce derecha trasera', tipoRespuesta: 'SI_NO_NA' },
          { id: 'lu_cruce_it', pregunta: 'Cruce Izquierda trasera', tipoRespuesta: 'SI_NO_NA' },
          { id: 'lu_coc_tra', pregunta: 'Cocuyos Cava Traseros', tipoRespuesta: 'SI_NO_NA' },
          { id: 'lu_int_hab', pregunta: 'Interna Habitáculo', tipoRespuesta: 'SI_NO_NA' },
          { id: 'lu_int_fur', pregunta: 'Interna furgón o cabina de carga', tipoRespuesta: 'SI_NO_NA' }
        ]
      },
      {
        id: 's_parachoques',
        titulo: 'Condiciones de los Parachoques',
        items: [
          { id: 'par_del', pregunta: 'Delantero', tipoRespuesta: 'SI_NO_NA' }, 
          { id: 'par_tra', pregunta: 'Trasero', tipoRespuesta: 'SI_NO_NA' }
        ]
      },
      {
        id: 's_parabrisas',
        titulo: 'Condiciones del Parabrisas',
        items: [
          { id: 'pb_limpia', pregunta: 'Limpia parabrisas', tipoRespuesta: 'SI_NO_NA' },
          { id: 'pb_estado', pregunta: 'Estado del Cristal (*)', tipoRespuesta: 'SI_NO_NA' }
        ]
      },
      {
        id: 's_espejos',
        titulo: 'Condiciones de los Espejos (retrovisores)',
        items: [
          { id: 'esp_der', pregunta: 'Derecho', tipoRespuesta: 'SI_NO_NA' },
          { id: 'esp_izq', pregunta: 'Izquierdo', tipoRespuesta: 'SI_NO_NA' }
        ]
      },
      {
        id: 's_frenos',
        titulo: 'Condiciones de los Frenos',
        items: [
          { id: 'fre_mano', pregunta: 'Freno de Mano o auxiliar', tipoRespuesta: 'SI_NO_NA' },
          { id: 'fre_gen', pregunta: 'Frenos en General (*)', tipoRespuesta: 'SI_NO_NA' }
        ]
      },
      {
        id: 's_est_int',
        titulo: 'Condiciones de la Estructura interna de cabina',
        items: [
          { id: 'ei_aire', pregunta: 'Aire acondicionado', tipoRespuesta: 'SI_NO_NA' },
          { id: 'ei_asientos', pregunta: 'Asientos', tipoRespuesta: 'SI_NO_NA' },
          { id: 'ei_bocina', pregunta: 'Corneta/Bocina', tipoRespuesta: 'SI_NO_NA' },
          { id: 'ei_man_vid', pregunta: 'Manijas de regulación vidrios laterales', tipoRespuesta: 'SI_NO_NA' },
          { id: 'ei_vidrios', pregunta: 'Vidrios laterales piloto y copiloto', tipoRespuesta: 'SI_NO_NA' },
          { id: 'ei_man_ext', pregunta: 'Manijas externas de aperturas de puertas', tipoRespuesta: 'SI_NO_NA' },
          { id: 'ei_man_int', pregunta: 'Manijas interna de aperturas de puertas', tipoRespuesta: 'SI_NO_NA' },
          { id: 'ei_pal_camb', pregunta: 'Palanca de cambios (*)', tipoRespuesta: 'SI_NO_NA' },
          { id: 'ei_ped_acel', pregunta: 'Pedal de acelerador (*)', tipoRespuesta: 'SI_NO_NA' },
          { id: 'ei_ped_emb', pregunta: 'Pedal de embrague (*)', tipoRespuesta: 'SI_NO_NA' },
          { id: 'ei_ped_fre', pregunta: 'Pedal de freno (*)', tipoRespuesta: 'SI_NO_NA' },
          { id: 'ei_radio', pregunta: 'Radio', tipoRespuesta: 'SI_NO_NA' }
        ]
      },
      {
        id: 's_est_ext',
        titulo: 'Condiciones de la Estructura externa',
        items: [
          { id: 'ee_barandas', pregunta: 'Barandas de Protección', tipoRespuesta: 'SI_NO_NA' },
          { id: 'ee_eslingas', pregunta: 'Eslingas de sujeción de mercancía', tipoRespuesta: 'SI_NO_NA' },
          { id: 'ee_plataf', pregunta: 'Plataforma', tipoRespuesta: 'SI_NO_NA' },
          { id: 'ee_est_furg_ext', pregunta: 'Estructura del furgón externo', tipoRespuesta: 'SI_NO_NA' },
          { id: 'ee_est_furg_int', pregunta: 'Estructura del furgón interno', tipoRespuesta: 'SI_NO_NA' },
          { id: 'ee_salpic', pregunta: 'Salpicaderas o Chapaletas', tipoRespuesta: 'SI_NO_NA' },
          { id: 'ee_sis_bat', pregunta: 'Sistema de recolección de ácido de baterías', tipoRespuesta: 'SI_NO_NA' }
        ]
      },
      {
        id: 's_medidores',
        titulo: 'Condiciones de los Medidores de tablero internos',
        items: [
          { id: 'med_comb', pregunta: 'Medidor de combustible', tipoRespuesta: 'SI_NO_NA' },
          { id: 'med_km', pregunta: 'Contador de kilometraje', tipoRespuesta: 'SI_NO_NA' },
          { id: 'med_temp', pregunta: 'Medidor de temperatura', tipoRespuesta: 'SI_NO_NA' },
          { id: 'med_pres_aire', pregunta: 'Medidor de presión de aire', tipoRespuesta: 'SI_NO_NA' },
          { id: 'med_pres_aceit', pregunta: 'Medidor de presión de aceite', tipoRespuesta: 'SI_NO_NA' },
          { id: 'med_rpm', pregunta: 'Medidor de RPM', tipoRespuesta: 'SI_NO_NA' },
          { id: 'med_vel', pregunta: 'Medidor de Velocidad', tipoRespuesta: 'SI_NO_NA' }
        ]
      },
      {
        id: 's_fluidos',
        titulo: 'Condiciones de los Fluidos del vehículo',
        items: [
          { id: 'fl_agua', pregunta: 'Nivel de agua tanque radiador (*)', tipoRespuesta: 'SI_NO_NA' },
          { id: 'fl_aceite', pregunta: 'Nivel de aceite motor (*)', tipoRespuesta: 'SI_NO_NA' }
        ]
      },
      {
        id: 's_senal',
        titulo: 'Condiciones de las Señalizaciones de la Unidad',
        items: [
          { id: 'sen_onu', pregunta: 'Número ONU 2794', tipoRespuesta: 'SI_NO_NA' },
          { id: 'sen_racda', pregunta: 'N° R.A.C.D.A. Actual', tipoRespuesta: 'SI_NO_NA' },
          { id: 'sen_rombo', pregunta: 'Rombo NFPA y Rombo DOT N°8', tipoRespuesta: 'SI_NO_NA' },
          { id: 'sen_placa', pregunta: 'Placa del Vehículo anterior y posterior (*)', tipoRespuesta: 'SI_NO_NA' }
        ]
      },
      {
        id: 's_kit_derrame',
        titulo: 'Condiciones del Kit para Derrames',
        items: [
          { id: 'kd_lentes', pregunta: 'Lentes', tipoRespuesta: 'SI_NO_NA' },
          { id: 'kd_guantes', pregunta: 'Guantes', tipoRespuesta: 'SI_NO_NA' },
          { id: 'kd_mascarilla', pregunta: 'Mascarilla', tipoRespuesta: 'SI_NO_NA' },
          { id: 'kd_cinta', pregunta: 'Cinta de demarcación', tipoRespuesta: 'SI_NO_NA' },
          { id: 'kd_cepillo', pregunta: 'Cepillo', tipoRespuesta: 'SI_NO_NA' },
          { id: 'kd_pala', pregunta: 'Pala', tipoRespuesta: 'SI_NO_NA' },
          { id: 'kd_bolsas', pregunta: 'Bolsas plásticas', tipoRespuesta: 'SI_NO_NA' },
          { id: 'kd_cal', pregunta: 'Cal (>=3 kg)', tipoRespuesta: 'SI_NO_NA' },
          { id: 'kd_recipiente', pregunta: 'Recipiente de almacenamiento del kit de emergencia', tipoRespuesta: 'SI_NO_NA' }
        ]
      },
      {
        id: 's_doc_per',
        titulo: 'Condiciones de los Documentos personales',
        items: [
          { id: 'dp_licencia', pregunta: 'Posee licencia de conducir vigente', tipoRespuesta: 'SI_NO_NA' },
          { id: 'dp_grado', pregunta: 'Grado de Licencia de 5ta', tipoRespuesta: 'SI_NO_NA' },
          { id: 'dp_cert_med', pregunta: 'Certificado médico vigente', tipoRespuesta: 'SI_NO_NA' },
          { id: 'dp_cert_man', pregunta: 'Certificado como Manejador de Sustancias Peligrosas', tipoRespuesta: 'SI_NO_NA' },
          { id: 'dp_curso', pregunta: 'Curso de Manejo defensivo', tipoRespuesta: 'SI_NO_NA' },
          { id: 'dp_politica', pregunta: 'Política de Prevención y Seguridad Vial', tipoRespuesta: 'SI_NO_NA' }
        ]
      },
      {
        id: 's_doc_amb',
        titulo: 'Condiciones de los Documentos ambientales y legales',
        items: [
          { id: 'da_hoja', pregunta: 'Hoja de seguridad de materiales(FDS)AT-SSA-072', tipoRespuesta: 'SI_NO_NA' },
          { id: 'da_reg_racda', pregunta: 'Registro R.A.C.D.A actualizado (2años)', tipoRespuesta: 'SI_NO_NA' },
          { id: 'da_poliza_rc', pregunta: 'Póliza de Responsabilidad Civil', tipoRespuesta: 'SI_NO_NA' },
          { id: 'da_plan_emerg', pregunta: 'Plan de Emergencia y Contingencia', tipoRespuesta: 'SI_NO_NA' },
          { id: 'da_poliza_seguro', pregunta: 'Póliza de Seguros vigente (cobertura de daño ambiental)', tipoRespuesta: 'SI_NO_NA' },
          { id: 'da_pol_prev', pregunta: 'Política de Prevención y Seguridad Vial', tipoRespuesta: 'SI_NO_NA' },
          { id: 'da_reg_sencamer', pregunta: 'Registro de SENCAMER vigente', tipoRespuesta: 'SI_NO_NA' },
          { id: 'da_reg_rot', pregunta: 'Registro R.O.T vigente', tipoRespuesta: 'SI_NO_NA' },
          { id: 'da_norma_desechos', pregunta: 'Norma de Disposición de Desechos Peligrosos NG-SST- 067', tipoRespuesta: 'SI_NO_NA' }
        ]
      },
      {
        id: 's_doc_control',
        titulo: 'Condiciones de los Documentos de control',
        items: [
          { id: 'dc_formato', pregunta: 'Formato de inspección diaria de vehículos de transporte ventas (NG-SST-185)', tipoRespuesta: 'SI_NO_NA' },
          { id: 'dc_coment', pregunta: 'Comentarios', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_cap_carga',
        titulo: 'Inspección de Capacidad de Carga',
        items: [
          { id: 'cc_supera', pregunta: '¿La carga inspeccionada supera capacidad neta del vehículo?', tipoRespuesta: 'SI_NO_NA' },
          { id: 'cc_cant_ocup', pregunta: 'Cantidad de ocupantes de la unidad', tipoRespuesta: 'NUMBER' },
          { id: 'cc_cant_sem', pregunta: 'Cantidad de semanas evaluadas', tipoRespuesta: 'NUMBER' },
          { id: 'cc_tipo_unidad', pregunta: 'Tipo de unidad', tipoRespuesta: 'NUMBER' },
          { id: 'cc_coment', pregunta: 'Comentarios de Inspección de Capacidad de Carga', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_incidentes',
        titulo: 'Incidentes Reportados',
        items: [
          { id: 'inc_desc', pregunta: 'Descripción de los Incidentes', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_mantenimientos',
        titulo: 'Mantenimientos',
        items: [
          { id: 'man_cumple', pregunta: 'Se cumple con los planes de mantenimiento de los vehículos?', tipoRespuesta: 'SI_NO_NA' }, 
          { id: 'man_lleva', pregunta: 'Se lleva plan de mantenimiento de la unidad de transporte y cambio de cauchos', tipoRespuesta: 'SI_NO_NA' },
          { id: 'man_coment_plan', pregunta: 'Comentarios del plan de mantenimiento', tipoRespuesta: 'TEXT' },
          { id: 'man_soportes', pregunta: 'Soportes de mantenimiento de la unidad (Soportes Con fechas)', tipoRespuesta: 'SI_NO_NA' }, 
          { id: 'man_coment_sop', pregunta: 'Comentarios de los soportes de mantenimiento', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_cauchos_reporte',
        titulo: 'Reporte de desgaste de llantas o Cauchos',
        items: [
          { id: 'cr_cantidad', pregunta: 'Cantidad de cauchos a evaluar', tipoRespuesta: 'NUMBER' },
          ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].flatMap(i => [
            { id: `cr_c${i}_prof_int`, pregunta: `Caucho ${i} Medición de Profundidad Lado Interno (mm)`, tipoRespuesta: 'NUMBER' },
            { id: `cr_c${i}_conf_int`, pregunta: `Caucho ${i} Conformidad de profundidad Lado Interno`, tipoRespuesta: 'SI_NO_NA' },
            { id: `cr_c${i}_req_int`, pregunta: `Caucho ${i} Lado Interno Requiere cambio?`, tipoRespuesta: 'SI_NO_NA' },
            { id: `cr_c${i}_prof_ext`, pregunta: `Caucho ${i} Medición de Profundidad Lado Externo (mm)`, tipoRespuesta: 'NUMBER' },
            { id: `cr_c${i}_conf_ext`, pregunta: `Caucho ${i} Conformidad de profundidad Lado Externo`, tipoRespuesta: 'SI_NO_NA' },
            { id: `cr_c${i}_req_ext`, pregunta: `Caucho ${i} Lado Externo Requiere cambio?`, tipoRespuesta: 'SI_NO_NA' }
          ] as any[]),
          { id: 'cr_obs_cachos', pregunta: 'Observaciones relacionadas con los Cauchos', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_med_prev',
        titulo: 'Medidas Preventivas o Correctivas Establecidas - Otras Observaciones',
        items: [
          { id: 'med_prev', pregunta: 'Observaciones', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_conclusiones',
        titulo: 'Conclusiones, Recomendaciones Generales',
        items: [
          { id: 'conclusiones', pregunta: 'Observaciones', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_firmas',
        titulo: 'Personal que participó en la Inspección',
        items: [
          { id: 'f_elab', pregunta: 'Elaborado por', tipoRespuesta: 'TEXT' },
          { id: 'f_gerente', pregunta: 'Gerente de Distribuidora / Supervisor de Distribuidora', tipoRespuesta: 'TEXT' },
          { id: 'f_vendedor', pregunta: 'Vendedor de Ruta (Conductor – Piloto)', tipoRespuesta: 'TEXT' },
          { id: 'f_auxiliar', pregunta: 'Auxiliar de Ruta (Ayudante – Copiloto)', tipoRespuesta: 'TEXT' }
        ]
      }
    ]
  },
  {
    codigo: 'IEP',
    nombre: 'Inspección de Extintores Portátiles',
    frecuencia: 'Mensual',
    categoria: 'Contra incendios',
    secciones: [
      {
        id: 's_info',
        titulo: 'Información y Datos del Extintor Portátil',
        items: [
          { id: 'i_ubicacion', pregunta: 'Ubicación', tipoRespuesta: 'TEXT' },
          { id: 'i_vencimiento', pregunta: 'Fecha de Vencimiento', tipoRespuesta: 'DATE' },
          { id: 'i_agente', pregunta: 'Agente Extinguidor', tipoRespuesta: 'TEXT' },
          { id: 'i_capacidad', pregunta: 'Capacidad', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_condiciones',
        titulo: 'Condiciones y datos del Extintor Inspeccionado',
        items: [
          { id: 'c_soporte', pregunta: 'Soporte', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'c_senal', pregunta: 'Señalización', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'c_pintura', pregunta: 'Pintura', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'c_precinto', pregunta: 'Precinto de Seguridad', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'c_manguera', pregunta: 'Manguera', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'c_valvula', pregunta: 'Válvula', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'c_pasador', pregunta: 'Pasador', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'c_boquilla', pregunta: 'Boquilla', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'c_etiqueta', pregunta: 'Etiqueta de recarga', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'c_operatividad', pregunta: 'Operatividad', tipoRespuesta: 'OPERATIVO_NO' },
          { id: 'c_accion', pregunta: 'Acción Requerida', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_obs',
        titulo: 'Observaciones',
        items: [
          { id: 'o_observaciones', pregunta: 'Observaciones', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_firmas',
        titulo: 'Personal que realizó la Inspección',
        items: [
          { id: 'f_realizado', pregunta: 'Realizada por', tipoRespuesta: 'TEXT' },
          { id: 'f_revisado', pregunta: 'Revisado por', tipoRespuesta: 'TEXT' }
        ]
      }
    ]
  },
  {
    codigo: 'FLP',
    nombre: 'Inspección de Fuente Lavaojos Portátil',
    frecuencia: 'Mensual',
    categoria: 'Seguridad Industrial',
    secciones: [
      {
        id: 's_info',
        titulo: 'Información de la Fuente Lavaojos',
        items: [
          { id: 'i_ultima_insp', pregunta: 'Última fecha de Inspección', tipoRespuesta: 'DATE' },
          { id: 'i_ultimo_cambio', pregunta: 'Última fecha de cambio de agua', tipoRespuesta: 'DATE' },
          { id: 'i_ubicacion', pregunta: 'Ubicación', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_elem',
        titulo: 'Disponibilidad y Buen Estado de los Elementos',
        items: [
          { id: 'e_cabez', pregunta: 'Cabezales duales', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e_bandeja', pregunta: 'Bandeja de plástico', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e_cuerpo', pregunta: 'Cuerpo del envase polietileno', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e_tapa', pregunta: 'Tapa superior', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e_base', pregunta: 'Base de pared', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e_presion', pregunta: 'Presión de agua', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e_tapa_plas', pregunta: 'Tapa plástica (Si aplica)', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e_senal', pregunta: 'Señalización', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e_acces', pregunta: 'Accesibilidad', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e_agua', pregunta: '¿El agua que contiene la fuente lavaojos portátil es filtrada o una solución de mezcla salina fisiológica?', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e_cambio', pregunta: '¿En caso de ser agua filtrada se cambió en un lapso no mayor a los 30 días?', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e_limpia', pregunta: '¿Se encuentra limpia y sin polvo la fuente lavaojos?', tipoRespuesta: 'SI_NO_NA' },
          { id: 'e_fuga', pregunta: '¿Inexistencia de fuga de agua por los cabezales duales?', tipoRespuesta: 'SI_NO_NA' }
        ]
      },
      {
        id: 's_obs',
        titulo: 'Observaciones',
        items: [
          { id: 'o_observaciones', pregunta: 'Observaciones', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_firmas',
        titulo: 'Personal que realizó la Inspección',
        items: [
          { id: 'f_realizado', pregunta: 'Realizada por', tipoRespuesta: 'TEXT' },
          { id: 'f_revisado', pregunta: 'Revisado por', tipoRespuesta: 'TEXT' }
        ]
      }
    ]
  },
  {
    codigo: 'FLDE',
    nombre: 'Inspección de Fuente Lavaojos y Ducha de Emergencia',
    frecuencia: 'Mensual',
    categoria: 'Seguridad Industrial',
    secciones: [
      {
        id: 's_info',
        titulo: 'Información de la Fuente Lavaojos y Ducha',
        items: [
          { id: 'i_ultima_insp', pregunta: 'Última fecha de Inspección', tipoRespuesta: 'DATE' },
          { id: 'i_ubicacion', pregunta: 'Ubicación', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_lavaojos',
        titulo: 'Fuente Lavaojos Disponibilidad y Buen Estado de los Elementos',
        items: [
          { id: 'fl_boquilla', pregunta: 'Boquilla rociadora de agua', tipoRespuesta: 'SI_NO_NA' },
          { id: 'fl_aireador', pregunta: 'Aireador de lavado de ojos', tipoRespuesta: 'SI_NO_NA' },
          { id: 'fl_funda', pregunta: 'Funda anti polvo (tapa plástica)', tipoRespuesta: 'SI_NO_NA' },
          { id: 'fl_receptor', pregunta: 'Receptor de plástico', tipoRespuesta: 'SI_NO_NA' },
          { id: 'fl_manija', pregunta: 'Manija y válvula de lavaojos', tipoRespuesta: 'SI_NO_NA' },
          { id: 'fl_tuberia', pregunta: 'Tubería de drenaje (Si aplica)', tipoRespuesta: 'SI_NO_NA' },
          { id: 'fl_presion', pregunta: 'Presión de agua', tipoRespuesta: 'SI_NO_NA' },
          { id: 'fl_acces', pregunta: 'Accesibilidad', tipoRespuesta: 'SI_NO_NA' }
        ]
      },
      {
        id: 's_ducha',
        titulo: 'Ducha de Emergencia Disponibilidad y Buen Estado de los Elementos',
        items: [
          { id: 'de_cabezal', pregunta: 'Cabezal de la ducha', tipoRespuesta: 'SI_NO_NA' },
          { id: 'de_accionador', pregunta: 'Accionador de la regadera', tipoRespuesta: 'SI_NO_NA' },
          { id: 'de_tuberia', pregunta: 'Tuberia', tipoRespuesta: 'SI_NO_NA' },
          { id: 'de_senal', pregunta: 'Señalización', tipoRespuesta: 'SI_NO_NA' },
          { id: 'de_pintura', pregunta: 'Pintura y demarcación', tipoRespuesta: 'SI_NO_NA' },
          { id: 'de_presion', pregunta: 'Presión de agua', tipoRespuesta: 'SI_NO_NA' },
          { id: 'de_acces', pregunta: 'Accesibilidad', tipoRespuesta: 'SI_NO_NA' }
        ]
      },
      {
        id: 's_obs',
        titulo: 'Observaciones',
        items: [
          { id: 'o_observaciones', pregunta: 'Observaciones', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_firmas',
        titulo: 'Personal que realizó la Inspección',
        items: [
          { id: 'f_realizado', pregunta: 'Realizada por', tipoRespuesta: 'TEXT' },
          { id: 'f_revisado', pregunta: 'Revisado por', tipoRespuesta: 'TEXT' }
        ]
      }
    ]
  },
  {
    codigo: 'IHE',
    nombre: 'Inspección de Herramientas y Equipos',
    frecuencia: 'Mensual',
    categoria: 'Equipos y Herramientas',
    secciones: [
      {
        id: 's_info',
        titulo: 'Información y Datos de Herramientas y Equipos',
        items: [
          { id: 'i_ubicacion', pregunta: 'Ubicación', tipoRespuesta: 'TEXT' },
          { id: 'i_cant_trab', pregunta: 'Cantidad de Trabajadores', tipoRespuesta: 'NUMBER' },
          { id: 'i_equipo', pregunta: 'Equipo a inspeccionar', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_equipos',
        titulo: 'Condiciones de Operación y Funcionamiento de Equipos Técnicos de Trabajo',
        items: [
          { id: 'et_pinzas', pregunta: 'Condición de Pinzas', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'et_cables', pregunta: 'Condición de Cables o Conductores', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'et_botones', pregunta: 'Condición de Botones o Interruptores', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'et_pantalla', pregunta: 'Condición de Pantalla', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'et_resistencia', pregunta: 'Condición de Resistencia', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'et_enchufe', pregunta: 'Condición de Enchufe', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'et_guarda', pregunta: 'Condición de Guarda Protectora', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'et_mango', pregunta: 'Condición de Mango de Agarre', tipoRespuesta: 'BUENO_DANADO_NA' }
        ]
      },
      {
        id: 's_manuales',
        titulo: 'Condiciones de Operación y Funcionamiento de Herramientas Manuales',
        items: [
          { id: 'hm_llaves', pregunta: 'Llaves Combinadas', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'hm_rache', pregunta: 'Rache', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'hm_dados', pregunta: 'Dados y extensiones', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'hm_alic_man', pregunta: 'Alicate manual', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'hm_alic_pres', pregunta: 'Alicate de presión', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'hm_pinza_elec', pregunta: 'Pinza manual para electricista', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'hm_tenaza', pregunta: 'Tenaza', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'hm_dest_man', pregunta: 'Destornilladores manuales', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'hm_dest_inal', pregunta: 'Destornilladores inalámbricos', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'hm_martillo', pregunta: 'Martillo', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'hm_lima', pregunta: 'Lima', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'hm_navaja', pregunta: 'Navaja, exacto o cutter', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'hm_tijera', pregunta: 'Tijera manual', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'hm_cegueta', pregunta: 'Cegueta', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'hm_nivel', pregunta: 'Nivel de gota', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'hm_cinta', pregunta: 'Cinta métrica', tipoRespuesta: 'BUENO_DANADO_NA' }
        ]
      },
      {
        id: 's_firmas',
        titulo: 'Personal que realizó la Inspección',
        items: [
          { id: 'f_realizado', pregunta: 'Realizada por', tipoRespuesta: 'TEXT' },
          { id: 'f_revisado', pregunta: 'Revisado por', tipoRespuesta: 'TEXT' }
        ]
      }
    ]
  },
  {
    codigo: 'DIST',
    nombre: 'Inspección de Distribuidoras',
    frecuencia: 'Trimestral',
    categoria: 'Distribuidoras',
    secciones: [
      {
        id: 's_info',
        titulo: 'Datos de la Inspección',
        items: [
          { id: 'i_fecha_cierre', pregunta: 'Fecha de Cierre', tipoRespuesta: 'DATE' },
          { id: 'i_ronda', pregunta: 'Ronda N°', tipoRespuesta: 'NUMBER' }
        ]
      },
      {
        id: 's_ilum',
        titulo: 'Iluminación',
        items: [
          { id: 'il_1_1', pregunta: '1.1 ¿Son suficientes las luminarias según la tarea visual?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'il_1_2', pregunta: '1.2 ¿Luminarias limpias y en buen estado?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'il_1_3', pregunta: '1.3 ¿Luminarias con protección anti-caída/rotura?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'il_obs', pregunta: 'Observaciones en campo - Iluminación', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_vent',
        titulo: 'Ventilación',
        items: [
          { id: 've_2_1', pregunta: '2.1 ¿Ventilación/Extracción adecuada en todas las áreas?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 've_2_2', pregunta: '2.2 ¿Estado funcional de extractores y aires acondicionados?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 've_obs', pregunta: 'Observaciones en campo - Ventilación', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_avisos',
        titulo: 'Avisos o Señalizaciones Según Norma COVENIN 187-2003',
        items: [
          { id: 'av_3_1', pregunta: '3.1 ¿Aviso "No Fumar" visible?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'av_3_2', pregunta: '3.2 ¿Aviso "No Discriminación" visible?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'av_3_3', pregunta: '3.3 ¿Aviso "Prohibido Porte de Armas" visible?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'av_3_4', pregunta: '3.4 ¿Aviso "Número 911" visible?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'av_3_5', pregunta: '3.5 ¿Cartelera/Información SSA visible en áreas operativas?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'av_3_6', pregunta: '3.6 ¿Señalización de vías de escape visible?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'av_3_7', pregunta: '3.7 ¿Señalización de riesgos específicos (Eléctrico, NFPA)?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'av_3_8', pregunta: '3.8 ¿Señalización visible de equipos contra incendio?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'av_3_9', pregunta: '3.9 ¿Contenedor de estopas con Rombo DOT 9?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'av_3_10', pregunta: '3.10 ¿Área de baterías con Rombo NFPA 704?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'av_3_11', pregunta: '3.11 ¿Tanques/Cilindros con rombos DOT (3 y 2) y NFPA?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'av_3_12', pregunta: '3.12 ¿Señalización adecuada por tipo de almacén?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'av_obs', pregunta: 'Observaciones en campo - Avisos', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_almacenamiento',
        titulo: 'Almacenamiento',
        items: [
          { id: 'al_4_1', pregunta: '4.1 ¿Almacenamiento apilado, organizado y seguro?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'al_4_2', pregunta: '4.2 ¿Estanterías/Racks en buen estado y anclados?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'al_4_3', pregunta: '4.3 ¿Racks de baterías anclados al suelo?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'al_4_4', pregunta: '4.4 ¿Baterías inservibles protegidas de intemperie?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'al_4_5', pregunta: '4.5 ¿Piso impermeable en área de baterías inservibles?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'al_4_6', pregunta: '4.6 ¿Baterías alejadas de fuentes de calor/energía?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'al_4_7', pregunta: '4.7 ¿Control de fugas de ácido a drenajes?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'al_4_8', pregunta: '4.8 ¿Orden y limpieza en áreas de almacenamiento?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'al_obs', pregunta: 'Observaciones en campo - Almacenamiento', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_herramientas',
        titulo: 'Herramientas y Equipos',
        items: [
          { id: 'he_5_1', pregunta: '5.1 ¿Limpieza alrededor de equipos/herramientas?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'he_5_2', pregunta: '5.2 ¿Equipos y herramientas en buen estado?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'he_5_3', pregunta: '5.3 ¿Existencia de contenedor de estopas usadas?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'he_5_4', pregunta: '5.4 ¿Uso exclusivo del contenedor para estopas/residuos peligrosos?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'he_5_5', pregunta: '5.5 ¿Carretillas/Transpaletas en buen estado?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'he_obs', pregunta: 'Observaciones en campo - Herramientas', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_extincion',
        titulo: 'Sistema de Extinción y Detección de Incendios',
        items: [
          { id: 'ex_6_1', pregunta: '6.1 ¿Extintores en sitio y señalizados correctamente?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ex_6_2', pregunta: '6.2 ¿Extintores accesibles sin obstáculos?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ex_6_3', pregunta: '6.3 ¿Extintores con mantenimiento vigente (anual)?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ex_6_4', pregunta: '6.4 ¿Altura de montaje de extintores (10cm - 1.30m)?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ex_6_5', pregunta: '6.5 ¿Posee sistema de detección y alarma?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ex_6_6', pregunta: '6.6 ¿Sistema de detección funcionando correctamente?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ex_6_7', pregunta: '6.7 ¿Luces de emergencia operativas?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ex_6_8', pregunta: '6.8 ¿Estaciones manuales accesibles?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ex_6_9', pregunta: '6.9 ¿Sistema de extinción acorde a COVENIN 1331?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ex_6_10', pregunta: '6.10 ¿Sistema de bombas contra incendio operativo?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ex_6_11', pregunta: '6.11 ¿Distribución adecuada de mangueras y tuberías?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ex_6_12', pregunta: '6.12 ¿Paños de manguera completos y en buen estado?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ex_obs', pregunta: 'Observaciones en campo - Extinción', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_emergencias',
        titulo: 'Atención de Emergencias',
        items: [
          { id: 'em_7_1', pregunta: '7.1 ¿Cuenta con Plan de Emergencia?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'em_7_2', pregunta: '7.2 ¿Cuenta con Brigada de Emergencia formada?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'em_7_3', pregunta: '7.3 ¿Adiestramiento continuo a la brigada?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'em_7_4', pregunta: '7.4 ¿Simulacros de desalojo anuales?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'em_7_5', pregunta: '7.5 ¿Puertas de salida abren fácilmente desde el interior?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'em_7_6', pregunta: '7.6 ¿Puertas de emergencia libres y abren hacia afuera?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'em_7_7', pregunta: '7.7 ¿Pruebas mensuales de presurización documentadas?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'em_7_8', pregunta: '7.8 ¿Existencia de rayado peatonal interno?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'em_obs', pregunta: 'Observaciones en campo - Emergencias', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_instalaciones',
        titulo: 'Instalaciones del Local',
        items: [
          { id: 'in_8_1', pregunta: '8.1 ¿Mobiliario de oficina en buenas condiciones?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_2', pregunta: '8.2 ¿Orden y limpieza en oficina?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_3', pregunta: '8.3 ¿Sistema eléctrico canalizado y protegido?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_4', pregunta: '8.4 ¿Ausencia de sobrecarga en regletas/tomas?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_5', pregunta: '8.5 ¿Cerraduras y puertas funcionales?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_6', pregunta: '8.6 ¿Tanque de agua sanitario operativo?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_7', pregunta: '8.7 ¿Bomba de agua operativa (si aplica)?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_8', pregunta: '8.8 ¿Baños con dispensadores de jabón/papel?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_9', pregunta: '8.9 ¿Piezas sanitarias operativas?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_10', pregunta: '8.10 ¿Dispensadores dotados de insumos?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_11', pregunta: '8.11 ¿Baños limpios e higienizados?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_12', pregunta: '8.12 ¿Suministro adecuado de consumibles de baño?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_13', pregunta: '8.13 ¿Área de consumibles ordenada y limpia?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_14', pregunta: '8.14 ¿Espacio habilitado para comedor?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_15', pregunta: '8.15 ¿Comedor separado de áreas contaminantes?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_16', pregunta: '8.16 ¿Comedor con climatización adecuada?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_17', pregunta: '8.17 ¿Equipos de comedor (nevera/mesa) en buen estado?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_18', pregunta: '8.18 ¿Higiene y orden en el comedor?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_19', pregunta: '8.19 ¿Filtro de agua higiénico y funcional?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_20', pregunta: '8.20 ¿Ubicación segura de filtro y botellones?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_21', pregunta: '8.21 ¿Dispensador de vasos cónicos disponible?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_22', pregunta: '8.22 ¿Acceso fácil al agua potable?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_23', pregunta: '8.23 ¿Techos sin goteras ni filtraciones?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_24', pregunta: '8.24 ¿Paredes sin grietas ni deterioro?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_25', pregunta: '8.25 ¿Piso nivelado y sin daños?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_26', pregunta: '8.26 ¿Pintura general en buen estado?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_27', pregunta: '8.27 ¿Áreas libres de obstrucciones y residuos?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_28', pregunta: '8.28 ¿Demarcación de piso en áreas operativas?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_obs', pregunta: 'Observaciones en campo - Instalaciones', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_eq_prot',
        titulo: 'Equipos de Protección Colectiva',
        items: [
          { id: 'ep_9_1', pregunta: '9.1 ¿Ducha/Lavaojos de emergencia disponible?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ep_9_2', pregunta: '9.2 ¿Componentes de ducha/lavaojos completos?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ep_9_3', pregunta: '9.3 ¿Presión de agua suficiente en ducha/lavaojos?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ep_9_4', pregunta: '9.4 ¿Botiquín visible, señalizado y accesible?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ep_9_5', pregunta: '9.5 ¿Contenido del botiquín según norma?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ep_9_6', pregunta: '9.6 ¿Kit para derrames (ácidos) disponible?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ep_obs', pregunta: 'Observaciones en campo - Equipos Prot C', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_uniforme',
        titulo: 'Uniforme y Equipo de Protección Personal',
        items: [
          { id: 'up_10_1', pregunta: '10.1 ¿Uso adecuado del uniforme?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'up_10_2', pregunta: '10.2 ¿Uniformes en buen estado?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'up_10_3', pregunta: '10.3 ¿Uso correcto de EPP (lentes, guantes, botas)?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'up_obs', pregunta: 'Observaciones en campo - Uniforme y EPP', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_cartelera',
        titulo: 'Cartelera de Seguridad, Salud y Ambiente',
        items: [
          { id: 'ca_11_1', pregunta: '11.1 ¿Política de SSL disponible y actualizada?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ca_11_2', pregunta: '11.2 ¿Hoja de Datos de Seguridad (FDS) visible?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ca_11_3', pregunta: '11.3 ¿Plan de emergencia acorde a COVENIN?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ca_11_4', pregunta: '11.4 ¿Permiso de Bomberos publicado?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ca_11_5', pregunta: '11.5 ¿Permiso de Bomberos vigente?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ca_11_6', pregunta: '11.6 ¿Estadísticas de accidentabilidad actualizadas?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ca_11_7', pregunta: '11.7 ¿Estadísticas de morbilidad actualizadas?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ca_11_8', pregunta: '11.8 ¿Mapa de Riesgo visible?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ca_obs', pregunta: 'Observaciones en campo - Cartelera SSA', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_gestion',
        titulo: 'Gestión de Seguridad, Salud y Ambiente',
        items: [
          { id: 'gs_12_1', pregunta: '12.1 ¿Mantenimiento semestral sistema contra incendio?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'gs_12_2', pregunta: '12.2 ¿Inspección semestral de extintores?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'gs_12_3', pregunta: '12.3 ¿Inspección mensual de orden y limpieza?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'gs_12_4', pregunta: '12.4 ¿Inspección mensual de herramientas?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'gs_12_5', pregunta: '12.5 ¿Inspección trimestral detección incendios?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'gs_12_6', pregunta: '12.6 ¿Inspección mensual luces de emergencia?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'gs_12_7', pregunta: '12.7 ¿Inspección mensual Kit derrames?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'gs_12_8', pregunta: '12.8 ¿Inspección mensual fuente lavaojos?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'gs_12_9', pregunta: '12.9 ¿Registro de Delegados vigente?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'gs_12_10', pregunta: '12.10 ¿Registro de CSSL vigente?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'gs_12_11', pregunta: '12.11 ¿Reuniones mensuales del CSSL?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'gs_12_12', pregunta: '12.12 ¿Libro de actas del CSSL al día?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'gs_12_13', pregunta: '12.13 ¿Consignación mensual de minutas al INPSASEL?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'gs_12_14', pregunta: '12.14 ¿Informe Epidemiológico sellado por INPSASEL?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'gs_12_15', pregunta: '12.15 ¿16 horas trimestrales de formación cumplidas?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'gs_12_16', pregunta: '12.16 ¿Programa SST registrado en INPSASEL?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'gs_12_17', pregunta: '12.17 ¿Servicio SST registrado y actualizado?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'gs_12_18', pregunta: '12.18 ¿RACDA actualizado para la localidad?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'gs_12_19', pregunta: '12.19 ¿Póliza de daños ambientales consignada anual?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'gs_12_20', pregunta: '12.20 ¿Informe anual de almacenamiento consignado?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'gs_obs', pregunta: 'Observaciones en campo - Gestión SSA', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_expedientes',
        titulo: 'Expedientes de los Colaboradores',
        items: [
          { id: 'ec_13_1', pregunta: '13.1 ¿Exámenes médicos periódicos vigentes?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ec_13_2', pregunta: '13.2 ¿Hojas de Ruta de Trabajo en expedientes?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ec_13_3', pregunta: '13.3 ¿Descripción de Cargo en expedientes?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ec_13_4', pregunta: '13.4 ¿Constancia de entrega de EPP en expedientes?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ec_13_5', pregunta: '13.5 ¿Notificación de Riesgos en expedientes?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ec_13_6', pregunta: '13.6 ¿Análisis de Riesgo de Tareas (ART)?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ec_13_7', pregunta: '13.7 ¿Certificación MATPEL vigente en expedientes?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ec_13_8', pregunta: '13.8 ¿Política de SST firmada por trabajadores?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ec_13_9', pregunta: '13.9 ¿Política vial firmada por trabajadores?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ec_13_10', pregunta: '13.10 ¿Notificación de cambios en condiciones de trabajo?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ec_obs', pregunta: 'Observaciones en campo - Expedientes', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_hoja_seg',
        titulo: 'Hoja de Seguimiento Acumuladores Inservibles',
        items: [
          { id: 'hs_14_1', pregunta: '14.1 ¿Hojas de seguimiento llenas correctamente?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'hs_14_2', pregunta: '14.2 ¿Material de impresión hoja seguimiento adecuado?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'hs_14_3', pregunta: '14.3 ¿Hojas de transporte llenas correctamente?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'hs_14_4', pregunta: '14.4 ¿Material de impresión hoja transporte adecuado?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'hs_14_5', pregunta: '14.5 ¿Archivo cronológico de guías/hojas?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'hs_obs', pregunta: 'Observaciones en campo - Hoja Seguimiento', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_montacargas',
        titulo: 'Montacargas',
        items: [
          { id: 'mo_15_1', pregunta: '15.1 ¿Montacargas en buenas condiciones generales?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'mo_15_2', pregunta: '15.2 ¿Extintor del montacargas vigente y fijo?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'mo_15_3', pregunta: '15.3 ¿Cinturón de seguridad en buen estado?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'mo_15_4', pregunta: '15.4 ¿Uso del cinturón por el operador?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'mo_15_5', pregunta: '15.5 ¿Luces frontales operativas?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'mo_15_6', pregunta: '15.6 ¿Alarma de retroceso/pito operativo?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'mo_15_7', pregunta: '15.7 ¿Bocina operativa?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'mo_15_8', pregunta: '15.8 ¿Registro de inspección diaria?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'mo_15_9', pregunta: '15.9 ¿Plan de mantenimiento (trazabilidad)?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'mo_15_10', pregunta: '15.10 ¿Licencia de 5ta grado vigente (Operador)?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'mo_15_11', pregunta: '15.11 ¿Certificado médico vigente (Operador)?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'mo_15_12', pregunta: '15.12 ¿Evaluación médica especial (Visual/Auditiva)?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'mo_15_13', pregunta: '15.13 ¿Certificación de manejo de montacargas?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'mo_obs', pregunta: 'Observaciones en campo - Montacargas', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_alm_cilindros',
        titulo: 'Almacenamiento - Cilindros de Gas Inflamable',
        items: [
          { id: 'ac_16_1', pregunta: '16.1 ¿Cilindros en buen estado?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ac_16_2', pregunta: '16.2 ¿Cilindros verticales y asegurados?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ac_16_3', pregunta: '16.3 ¿Protección contra calor/sol?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ac_16_4', pregunta: '16.4 ¿Área ventilada y sin combustibles cerca?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ac_16_5', pregunta: '16.5 ¿Uso de carros/cestas para traslado?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ac_16_6', pregunta: '16.6 ¿Identificación del tipo de gas?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ac_16_7', pregunta: '16.7 ¿Colmenas/Estructuras sin óxido/daños?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ac_obs', pregunta: 'Observaciones en campo - Gas Inflamable', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_alm_tanques',
        titulo: 'Almacenamiento - Tanques de Almacenamiento de Combustible Líquido',
        items: [
          { id: 'at_17_1', pregunta: '17.1 ¿Tanques estructuralmente sanos?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'at_17_2', pregunta: '17.2 ¿Superficie sólida y nivelada?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'at_17_3', pregunta: '17.3 ¿Muro de contención adecuado?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'at_17_4', pregunta: '17.4 ¿Capacidad del muro 110% del tanque mayor?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'at_17_5', pregunta: '17.5 ¿Alejado de fuentes de ignición?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'at_17_6', pregunta: '17.6 ¿Ubicación en área abierta/ventilada?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'at_17_7', pregunta: '17.7 ¿Distancia mínima de 6m a edificaciones?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'at_17_8', pregunta: '17.8 ¿Equipos eléctricos clasificados (antiexplosivos)?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'at_17_9', pregunta: '17.9 ¿Disposición final aceites según norma?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'at_obs', pregunta: 'Observaciones en campo - Combustible Líquido', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_flota',
        titulo: 'Flota de Distribuidora',
        items: [
          { id: 'fl_18_1', pregunta: '18.1 ¿Inspección diaria de vehículos realizada?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'fl_18_2', pregunta: '18.2 ¿Resultado de inspección satisfactorio?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'fl_18_3', pregunta: '18.3 ¿Carga de salida dentro de capacidad?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'fl_18_4', pregunta: '18.4 ¿Carga de retorno dentro de capacidad?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'fl_18_5', pregunta: '18.5 ¿Desgaste de cauchos aceptable?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'fl_18_6', pregunta: '18.6 ¿Trazabilidad de mantenimiento?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'fl_18_7', pregunta: '18.7 ¿Kit lavaojos en unidades?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'fl_18_8', pregunta: '18.8 ¿Kit de derrames en unidades?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'fl_18_9', pregunta: '18.9 ¿Señalización ONU/RACDA/Rombo 9 visible?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'fl_18_10', pregunta: '18.10 ¿Documentación completa en flota?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'fl_18_11', pregunta: '18.11 ¿Implementos de emergencia (Gato, triángulo)?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'fl_18_12', pregunta: '18.12 ¿Cinturones de seguridad operativos?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'fl_18_13', pregunta: '18.13 ¿Licencia 5ta y Certificado Médico vigentes?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'fl_18_14', pregunta: '18.14 ¿Vehículos en buenas condiciones generales?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'fl_obs', pregunta: 'Observaciones en campo - Flota', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_conclusiones',
        titulo: 'Conclusiones, Recomendaciones Generales',
        items: [
          { id: 'conclusiones', pregunta: 'Observaciones', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_firmas',
        titulo: 'Personal que realizó la Inspección',
        items: [
          { id: 'f_realizado', pregunta: 'Realizada por', tipoRespuesta: 'TEXT' },
          { id: 'f_revisado', pregunta: 'Revisado por', tipoRespuesta: 'TEXT' }
        ]
      }
    ]
  },
  {
    codigo: 'SERV',
    nombre: 'Inspección de Servicentros',
    frecuencia: 'Trimestral',
    categoria: 'Servicentros',
    secciones: [
      {
        id: 's_info',
        titulo: 'Datos de la Inspección',
        items: [
          { id: 'i_fecha_cierre', pregunta: 'Fecha de Cierre', tipoRespuesta: 'DATE' },
          { id: 'i_ronda', pregunta: 'Ronda N°', tipoRespuesta: 'NUMBER' }
        ]
      },
      {
        id: 's_ilum',
        titulo: 'Iluminación',
        items: [
          { id: 'il_1_1', pregunta: '1.1 ¿Es suficiente la iluminación (natural o artificial) en las áreas?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'il_1_2', pregunta: '1.2 ¿Están las luminarias limpias y en buen estado?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'il_1_3', pregunta: '1.3 ¿Tienen las luminarias protección contra caída o rotura?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'il_obs', pregunta: 'Observaciones en campo - Iluminación', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_vent',
        titulo: 'Ventilación',
        items: [
          { id: 've_2_1', pregunta: '2.1 ¿Es adecuada la ventilación/extracción en todas las áreas?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 've_2_2', pregunta: '2.2 ¿Están operativos los extractores y aires acondicionados?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 've_obs', pregunta: 'Observaciones en campo - Ventilación', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_avisos',
        titulo: 'Avisos o Señalizaciones Según Norma COVENIN 187-2003',
        items: [
          { id: 'av_3_1', pregunta: '3.1 ¿Aviso "No Fumar" visible y fijado?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'av_3_2', pregunta: '3.2 ¿Aviso "No Discriminación" visible?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'av_3_3', pregunta: '3.3 ¿Aviso "Prohibición de Armas" visible?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'av_3_4', pregunta: '3.4 ¿Aviso del número de emergencia 911 visible?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'av_3_5', pregunta: '3.5 ¿Cartelera informativa de SSA visible en áreas operativas?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'av_3_6', pregunta: '3.6 ¿Señalización de vías de escape visible y fijada?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'av_3_7', pregunta: '3.7 ¿Señalización de riesgos específicos (Eléctrico, NFPA, DOT)?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'av_3_8', pregunta: '3.8 ¿Señalización visible de equipos contra incendio (sin obstáculos)?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'av_3_9', pregunta: '3.9 ¿Contenedor de estopas identificado con Rombo ONU 9?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'av_3_10', pregunta: '3.10 ¿Área de baterías identificada con Rombo NFPA 704?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'av_obs', pregunta: 'Observaciones en campo - Avisos', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_almacenamiento',
        titulo: 'Almacenamiento',
        items: [
          { id: 'al_4_1', pregunta: '4.1 ¿Almacenamiento apilado y organizado en racks/zonas?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'al_4_2', pregunta: '4.2 ¿Estanterías y racks en buen estado y anclados?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'al_4_3', pregunta: '4.3 ¿Baterías inservibles protegidas de la intemperie?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'al_4_4', pregunta: '4.4 ¿Piso impermeable en área de baterías (evita filtración ácida)?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'al_4_5', pregunta: '4.5 ¿Baterías alejadas de fuentes de calor o energía?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'al_4_6', pregunta: '4.6 ¿Se garantiza que el ácido no llegue a drenajes o aguas?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'al_4_7', pregunta: '4.7 ¿Orden y limpieza en áreas de almacenamiento?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'al_obs', pregunta: 'Observaciones en campo - Almacenamiento', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_herramientas',
        titulo: 'Herramientas y Equipos',
        items: [
          { id: 'he_5_1', pregunta: '5.1 ¿Áreas de equipos y herramientas limpias y ordenadas?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'he_5_2', pregunta: '5.2 ¿Equipos y herramientas en buenas condiciones?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'he_5_3', pregunta: '5.3 ¿Existe contenedor para estopas usadas?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'he_5_4', pregunta: '5.4 ¿Contenedor de estopas solo tiene residuos permitidos?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'he_5_5', pregunta: '5.5 ¿Carretillas y transpaletas en buen estado (ruedas, gatos)?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'he_5_6', pregunta: '5.6 ¿Mantenimiento de orden y limpieza en almacenes?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'he_obs', pregunta: 'Observaciones en campo - Herramientas', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_extincion',
        titulo: 'Sistema de Extinción y Detección de Incendios',
        items: [
          { id: 'ex_6_1', pregunta: '6.1 ¿Extintores señalizados, con instrucciones y vigentes?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ex_6_2', pregunta: '6.2 ¿Extintores accesibles y sin obstáculos?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ex_6_3', pregunta: '6.3 ¿Extintores con mantenimiento anual vigente?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ex_6_4', pregunta: '6.4 ¿Altura de extintores correcta (10cm a 1.30m)?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ex_6_5', pregunta: '6.5 ¿Existe sistema de detección y alarma de incendios?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ex_6_6', pregunta: '6.6 ¿El sistema de detección funciona correctamente?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ex_6_7', pregunta: '6.7 ¿Luces de emergencia operativas y buen estado?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ex_6_8', pregunta: '6.8 ¿Estaciones manuales libres de obstáculos y buen estado?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ex_obs', pregunta: 'Observaciones en campo - Extinción', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_emergencias',
        titulo: 'Atención de Emergencias',
        items: [
          { id: 'em_7_1', pregunta: '7.1 ¿Se cuenta con Plan de Emergencia documentado?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'em_7_2', pregunta: '7.2 ¿Personal formado en brigada de emergencia integral?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'em_7_3', pregunta: '7.3 ¿Existe adiestramiento continuo para la brigada?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'em_7_4', pregunta: '7.4 ¿Se realizan simulacros de desalojo anuales?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'em_7_5', pregunta: '7.5 ¿Puertas de salida abren fácilmente desde el interior?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'em_7_6', pregunta: '7.6 ¿Puertas de emergencia libres y abren hacia afuera?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'em_obs', pregunta: 'Observaciones en campo - Emergencias', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_instalaciones',
        titulo: 'Instalaciones del Local',
        items: [
          { id: 'in_8_1', pregunta: '8.1 ¿Mobiliario de oficina ergonómico y en buen estado?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_2', pregunta: '8.2 ¿Oficina de ventas ordenada y limpia?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_3', pregunta: '8.3 ¿Cableado eléctrico canalizado y protegido?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_4', pregunta: '8.4 ¿Regletas y tomas sin sobrecarga eléctrica?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_5', pregunta: '8.5 ¿Puertas y cerraduras funcionan correctamente?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_6', pregunta: '8.6 ¿Tanque de agua sanitario operativo para contingencias?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_7', pregunta: '8.7 ¿Bomba de agua operativa (si aplica tanque subterráneo)?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_8', pregunta: '8.8 ¿Baños con dispensadores de jabón y papel?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_9', pregunta: '8.9 ¿Piezas sanitarias funcionales y en buen estado?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_10', pregunta: '8.10 ¿Dispensadores de baños con suministro activo?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_11', pregunta: '8.11 ¿Higiene y limpieza garantizada en baños?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_12', pregunta: '8.12 ¿Suministro adecuado de papel, jabón y secante?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_13', pregunta: '8.13 ¿Almacén de consumibles de limpieza ordenado?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_14', pregunta: '8.14 ¿Existe espacio habilitado para comedor?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_15', pregunta: '8.15 ¿Comedor separado de áreas de trabajo/contaminantes?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_16', pregunta: '8.16 ¿Comedor con temperatura/clima adecuado?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_17', pregunta: '8.17 ¿Equipos de comedor (nevera, microondas) higiénicos?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_18', pregunta: '8.18 ¿Orden y limpieza en el área de comedor?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_19', pregunta: '8.19 ¿Filtro de agua funcional e higiénico?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_20', pregunta: '8.20 ¿Filtro y botellones alejados de contaminación?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_21', pregunta: '8.21 ¿Dispensador de vasos cónicos disponible?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_22', pregunta: '8.22 ¿Filtro de agua accesible a todos?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_23', pregunta: '8.23 ¿Techo sin goteras y con drenaje pluvial?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_24', pregunta: '8.24 ¿Paredes sin grietas ni deterioro?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_25', pregunta: '8.25 ¿Piso nivelado, sin grietas ni humedad?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_26', pregunta: '8.26 ¿Pintura general en buen estado?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_27', pregunta: '8.27 ¿Áreas de circulación libres de obstáculos?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_8_28', pregunta: '8.28 ¿Demarcación de pisos visible y en buen estado?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'in_obs', pregunta: 'Observaciones en campo - Instalaciones', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_eq_prot',
        titulo: 'Equipos de Protección Colectiva',
        items: [
          { id: 'ep_9_1', pregunta: '9.1 ¿Existe ducha o fuente lavaojos de emergencia?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ep_9_2', pregunta: '9.2 ¿Ducha/Lavaojos completa y en buen estado?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ep_9_3', pregunta: '9.3 ¿Presión de agua suficiente en ducha/lavaojos?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ep_9_4', pregunta: '9.4 ¿Botiquín visible, señalizado y adherido a pared?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ep_9_5', pregunta: '9.5 ¿Contenido del botiquín completo según norma?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ep_9_6', pregunta: '9.6 ¿Kit para control de derrames ácidos disponible?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ep_obs', pregunta: 'Observaciones en campo - Equipos Prot C', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_uniforme',
        titulo: 'Uniforme y Equipo de Protección Personal',
        items: [
          { id: 'up_10_1', pregunta: '10.1 ¿Uso adecuado del uniforme por trabajadores?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'up_10_2', pregunta: '10.2 ¿Uniformes en buen estado?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'up_10_3', pregunta: '10.3 ¿Uso correcto de EPP (lentes, guantes, botas)?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'up_obs', pregunta: 'Observaciones en campo - Uniforme y EPP', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_cartelera',
        titulo: 'Cartelera de Seguridad, Salud y Ambiente',
        items: [
          { id: 'ca_11_1', pregunta: '11.1 ¿Política de SSL disponible y actualizada?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ca_11_2', pregunta: '11.2 ¿FDS (Hoja de Seguridad) de Baterías visible en almacén?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ca_11_3', pregunta: '11.3 ¿Plan de Emergencia cumple COVENIN 823-2?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ca_11_4', pregunta: '11.4 ¿Permiso de Bomberos publicado en cartelera?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ca_11_5', pregunta: '11.5 ¿Permiso de Bomberos vigente?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ca_11_6', pregunta: '11.6 ¿Índices de accidentabilidad actualizados?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ca_11_7', pregunta: '11.7 ¿Índices de morbilidad actualizados?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ca_11_8', pregunta: '11.8 ¿Mapa de riesgos publicado y visible?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ca_obs', pregunta: 'Observaciones en campo - Cartelera SSA', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_gestion',
        titulo: 'Gestión de Seguridad, Salud y Ambiente',
        items: [
          { id: 'gs_12_1', pregunta: '12.1 ¿Mantenimiento semestral sistema contra incendios?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'gs_12_2', pregunta: '12.2 ¿Inspección de extintores (Semestral)?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'gs_12_3', pregunta: '12.3 ¿Inspección mensual de Orden y Limpieza?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'gs_12_4', pregunta: '12.4 ¿Inspección mensual de herramientas?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'gs_12_5', pregunta: '12.5 ¿Inspección trimestral detección de incendios?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'gs_12_6', pregunta: '12.6 ¿Inspección mensual luces de emergencia?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'gs_12_7', pregunta: '12.7 ¿Inspección mensual Kit de derrames?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'gs_12_8', pregunta: '12.8 ¿Inspección mensual fuente lavaojos?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'gs_12_9', pregunta: '12.9 ¿Registro de Delegados de Prevención vigente?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'gs_12_10', pregunta: '12.10 ¿Registro de CSSL vigente?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'gs_12_11', pregunta: '12.11 ¿Reuniones mensuales del CSSL realizadas?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'gs_12_12', pregunta: '12.12 ¿Minutas del CSSL transcritas al Libro de Actas?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'gs_12_13', pregunta: '12.13 ¿Minutas consignadas mensualmente al INPSASEL?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'gs_12_14', pregunta: '12.14 ¿Informe Epidemiológico sellado por INPSASEL?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'gs_12_15', pregunta: '12.15 ¿Cumplimiento de 16 horas trimestrales de formación?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'gs_12_16', pregunta: '12.16 ¿Programa de SST registrado ante INPSASEL?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'gs_12_17', pregunta: '12.17 ¿Servicio de SST registrado y actualizado?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'gs_12_18', pregunta: '12.18 ¿RACDA actualizado para la localidad?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'gs_12_19', pregunta: '12.19 ¿Póliza de Daños Ambientales consignada (anual)?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'gs_12_20', pregunta: '12.20 ¿Informe Anual de Almacenamiento consignado?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'gs_obs', pregunta: 'Observaciones en campo - Gestión SSA', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_expedientes',
        titulo: 'Expedientes de los Colaboradores',
        items: [
          { id: 'ec_13_1', pregunta: '13.1 ¿Exámenes médicos (Pre, Post, Vacacional) vigentes?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ec_13_2', pregunta: '13.2 ¿Hojas de Ruta de Trabajo en expedientes?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ec_13_3', pregunta: '13.3 ¿Descripción de Cargo en expedientes?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ec_13_4', pregunta: '13.4 ¿Constancia de entrega de EPP en expedientes?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ec_13_5', pregunta: '13.5 ¿Notificación de Riesgos (Principios de Prevención)?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ec_13_6', pregunta: '13.6 ¿Análisis de Riesgo de Tareas (ART) disponible?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ec_13_7', pregunta: '13.7 ¿Certificación MATPEL vigente en expedientes?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ec_13_8', pregunta: '13.8 ¿Política de SST firmada por trabajadores?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ec_13_9', pregunta: '13.9 ¿Política de Seguridad Vial firmada?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ec_13_10', pregunta: '13.10 ¿Notificación de cambios de condiciones realizada?', tipoRespuesta: 'C_NC_OM_NA' },
          { id: 'ec_obs', pregunta: 'Observaciones en campo - Expedientes', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_conclusiones',
        titulo: 'Conclusiones, Recomendaciones Generales',
        items: [
          { id: 'conclusiones', pregunta: 'Observaciones', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_firmas',
        titulo: 'Personal que realizó la Inspección',
        items: [
          { id: 'f_realizado', pregunta: 'Realizada por', tipoRespuesta: 'TEXT' },
          { id: 'f_revisado', pregunta: 'Revisado por', tipoRespuesta: 'TEXT' }
        ]
      }
    ]
  },
  {
    codigo: 'IDVTC',
    nombre: 'Inspección Diaria Vehículos de Transporte de Cargas',
    frecuencia: 'Diaria',
    categoria: 'Vehículos',
    secciones: [
      {
        id: 'i_datos_vehiculo',
        titulo: 'Información y Datos del Vehículo de Transporte de Cargas',
        items: [
          { id: 'i_dv_marca', pregunta: 'Marca', tipoRespuesta: 'TEXT' },
          { id: 'i_dv_modelo', pregunta: 'Modelo', tipoRespuesta: 'TEXT' },
          { id: 'i_dv_ano', pregunta: 'Año', tipoRespuesta: 'NUMBER' },
          { id: 'i_dv_placa', pregunta: 'Placa', tipoRespuesta: 'TEXT' },
          { id: 'i_dv_capacidad', pregunta: 'Capacidad de Carga (Kg)', tipoRespuesta: 'NUMBER' },
          { id: 'i_dv_ruta', pregunta: 'Ruta', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 'i_datos_personal',
        titulo: 'Datos del Vendedor de Ruta y Auxiliar de Ruta',
        items: [
          { id: 'i_dp_tipo_vend', pregunta: 'Tipo de Vendedor de Ruta - Conductor', tipoRespuesta: 'TEXT' },
          { id: 'i_dp_motivo_vend', pregunta: 'En caso de no ser el Titular, indique motivo', tipoRespuesta: 'TEXT' },
          { id: 'i_dp_nombre_vend', pregunta: 'Nombre y Apellidos (Vendedor)', tipoRespuesta: 'TEXT' },
          { id: 'i_dp_ced_vend', pregunta: 'Cédula (Vendedor)', tipoRespuesta: 'TEXT' },
          { id: 'i_dp_tipo_aux', pregunta: 'Tipo de Auxiliar de Ruta', tipoRespuesta: 'TEXT' },
          { id: 'i_dp_motivo_aux', pregunta: 'En caso de no ser el Auxiliar Titular, indique motivo', tipoRespuesta: 'TEXT' },
          { id: 'i_dp_nombre_aux', pregunta: 'Nombre y Apellidos (Auxiliar)', tipoRespuesta: 'TEXT' },
          { id: 'i_dp_ced_aux', pregunta: 'Cédula (Auxiliar)', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 'i_cauchos',
        titulo: 'Cauchos del vehículo',
        items: [
          { id: 'c_di', pregunta: 'Direccional Izquierdo (*)', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'c_dd', pregunta: 'Direccional Derecho (*)', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'c_tii', pregunta: 'Trasero interno Izquierdo (*)', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'c_tei', pregunta: 'Trasero externo Izquierdo (*)', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'c_tid', pregunta: 'Trasero interno Derecho (*)', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'c_ted', pregunta: 'Trasero externo Derecho (*)', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'c_r', pregunta: 'Repuesto (*)', tipoRespuesta: 'BUENO_MALO_NA' }
        ]
      },
      {
        id: 'i_equipos',
        titulo: 'Equipos de seguridad y prevención',
        items: [
          { id: 'e_cinturon', pregunta: 'Cinturón de Seguridad (*)', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'e_extintor', pregunta: 'Extintor P.Q.S (*)', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'e_triangulo', pregunta: 'Triángulo de emergencia / Conos (*)', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'e_herramientas', pregunta: 'Herramientas (gato, llave de cruz, etc.)', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'e_kit_ojos', pregunta: 'Kit de lavado de ojos', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'e_kit_foraneos', pregunta: 'Kit de emergencia foráneos', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'e_kit_derrames', pregunta: 'Kit para atención de derrames (*)', tipoRespuesta: 'BUENO_MALO_NA' }
        ]
      },
      {
        id: 'i_luces',
        titulo: 'Luces',
        items: [
          { id: 'l_bajas', pregunta: 'Bajas', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'l_altas', pregunta: 'Altas', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'l_id', pregunta: 'Intermitentes delanteras', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'l_it', pregunta: 'Intermitentes Traseras', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'l_cdd', pregunta: 'Cruce derecha delantera', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'l_cid', pregunta: 'Cruce Izquierda delantera', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'l_ccd', pregunta: 'Cocuyos cava delanteros', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'l_ts', pregunta: 'Traseras Stop', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'l_retro', pregunta: 'Retroceso', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'l_cdt', pregunta: 'Cruce derecha trasera', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'l_cit', pregunta: 'Cruce Izquierda trasera', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'l_cct', pregunta: 'Cocuyos Cava Traseros', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'l_ih', pregunta: 'Interna Habitáculo', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'l_if', pregunta: 'Interna furgón o cabina', tipoRespuesta: 'BUENO_MALO_NA' }
        ]
      },
      {
        id: 'i_parachoques',
        titulo: 'Parachoques',
        items: [
          { id: 'p_d', pregunta: 'Delantero', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'p_t', pregunta: 'Trasero', tipoRespuesta: 'BUENO_MALO_NA' }
        ]
      },
      {
        id: 'i_parabrisas',
        titulo: 'Parabrisas',
        items: [
          { id: 'pb_lp', pregunta: 'Limpia parabrisas', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'pb_ec', pregunta: 'Estado del Cristal (*)', tipoRespuesta: 'BUENO_MALO_NA' }
        ]
      },
      {
        id: 'i_espejos',
        titulo: 'Espejos (retrovisores)',
        items: [
          { id: 'esp_d', pregunta: 'Derecho', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'esp_i', pregunta: 'Izquierdo', tipoRespuesta: 'BUENO_MALO_NA' }
        ]
      },
      {
        id: 'i_frenos',
        titulo: 'Frenos',
        items: [
          { id: 'f_mano', pregunta: 'Freno de Mano o auxiliar', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'f_gen', pregunta: 'Frenos en General (*)', tipoRespuesta: 'BUENO_MALO_NA' }
        ]
      },
      {
        id: 'i_est_int',
        titulo: 'Estructura interna de cabina',
        items: [
          { id: 'ei_ac', pregunta: 'Aire acondicionado', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'ei_asi', pregunta: 'Asientos', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'ei_pal', pregunta: 'Palanca de cambios (*)', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'ei_pf', pregunta: 'Pedal de freno (*)', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'ei_pa', pregunta: 'Pedal de acelerador (*)', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'ei_pe', pregunta: 'Pedal de embrague (*)', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'ei_cor', pregunta: 'Corneta/Bocina', tipoRespuesta: 'BUENO_MALO_NA' }
        ]
      },
      {
        id: 'i_est_ext',
        titulo: 'Estructura externa',
        items: [
          { id: 'ee_bp', pregunta: 'Barandas de Protección', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'ee_esl', pregunta: 'Eslingas de sujeción de mercancía', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'ee_plat', pregunta: 'Plataforma', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'ee_efe', pregunta: 'Estructura del furgón externo', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'ee_efi', pregunta: 'Estructura del furgón interno', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'ee_salp', pregunta: 'Salpicaderas o Chapaletas', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'ee_sra', pregunta: 'Sistema de recolección de ácido', tipoRespuesta: 'BUENO_MALO_NA' }
        ]
      },
      {
        id: 'i_medidores',
        titulo: 'Medidores de tablero internos',
        items: [
          { id: 'md_comb', pregunta: 'Medidor de combustible', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'md_kilo', pregunta: 'Contador de kilometraje', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'md_temp', pregunta: 'Medidor de temperatura', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'md_pres', pregunta: 'Medidor de presión de aire', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'md_aceite', pregunta: 'Medidor de presión de aceite', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'md_rpm', pregunta: 'Medidor de RPM', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'md_vel', pregunta: 'Medidor de Velocidad', tipoRespuesta: 'BUENO_MALO_NA' }
        ]
      },
      {
        id: 'i_fluidos',
        titulo: 'Fluidos del vehículo',
        items: [
          { id: 'fl_mot', pregunta: 'Nivel de aceite motor (*)', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'fl_rad', pregunta: 'Nivel de agua tanque radiador (*)', tipoRespuesta: 'BUENO_MALO_NA' }
        ]
      },
      {
        id: 'i_senal',
        titulo: 'Señalizaciones de la Unidad',
        items: [
          { id: 'sn_onu', pregunta: 'Número ONU (2794) en los cuatro costados. (*)', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'sn_racda', pregunta: 'N° R.A.C.D.A. Actual en los laterales', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'sn_nfpa', pregunta: 'Rombo NFPA y Rombo DOT N°8 (*)', tipoRespuesta: 'BUENO_MALO_NA' },
          { id: 'sn_placa', pregunta: 'Placa del Vehículo anterior y posterior (*)', tipoRespuesta: 'BUENO_MALO_NA' }
        ]
      },
      {
        id: 'i_peso',
        titulo: 'Inspección de peso de carga',
        items: [
          { id: 'pe_salida', pregunta: 'Carga de salida (kg)', tipoRespuesta: 'NUMBER' },
          { id: 'pe_ret_aptos', pregunta: 'Carga retorno (acumuladores aptos y devoluciones)', tipoRespuesta: 'NUMBER' },
          { id: 'pe_ret_inserv', pregunta: 'Carga retorno (acumuladores inservibles)', tipoRespuesta: 'NUMBER' }
        ]
      },
      {
        id: 'i_documentos',
        titulo: 'Documentos Requeridos en el Vehículo',
        items: [
          { id: 'dc_curso_mat', pregunta: 'Curso como Manejador de Materiales Peligrosos', tipoRespuesta: 'EXISTE_NO_DESACTUALIZADO' },
          { id: 'dc_curso_man', pregunta: 'Curso de Manejo defensivo', tipoRespuesta: 'EXISTE_NO_DESACTUALIZADO' },
          { id: 'dc_fds', pregunta: 'Hoja de seguridad de materiales (FDS)', tipoRespuesta: 'EXISTE_NO_DESACTUALIZADO' },
          { id: 'dc_pol_resp', pregunta: 'Póliza de Responsabilidad Civil', tipoRespuesta: 'EXISTE_NO_DESACTUALIZADO' },
          { id: 'dc_pol_seg', pregunta: 'Póliza de Seguros vigente (daño ambiental)', tipoRespuesta: 'EXISTE_NO_DESACTUALIZADO' },
          { id: 'dc_sencamer', pregunta: 'Registro de SENCAMER vigente', tipoRespuesta: 'EXISTE_NO_DESACTUALIZADO' },
          { id: 'dc_norma', pregunta: 'Norma de Disposición de Desechos', tipoRespuesta: 'EXISTE_NO_DESACTUALIZADO' },
          { id: 'dc_racda', pregunta: 'Registro R.A.C.D.A actualizado', tipoRespuesta: 'EXISTE_NO_DESACTUALIZADO' },
          { id: 'dc_plan', pregunta: 'Plan de Emergencia y Contingencia', tipoRespuesta: 'EXISTE_NO_DESACTUALIZADO' },
          { id: 'dc_rot', pregunta: 'Registro R.O.T vigente', tipoRespuesta: 'EXISTE_NO_DESACTUALIZADO' },
          { id: 'dc_vial', pregunta: 'Política de Prevención y Seguridad Vial', tipoRespuesta: 'EXISTE_NO_DESACTUALIZADO' },
          { id: 'dc_personales', pregunta: 'Documentos Personales (carnet, licencia, etc.)', tipoRespuesta: 'EXISTE_NO_DESACTUALIZADO' }
        ]
      },
      {
        id: 's_observaciones',
        titulo: 'Observaciones',
        items: [
          { id: 'obs_final', pregunta: 'Observaciones generales', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_firmas',
        titulo: 'Personal que realizó la Inspección',
        items: [
          { id: 'f_realizado', pregunta: 'Realizada por', tipoRespuesta: 'TEXT' },
          { id: 'f_revisado', pregunta: 'Revisado por', tipoRespuesta: 'TEXT' }
        ]
      }
    ]
  },
  {
    codigo: 'KCD',
    nombre: 'Inspección de Kit para Control de Derrames',
    frecuencia: 'Mensual',
    categoria: 'Seguridad',
    secciones: [
      {
        id: 's_info',
        titulo: 'Datos de la Inspección',
        items: [
          { id: 'i_ultima_insp', pregunta: 'Última fecha de Inspección', tipoRespuesta: 'DATE' }
        ]
      },
      {
        id: 's_elem',
        titulo: 'Disponibilidad y Buen Estado de los Implementos',
        items: [
          { id: 'kcd_bolsas', pregunta: 'Bolsas plásticas', tipoRespuesta: 'SI_NO' },
          { id: 'kcd_cepillo', pregunta: 'Cepillo para barrer', tipoRespuesta: 'SI_NO' },
          { id: 'kcd_cinta', pregunta: 'Cinta de seguridad', tipoRespuesta: 'SI_NO' },
          { id: 'kcd_cond', pregunta: 'Condiciones del contenedor (plástico o aéreo)', tipoRespuesta: 'SI_NO' },
          { id: 'kcd_guantes', pregunta: 'Guantes', tipoRespuesta: 'SI_NO' },
          { id: 'kcd_lentes', pregunta: 'Lentes', tipoRespuesta: 'SI_NO' },
          { id: 'kcd_masc', pregunta: 'Mascarillas', tipoRespuesta: 'SI_NO' },
          { id: 'kcd_cal', pregunta: 'Material neutralizante (CAL)', tipoRespuesta: 'SI_NO' },
          { id: 'kcd_pala', pregunta: 'Pala', tipoRespuesta: 'SI_NO' },
          { id: 'kcd_acc', pregunta: '¿El kit se encuentra libre de obstáculos y de fácil acceso?', tipoRespuesta: 'SI_NO' }
        ]
      },
      {
        id: 's_obs',
        titulo: 'Observaciones',
        items: [
          { id: 'o_observaciones', pregunta: 'Observaciones', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_firmas',
        titulo: 'Personal que realizó la Inspección',
        items: [
          { id: 'f_realizado', pregunta: 'Realizada por', tipoRespuesta: 'TEXT' },
          { id: 'f_revisado', pregunta: 'Revisado por', tipoRespuesta: 'TEXT' }
        ]
      }
    ]
  },
  {
    codigo: 'ILE',
    nombre: 'Inspección de Lámpara de Emergencia',
    frecuencia: 'Trimestral', // Or wherever it fits
    categoria: 'Seguridad',
    secciones: [
      {
        id: 's_info',
        titulo: 'Datos de la Inspección',
        items: [
          { id: 'i_ultima_insp', pregunta: 'Última fecha de Inspección', tipoRespuesta: 'DATE' }
        ]
      },
      {
        id: 's_lamp1',
        titulo: 'Inspección de Lámpara de Emergencia N° 1',
        items: [
          { id: 'l1_ubi', pregunta: 'Ubicación', tipoRespuesta: 'TEXT' },
          { id: 'l1_est', pregunta: 'Estado físico de lámpara N° 1', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'l1_ind_fn', pregunta: 'Indicador Función Normal activo de lámpara N° 1', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'l1_ind_av', pregunta: 'Indicador de avería de lámpara N° 1', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'l1_bot', pregunta: 'Botón de prueba lámpara N° 1', tipoRespuesta: 'BUENO_DANADO_NA' }
        ]
      },
      {
        id: 's_lamp2',
        titulo: 'Inspección de Lámpara de Emergencia N° 2',
        items: [
          { id: 'l2_ubi', pregunta: 'Ubicación', tipoRespuesta: 'TEXT' },
          { id: 'l2_est', pregunta: 'Estado físico de lámpara N° 2', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'l2_ind_fn', pregunta: 'Indicador Función Normal activo de lámpara N° 2', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'l2_ind_av', pregunta: 'Indicador de avería de lámpara N° 2', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'l2_bot', pregunta: 'Botón de prueba lámpara N° 2', tipoRespuesta: 'BUENO_DANADO_NA' }
        ]
      },
      {
        id: 's_lamp3',
        titulo: 'Inspección de Lámpara de Emergencia N° 3',
        items: [
          { id: 'l3_ubi', pregunta: 'Ubicación', tipoRespuesta: 'TEXT' },
          { id: 'l3_est', pregunta: 'Estado físico de lámpara N° 3', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'l3_ind_fn', pregunta: 'Indicador Función Normal activo de lámpara N° 3', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'l3_ind_av', pregunta: 'Indicador de avería de lámpara N° 3', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'l3_bot', pregunta: 'Botón de prueba lámpara N° 3', tipoRespuesta: 'BUENO_DANADO_NA' }
        ]
      },
      {
        id: 's_lamp4',
        titulo: 'Inspección de Lámpara de Emergencia N° 4',
        items: [
          { id: 'l4_ubi', pregunta: 'Ubicación', tipoRespuesta: 'TEXT' },
          { id: 'l4_est', pregunta: 'Estado físico de lámpara N° 4', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'l4_ind_fn', pregunta: 'Indicador Función Normal activo de lámpara N° 4', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'l4_ind_av', pregunta: 'Indicador de avería de lámpara N° 4', tipoRespuesta: 'BUENO_DANADO_NA' },
          { id: 'l4_bot', pregunta: 'Botón de prueba lámpara N° 4', tipoRespuesta: 'BUENO_DANADO_NA' }
        ]
      },
      {
        id: 's_obs',
        titulo: 'Observaciones',
        items: [
          { id: 'o_observaciones', pregunta: 'Observaciones', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_firmas',
        titulo: 'Personal que realizó la Inspección',
        items: [
          { id: 'f_realizado', pregunta: 'Realizada por', tipoRespuesta: 'TEXT' },
          { id: 'f_revisado', pregunta: 'Revisado por', tipoRespuesta: 'TEXT' }
        ]
      }
    ]
  },
  {
    codigo: 'IMC',
    nombre: 'Inspección de Montacargas SSA',
    frecuencia: 'Mensual',
    categoria: 'Maquinaria',
    secciones: [
      {
        id: 'i_datos_montacargas',
        titulo: 'Información y Datos del Montacargas',
        items: [
          { id: 'm_ubicacion', pregunta: 'Ubicación', tipoRespuesta: 'TEXT' },
          { id: 'm_equipo_num', pregunta: 'Equipo Número', tipoRespuesta: 'TEXT' },
          { id: 'm_marca', pregunta: 'Marca', tipoRespuesta: 'TEXT' },
          { id: 'm_modelo', pregunta: 'Modelo', tipoRespuesta: 'TEXT' },
          { id: 'm_serial', pregunta: 'Serial Número', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 'i_parte1',
        titulo: 'PARTE I: Identificación y Documentación (Administrativo)',
        items: [
          { id: 'p1_placa', pregunta: 'Placa y Tabla de Capacidad', tipoRespuesta: 'SI_NO_NA' },
          { id: 'p1_cert', pregunta: 'Certificado de Operación', tipoRespuesta: 'SI_NO_NA' },
          { id: 'p1_libro', pregunta: 'Libro de Vida', tipoRespuesta: 'SI_NO_NA' }
        ]
      },
      {
        id: 'i_parte2',
        titulo: 'PARTE II: Seguridad Pasiva y Ergonomía',
        items: [
          { id: 'p2_techo', pregunta: 'Techo Protector', tipoRespuesta: 'SI_NO_NA' },
          { id: 'p2_asiento', pregunta: 'Asiento y Cinturón', tipoRespuesta: 'SI_NO_NA' },
          { id: 'p2_extintor', pregunta: 'Extintor portátil', tipoRespuesta: 'SI_NO_NA' }
        ]
      },
      {
        id: 'i_parte3',
        titulo: 'PARTE III: Dispositivos de Seguridad (Seguridad Activa)',
        items: [
          { id: 'p3_alarma', pregunta: 'Alarma de Retroceso', tipoRespuesta: 'SI_NO_NA' },
          { id: 'p3_luces', pregunta: 'Luces de Advertencia', tipoRespuesta: 'SI_NO_NA' },
          { id: 'p3_bocina', pregunta: 'Bocina (Corneta)', tipoRespuesta: 'SI_NO_NA' }
        ]
      },
      {
        id: 'i_parte4',
        titulo: 'PARTE IV: Sistema de Carga (Criterios Críticos)',
        items: [
          { id: 'p4_horquillas', pregunta: 'Horquillas (Uñas)', tipoRespuesta: 'SI_NO_NA' },
          { id: 'p4_alineacion', pregunta: 'Alineación de Horquillas', tipoRespuesta: 'SI_NO_NA' },
          { id: 'p4_cadenas', pregunta: 'Cadenas de Elevación', tipoRespuesta: 'SI_NO_NA' },
          { id: 'p4_mangueras', pregunta: 'Mangueras Hidráulicas', tipoRespuesta: 'SI_NO_NA' }
        ]
      },
      {
        id: 'i_parte5',
        titulo: 'PARTE V: Controles, Desplazamiento y Neumáticos',
        items: [
          { id: 'p5_frenos', pregunta: 'Frenos', tipoRespuesta: 'SI_NO_NA' },
          { id: 'p5_direccion', pregunta: 'Dirección', tipoRespuesta: 'SI_NO_NA' },
          { id: 'p5_cauchos', pregunta: 'Cauchos', tipoRespuesta: 'SI_NO_NA' }
        ]
      },
      {
        id: 'i_parte6',
        titulo: 'PARTE VI: Sistema de Escape y Control Cualitativo de Emisiones',
        items: [
          { id: 'p6_integridad', pregunta: 'Integridad y Diseño del Escape', tipoRespuesta: 'SI_NO_NA' },
          { id: 'p6_aislamiento', pregunta: 'Aislamiento Térmico', tipoRespuesta: 'SI_NO_NA' },
          { id: 'p6_emisiones', pregunta: 'Emisiones de Escape', tipoRespuesta: 'SI_NO_NA' }
        ]
      },
      {
        id: 'i_observaciones',
        titulo: 'Observaciones en campo e Hallazgos',
        items: [
          { id: 'o_observaciones', pregunta: 'Observaciones en campo', tipoRespuesta: 'TEXT' },
          { id: 'o_hallazgos', pregunta: 'Hallazgos y/o Recomendaciones', tipoRespuesta: 'TEXT' }
        ]
      },
      {
        id: 's_firmas',
        titulo: 'Personal que realizó la Inspección',
        items: [
          { id: 'f_realizado', pregunta: 'Realizada por', tipoRespuesta: 'TEXT' },
          { id: 'f_revisado', pregunta: 'Revisado por', tipoRespuesta: 'TEXT' }
        ]
      }
    ]
  }
];
