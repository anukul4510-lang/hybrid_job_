/**
 * API Client Module
 * Handles all HTTP requests to the backend API
 */

// Use the same protocol and host as the frontend to avoid CORS issues
const API_BASE_URL = window.location.hostname === '127.0.0.1' 
    ? 'http://127.0.0.1:8000/api' 
    : 'http://localhost:8000/api';

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
                // Handle 401 Unauthorized - redirect to login
                if (response.status === 401) {
                    console.error('Authentication failed. Redirecting to login...');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user_email');
                    localStorage.removeItem('user_role');
                    window.location.href = 'index.html';
                    return;
                }
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
        return this.request(`/recruiter/applications/${applicationId}/status?status=${status}`, {
            method: 'PUT',
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
        return this.request(`/jobseeker/recommendations?limit=${limit}`);
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

    // Resume endpoints - upload file
    async uploadResumeFile(title, file) {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('file', file);
        
        const url = `${API_BASE_URL}/jobseeker/resumes/upload-file`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.getToken()}`,
            },
            body: formData,
        });
        
        const data = await response.json();
        if (!response.ok) {
            if (response.status === 401) {
                console.error('Authentication failed. Redirecting to login...');
                this.removeToken();
                window.location.href = 'index.html';
                return;
            }
            throw new Error(data.detail || `HTTP ${response.status}`);
        }
        return data;
    }

    // Resume endpoints - add by URL
    async addResumeByUrl(title, fileUrl) {
        return this.request('/jobseeker/resumes/add-url', {
            method: 'POST',
            body: JSON.stringify({ title, file_url: fileUrl }),
        });
    }

    // Resume endpoints - build from structured data
    async buildResume(resumeData) {
        return this.request('/jobseeker/resumes/build', {
            method: 'POST',
            body: JSON.stringify(resumeData),
        });
    }

    async getResumes() {
        return this.request('/jobseeker/resumes');
    }

    async updateResume(resumeId, title, content) {
        const params = new URLSearchParams();
        if (title) params.append('title', title);
        if (content) params.append('content', content);
        return this.request(`/jobseeker/resumes/${resumeId}?${params}`, {
            method: 'PUT',
        });
    }

    async deleteResume(resumeId) {
        return this.request(`/jobseeker/resumes/${resumeId}`, {
            method: 'DELETE',
        });
    }

    async setPrimaryResume(resumeId) {
        return this.request(`/jobseeker/resumes/${resumeId}/primary`, {
            method: 'PUT',
        });
    }

    // Skill recommendations
    async getSkillRecommendations(query, limit = 10) {
        const params = new URLSearchParams({ limit });
        if (query) params.append('query', query);
        return this.request(`/jobseeker/skills/recommendations?${params}`);
    }

    async createSkill(skillName) {
        const params = new URLSearchParams({ skill_name: skillName });
        return this.request(`/jobseeker/skills/create?${params}`, {
            method: 'POST',
        });
    }

    // Application search
    async searchApplications(status, company) {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (company) params.append('company', company);
        return this.request(`/jobseeker/applications/search?${params}`);
    }

    // Recruiter user search
    async searchCandidates(query, location, minExperience, limit = 20) {
        const params = new URLSearchParams({ query, limit });
        if (location) params.append('location', location);
        if (minExperience) params.append('min_experience', minExperience);
        return this.request(`/recruiter/users/search?${params}`);
    }

    async getCandidateProfile(userId) {
        return this.request(`/recruiter/users/${userId}`);
    }

    // Shortlist management
    async addToShortlist(candidateId, jobId, matchScore, notes) {
        const params = new URLSearchParams({ candidate_id: candidateId });
        if (jobId) params.append('job_id', jobId);
        if (matchScore) params.append('match_score', matchScore);
        if (notes) params.append('notes', notes);
        return this.request(`/recruiter/shortlist?${params}`, {
            method: 'POST',
        });
    }

    async getShortlist(status) {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        return this.request(`/recruiter/shortlist?${params}`);
    }

    async updateShortlistStatus(shortlistId, status, notes) {
        const params = new URLSearchParams({ status });
        if (notes) params.append('notes', notes);
        return this.request(`/recruiter/shortlist/${shortlistId}?${params}`, {
            method: 'PUT',
        });
    }

    async removeFromShortlist(shortlistId) {
        return this.request(`/recruiter/shortlist/${shortlistId}`, {
            method: 'DELETE',
        });
    }

    // Admin endpoints
    async getAllUsers(limit = 100, offset = 0) {
        return this.request(`/admin/users?limit=${limit}&offset=${offset}`);
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

    async updateUserStatus(userId, action) {
        const params = new URLSearchParams({ action });
        return this.request(`/admin/users/${userId}/status?${params}`, {
            method: 'PUT',
        });
    }

    async deleteUser(userId) {
        return this.request(`/admin/users/${userId}`, {
            method: 'DELETE',
        });
    }

    async getAdminLogs(limit = 100) {
        return this.request(`/admin/logs?limit=${limit}`);
    }

    async getAllJobsAdmin() {
        return this.request('/admin/jobs');
    }

    async deleteJobAdmin(jobId) {
        return this.request(`/admin/jobs/${jobId}`, {
            method: 'DELETE',
        });
    }
}

// Export singleton instance
export const apiClient = new ApiClient();

