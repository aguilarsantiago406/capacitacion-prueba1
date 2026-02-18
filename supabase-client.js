document.addEventListener('DOMContentLoaded', () => {
    try {
        // Verificar que las credenciales estén configuradas
        if (!window.SUPABASE_CONFIG ||
            window.SUPABASE_CONFIG.url === 'https://TU_PROJECT_ID.supabase.co' ||
            window.SUPABASE_CONFIG.anonKey === 'TU_ANON_KEY_AQUI') {
            console.error('⚠️ CONFIGURA TUS CREDENCIALES DE SUPABASE EN config.js');
            showMessage('error', 'Error: Configura las credenciales de Supabase en config.js');
            return;
        }

        // Verificar que la librería de Supabase esté cargada
        if (!window.supabase) {
            console.error('❌ La librería de Supabase no está cargada');
            showMessage('error', 'Error: No se pudo cargar la librería de Supabase');
            return;
        }

        // Crear el cliente de Supabase (usando window.supabase del CDN)
        // Guardar en window.supabaseClient para evitar conflicto con variable global
        window.supabaseClient = window.supabase.createClient(
            window.SUPABASE_CONFIG.url,
            window.SUPABASE_CONFIG.anonKey
        );

        console.log('✅ Cliente de Supabase inicializado correctamente');
    } catch (error) {
        console.error('❌ Error al inicializar Supabase:', error);
        showMessage('error', 'Error al conectar con Supabase');
    }
});

// Función auxiliar para mostrar mensajes
function showMessage(type, text) {
    const messageEl = document.getElementById('message');
    if (!messageEl) return;

    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
    messageEl.style.display = 'block';

    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 5000);
}

// Exportar el cliente para usarlo en otros archivos
window.getSupabase = () => window.supabaseClient;
