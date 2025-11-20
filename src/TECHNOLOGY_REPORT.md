# Exposición del Proyecto: Guardián CiudadSegura

Este documento detalla las características, capacidades y arquitectura del sistema Guardián CiudadSegura, una plataforma inteligente para la seguridad comunitaria.

---

### **Sección 1: Sistema Inteligente de Reporte y Análisis de Incidentes**

Guardián CiudadSegura permite a cualquier miembro de la comunidad convertirse en un vigilante activo. La plataforma está diseñada para capturar y comprender la información de los ciudadanos de manera eficiente.

**Características Actuales:**
*   **Reporte Simplificado:** Los usuarios pueden enviar reportes de incidentes a través de un formulario intuitivo, describiendo la situación y seleccionando la ubicación exacta de una lista estandarizada de zonas de la ciudad.
*   **Análisis por IA (Agente Inteligente):** Aquí reside el primer pilar de su inteligencia. El sistema no solo almacena el reporte; lo **analiza activamente** usando un modelo de lenguaje avanzado (Google Gemini) a través de un flujo de Genkit (`analyzeCitizenReport`). Este agente **percibe** el texto del usuario, **comprende** el contexto semántico y **actúa** realizando tres tareas clave:
    1.  **Clasificación del Incidente:** Determina el tipo de evento (ej. Robo, Vandalismo, Ataque de Animal).
    2.  **Evaluación de Riesgo:** Asigna un nivel de riesgo (Bajo, Medio, Alto) basándose en la gravedad inferida del texto.
    3.  **Resumen Anonimizado:** Genera una descripción concisa y neutral del incidente, eliminando información personal sensible.

**Limitaciones y Mejoras Futuras:**
*   **Soporte Multimedia:** Actualmente, el análisis de IA se basa únicamente en texto. Una mejora crucial sería permitir a los usuarios adjuntar **fotos, audio o videos** a sus reportes, y que el agente de IA los analice para una evaluación de riesgo mucho más precisa.
*   **Validación de Ubicación:** Aunque se usa una lista, el sistema podría integrarse con un mapa interactivo para que los usuarios coloquen un marcador, proporcionando coordenadas GPS exactas.

---

### **Sección 2: Comunidad Interactiva y Sistema de Reputación Dinámica**

La plataforma fomenta la colaboración y la veracidad a través de un sistema de validación comunitaria.

**Características Actuales:**
*   **Validación Comunitaria:** Los usuarios pueden **confirmar** o **disputar** los reportes enviados por otros. Esta acción colectiva es fundamental para el funcionamiento del sistema.
*   **Actualización Automática de Estatus:** Cuando un reporte alcanza un umbral de votos (ej. 3 confirmaciones o 3 disputas), su estatus cambia automáticamente a "Confirmado" o "Disputado". El sistema **reacciona** a las acciones de la comunidad de forma autónoma.
*   **Sistema de Reputación:** Cada usuario posee un puntaje de reputación que se ve afectado por la validación de sus reportes.
    *   Un reporte **confirmado** por la comunidad o un administrador aumenta la reputación del autor.
    *   Un reporte **disputado** o marcado como **falso** disminuye su reputación.
    Esto convierte al sistema en un **agente de aprendizaje por refuerzo**, incentivando reportes veraces y penalizando los falsos.

**Limitaciones y Mejoras Futuras:**
*   **Reputación Simplista:** El puntaje actual es un simple número. Podría evolucionar a un sistema más complejo que considere la antigüedad del usuario, la frecuencia de sus reportes y la precisión histórica de los mismos.
*   **Prevención de Abuso:** Faltan mecanismos para prevenir que grupos de usuarios se coordinen para confirmar o disputar reportes de manera malintencionada (voto en bloque).

---

### **Sección 3: Alertas en Tiempo Real y Notificaciones Inteligentes**

Esta es la característica más proactiva del sistema, donde actúa como un verdadero guardián digital.

