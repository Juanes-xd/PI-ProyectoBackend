// Manejo de autenticación
const AuthManager = {
  isLoginMode: true,

  init() {
    this.bindEvents();
  },

  bindEvents() {
    const authForm = document.getElementById('auth-form');
    const switchBtn = document.getElementById('switch-mode');
    
    authForm.addEventListener('submit', (e) => this.handleSubmit(e));
    switchBtn.addEventListener('click', () => this.toggleMode());
  },

  async handleSubmit(e) {
    e.preventDefault();
    console.log('Form submitted, mode:', this.isLoginMode); // Debug log
    
    const errorDiv = document.getElementById('auth-error');
    errorDiv.textContent = '';

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    console.log('Form data:', data); // Debug log

    try {
      let response;
      if (this.isLoginMode) {
        console.log('Attempting login...'); // Debug log
        response = await ApiService.login({
          email: data.email,
          password: data.password
        });
      } else {
        console.log('Attempting registration...'); // Debug log
        response = await ApiService.register({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          age: parseInt(data.age)
        });
      }

      console.log('Auth response:', response); // Debug log
      // Autenticación exitosa
      App.showDashboard(response);
    } catch (error) {
      console.error('Auth error:', error); // Debug log
      errorDiv.textContent = error.message || 'Error en la autenticación';
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

    if (this.isLoginMode) {
      title.textContent = 'Iniciar Sesión';
      submitBtn.textContent = 'Entrar';
      registerFields.style.display = 'none';
      question.textContent = '¿No tienes cuenta?';
      switchBtn.textContent = 'Regístrate aquí';
      
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
      
      // Agregar required a campos de registro
      firstNameInput.setAttribute('required', '');
      lastNameInput.setAttribute('required', '');
      ageInput.setAttribute('required', '');
    }

    // Limpiar formulario
    document.getElementById('auth-form').reset();
    document.getElementById('auth-error').textContent = '';
  }
};