// 🔧 Configuración de Supabase
// ⚠️ IMPORTANTE: Reemplaza estos valores con los de TU proyecto de Supabase

const SUPABASE_CONFIG = {
    // ✅ Configurado para proyecto: control-horario-2026
    // Región: us-east-1
    url: 'https://lossuhqdplekjtpfklvg.supabase.co',

    // Anon key (público - seguro para frontend)
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxvc3N1aHFkcGxla2p0cGZrbHZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MTYxNTQsImV4cCI6MjA4NjA5MjE1NH0.Au8v80ryl4oZT3Jvy679zT0rOUWjrBcJWffn_vkRtGQ'
};

// ⚠️ NO compartas el service_role key en el frontend
// Solo usamos anon key en el navegador por seguridad

// Exportar configuración
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
