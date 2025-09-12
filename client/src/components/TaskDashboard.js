import apiService from '../services/api.js';

export class TaskDashboard {
  constructor(container) {
    this.container = container;
    this.tasks = [];
    this.user = null;
  }

  async init() {
    try {
      // Get user profile
      const profileResponse = await apiService.getProfile();
      this.user = profileResponse;
      
      // Load tasks
      await this.loadTasks();
      this.render();
    } catch (error) {
      console.error('Error initializing dashboard:', error);
      // If authentication fails, dispatch logout event
      window.dispatchEvent(new CustomEvent('auth-logout'));
    }
  }

  async loadTasks() {
    try {
      const response = await apiService.getTasks();
      this.tasks = response || [];
    } catch (error) {
      console.error('Error loading tasks:', error);
      this.tasks = [];
    }
  }

  render() {
    this.container.innerHTML = `
      <div class="dashboard">
        <header class="dashboard-header">
          <div class="user-info">
            <h1>¡Hola, ${this.user?.name || 'Usuario'}!</h1>
            <p>Gestiona tus tareas de forma eficiente</p>
          </div>
          <button id="logout-btn" class="btn-secondary">Cerrar Sesión</button>
        </header>

        <div class="task-form-container">
          <h2>Nueva Tarea</h2>
          <form id="task-form" class="task-form">
            <div class="form-group">
              <label for="task-title">Título:</label>
              <input type="text" id="task-title" name="title" required maxlength="50">
            </div>
            <div class="form-group">
              <label for="task-details">Detalles:</label>
              <textarea id="task-details" name="details" maxlength="500" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label for="task-status">Estado:</label>
              <select id="task-status" name="status">
                <option value="Por Hacer">Por Hacer</option>
                <option value="Haciendo">Haciendo</option>
                <option value="Hecho">Hecho</option>
              </select>
            </div>
            <button type="submit" class="btn-primary">Crear Tarea</button>
          </form>
          <div id="task-error" class="error-message"></div>
        </div>

        <div class="tasks-container">
          <h2>Mis Tareas (${this.tasks.length})</h2>
          <div class="tasks-grid">
            ${this.renderTasks()}
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  renderTasks() {
    if (this.tasks.length === 0) {
      return '<div class="no-tasks">No tienes tareas aún. ¡Crea tu primera tarea!</div>';
    }

    return this.tasks.map(task => `
      <div class="task-card ${task.status.toLowerCase().replace(' ', '-')}">
        <div class="task-header">
          <h3>${task.title}</h3>
          <span class="task-status status-${task.status.toLowerCase().replace(' ', '-')}">${task.status}</span>
        </div>
        ${task.details ? `<p class="task-details">${task.details}</p>` : ''}
        <div class="task-footer">
          <small>Creada: ${new Date(task.createdAt).toLocaleDateString('es-ES')}</small>
        </div>
      </div>
    `).join('');
  }

  attachEventListeners() {
    const taskForm = document.getElementById('task-form');
    const logoutBtn = document.getElementById('logout-btn');
    const errorDiv = document.getElementById('task-error');

    taskForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorDiv.textContent = '';

      const formData = new FormData(taskForm);
      const taskData = Object.fromEntries(formData);

      try {
        await apiService.createTask(taskData);
        taskForm.reset();
        await this.loadTasks();
        this.renderTasksOnly();
      } catch (error) {
        errorDiv.textContent = error.message || 'Error al crear la tarea';
      }
    });

    logoutBtn.addEventListener('click', async () => {
      try {
        await apiService.logout();
      } catch (error) {
        console.error('Logout error:', error);
      }
      window.dispatchEvent(new CustomEvent('auth-logout'));
    });
  }

  renderTasksOnly() {
    const tasksGrid = document.querySelector('.tasks-grid');
    const tasksTitle = document.querySelector('.tasks-container h2');
    
    if (tasksGrid) {
      tasksGrid.innerHTML = this.renderTasks();
    }
    
    if (tasksTitle) {
      tasksTitle.textContent = `Mis Tareas (${this.tasks.length})`;
    }
  }
}