**Características Actuales:**
*   **Roles Diferenciados:** El sistema reconoce tres roles: `user`, `admin` y `security` (para serenazgo y policía).
*   **Sistema de Suscripción Geográfica:** Los usuarios pueden suscribirse a notificaciones de su vecindario específico a través de los ajustes de su perfil.
*   **Agente de Alertas Inteligentes:** Cuando se registra un nuevo incidente de riesgo **Medio** o **Alto**, el sistema se activa como un agente de alertas:
    1.  **Identifica al Público Objetivo:** Determina quién debe ser notificado.
    2.  **Notificación a Fuerzas de Seguridad:** Envía una alerta inmediata y detallada a **todos** los usuarios con rol `security`.
    3.  **Notificación a Vecinos:** Envía una alerta a los usuarios que se han suscrito al vecindario donde ocurrió el incidente.
    Este proceso es completamente autónomo y demuestra la capacidad del agente para **actuar proactivamente** en base a nuevas percepciones (un nuevo reporte de alto riesgo).

**Limitaciones y Mejoras Futuras:**
*   **Canales de Notificación:** Actualmente, las alertas son solo notificaciones dentro de la aplicación. Podrían expandirse para enviar SMS, correos electrónicos o integrarse con aplicaciones de mensajería para mayor alcance.
*   **Notificaciones Genéricas:** Para garantizar la estabilidad, los mensajes de las notificaciones son predefinidos. Anteriormente, se usaba IA para generarlos, una característica que se podría reintroducir de forma más robusta.

---

### **Sección 4: Herramientas de Análisis y Administración Centralizada**

La plataforma proporciona a los administradores un control total sobre el contenido y el acceso a análisis de alto nivel.

**Características Actuales:**
*   **Dashboard Central:** Ofrece una vista general de las métricas clave: alertas activas, reportes diarios y zonas de riesgo.
*   **Gestión de Incidentes:** Los administradores tienen privilegios elevados para:
    *   **Editar** cualquier detalle de un reporte (corregir tipo, riesgo, resumen).
    *   **Eliminar** reportes duplicados o inapropiados.
    *   **Verificar o desmentir** reportes directamente, lo que anula el sistema de votación comunitaria y ajusta la reputación del autor de forma inmediata.
*   **Análisis de Patrones (Agente Analista):** La sección "Patrones" utiliza un agente de IA (`detectCrimePatterns`) que analiza el histórico completo de incidentes para identificar "puntos calientes": zonas y horas donde ciertos tipos de delitos son más frecuentes. Esto se visualiza en un gráfico de barras, transformando datos brutos en inteligencia accionable.

**Limitaciones y Mejoras Futuras:**
*   **Visualizaciones Limitadas:** El análisis de patrones se muestra en un solo gráfico. Podría expandirse para incluir mapas de calor, líneas de tendencia temporal y filtros avanzados.
*   **Gestión de Usuarios:** Falta una interfaz para que los administradores gestionen los roles y la reputación de los usuarios directamente.

---

### **Sección 5: Planificación de Rutas Seguras (Agente Consejero)**

Esta funcionalidad demuestra la capacidad del sistema para usar la información sobre riesgos para guiar las decisiones de los usuarios en el mundo real.

**Características Actuales:**
*   **Planificador Inteligente:** Los usuarios pueden ingresar un punto de inicio, un destino y un modo de transporte (a pie o transporte público).
*   **Agente de Recomendación de Rutas:** El sistema invoca a un agente de IA (`recommendSafeRoutes`) que:
    1.  **Percibe** el contexto del viaje del usuario.
    2.  **Consulta** su base de conocimiento, que incluye el mapa de conectividad de la ciudad y datos sobre incidentes recientes.
    3.  **Delibera** y genera múltiples opciones de ruta, cada una con una descripción detallada y una evaluación de riesgos explícita.
    4.  Proporciona una **recomendación general** sobre la opción más segura.

**Limitaciones y Mejoras Futuras:**
*   **Datos Estáticos:** El agente actualmente usa un mapa de conectividad y datos de incidentes codificados estáticamente. Para ser verdaderamente dinámico, debería consultar la base de datos de Firestore en tiempo real para obtener los datos de incidentes más recientes al generar la recomendación.
*   **Integración de Mapas:** La ruta se describe con texto. La integración con una API de mapas (como Google Maps) para visualizar las rutas recomendadas sería una mejora transformadora.