import apiService from '../services/api.js';

export class AuthComponent {
  constructor(container) {
    this.container = container;
    this.isLoginMode = true;
  }

  render() {
    this.container.innerHTML = `
      <div class="auth-container">
        <div class="auth-card">
          <h2>${this.isLoginMode ? 'Iniciar Sesión' : 'Registrarse'}</h2>
          <form id="auth-form" class="auth-form">
            ${!this.isLoginMode ? `
              <div class="form-group">
                <label for="firstName">Nombre:</label>
                <input type="text" id="firstName" name="firstName" required>
              </div>
              <div class="form-group">
                <label for="lastName">Apellido:</label>
                <input type="text" id="lastName" name="lastName" required>
              </div>
              <div class="form-group">
                <label for="age">Edad:</label>
                <input type="number" id="age" name="age" min="1" max="120" required>
              </div>
            ` : ''}
            <div class="form-group">
              <label for="email">Email:</label>
              <input type="email" id="email" name="email" required>
            </div>
            <div class="form-group">
              <label for="password">Contraseña:</label>
              <input type="password" id="password" name="password" required>
            </div>
            <button type="submit" class="btn-primary">
              ${this.isLoginMode ? 'Entrar' : 'Registrarse'}
            </button>
          </form>
          <div class="auth-switch">
            <p>
              ${this.isLoginMode ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
              <button id="switch-mode" class="btn-link">
                ${this.isLoginMode ? 'Regístrate aquí' : 'Inicia sesión aquí'}
              </button>
            </p>
          </div>
          <div id="auth-error" class="error-message"></div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    const form = document.getElementById('auth-form');
    const switchBtn = document.getElementById('switch-mode');
    const errorDiv = document.getElementById('auth-error');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorDiv.textContent = '';

      const formData = new FormData(form);
      const data = Object.fromEntries(formData);

      try {
        let response;
        if (this.isLoginMode) {
          response = await apiService.login({
            email: data.email,
            password: data.password
          });
        } else {
          response = await apiService.register({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: data.password
          });
        }

        // Dispatch custom event for successful authentication
        window.dispatchEvent(new CustomEvent('auth-success', { detail: response }));
      } catch (error) {
        errorDiv.textContent = error.message || 'Error en la autenticación';
      }
    });

    switchBtn.addEventListener('click', () => {
      this.isLoginMode = !this.isLoginMode;
      this.render();
    });
  }
}