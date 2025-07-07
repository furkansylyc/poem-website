const API_BASE_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api');

export interface Poem {
  _id: string;
  title: string;
  content: string;
  date: string;
  views: number;
}

export interface Comment {
  _id: string;
  poemId: string | { _id: string; title: string };
  name: string;
  comment: string;
  date: string;
  approved: boolean;
}

export interface LoginResponse {
  token: string;
  message: string;
}

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  resetToken() {
    this.clearToken();
    this.token = localStorage.getItem('token');
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

    // Sadece admin endpoint'leri için token ekle
    const adminEndpoints = [
      '/admin/login',
      '/admin/setup', 
      '/poems', // POST, PUT, DELETE
      '/visits/reset'
    ];
    
    const isAdminEndpoint = adminEndpoints.some(adminEndpoint => endpoint.startsWith(adminEndpoint));
    
    // GET /comments endpoint'i özel durum - sadece admin kullanabilir
    if (endpoint === '/comments' && options.method !== 'POST') {
      if (this.token) {
        config.headers = {
          ...config.headers,
          'Authorization': `Bearer ${this.token}`,
        };
      }
    }
    // Diğer admin endpoint'leri için token ekle
    else if (this.token && isAdminEndpoint) {
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
  async addPoem(title: string, content: string, date?: string): Promise<Poem> {
    return this.request('/poems', {
      method: 'POST',
      body: JSON.stringify({ title, content, date }),
    });
  }

  // Şiir sil
  async deletePoem(id: string): Promise<{ message: string }> {
    return this.request(`/poems/${id}`, {
      method: 'DELETE',
    });
  }

  // Şiir düzenle
  async updatePoem(id: string, title: string, content: string, date?: string): Promise<Poem> {
    return this.request(`/poems/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ title, content, date }),
    });
  }

  // Yorum ekle (herkes yapabilir)
  async addComment(poemId: string, name: string, comment: string): Promise<Comment> {
    return this.request('/comments', {
      method: 'POST',
      body: JSON.stringify({ poemId, name, comment }),
    });
  }

  // Şiir için onaylanmış yorumları getir (herkes görebilir)
  async getPoemComments(poemId: string): Promise<Comment[]> {
    return this.request(`/poems/${poemId}/comments`);
  }

  // Tüm yorumları getir (Sadece admin)
  async getAllComments(): Promise<Comment[]> {
    return this.request('/comments');
  }

  // Yorum onayla/reddet (Sadece admin)
  async approveComment(commentId: string, approved: boolean): Promise<Comment> {
    return this.request(`/comments/${commentId}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ approved }),
    });
  }

  // Yorum sil (Sadece admin)
  async deleteComment(commentId: string): Promise<{ message: string }> {
    return this.request(`/comments/${commentId}`, {
      method: 'DELETE',
    });
  }

  // Ziyaret sayısını getir
  async getVisits(): Promise<{ count: number }> {
    return this.request('/visits');
  }

  // Ziyaret sayısını artır
  async incrementVisits(): Promise<{ count: number }> {
    return this.request('/visits/increment', {
      method: 'POST',
    });
  }

  // Ziyaret sayısını sıfırla (Admin için)
  async resetVisits(): Promise<{ count: number; message: string }> {
    return this.request('/visits/reset', {
      method: 'POST',
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