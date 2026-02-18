/**
 * 🎨 UI Feedback Service
 * 
 * Sistema centralizado de feedback visual para el usuario
 * Incluye: toasts, loading states, skeleton loaders
 * 
 * Tarea Paralela #2
 * Responsable: Dev 2
 */

class UIFeedbackService {
    constructor() {
        this.toastContainer = null;
        this.loadingOverlay = null;
        this.init();
    }

    /**
     * Inicializa el servicio creando los contenedores necesarios
     */
    init() {
        this.createToastContainer();
        this.createLoadingOverlay();
        console.log('✅ UI Feedback service initialized');
    }

    /**
     * Crea el contenedor de toasts
     */
    createToastContainer() {
        if (document.getElementById('toast-container')) return;

        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
        this.toastContainer = container;
    }

    /**
     * Crea el overlay de loading global
     */
    createLoadingOverlay() {
        if (document.getElementById('loading-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.className = 'loading-overlay hidden';
        overlay.innerHTML = `
      <div class="loading-spinner large"></div>
      <p class="loading-text">Cargando...</p>
    `;
        document.body.appendChild(overlay);
        this.loadingOverlay = overlay;
    }

    /**
     * Muestra un toast notification
     * @param {string} type - Tipo: 'success', 'error', 'info', 'warning'
     * @param {string} message - Mensaje a mostrar
     * @param {number} duration - Duración en ms (default: 3000)
     */
    showToast(type, message, duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icon = this.getToastIcon(type);
        toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-message">${message}</span>
    `;

        this.toastContainer.appendChild(toast);

        // Animación de entrada
        setTimeout(() => toast.classList.add('show'), 10);

        // Auto-remover después de la duración
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    /**
     * Shortcuts para tipos de toast
     */
    success(message, duration) {
        this.showToast('success', message, duration);
    }

    error(message, duration) {
        this.showToast('error', message, duration);
    }

    info(message, duration) {
        this.showToast('info', message, duration);
    }

    warning(message, duration) {
        this.showToast('warning', message, duration);
    }

    /**
     * Obtiene el icono apropiado para cada tipo de toast
     * @param {string} type - Tipo de toast
     * @returns {string} - Emoji del icono
     */
    getToastIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            info: 'ℹ️',
            warning: '⚠️'
        };
        return icons[type] || 'ℹ️';
    }

    /**
     * Muestra el loading overlay global
     * @param {string} text - Texto de loading (opcional)
     */
    showLoading(text = 'Cargando...') {
        if (this.loadingOverlay) {
            const loadingText = this.loadingOverlay.querySelector('.loading-text');
            if (loadingText) {
                loadingText.textContent = text;
            }
            this.loadingOverlay.classList.remove('hidden');
        }
    }

    /**
     * Oculta el loading overlay global
     */
    hideLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.classList.add('hidden');
        }
    }

    /**
     * Agrega un loading spinner a un elemento específico
     * @param {HTMLElement} element - Elemento donde agregar el spinner
     * @param {string} size - Tamaño: 'small', 'medium', 'large'
     * @returns {HTMLElement} - El spinner creado
     */
    addSpinner(element, size = 'medium') {
        const spinner = document.createElement('div');
        spinner.className = `loading-spinner ${size} inline-spinner`;
        element.appendChild(spinner);
        return spinner;
    }

    /**
     * Remueve un spinner de un elemento
     * @param {HTMLElement} element - Elemento del cual remover el spinner
     */
    removeSpinner(element) {
        const spinner = element.querySelector('.inline-spinner');
        if (spinner) {
            spinner.remove();
        }
    }

    /**
     * Crea un skeleton loader para contenido
     * @param {number} lines - Número de líneas del skeleton
     * @returns {HTMLElement} - Elemento del skeleton
     */
    createSkeleton(lines = 3) {
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton-loader';

        for (let i = 0; i < lines; i++) {
            const line = document.createElement('div');
            line.className = 'skeleton-line';
            if (i === lines - 1) {
                line.style.width = '70%'; // Última línea más corta
            }
            skeleton.appendChild(line);
        }

        return skeleton;
    }

    /**
     * Muestra un skeleton en lugar de contenido mientras carga
     * @param {HTMLElement} element - Elemento donde mostrar skeleton
     * @param {number} lines - Número de líneas
     */
    showSkeleton(element, lines = 3) {
        const skeleton = this.createSkeleton(lines);
        skeleton.dataset.skeletonId = Math.random().toString(36);
        element.appendChild(skeleton);
        return skeleton.dataset.skeletonId;
    }

    /**
     * Remueve skeleton y muestra contenido real
     * @param {HTMLElement} element - Elemento del cual remover skeleton
     */
    removeSkeleton(element) {
        const skeleton = element.querySelector('.skeleton-loader');
        if (skeleton) {
            skeleton.remove();
        }
    }
}

// Exportar instancia singleton
const uiFeedback = new UIFeedbackService();
window.uiFeedback = uiFeedback;
