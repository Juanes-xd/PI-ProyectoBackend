// Manejo de autenticación
document.addEventListener('DOMContentLoaded', () => {
    const AuthManager = {
        isLoginMode: true,

        init() {
            console.log('AuthManager iniciando...');
            this.bindEvents();
            const isFromLogout = this.checkLogoutMessage();
            console.log('¿Viene de logout?', isFromLogout);
            
            // Solo verificar autenticación existente si NO viene de logout
            if (!isFromLogout) {
                console.log('Verificando autenticación existente...');
                this.checkExistingAuth();
            } else {
                console.log('No verificando auth porque viene de logout');
            }
        },

        checkLogoutMessage() {
            // Verificar si viene de un logout
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('logout') === 'true') {
                console.log('Detectado logout=true en URL');
                
                // Asegurar que esté en modo login
                this.isLoginMode = true;
                this.updateUI();
                this.showLogoutMessage();
                
                // Limpiar completamente todas las cookies relacionadas con auth
                document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost';
                document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.localhost';
                
                // Limpiar el parámetro de la URL sin recargar
                window.history.replaceState({}, document.title, window.location.pathname);
                return true; // Indica que viene de logout
            }
            return false; // No viene de logout
        },

        showLogoutMessage() {
            const errorDiv = document.getElementById('auth-error');
            if (errorDiv) {
                errorDiv.style.color = '#10b981'; // Verde para mensaje de éxito
                errorDiv.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
                errorDiv.style.padding = '0.75rem';
                errorDiv.style.borderRadius = '8px';
                errorDiv.style.border = '1px solid rgba(16, 185, 129, 0.2)';
                errorDiv.textContent = '✓ Sesión cerrada correctamente. Por favor, inicia sesión nuevamente.';
                
                // Limpiar el mensaje después de 8 segundos
                setTimeout(() => {
                    errorDiv.textContent = '';
                    errorDiv.style.color = '';
                    errorDiv.style.backgroundColor = '';
                    errorDiv.style.padding = '';
                    errorDiv.style.borderRadius = '';
                    errorDiv.style.border = '';
                }, 8000);
            }
        },

        async checkExistingAuth() {
            console.log('Verificando token existente...');
            try {
                const result = await ApiService.verifyToken();
                console.log('Resultado de verifyToken:', result);
                // Si ya está autenticado, redirigir al dashboard
                console.log('Usuario ya autenticado, redirigiendo al dashboard');
                Utils.navigateTo('dashboard.html');
            } catch (error) {
                // No hay autenticación válida, continuar con login
                console.log('No hay autenticación válida:', error.message);
            }
        },

        bindEvents() {
            const authForm = document.getElementById('auth-form');
            const switchBtn = document.getElementById('switch-mode');
            
            authForm.addEventListener('submit', (e) => this.handleSubmit(e));
            switchBtn.addEventListener('click', () => this.toggleMode());
        },

        async handleSubmit(e) {
            e.preventDefault();
            console.log('Form submitted, mode:', this.isLoginMode);
            
            Utils.clearError('auth-error');

            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            console.log('Form data:', data);

            try {
                let response;
                if (this.isLoginMode) {
                    console.log('Attempting login...');
                    response = await ApiService.login({
                        email: data.email,
                        password: data.password
                    });
                } else {
                    console.log('Attempting registration...');
                    response = await ApiService.register({
                        firstName: data.firstName,
                        lastName: data.lastName,
                        email: data.email,
                        password: data.password,
                        age: parseInt(data.age)
                    });
                }

                console.log('Auth response:', response);
                // Autenticación exitosa, redirigir al dashboard
                Utils.navigateTo('dashboard.html');
            } catch (error) {
                console.error('Auth error:', error);
                Utils.showError('auth-error', error.message || 'Error en la autenticación');
            }
        },

        toggleMode() {
            this.isLoginMode = !this.isLoginMode;
            this.updateUI();
        },

        updateUI() {
            const title = document.getElementById('auth-title');
            const submitBtn = document.getElementById('auth-submit');
            const registerFields = document.getElementById('register-fields');
            const question = document.getElementById('auth-question');
            const switchBtn = document.getElementById('switch-mode');
            const firstNameInput = document.getElementById('firstName');
            const lastNameInput = document.getElementById('lastName');
            const ageInput = document.getElementById('age');
            const authCard = document.querySelector('.auth-card');

            if (this.isLoginMode) {
                title.textContent = 'Iniciar Sesión';
                submitBtn.textContent = 'Entrar';
                registerFields.style.display = 'none';
                question.textContent = '¿No tienes cuenta?';
                switchBtn.textContent = 'Regístrate aquí';
                authCard.classList.remove('register-mode');
                
                // Remover required de campos de registro
                firstNameInput.removeAttribute('required');
                lastNameInput.removeAttribute('required');
                ageInput.removeAttribute('required');
            } else {
                title.textContent = 'Registrarse';
                submitBtn.textContent = 'Registrarse';
                registerFields.style.display = 'flex';
                question.textContent = '¿Ya tienes cuenta?';
                switchBtn.textContent = 'Inicia sesión aquí';
                authCard.classList.add('register-mode');
                
                // Agregar required a campos de registro
                firstNameInput.setAttribute('required', '');
                lastNameInput.setAttribute('required', '');
                ageInput.setAttribute('required', '');
            }

            // Limpiar formulario
            document.getElementById('auth-form').reset();
            Utils.clearError('auth-error');
        }
    };

    // Inicializar AuthManager
    AuthManager.init();
});