// API Service para comunicación con el backend
const API_BASE_URL = 'http://localhost:4000/api/v1';

const ApiService = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Incluir cookies
      ...options,
    };

    console.log('API Request:', url, config); // Debug log

    try {
      const response = await fetch(url, config);
      
      console.log('API Response status:', response.status); // Debug log
      
      // Manejar diferentes tipos de respuesta
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      console.log('API Response data:', data); // Debug log

      if (!response.ok) {
        throw new Error(data.message || data || `HTTP Error ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Métodos de autenticación
  async register(userData) {
    const requestData = {
      name: userData.firstName,
      lastname: userData.lastName,
      email: userData.email,
      password: userData.password,
      age: userData.age || 18
    };
    
    return await this.request('/register', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  },

  async login(credentials) {
    return await this.request('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async logout() {
    try {
      await this.request('/logout', { method: 'POST' });
    } catch (error) {
      console.log('Logout error:', error);
    }
  },

  async verifyToken() {
    return await this.request('/verify');
  },

  async getProfile() {
    return await this.request('/profile');
  },

  // Métodos de tareas
  async getTasks() {
    return await this.request('/tasks');
  },

  async createTask(taskData) {
    return await this.request('/tasks/new', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  async getTask(id) {
    return await this.request(`/tasks/${id}`);
  }
};