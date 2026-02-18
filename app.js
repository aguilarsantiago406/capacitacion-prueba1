// 📱 Aplicación Principal - Dashboard

// Control de Jornada Laboral - Dashboard
// Actividad 3: Con Weather API, UI Feedback, Estadísticas y Pausas (Sprint 0)

// Inicializar widget de clima (Actividad 3 - Día 2)
async function initWeather() {
    // NOTA: Para que funcione, debes obtener tu API key de OpenWeatherMap
    const apiKey = '6b9bd12dc4bc142c051fb0fa754f52c8'; // ← Tu API Key
    const city = 'Lima';

    const weatherWidget = document.getElementById('weather-widget');

    if (apiKey === 'YOUR_API_KEY_HERE') {
        weatherWidget.innerHTML = `
            <div style="color: var(--text-muted); font-size: 0.9rem;">
                <p>⚠️ API Key no configurada</p>
                <p style="font-size: 0.8rem;">Obtén tu key gratis en 
                <a href="https://openweathermap.org/" target="_blank" style="color: var(--primary);">OpenWeatherMap</a></p>
            </div>
        `;
        return;
    }

    if (!weatherService.init(apiKey)) {
        weatherWidget.innerHTML = '<p style="color: var(--text-muted);">Servicio de clima no disponible</p>';
        return;
    }

    try {
        weatherWidget.innerHTML = `
            <div class="loading-spinner small"></div>
            <p style="color: var(--text-muted); margin-left: 0.5rem;">Cargando clima...</p>
        `;

        const data = await weatherService.getCurrentWeather(city);
        const formatted = weatherService.formatWeatherData(data);

        weatherWidget.innerHTML = `
            <img src="${weatherService.getIconUrl(formatted.icon)}" alt="${formatted.description}">
            <div class="weather-info">
                <div class="weather-temp">${formatted.temperature}°C</div>
                <div class="weather-description">${formatted.description}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">
                    ${formatted.city}
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Weather error:', error);

        let errorMsg = 'No se pudo cargar el clima';
        if (error.message.includes('401')) {
            errorMsg = 'API Key inválida';
        } else if (error.message.includes('404')) {
            errorMsg = 'Ciudad no encontrada';
        }

        if (window.uiFeedback) uiFeedback.warning(errorMsg);
        weatherWidget.innerHTML = `
            <p style="color: var(--text-muted); font-size: 0.9rem;">❌ ${errorMsg}</p>
        `;
    }
}

// Inicializar estadísticas (Actividad 3 - Día 2)
async function loadStats() {
    const supabase = window.getSupabase();
    if (!supabase || !currentUser) return;

    const statsDashboard = document.getElementById('stats-dashboard');
    statsDashboard.innerHTML = '<div class="loading-spinner"></div>';

    try {
        statsService.init(supabase, currentUser.id);
        const stats = await statsService.getMonthlyStats();

        statsDashboard.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-label">Horas Totales</div>
                    <div class="stat-value">${stats.totalHours}h</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Días Trabajados</div>
                    <div class="stat-value">${stats.daysWorked}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Promedio/Día</div>
                    <div class="stat-value">${stats.avgHoursPerDay}h</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Jornadas Completadas</div>
                    <div class="stat-value">${stats.completedWorkdays}</div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading stats:', error);
        if (window.uiFeedback) uiFeedback.error('Error al cargar estadísticas');
        statsDashboard.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); padding: 2rem;">
                <p>❌ Error al cargar estadísticas</p>
                <p style="font-size: 0.8rem; margin-top: 0.5rem;">${error.message}</p>
            </div>
        `;
    }
}

// Variables globales
let currentUser = null;
let currentWorkday = null;
let currentPause = null; // NUEVO: Para controlar el estado de pausa
let clockInterval = null;

// Elementos del DOM
const userNameEl = document.getElementById('user-name');
const logoutBtn = document.getElementById('logout-btn');
const currentTimeEl = document.getElementById('current-time');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const endBtn = document.getElementById('end-btn');
const controlMessageEl = document.getElementById('control-message');
const historyListEl = document.getElementById('history-list');
const loadingHistoryEl = document.getElementById('loading-history');
const loadingEl = document.getElementById('loading');

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();

    // Inicializar nuevas features (Actividad 3)
    initWeather(); // Weather API
    loadStats();   // Estadísticas

    setupEventListeners();
    startClock();
    await loadCurrentWorkday();
    await loadHistory();
});

// Verificar autenticación
async function checkAuth() {
    const supabase = window.getSupabase();
    if (!supabase) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            // No hay sesión, redirigir a login
            window.location.href = 'index.html';
            return;
        }

        currentUser = session.user;
        const userName = currentUser.user_metadata?.full_name || currentUser.email;
        if (userNameEl) userNameEl.textContent = userName;

        console.log('✅ Usuario autenticado:', currentUser.email);

    } catch (error) {
        console.error('❌ Error al verificar autenticación:', error);
        window.location.href = 'index.html';
    }
}

