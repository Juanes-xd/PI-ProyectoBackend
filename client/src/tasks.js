// Manejo de tareas
const TaskManager = {
  tasks: [],
  user: null,

  init(user) {
    this.user = user;
    this.bindEvents();
    this.loadTasks();
  },

  bindEvents() {
    const taskForm = document.getElementById('task-form');
    const logoutBtn = document.getElementById('logout-btn');
    
    taskForm.addEventListener('submit', (e) => this.handleCreateTask(e));
    logoutBtn.addEventListener('click', () => this.handleLogout());
  },

  async loadTasks() {
    try {
      const response = await ApiService.getTasks();
      this.tasks = response || [];
      this.renderTasks();
      this.updateTasksTitle();
    } catch (error) {
      console.error('Error loading tasks:', error);
      this.tasks = [];
      this.renderTasks();
    }
  },

  async handleCreateTask(e) {
    e.preventDefault();
    const errorDiv = document.getElementById('task-error');
    errorDiv.textContent = '';

    const formData = new FormData(e.target);
    const taskData = Object.fromEntries(formData);

    try {
      await ApiService.createTask(taskData);
      e.target.reset();
      await this.loadTasks(); // Recargar tareas
    } catch (error) {
      errorDiv.textContent = error.message || 'Error al crear la tarea';
    }
  },

  async handleLogout() {
    try {
      await ApiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    App.showAuth();
  },

  renderTasks() {
    const tasksGrid = document.getElementById('tasks-grid');
    
    if (this.tasks.length === 0) {
      tasksGrid.innerHTML = '<div class="no-tasks">No tienes tareas aún. ¡Crea tu primera tarea!</div>';
      return;
    }

    const tasksHTML = this.tasks.map(task => `
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

    tasksGrid.innerHTML = tasksHTML;
  },

  updateTasksTitle() {
    const tasksTitle = document.getElementById('tasks-title');
    tasksTitle.textContent = `Mis Tareas (${this.tasks.length})`;
  },

  updateUserGreeting() {
    const userGreeting = document.getElementById('user-greeting');
    userGreeting.textContent = `¡Hola, ${this.user?.name || 'Usuario'}!`;
  }
};