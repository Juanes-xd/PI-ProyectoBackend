// Manejo de creación de tareas
document.addEventListener('DOMContentLoaded', async () => {
    const CreateTaskManager = {
        async init() {
            // Verificar autenticación
            const isAuthenticated = await Utils.checkAuth();
            if (!isAuthenticated) return;

            this.bindEvents();
            this.setupCharCounters();
        },

        bindEvents() {
            const taskForm = document.getElementById('task-form');
            const cancelBtn = document.getElementById('cancel-btn');
            const goDashboardBtn = document.getElementById('go-dashboard');
            const createAnotherBtn = document.getElementById('create-another');
            
            taskForm.addEventListener('submit', (e) => this.handleSubmit(e));
            cancelBtn.addEventListener('click', () => this.handleCancel());
            goDashboardBtn.addEventListener('click', () => this.goToDashboard());
            createAnotherBtn.addEventListener('click', () => this.createAnother());
        },

        setupCharCounters() {
            const titleInput = document.getElementById('task-title');
            const detailsInput = document.getElementById('task-details');
            
            titleInput.addEventListener('input', () => {
                this.updateCharCounter(titleInput, 50);
            });
            
            detailsInput.addEventListener('input', () => {
                this.updateCharCounter(detailsInput, 500);
            });
        },

        updateCharCounter(input, maxLength) {
            const counter = input.parentElement.querySelector('.char-counter');
            const currentLength = input.value.length;
            counter.textContent = `${currentLength}/${maxLength} caracteres`;
            
            if (currentLength > maxLength * 0.9) {
                counter.style.color = '#ff6b6b';
            } else {
                counter.style.color = '#747bff';
            }
        },

        async handleSubmit(e) {
            e.preventDefault();
            Utils.clearError('task-error');

            const formData = new FormData(e.target);
            const taskData = Object.fromEntries(formData);

            // Validaciones básicas
            if (!taskData.title.trim()) {
                Utils.showError('task-error', 'El título es obligatorio');
                return;
            }

            if (taskData.title.length > 50) {
                Utils.showError('task-error', 'El título no puede exceder 50 caracteres');
                return;
            }

            if (taskData.details.length > 500) {
                Utils.showError('task-error', 'La descripción no puede exceder 500 caracteres');
                return;
            }

            try {
                console.log('Creating task:', taskData);
                await ApiService.createTask(taskData);
                
                // Mostrar modal de éxito
                this.showSuccessModal();
                
                // Limpiar formulario
                e.target.reset();
                this.updateCharCounter(document.getElementById('task-title'), 50);
                this.updateCharCounter(document.getElementById('task-details'), 500);
                
            } catch (error) {
                console.error('Error creating task:', error);
                Utils.showError('task-error', error.message || 'Error al crear la tarea');
            }
        },

        handleCancel() {
            if (this.hasUnsavedChanges()) {
                if (confirm('¿Estás seguro? Se perderán los cambios no guardados.')) {
                    this.goToDashboard();
                }
            } else {
                this.goToDashboard();
            }
        },

        hasUnsavedChanges() {
            const title = document.getElementById('task-title').value.trim();
            const details = document.getElementById('task-details').value.trim();
            return title || details;
        },

        showSuccessModal() {
            const modal = document.getElementById('success-modal');
            modal.style.display = 'flex';
        },

        hideSuccessModal() {
            const modal = document.getElementById('success-modal');
            modal.style.display = 'none';
        },

        goToDashboard() {
            Utils.navigateTo('dashboard.html');
        },

        createAnother() {
            this.hideSuccessModal();
            // El formulario ya fue limpiado, solo enfocar el primer campo
            document.getElementById('task-title').focus();
        }
    };

    // Inicializar CreateTaskManager
    await CreateTaskManager.init();
});