// Configurar event listeners
function setupEventListeners() {
    logoutBtn?.addEventListener('click', handleLogout);
    startBtn?.addEventListener('click', handleStartWorkday);
    pauseBtn?.addEventListener('click', handlePauseWorkday);
    endBtn?.addEventListener('click', handleEndWorkday);
}

// Reloj en tiempo real
function startClock() {
    function updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        currentTimeEl.textContent = timeString;
    }

    updateClock();
    clockInterval = setInterval(updateClock, 1000);
}

// Cerrar sesión
async function handleLogout() {
    // 1. Preguntar antes de salir (Evita clics por error)
    const confirmacion = confirm("¿Estás seguro que deseas cerrar sesión?");
    if (!confirmacion) return; // Si dice "Cancelar", no hacemos nada

    const supabase = window.getSupabase();
    if (!supabase) return;

    try {
        await supabase.auth.signOut();
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        // Usamos el sistema de mensajes si existe, si no, alert
        if (window.uiFeedback) {
            uiFeedback.error('Error al cerrar sesión');
        } else {
            alert('Error al cerrar sesión');
        }
    }
}

// Cargar jornada actual (si existe)
async function loadCurrentWorkday() {
    const supabase = window.getSupabase();
    if (!supabase) return;

    try {
        // 1. Buscar jornada activa (que no tenga fecha_fin)
        const { data, error } = await supabase
            .from('jornadas')
            .select('*')
            .eq('user_id', currentUser.id)
            .is('fecha_fin', null)
            .order('fecha_inicio', { ascending: false })
            .limit(1);

        if (error) {
            if (error.message.includes('does not exist')) {
                console.warn('⚠️ La tabla jornadas no existe aún.');
                showControlMessage('info', 'Configura la base de datos en Supabase');
            } else {
                throw error;
            }
            return;
        }

        if (data && data.length > 0) {
            currentWorkday = data[0];

            // 2. NUEVO: Verificar si hay una pausa activa para esta jornada
            const { data: pauseData } = await supabase
                .from('pausas')
                .select('*')
                .eq('jornada_id', currentWorkday.id)
                .is('fin', null)
                .maybeSingle(); // Usamos maybeSingle para no lanzar error si no hay pausa

            currentPause = pauseData; // Si hay pausa, esto tendrá datos, si no, null
            updateUIForActiveWorkday();
        } else {
            currentWorkday = null;
            currentPause = null;
            updateUIForNoWorkday();
        }

    } catch (error) {
        console.error('Error al cargar jornada actual:', error);
    }
}

