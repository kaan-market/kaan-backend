const API_BASE_URL = 'http://localhost:8000';

class ApiService {
    constructor() {
        this.token = localStorage.getItem('token') || '';
    }

    async request(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {}),
            ...options.headers,
        };

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers,
            });

            let data;
            try {
                data = await response.json();
            } catch (e) {
                // If response is not JSON, use the status text
                data = { error: response.statusText || 'Something went wrong' };
            }

            if (!response.ok) {
                throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    clearToken() {
        this.token = '';
        localStorage.removeItem('token');
    }

    // Auth endpoints
    async requestOtp(phone) {
        return this.request('/auth/request-otp', {
            method: 'POST',
            body: JSON.stringify({ phone }),
        });
    }

    async verifyOtp(phone, otp) {
        return this.request('/auth/verify-otp', {
            method: 'POST',
            body: JSON.stringify({ phone, otp }),
        });
    }

    // Profile endpoints
    async createProfile(data) {
        return this.request('/profile', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateProfile(data) {
        return this.request('/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async getProfile() {
        return this.request('/profile');
    }

    async deleteProfile() {
        return this.request('/profile', {
            method: 'DELETE',
        });
    }
}

const api = new ApiService(); 