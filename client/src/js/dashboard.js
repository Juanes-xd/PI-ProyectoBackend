// Manejo del dashboard
document.addEventListener('DOMContentLoaded', async () => {
    const DashboardManager = {
        tasks: [],
        user: null,
        currentFilter: 'all',

        async init() {
            // Verificar autenticación
            const isAuthenticated = await Utils.checkAuth();
            if (!isAuthenticated) return;

            await this.loadUserProfile();
            await this.loadTasks();
            this.bindEvents();
            this.hideLoading();
        },

        async loadUserProfile() {
            try {
                const userData = await ApiService.getProfile();
                this.user = userData;
                this.updateUserGreeting();
            } catch (error) {
                console.error('Error loading user profile:', error);
                Utils.showError('Error al cargar el perfil del usuario');
            }
        },

        updateUserGreeting() {
            const greeting = document.getElementById('user-greeting');
            if (greeting && this.user) {
                greeting.textContent = `¡Hola, ${this.user.username || this.user.email}!`;
            }
        },

        async loadTasks() {
            try {
                this.tasks = await ApiService.getTasks();
                this.renderTasks();
            } catch (error) {
                console.error('Error loading tasks:', error);
                this.tasks = [];
                this.renderTasks();
            }
        },

        bindEvents() {
            const filterBtns = document.querySelectorAll('.filter-btn');
            
            filterBtns.forEach(btn => {
                btn.addEventListener('click', (e) => this.handleFilter(e));
            });
        },

        handleFilter(e) {
            const filter = e.target.dataset.filter;
            this.currentFilter = filter;
            
            // Actualizar botones activos
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            e.target.classList.add('active');
            
            this.renderTasks();
        },

        getFilteredTasks() {
            if (this.currentFilter === 'all') {
                return this.tasks;
            }
            return this.tasks.filter(task => task.status === this.currentFilter);
        },

        renderTasks() {
            const tasksContainer = document.getElementById('tasks-grid');
            const filteredTasks = this.getFilteredTasks();
            
            if (filteredTasks.length === 0) {
                tasksContainer.innerHTML = this.getEmptyStateHTML();
                return;
            }
            
            tasksContainer.innerHTML = filteredTasks.map(task => this.createTaskHTML(task)).join('');
            this.bindTaskEvents();
        },

        getEmptyStateHTML() {
            return `
                <div class="empty-state">
                    <h3>No tienes tareas aún</h3>
                    <p>¡Crea tu primera tarea para comenzar!</p>
                    <a href="create-task.html" class="btn btn-primary">Nueva Tarea</a>
                </div>
            `;
        },

        createTaskHTML(task) {
            const isCompleted = task.status === 'Hecho';
            return `
                <div class="task-item ${isCompleted ? 'completed' : ''}" data-task-id="${task._id}">
                    <div class="task-header">
                        <h3 class="task-title ${isCompleted ? 'completed' : ''}">${task.title}</h3>
                        <div class="task-actions">
                            <button class="btn-icon toggle-status" title="${isCompleted ? 'Marcar como pendiente' : 'Marcar como completada'}">
                                ${isCompleted ? '↶' : '✓'}
                            </button>
                            <button class="btn-icon edit-task" title="Editar tarea">✏️</button>
                            <button class="btn-icon delete-task" title="Eliminar tarea">🗑️</button>
                        </div>
                    </div>
                    ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
                    <div class="task-meta">
                        <span class="task-date">Creada: ${Utils.formatDate(task.createdAt)}</span>
                        <span class="task-status ${task.status.toLowerCase().replace(' ', '-')}">${task.status}</span>
                    </div>
                </div>
            `;
        },

        bindTaskEvents() {
            // Toggle status
            document.querySelectorAll('.toggle-status').forEach(btn => {
                btn.addEventListener('click', (e) => this.toggleTaskStatus(e));
            });
            
            // Delete task
            document.querySelectorAll('.delete-task').forEach(btn => {
                btn.addEventListener('click', (e) => this.deleteTask(e));
            });
            
            // Edit task (placeholder)
            document.querySelectorAll('.edit-task').forEach(btn => {
                btn.addEventListener('click', (e) => this.editTask(e));
            });
        },

        async toggleTaskStatus(e) {
            const taskElement = e.target.closest('.task-item');
            const taskId = taskElement.dataset.taskId;
            const task = this.tasks.find(t => t._id === taskId);
            
            if (task) {
                const newStatus = task.status === 'Hecho' ? 'Por Hacer' : 'Hecho';
                try {
                    await ApiService.updateTask(taskId, { status: newStatus });
                    task.status = newStatus;
                    this.renderTasks();
                    Utils.showSuccess(`Tarea marcada como ${newStatus}`);
                } catch (error) {
                    console.error('Error updating task:', error);
                    Utils.showError('Error al actualizar la tarea');
                }
            }
        },

        async deleteTask(e) {
            const taskElement = e.target.closest('.task-item');
            const taskId = taskElement.dataset.taskId;
            
            if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
                try {
                    await ApiService.deleteTask(taskId);
                    this.tasks = this.tasks.filter(t => t._id !== taskId);
                    this.renderTasks();
                    Utils.showSuccess('Tarea eliminada exitosamente');
                } catch (error) {
                    console.error('Error deleting task:', error);
                    Utils.showError('Error al eliminar la tarea');
                }
            }
        },

        editTask(e) {
            // Por ahora, solo mostrar alert
            Utils.showInfo('Funcionalidad de edición en desarrollo');
        },

        hideLoading() {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
            }
        }
    };

    await DashboardManager.init();
});