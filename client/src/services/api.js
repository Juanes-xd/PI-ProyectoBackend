const API_BASE_URL = 'http://localhost:4000/api/v1';

class ApiService {
  constructor() {
    // No necesitamos manejar tokens en localStorage ya que el backend usa cookies httpOnly
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Importante: incluir cookies en las peticiones
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Si la respuesta es de tipo text, la parseamos como texto
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw new Error(data.message || data || 'Error en la petición');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth methods
  async register(userData) {
    // El backend espera name y lastname, no firstName y lastName
    const requestData = {
      name: userData.firstName,
      lastname: userData.lastName,
      email: userData.email,
      password: userData.password,
      age: userData.age || 18 // Valor por defecto ya que el backend lo requiere
    };
    
    const response = await this.request('/register', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
    return response;
  }

  async login(credentials) {
    const response = await this.request('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return response;
  }

  async logout() {
    try {
      await this.request('/logout', { method: 'POST' });
    } catch (error) {
      console.log('Logout error:', error);
    }
  }

  async verifyToken() {
    return await this.request('/verify');
  }

  async getProfile() {
    return await this.request('/profile');
  }

  // Task methods
  async getTasks() {
    return await this.request('/tasks');
  }

  async createTask(taskData) {
    return await this.request('/tasks/new', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async getTask(id) {
    return await this.request(`/tasks/${id}`);
  }

  // Token management - ya no necesitamos estos métodos con cookies httpOnly
  isAuthenticated() {
    // Con cookies httpOnly no podemos verificar desde el cliente
    // Necesitamos hacer una petición al servidor
    return true; // Siempre devolvemos true y dejamos que verifyToken maneje la lógica
  }
}

export default new ApiService();