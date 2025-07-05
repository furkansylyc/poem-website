const API_BASE_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api');

export interface Poem {
  _id: string;
  title: string;
  content: string;
  date: string;
}

export interface LoginResponse {
  token: string;
  message: string;
}

class ApiService {
  private token: string | null = localStorage.getItem('token');

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${this.token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Bir hata oluştu');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Şiirleri getir
  async getPoems(): Promise<Poem[]> {
    return this.request('/poems');
  }

  // Tek şiir getir
  async getPoem(id: string): Promise<Poem> {
    return this.request(`/poems/${id}`);
  }

  // Admin girişi
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await this.request('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  // Şiir ekle
  async addPoem(title: string, content: string): Promise<Poem> {
    return this.request('/poems', {
      method: 'POST',
      body: JSON.stringify({ title, content }),
    });
  }

  // Şiir sil
  async deletePoem(id: string): Promise<{ message: string }> {
    return this.request(`/poems/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin kurulumu (sadece bir kez)
  async setupAdmin(): Promise<{ message: string }> {
    return this.request('/admin/setup', {
      method: 'POST',
    });
  }
}

export const apiService = new ApiService(); 