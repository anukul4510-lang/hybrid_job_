/**
 * API Client Module
 * Handles all HTTP requests to the backend API
 */

const API_BASE_URL = 'http://localhost:8000/api';

class ApiClient {
    /**
     * Get authentication token from localStorage
     * @returns {string|null} JWT token
     */
    getToken() {
        return localStorage.getItem('token');
    }

    /**
     * Save authentication token to localStorage
     * @param {string} token - JWT token
     */
    setToken(token) {
        localStorage.setItem('token', token);
    }

    /**
     * Remove authentication token
     */
    removeToken() {
        localStorage.removeItem('token');
    }

    /**
     * Get request headers with authentication
     * @returns {Object} Headers object
     */
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };
        
        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    }

    /**
     * Make HTTP request
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Fetch options
     * @returns {Promise} Response data
     */
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...this.getHeaders(),
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || `HTTP ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Authentication endpoints
    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    async login(credentials) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    }

    async getCurrentUser() {
        return this.request('/auth/me');
    }

    // Job Seeker endpoints
    async createProfile(profileData) {
        return this.request('/jobseeker/profile', {
            method: 'POST',
            body: JSON.stringify(profileData),
        });
    }

    async getProfile() {
        return this.request('/jobseeker/profile');
    }

    async updateProfile(profileData) {
        return this.request('/jobseeker/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData),
        });
    }

    async getJobs(filters = {}, limit = 50) {
        const params = new URLSearchParams({ limit });
        for (const [key, value] of Object.entries(filters)) {
            if (value) params.append(key, value);
        }
        return this.request(`/jobseeker/jobs?${params}`);
    }

    async applyToJob(applicationData) {
        return this.request('/jobseeker/applications', {
            method: 'POST',
            body: JSON.stringify(applicationData),
        });
    }

    async getMyApplications() {
        return this.request('/jobseeker/applications');
    }

    async saveJob(jobId) {
        return this.request('/jobseeker/jobs/save', {
            method: 'POST',
            body: JSON.stringify({ job_id: jobId }),
        });
    }

    async getSavedJobs() {
        return this.request('/jobseeker/jobs/saved');
    }

    async getRecommendations(limit = 10) {
        return this.request(`/jobseeker/recommendations?limit=${limit}`);
    }

    // Recruiter endpoints
    async createJob(jobData) {
        return this.request('/recruiter/jobs', {
            method: 'POST',
            body: JSON.stringify(jobData),
        });
    }

    async getMyJobs() {
        return this.request('/recruiter/jobs');
    }

    async updateJob(jobId, jobData) {
        return this.request(`/recruiter/jobs/${jobId}`, {
            method: 'PUT',
            body: JSON.stringify(jobData),
        });
    }

    async deleteJob(jobId) {
        return this.request(`/recruiter/jobs/${jobId}`, {
            method: 'DELETE',
        });
    }

    async getJobApplications(jobId) {
        return this.request(`/recruiter/jobs/${jobId}/applications`);
    }

    async updateApplicationStatus(applicationId, status) {
        return this.request(`/recruiter/applications/${applicationId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
    }

    // Search endpoints
    async hybridSearch(query, filters = {}, limit = 10) {
        return this.request('/search/hybrid', {
            method: 'POST',
            body: JSON.stringify({ query, filters, limit }),
        });
    }

    async getJobRecommendations(limit = 10) {
        return this.request(`/search/recommendations?limit=${limit}`);
    }

    // Skills endpoints
    async getAllSkills() {
        return this.request('/jobseeker/skills');
    }

    async addSkill(skillId, proficiencyLevel = 'intermediate') {
        return this.request('/jobseeker/skills', {
            method: 'POST',
            body: JSON.stringify({ skill_id: skillId, proficiency_level: proficiencyLevel }),
        });
    }

    async getMySkills() {
        return this.request('/jobseeker/my-skills');
    }

    async removeSkill(skillId) {
        return this.request(`/jobseeker/skills/${skillId}`, {
            method: 'DELETE',
        });
    }

    // Admin endpoints
    async getAllUsers() {
        return this.request('/admin/users');
    }

    async getStats() {
        return this.request('/admin/stats');
    }

    async updateUserRole(userId, newRole) {
        return this.request(`/admin/users/${userId}/role`, {
            method: 'PUT',
            body: JSON.stringify({ new_role: newRole }),
        });
    }
}

// Export singleton instance
export const apiClient = new ApiClient();

