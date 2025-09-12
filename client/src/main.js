import './style.css'
import { AuthComponent } from './components/AuthComponent.js'
import { TaskDashboard } from './components/TaskDashboard.js'
import apiService from './services/api.js'

class App {
  constructor() {
    this.container = document.querySelector('#app');
    this.authComponent = new AuthComponent(this.container);
    this.taskDashboard = new TaskDashboard(this.container);
    this.init();
  }

  async init() {
    // Check if user is already authenticated by trying to verify token from cookies
    try {
      await apiService.verifyToken();
      this.showDashboard();
    } catch (error) {
      console.log('No valid authentication found');
      this.showAuth();
    }

    // Listen for authentication events
    window.addEventListener('auth-success', () => {
      this.showDashboard();
    });

    window.addEventListener('auth-logout', () => {
      this.showAuth();
    });
  }

  showAuth() {
    this.authComponent.render();
  }

  async showDashboard() {
    await this.taskDashboard.init();
  }
}

// Initialize the app
new App();
