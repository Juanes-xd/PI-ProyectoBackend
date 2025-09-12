// Aplicación principal
const App = {
  async init() {
    // Mostrar pantalla de carga
    this.showLoading();
    
    // Inicializar componentes
    AuthManager.init();
    
    // Verificar si hay autenticación existente
    try {
      const user = await ApiService.verifyToken();
      this.showDashboard(user);
    } catch (error) {
      console.log('No hay autenticación válida');
      this.showAuth();
    }
  },

  showLoading() {
    this.hideAllScreens();
    document.getElementById('loading-screen').style.display = 'flex';
  },

  showAuth() {
    this.hideAllScreens();
    document.getElementById('auth-screen').style.display = 'block';
  },

  async showDashboard(user) {
    this.hideAllScreens();
    
    // Obtener perfil actualizado si no se proporcionó
    if (!user) {
      try {
        user = await ApiService.getProfile();
      } catch (error) {
        console.error('Error obteniendo perfil:', error);
        this.showAuth();
        return;
      }
    }
    
    // Inicializar TaskManager con el usuario
    TaskManager.init(user);
    TaskManager.updateUserGreeting();
    
    document.getElementById('dashboard-screen').style.display = 'block';
  },

  hideAllScreens() {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
      screen.style.display = 'none';
    });
  }
};

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
