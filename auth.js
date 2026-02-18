// 🔐 Autenticación - Login y Signup

// Elementos del DOM
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const showSignupLink = document.getElementById('show-signup');
const showLoginLink = document.getElementById('show-login');
const loginFormContainer = document.getElementById('login-form');
const signupFormContainer = document.getElementById('signup-form');
const loadingEl = document.getElementById('loading');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si ya hay sesión activa
    checkSession();

    // Alternar entre login y signup
    showSignupLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginFormContainer.classList.remove('active');
        signupFormContainer.classList.add('active');
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        signupFormContainer.classList.remove('active');
        loginFormContainer.classList.add('active');
    });

    // Formulario de login
    loginForm.addEventListener('submit', handleLogin);

    // Formulario de signup
    signupForm.addEventListener('submit', handleSignup);
});

// Verificar sesión activa
async function checkSession() {
    const supabase = window.getSupabase();
    if (!supabase) return;

    try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
            // Ya hay sesión activa, redirigir al dashboard
            window.location.href = 'dashboard.html';
        }
    } catch (error) {
        console.error('Error al verificar sesión:', error);
    }
}

// Manejar Login
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        showMessage('error', 'Por favor completa todos los campos');
        return;
    }

    showLoading(true);

    const supabase = window.getSupabase();
    if (!supabase) {
        showMessage('error', 'Error de conexión con Supabase');
        showLoading(false);
        return;
    }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        console.log('✅ Login exitoso:', data);
        uiFeedback.success('Sesión iniciada correctamente');

        // Redirigir al dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);

    } catch (error) {
        console.error('❌ Error en login:', error);

        let errorMessage = 'Error al iniciar sesión';

        if (error.message.includes('Invalid login credentials')) {
            errorMessage = 'Email o contraseña incorrectos';
        } else if (error.message.includes('Email not confirmed')) {
            errorMessage = 'Por favor confirma tu email primero';
        }

        uiFeedback.error(errorMessage);
    } finally {
        showLoading(false);
    }
}

// Manejar Signup
async function handleSignup(e) {
    e.preventDefault();

    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const passwordConfirm = document.getElementById('signup-password-confirm').value;

    // Validaciones
    if (!name || !email || !password || !passwordConfirm) {
        showMessage('error', 'Por favor completa todos los campos');
        return;
    }

    if (password !== passwordConfirm) {
        showMessage('error', 'Las contraseñas no coinciden');
        return;
    }

    if (password.length < 6) {
        showMessage('error', 'La contraseña debe tener al menos 6 caracteres');
        return;
    }

    showLoading(true);

    const supabase = window.getSupabase();
    if (!supabase) {
        showMessage('error', 'Error de conexión con Supabase');
        showLoading(false);
        return;
    }

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name
                }
            }
        });

        if (error) throw error;

        console.log('✅ Registro exitoso:', data);

        // Verificar si requiere confirmación de email
        if (data.user && !data.session) {
            uiFeedback.info('Revisa tu email para confirmar tu cuenta');
        } else {
            uiFeedback.success('Cuenta creada exitosamente');

            // Redirigir al dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        }

    } catch (error) {
        console.error('❌ Error en signup:', error);

        let errorMessage = 'Error al crear la cuenta';

        if (error.message.includes('already registered')) {
            errorMessage = 'Este email ya está registrado';
        } else if (error.message.includes('Password')) {
            errorMessage = 'La contraseña no cumple los requisitos';
        }

        uiFeedback.error(errorMessage);
    } finally {
        showLoading(false);
    }
}

// Mostrar/ocultar loading
function showLoading(show) {
    if (loadingEl) {
        loadingEl.style.display = show ? 'flex' : 'none';
    }
}

// Mostrar mensajes
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
