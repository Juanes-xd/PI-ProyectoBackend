// Manejo de autenticación
document.addEventListener('DOMContentLoaded', () => {
    const AuthManager = {
        isLoginMode: true,
        validationState: {
            firstName: false,
            lastName: false,
            age: false,
            email: false,
            password: false,
            confirmPassword: false
        },

        init() {
            console.log('AuthManager iniciando...');
            this.bindEvents();
            this.setupValidation();
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

        setupValidation() {
            const fields = ['firstName', 'lastName', 'age', 'email', 'password', 'confirmPassword'];
            
            fields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field) {
                    field.addEventListener('input', () => this.validateField(fieldId));
                    field.addEventListener('blur', () => this.validateField(fieldId));
                }
            });
        },

        validateField(fieldId) {
            const field = document.getElementById(fieldId);
            const errorDiv = document.getElementById(`${fieldId}-error`);
            
            if (!field) return;

            let isValid = false;
            let errorMessage = '';

            switch (fieldId) {
                case 'firstName':
                case 'lastName':
                    isValid = field.value.trim().length >= 2;
                    errorMessage = isValid ? '' : 'Debe tener al menos 2 caracteres';
                    break;

                case 'age':
                    const age = parseInt(field.value);
                    isValid = age >= 13 && age <= 120;
                    errorMessage = isValid ? '' : 'Edad debe ser entre 13 y 120 años';
                    break;

                case 'email':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    isValid = emailRegex.test(field.value);
                    errorMessage = isValid ? '' : 'Ingrese un email válido';
                    break;

                case 'password':
                    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
                    isValid = passwordRegex.test(field.value);
                    errorMessage = isValid ? '' : 'Mínimo 8 caracteres, 1 mayúscula, 1 número y 1 carácter especial';
                    break;

                case 'confirmPassword':
                    const passwordField = document.getElementById('password');
                    isValid = field.value === passwordField.value && field.value.length > 0;
                    errorMessage = isValid ? '' : 'Las contraseñas no coinciden';
                    break;
            }

            // Actualizar estado de validación
            this.validationState[fieldId] = isValid;

            // Mostrar/ocultar error
            if (errorDiv) {
                errorDiv.textContent = errorMessage;
                errorDiv.classList.toggle('show', !isValid && field.value.length > 0);
            }

            // Aplicar estilos al campo
            field.classList.remove('error', 'valid');
            if (field.value.length > 0) {
                field.classList.add(isValid ? 'valid' : 'error');
            }

            // Actualizar estado del botón
            this.updateSubmitButton();

            return isValid;
        },

        updateSubmitButton() {
            const submitBtn = document.getElementById('auth-submit');
            const requiredFields = this.isLoginMode 
                ? ['email', 'password']
                : ['firstName', 'lastName', 'age', 'email', 'password', 'confirmPassword'];

            const allValid = requiredFields.every(field => this.validationState[field]);
            
            submitBtn.disabled = !allValid;
            submitBtn.classList.toggle('disabled', !allValid);
        },

        async handleSubmit(e) {
            e.preventDefault();
            console.log('Form submitted, mode:', this.isLoginMode);
            
            Utils.clearError('auth-error');

            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            console.log('Form data:', data);

            // Mostrar spinner
            const submitBtn = document.getElementById('auth-submit');
            const originalText = submitBtn.textContent;
            submitBtn.innerHTML = '<span class="loading-spinner"></span> Procesando...';
            submitBtn.disabled = true;

            // Timeout para el spinner (máximo 3 segundos)
            const timeoutId = setTimeout(() => {
                if (submitBtn.innerHTML.includes('Procesando')) {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    Utils.showError('auth-error', 'Tiempo de espera agotado. Intenta nuevamente.');
                }
            }, 3000);

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

                clearTimeout(timeoutId);
                console.log('Auth response:', response);
                
                // Autenticación exitosa, redirigir al dashboard
                setTimeout(() => {
                    Utils.navigateTo('dashboard.html');
                }, 200); // Redirección rápida ≤ 500ms
                
            } catch (error) {
                clearTimeout(timeoutId);
                console.error('Auth error:', error);
                
                // Restaurar botón
                submitBtn.innerHTML = originalText;
                this.updateSubmitButton(); // Esto manejará el estado disabled basado en validación
                
                // Manejar errores específicos
                let errorMessage = 'Error en la autenticación';
                
                if (error.message.includes('409') || error.message.includes('already exists') || error.message.includes('ya está registrado')) {
                    errorMessage = 'Este correo ya está registrado';
                } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                    errorMessage = 'Credenciales incorrectas';
                } else if (error.message.includes('400')) {
                    errorMessage = 'Datos inválidos. Revisa los campos';
                } else if (error.message) {
                    errorMessage = error.message;
                }
                
                Utils.showError('auth-error', errorMessage);
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
            const confirmPasswordGroup = document.getElementById('confirm-password-group');
            const question = document.getElementById('auth-question');
            const switchBtn = document.getElementById('switch-mode');
            const firstNameInput = document.getElementById('firstName');
            const lastNameInput = document.getElementById('lastName');
            const ageInput = document.getElementById('age');
            const confirmPasswordInput = document.getElementById('confirmPassword');
            const authCard = document.querySelector('.auth-card');

            if (this.isLoginMode) {
                title.textContent = 'Iniciar Sesión';
                submitBtn.textContent = 'Entrar';
                registerFields.style.display = 'none';
                confirmPasswordGroup.style.display = 'none';
                question.textContent = '¿No tienes cuenta?';
                switchBtn.textContent = 'Regístrate aquí';
                authCard.classList.remove('register-mode');
                
                // Remover required de campos de registro
                firstNameInput.removeAttribute('required');
                lastNameInput.removeAttribute('required');
                ageInput.removeAttribute('required');
                confirmPasswordInput.removeAttribute('required');
            } else {
                title.textContent = 'Registrarse';
                submitBtn.textContent = 'Registrarse';
                registerFields.style.display = 'flex';
                confirmPasswordGroup.style.display = 'block';
                question.textContent = '¿Ya tienes cuenta?';
                switchBtn.textContent = 'Inicia sesión aquí';
                authCard.classList.add('register-mode');
                
                // Agregar required a campos de registro
                firstNameInput.setAttribute('required', '');
                lastNameInput.setAttribute('required', '');
                ageInput.setAttribute('required', '');
                confirmPasswordInput.setAttribute('required', '');
            }

            // Limpiar formulario y estado de validación
            document.getElementById('auth-form').reset();
            Utils.clearError('auth-error');
            
            // Resetear estado de validación
            Object.keys(this.validationState).forEach(key => {
                this.validationState[key] = false;
            });
            
            // Limpiar estilos de validación
            const allInputs = document.querySelectorAll('input');
            allInputs.forEach(input => {
                input.classList.remove('error', 'valid');
            });
            
            // Limpiar mensajes de error
            const errorDivs = document.querySelectorAll('.field-error');
            errorDivs.forEach(div => {
                div.textContent = '';
                div.classList.remove('show');
            });
            
            // Actualizar estado del botón
            this.updateSubmitButton();
        }
    };

    // Inicializar AuthManager
    AuthManager.init();
});