/**
 * 🌦️ Weather Service
 * 
 * Servicio para integrar API de clima (OpenWeatherMap)
 * Proporciona información del clima actual para la ubicación del usuario
 * 
 * Tarea Paralela #1
 * Responsable: Dev 1
 */

class WeatherService {
    constructor() {
        this.apiKey = null;
        this.baseUrl = 'https://api.openweathermap.org/data/2.5/weather';
        this.cache = new Map();
        this.cacheTimeout = 10 * 60 * 1000; // 10 minutos
    }

    /**
     * Inicializa el servicio con la API key
     * @param {string} apiKey - API key de OpenWeatherMap
     */
    init(apiKey) {
        if (!apiKey) {
            console.warn('⚠️ Weather API key no configurada');
            return false;
        }
        this.apiKey = apiKey;
        console.log('✅ Weather service initialized');
        return true;
    }

    /**
     * Obtiene el clima actual para una ciudad
     * @param {string} city - Nombre de la ciudad
     * @param {string} lang - Idioma (default: 'es')
     * @returns {Promise<Object>} - Datos del clima
     */
    async getCurrentWeather(city, lang = 'es') {
        if (!this.apiKey) {
            throw new Error('API key no configurada. Llama a init() primero.');
        }

        // Verificar caché
        const cacheKey = `${city}-${lang}`;
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            console.log('📦 Using cached weather data');
            return cached.data;
        }

        try {
            const url = `${this.baseUrl}?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric&lang=${lang}`;

            const response = await fetch(url);

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('API key inválida');
                } else if (response.status === 404) {
                    throw new Error('Ciudad no encontrada');
                } else {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }
            }

            const data = await response.json();

            // Guardar en caché
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });

            return data;
        } catch (error) {
            console.error('❌ Error al obtener clima:', error);
            throw error;
        }
    }

    /**
     * Formatea los datos del clima para mostrar en UI
     * @param {Object} weatherData - Datos crudos de la API
     * @returns {Object} - Datos formateados
     */
    formatWeatherData(weatherData) {
        return {
            temperature: Math.round(weatherData.main.temp),
            description: weatherData.weather[0].description,
            icon: weatherData.weather[0].icon,
            humidity: weatherData.main.humidity,
            windSpeed: weatherData.wind.speed,
            feelsLike: Math.round(weatherData.main.feels_like),
            city: weatherData.name
        };
    }

    /**
     * Obtiene la URL del icono del clima
     * @param {string} iconCode - Código del icono de la API
     * @returns {string} - URL completa del icono
     */
    getIconUrl(iconCode) {
        return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    }

    /**
     * Limpia la caché
     */
    clearCache() {
        this.cache.clear();
        console.log('🧹 Weather cache cleared');
    }
}

// Exportar instancia singleton
const weatherService = new WeatherService();
window.weatherService = weatherService;
