# Control Horario - MVP (Sprint 0)

Sistema de control de asistencia y registro de jornadas laborales con geolocalización, clima y estadísticas en tiempo real. Este proyecto es parte del entregable para el **Sprint 0: Antigravity + Supabase MVP**.

## Sprint Goal
> "En 3 días entregaremos un MVP funcional con login y registro de jornada persistido en Supabase mediante MCP usando Antigravity."

---

## Tabla de Contenidos
1. [Características](#características)
2. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
3. [Estructura de Archivos](#estructura-de-archivos)
4. [Instalación y Uso](#instalación-y-uso)
5. [Tecnologías Usadas](#tecnologías-usadas)
6. [Verificación del Sprint (Definition of Done)](#verificación-del-sprint-definition-of-done)

---

## Características
* **Autenticación Segura:** Registro e Inicio de sesión gestionado con Supabase Auth.
* **Control de Jornada:** Botones funcionales para Iniciar, Pausar y Finalizar jornada.
* **Persistencia de Datos:**
    * Las jornadas se guardan en la tabla `jornadas` de Supabase.
    * Las pausas se registran en la tabla `pausas` (relación 1:N).
    * El estado se mantiene aunque se recargue la página.
* **Dashboard Interactivo:**
    * Widget de clima en tiempo real (OpenWeatherMap API).
    * Estadísticas mensuales (Horas trabajadas, promedio diario).
    * Historial de registros recientes.

---

## Arquitectura del Proyecto
El sistema sigue una arquitectura **Frontend Monolítico (SPA)** conectado a un **Backend as a Service (BaaS)**.

* **Frontend:** HTML5, CSS3 y Vanilla JavaScript (sin frameworks).
* **Backend & Base de Datos:** Supabase (PostgreSQL).
* **Integración:** Cliente de Supabase JS (`@supabase/supabase-js`) para la comunicación directa desde el navegador.

---

## Estructura de Archivos

| Archivo | Descripción |
| :--- | :--- |
| `index.html` | Pantalla de Login y Registro. Maneja la autenticación inicial. |
| `dashboard.html` | Panel principal. Contiene el cronómetro, botones de control y widgets. |
| `app.js` | **Lógica Core:** Maneja el cronómetro, lógica de pausar/reanudar y renderizado del historial. |
| `styles.css` | Estilos globales, diseño responsivo y tema visual (paleta azul/celeste). |
| `supabase-client.js` | Inicialización del cliente de Supabase (URL + Anon Key). |
| `services/` | Carpeta con módulos de lógica separada: |
| ├── `weather-service.js` | Conexión con API de OpenWeatherMap. |
| ├── `stats-service.js` | Cálculo de estadísticas (horas totales, promedios) desde Supabase. |
| └── `ui-feedback.js` | Sistema de notificaciones (Toasts) y alertas visuales. |

---

## Instalación y Uso

1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/aguilarsantiago406/capacitacion-prueba1.git](https://github.com/aguilarsantiago406/capacitacion-prueba1.git)
    ```
2.  **Configurar Variables:**
    * Asegúrate de tener el archivo `config.js` o las credenciales en `supabase-client.js`.
3.  **Ejecutar:**
    * No requiere `npm install` (usa CDN).
    * Abrir con **Live Server** (Extensión de VS Code) para evitar errores de CORS.
4.  **Credenciales de Prueba:**
    * Puedes registrar un usuario nuevo en la pantalla de inicio.

---

## Tecnologías Usadas
* ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
* ![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
* ![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
* ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
* ![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white)

---

## Verificación del Sprint (Definition of Done)

### Funcionalidades Mínimas
- [x] **Autenticación:** Signup + Login funcionando con Supabase.
- [x] **Registro de Jornada:** Se puede Iniciar, Pausar y Finalizar.
- [x] **Historial:** Listado de registros visible en el Dashboard.
- [x] **Persistencia:** Los datos se guardan en Supabase (Tablas `jornadas` y `pausas`).

### Calidad de Código y Git
- [x] **Funciona sin errores:** Probado en Chrome y Edge.
- [x] **Integración:** Código en `main` mediante Pull Requests.
- [x] **Debugging:** Se solucionó el bug de visualización del botón "Pausar" (Commit: `fix: correccion de visibilidad`).
- [x] **Documentación:** Este README explica arquitectura y uso.
