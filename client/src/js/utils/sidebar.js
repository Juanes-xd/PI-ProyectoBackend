// Sidebar functionality
class Sidebar {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadUserInfo();
        this.handleMobileMenu();
    }

    setupEventListeners() {
        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.handleLogout.bind(this));
        }

        // Mobile menu button
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', this.toggleMobileMenu.bind(this));
        }

        // Sidebar overlay
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', this.closeMobileMenu.bind(this));
        }

        // Close mobile menu when clicking nav items
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    this.closeMobileMenu();
                }
            });
        });
    }

    async loadUserInfo() {
        try {
            const userData = await ApiService.getProfile();
            this.updateUserInfo(userData.username || userData.email || 'Usuario');
        } catch (error) {
            console.error('Error loading user info:', error);
            // Si hay error de autenticación, redirigir a auth
            if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                window.location.href = './auth.html';
            } else {
                this.updateUserInfo('Usuario');
            }
        }
    }

    updateUserInfo(username) {
        const userInfoElement = document.getElementById('userInfo');
        if (userInfoElement) {
            userInfoElement.textContent = `¡Hola, ${username}!`;
        }
    }

    async handleLogout() {
        try {
            // Usar el ApiService en lugar de fetch directo
            await ApiService.logout();
            
            // Limpiar cualquier dato local si es necesario
            localStorage.clear();
            sessionStorage.clear();
            
            // Redirigir a la página de login con parámetro para mostrar mensaje
            window.location.href = './auth.html?logout=true';
        } catch (error) {
            console.error('Error during logout:', error);
            // En caso de error, aún así redirigir
            window.location.href = './auth.html?logout=true';
        }
    }

    toggleMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar && overlay) {
            sidebar.classList.toggle('mobile-open');
            overlay.classList.toggle('active');
        }
    }

    closeMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar && overlay) {
            sidebar.classList.remove('mobile-open');
            overlay.classList.remove('active');
        }
    }

    handleMobileMenu() {
        // Close mobile menu on window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                this.closeMobileMenu();
            }
        });

        // Close mobile menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMobileMenu();
            }
        });
    }

    // Método para marcar el elemento activo del menú
    setActiveNavItem(currentPage) {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            
            const href = item.getAttribute('href');
            if (href && href.includes(currentPage)) {
                item.classList.add('active');
            }
        });
    }
}

// Auto-inicializar el sidebar si existe
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        new Sidebar();
    }
});

// Exportar para uso en otros archivos
window.Sidebar = Sidebar;