// Iniciar jornada
async function handleStartWorkday() {
    const supabase = window.getSupabase();
    if (!supabase) return;

    if (currentWorkday) {
        showMessage('warning', 'Ya tienes una jornada activa');
        return;
    }

    showLoading(true);

    try {
        const now = new Date().toISOString();

        const { data, error } = await supabase
            .from('jornadas')
            .insert([
                {
                    user_id: currentUser.id,
                    fecha_inicio: now,
                    estado: 'active'
                }
            ])
            .select()
            .single();

        if (error) throw error;

        currentWorkday = data;
        currentPause = null;
        updateUIForActiveWorkday();
        showMessage('success', '✅ Jornada iniciada');
        await loadHistory();

    } catch (error) {
        console.error('Error al iniciar jornada:', error);
        if (window.uiFeedback) uiFeedback.error('Error al iniciar jornada: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// NUEVO: Manejar Pausa / Reanudar
async function handlePauseWorkday() {
    const supabase = window.getSupabase();
    if (!supabase || !currentWorkday) return;

    showLoading(true);

    try {
        const now = new Date().toISOString();

        if (currentPause) {
            // --- CASO 1: YA ESTAMOS PAUSADOS -> TOCA REANUDAR ---

            // Cerrar la pausa actual en BD
            const { error } = await supabase
                .from('pausas')
                .update({ fin: now })
                .eq('id', currentPause.id);

            if (error) throw error;

            // Actualizar estado local y UI
            currentPause = null;
            showMessage('success', '▶️ Jornada reanudada');

        } else {
            // --- CASO 2: ESTAMOS TRABAJANDO -> TOCA PAUSAR ---

            // Crear nueva pausa en BD
            const { data, error } = await supabase
                .from('pausas')
                .insert([{
                    jornada_id: currentWorkday.id,
                    inicio: now
                }])
                .select()
                .single();

            if (error) throw error;

            // Actualizar estado local y UI
            currentPause = data;
            showMessage('warning', '⏸️ Jornada pausada');
        }

        // Actualizar los botones y textos según el nuevo estado
        updateUIForActiveWorkday();

    } catch (error) {
        console.error('Error en pausa:', error);
        if (window.uiFeedback) uiFeedback.error('Error al actualizar pausa');
    } finally {
        showLoading(false);
    }
}

// Finalizar jornada
async function handleEndWorkday() {
    const supabase = window.getSupabase();
    if (!supabase || !currentWorkday) return;

    const confirmed = confirm('¿Estás seguro de finalizar tu jornada?');
    if (!confirmed) return;

    showLoading(true);

    try {
        const now = new Date().toISOString();

        // 1. Si hay pausa activa, ciérrala antes de terminar
        if (currentPause) {
            await supabase
                .from('pausas')
                .update({ fin: now })
                .eq('id', currentPause.id);
        }

        // 2. Cerrar la jornada
        const { data, error } = await supabase
            .from('jornadas')
            .update({
                fecha_fin: now,
                estado: 'completed'
            })
            .eq('id', currentWorkday.id)
            .select()
            .single();

        if (error) throw error;

        currentWorkday = null;
        currentPause = null;
        updateUIForNoWorkday();
        showMessage('success', '✅ Jornada finalizada');
        await loadHistory();
        await loadStats(); // Recargar estadísticas

    } catch (error) {
        console.error('Error al finalizar jornada:', error);
        showMessage('error', 'Error al finalizar jornada');
    } finally {
        showLoading(false);
    }
}

// Cargar historial
async function loadHistory() {
    const supabase = window.getSupabase();
    if (!supabase) return;

    loadingHistoryEl.style.display = 'block';

    try {
        const { data, error } = await supabase
            .from('jornadas')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('fecha_inicio', { ascending: false })
            .limit(20);

        if (error) {
            if (!error.message.includes('does not exist')) {
                throw error;
            }
            return;
        }

        if (!data || data.length === 0) {
            historyListEl.innerHTML = '<div class="history-empty">No hay jornadas registradas aún</div>';
            return;
        }

        // Renderizar historial
        historyListEl.innerHTML = data.map(jornada => {
            const startDate = new Date(jornada.fecha_inicio);
            const endDate = jornada.fecha_fin ? new Date(jornada.fecha_fin) : null;

            const dateStr = startDate.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            const startTimeStr = startDate.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            });

            const endTimeStr = endDate
                ? endDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
                : 'En curso';

            let durationStr = '';
            if (endDate) {
                const durationMs = endDate - startDate;
                const hours = Math.floor(durationMs / (1000 * 60 * 60));
                const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
                durationStr = `<div class="history-duration">Duración total: ${hours}h ${minutes}min</div>`;
            }

            return `
        <div class="history-item">
          <div class="history-date">${dateStr}</div>
          <div class="history-times">
            <div>▶️ Inicio: ${startTimeStr}</div>
            <div>⏹️ Fin: ${endTimeStr}</div>
          </div>
          ${durationStr}
        </div>
      `;
        }).join('');

    } catch (error) {
        console.error('Error al cargar historial:', error);
        historyListEl.innerHTML = '<div class="history-empty">Error al cargar el historial</div>';
    } finally {
        loadingHistoryEl.style.display = 'none';
    }
}

// Actualizar UI para jornada activa (Maneja estado Pausado/Activo)
function updateUIForActiveWorkday() {
    startBtn.disabled = true;
    pauseBtn.disabled = false; // ¡Ahora el botón de pausa SIEMPRE está habilitado!
    pauseBtn.style.display = 'inline-flex'; // Asegurar que sea visible
    endBtn.disabled = false;

    // Calcular hora inicio
    const startTime = new Date(currentWorkday.fecha_inicio);
    const startTimeStr = startTime.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
    });

    // CAMBIAR UI SEGÚN ESTADO DE PAUSA
    if (currentPause) {
        // --- ESTADO: PAUSADO ---
        showControlMessage('warning', '⏸️ Jornada Pausada');

        // Cambiar botón a "Reanudar"
        pauseBtn.innerHTML = '▶️ Reanudar';
        pauseBtn.className = 'btn btn-primary'; // Azul para acción positiva

    } else {
        // --- ESTADO: TRABAJANDO ---
        showControlMessage('success', `🟢 Jornada activa desde ${startTimeStr}`);

        // Cambiar botón a "Pausar"
        pauseBtn.innerHTML = '⏸️ Pausar';
        pauseBtn.className = 'btn btn-secondary'; // Gris/Blanco para acción secundaria
    }
}

// Actualizar UI para sin jornada
function updateUIForNoWorkday() {
    startBtn.disabled = false;

    // Deshabilitar pausa si no hay jornada
    pauseBtn.disabled = true;
    pauseBtn.innerHTML = '⏸️ Pausar';
    pauseBtn.className = 'btn btn-secondary';

    endBtn.disabled = true;
    showControlMessage('info', 'No hay jornada activa');
}

// Mostrar mensaje de control
function showControlMessage(type, text) {
    if (!controlMessageEl) return;
    controlMessageEl.textContent = text;
    controlMessageEl.className = `control-message ${type}`;
}

// Mostrar/ocultar loading
function showLoading(show) {
    if (loadingEl) {
        loadingEl.style.display = show ? 'flex' : 'none';
    }
}

// Mostrar mensajes (Toast)
function showMessage(type, text) {
    // Si existe uiFeedback, usarlo (es más bonito)
    if (window.uiFeedback) {
        if (type === 'success') uiFeedback.success(text);
        else if (type === 'error') uiFeedback.error(text);
        else if (type === 'warning') uiFeedback.warning(text);
        else uiFeedback.info(text);
        return;
    }

    // Fallback por si uiFeedback falla
    const messageEl = document.getElementById('message');
    if (!messageEl) return;

    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
    messageEl.style.display = 'block';

    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 5000);
}