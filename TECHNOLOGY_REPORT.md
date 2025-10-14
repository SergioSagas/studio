# Informe Tecnológico del Proyecto: Guardián CiudadSegura

Este documento proporciona un resumen detallado de las tecnologías, librerías y patrones de arquitectura utilizados en el desarrollo de la aplicación Guardián CiudadSegura.

## 1. Arquitectura General

La aplicación sigue una arquitectura moderna de **Jamstack** con un enfoque de renderizado híbrido gracias a **Next.js**. El frontend es una **Single-Page Application (SPA)** enriquecida que se comunica directamente con los servicios de **Firebase** para la persistencia de datos y la autenticación. La inteligencia artificial se integra a través de **Genkit**, ejecutándose en el servidor como "Server Actions" de Next.js.

---

## 2. Tecnologías del Frontend

El frontend está construido con un stack moderno basado en React y TypeScript, enfocado en la productividad del desarrollador y una experiencia de usuario de alta calidad.

- **Framework Principal:** **Next.js 15** (con App Router). Se utiliza para el enrutamiento basado en archivos, renderizado del lado del servidor (SSR), generación de sitios estáticos (SSG) y la creación de componentes de servidor y cliente.
- **Librería de UI:** **React 18**. Es la base para construir la interfaz de usuario declarativa y basada en componentes.
- **Lenguaje:** **TypeScript**. Aporta un sistema de tipos estático que mejora la robustez del código, la mantenibilidad y la experiencia de desarrollo.
- **Estilos:**
    - **Tailwind CSS:** Un framework de CSS "utility-first" para un estilizado rápido y consistente directamente en el markup.
    - **ShadCN UI:** Una colección de componentes de UI reutilizables, accesibles y estéticamente agradables, construidos sobre Radix UI y Tailwind CSS. Esto incluye componentes como `Button`, `Card`, `Dialog`, `Table`, `Select`, etc.
    - **Recharts:** Para la visualización de datos, utilizada específicamente en el gráfico de análisis de patrones de delincuencia.
- **Iconos:** **Lucide React**. Proporciona un conjunto de iconos SVG limpios y consistentes.
- **Gestión de Formularios:** **React Hook Form** junto con **Zod** para la validación de esquemas, garantizando que los datos de los formularios sean correctos antes de ser procesados.

---

## 3. Tecnologías del Backend y Base de Datos

El backend es "serverless" y se apoya completamente en el ecosistema de **Firebase**, lo que simplifica la gestión de la infraestructura.

- **Plataforma Backend:** **Firebase (BaaS - Backend as a Service)**.
    - **Base de Datos:** **Firestore**. Una base de datos NoSQL, escalable y en tiempo real, utilizada para almacenar los perfiles de usuario y los reportes de incidentes. Las actualizaciones se reflejan en la UI en tiempo real gracias a los hooks `useCollection` y `useDoc`.
    - **Autenticación:** **Firebase Authentication**. Gestiona el registro y la autenticación de usuarios por correo electrónico/contraseña y roles (usuario y administrador).
- **Reglas de Seguridad:** **Firestore Security Rules**. Se utilizan para definir las políticas de acceso a los datos, asegurando que solo los usuarios autorizados (como los administradores) puedan realizar ciertas acciones (ej. editar o eliminar incidentes).

---

## 4. Integración de Inteligencia Artificial (IA)

La IA es un pilar fundamental de la aplicación, utilizada para analizar datos y proporcionar información valiosa.

- **Framework de IA:** **Genkit**. Es el orquestador para definir y ejecutar flujos de inteligencia artificial.
- **Modelo de Lenguaje (LLM):** **Google Gemini (a través de Genkit)**. Utilizado para:
    - **Análisis de Reportes:** Clasificar el tipo de incidente y el nivel de riesgo a partir del texto proporcionado por el usuario.
    - **Recomendación de Rutas Seguras:** Procesar datos de incidentes y un mapa de conectividad de la ciudad para sugerir las rutas más seguras.
    - **Detección de Patrones:** Analizar el histórico de incidentes para identificar "zonas calientes" o patrones de delincuencia.
- **Ejecución:** Los flujos de Genkit se exponen como **Next.js Server Actions**, lo que permite que el cliente los llame de forma segura sin exponer las claves de API ni la lógica interna.

---

## 5. Hosting y Despliegue

- **Plataforma de Hosting:** **Firebase App Hosting**. La configuración en `apphosting.yaml` indica que la aplicación está preparada para ser desplegada en esta plataforma, que está optimizada para aplicaciones web con backends integrados.

---

## 6. Herramientas y Patrones Clave

- **Manejo de Estado:** Principalmente a través de hooks de React (`useState`, `useEffect`, `useMemo`, `useCallback`) y el estado de las acciones del servidor con `useActionState`.
- **Hooks Personalizados:** Se han creado hooks como `useUserRole` y `useIsMobile` para encapsular lógica y hacerla reutilizable.
- **Llamadas a la API:** Se utiliza el patrón de **Server Actions** de Next.js para las interacciones con la IA, proporcionando una forma segura y eficiente de ejecutar código del lado del servidor desde el cliente.
- **Comunicación con Firebase:** La interacción con Firestore se gestiona a través de los hooks personalizados `useCollection` y `useDoc`, que abstraen la complejidad de las suscripciones en tiempo real.