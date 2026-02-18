/**
 * 📊 Stats Service
 * 
 * Servicio para calcular y obtener estadísticas laborales
 * Incluye: horas trabajadas, promedios, gráficos
 * 
 * Tarea Paralela #3
 * Responsable: Dev 3
 */

class StatsService {
    constructor() {
        this.supabase = null;
        this.currentUserId = null;
    }

    /**
     * Inicializa el servicio con Supabase client y user ID
     * @param {Object} supabaseClient - Cliente de Supabase
     * @param {string} userId - ID del usuario actual
     */
    init(supabaseClient, userId) {
        this.supabase = supabaseClient;
        this.currentUserId = userId;
        console.log('✅ Stats service initialized');
    }

    /**
     * Obtiene las jornadas del mes actual
     * @returns {Promise<Array>} - Array de jornadas
     */
    async getCurrentMonthWorkdays() {
        if (!this.supabase || !this.currentUserId) {
            throw new Error('Stats service no inicializado');
        }

        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        try {
            const { data, error } = await this.supabase
                .from('jornadas')
                .select('*')
                .eq('user_id', this.currentUserId)
                .gte('fecha_inicio', firstDayOfMonth.toISOString())
                .lte('fecha_inicio', lastDayOfMonth.toISOString())
                .not('fecha_fin', 'is', null) // Solo jornadas completadas
                .order('fecha_inicio', { ascending: false });

            if (error) throw error;

            return data || [];
        } catch (error) {
            console.error('❌ Error al obtener jornadas del mes:', error);
            throw error;
        }
    }

    /**
     * Calcula las horas trabajadas de una jornada
     * @param {Object} workday - Objeto de jornada
     * @returns {number} - Horas trabajadas
     */
    calculateHours(workday) {
        if (!workday.fecha_fin) return 0;

        const start = new Date(workday.fecha_inicio);
        const end = new Date(workday.fecha_fin);
        const diffMs = end - start;
        const diffHours = diffMs / (1000 * 60 * 60);

        return Math.max(0, diffHours);
    }

    /**
     * Calcula estadísticas del mes actual
     * @returns {Promise<Object>} - Objeto con estadísticas
     */
    async getMonthlyStats() {
        try {
            const workdays = await this.getCurrentMonthWorkdays();

            if (workdays.length === 0) {
                return {
                    totalHours: 0,
                    avgHoursPerDay: 0,
                    daysWorked: 0,
                    daysInMonth: this.getDaysInCurrentMonth(),
                    completedWorkdays: 0
                };
            }

            // Calcular total de horas
            const totalHours = workdays.reduce((sum, workday) => {
                return sum + this.calculateHours(workday);
            }, 0);

            // Calcular días trabajados (únicos)
            const uniqueDays = new Set(
                workdays.map(w => new Date(w.fecha_inicio).toDateString())
            );
            const daysWorked = uniqueDays.size;

            // Calcular promedio
            const avgHoursPerDay = daysWorked > 0 ? totalHours / daysWorked : 0;

            return {
                totalHours: Math.round(totalHours * 100) / 100,
                avgHoursPerDay: Math.round(avgHoursPerDay * 100) / 100,
                daysWorked: daysWorked,
                daysInMonth: this.getDaysInCurrentMonth(),
                completedWorkdays: workdays.length
            };
        } catch (error) {
            console.error('❌ Error al calcular estadísticas:', error);
            throw error;
        }
    }

    /**
     * Obtiene el número de días del mes actual
     * @returns {number} - Días en el mes
     */
    getDaysInCurrentMonth() {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    }

    /**
     * Formatea horas a formato legible
     * @param {number} hours - Horas decimales
     * @returns {string} - Formato "Xh Ym"
     */
    formatHours(hours) {
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        return `${h}h ${m}m`;
    }

    /**
     * Obtiene datos para gráfico simple de barras
     * @returns {Promise<Array>} - Datos para gráfico
     */
    async getWeeklyChartData() {
        try {
            const workdays = await this.getCurrentMonthWorkdays();

            // Agrupar por semana (simplificado - últimos 7 días)
            const last7Days = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateString = date.toDateString();

                const dayWorkdays = workdays.filter(w =>
                    new Date(w.fecha_inicio).toDateString() === dateString
                );

                const totalHours = dayWorkdays.reduce((sum, w) =>
                    sum + this.calculateHours(w), 0
                );

                last7Days.push({
                    date: date.toLocaleDateString('es', { weekday: 'short' }),
                    hours: Math.round(totalHours * 10) / 10
                });
            }

            return last7Days;
        } catch (error) {
            console.error('❌ Error al obtener datos de gráfico:', error);
            return [];
        }
    }
}

// Exportar instancia singleton
const statsService = new StatsService();
window.statsService = statsService;
