import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),
  
  register: (userData) =>
    apiClient.post('/auth/register', userData),
  
  getCurrentUser: () =>
    apiClient.get('/auth/me'),
};

// Job Seeker API
export const jobSeekerAPI = {
  getProfile: () =>
    apiClient.get('/jobseeker/profile'),
  
  createProfile: (profileData) =>
    apiClient.post('/jobseeker/profile', profileData),
  
  updateProfile: (profileData) =>
    apiClient.put('/jobseeker/profile', profileData),
  
  getResumes: () =>
    apiClient.get('/jobseeker/resumes'),
  
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/jobseeker/resumes/upload-file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  deleteResume: (resumeId) =>
    apiClient.delete(`/jobseeker/resumes/${resumeId}`),
  
  setPrimaryResume: (resumeId) =>
    apiClient.put(`/jobseeker/resumes/${resumeId}/primary`),
  
  getSkills: () =>
    apiClient.get('/jobseeker/my-skills'),
  
  getAllSkills: () =>
    apiClient.get('/jobseeker/skills'),
  
  addSkill: (skillData) =>
    apiClient.post('/jobseeker/skills/add', skillData),
  
  deleteSkill: (skillId) =>
    apiClient.delete(`/jobseeker/skills/${skillId}`),
  
  getJobs: (filters = {}) =>
    apiClient.get('/jobseeker/jobs', { params: filters }),
  
  getRecommendedJobs: (limit = 10) =>
    apiClient.get('/jobseeker/recommendations', { params: { limit } }),
  
  searchJobs: (query, filters) =>
    apiClient.post('/search/hybrid', { query, ...filters }),
  
  getApplications: () =>
    apiClient.get('/jobseeker/applications'),
  
  applyToJob: (applicationData) =>
    apiClient.post('/jobseeker/applications', applicationData),
  
  getSavedJobs: () =>
    apiClient.get('/jobseeker/jobs/saved'),
  
  saveJob: (jobId) =>
    apiClient.post(`/jobseeker/jobs/${jobId}/save`),
  
  getRecommendations: (limit = 15) =>
    apiClient.get(`/jobseeker/recommendations?limit=${limit}`),
};

// Recruiter API
export const recruiterAPI = {
  getMyJobs: () =>
    apiClient.get('/recruiter/jobs'),
  
  postJob: (jobData) =>
    apiClient.post('/recruiter/jobs', jobData),
  
  createJob: (jobData) =>
    apiClient.post('/recruiter/jobs', jobData),
  
  updateJob: (jobId, jobData) =>
    apiClient.put(`/recruiter/jobs/${jobId}`, jobData),
  
  deleteJob: (jobId) =>
    apiClient.delete(`/recruiter/jobs/${jobId}`),
  
  searchCandidates: (query, limit = 50) =>
    apiClient.get(`/recruiter/users/search?query=${query}&limit=${limit}`),
  
  getCandidateProfile: (userId) =>
    apiClient.get(`/recruiter/users/${userId}`),
  
  getShortlist: (status = null) =>
    apiClient.get('/recruiter/shortlist', { params: { status } }),
  
  addToShortlist: (candidateId, jobId = null, notes = null, matchScore = null) => {
    // Ensure candidateId is an integer
    const params = { 
      candidate_id: parseInt(candidateId)
    };
    
    // Only add optional params if they have values
    if (jobId !== null && jobId !== undefined) {
      params.job_id = parseInt(jobId);
    }
    if (notes !== null && notes !== undefined && notes !== '') {
      params.notes = String(notes);
    }
    if (matchScore !== null && matchScore !== undefined) {
      params.match_score = parseFloat(matchScore);
    }
    
    console.log('addToShortlist params:', params);
    return apiClient.post('/recruiter/shortlist', null, { params });
  },
  
  updateShortlistStatus: (shortlistId, status, notes = null) =>
    apiClient.put(`/recruiter/shortlist/${shortlistId}`, null, { 
      params: { status, notes } 
    }),
  
  removeFromShortlist: (shortlistId) =>
    apiClient.delete(`/recruiter/shortlist/${shortlistId}`),
  
  getApplications: (jobId = null, status = null) =>
    apiClient.get('/recruiter/applications', { params: { job_id: jobId, status } }),
  
  updateApplicationStatus: (applicationId, status) =>
    apiClient.put(`/recruiter/applications/${applicationId}/status?status=${status}`),
};

// Admin API
export const adminAPI = {
  getStatistics: () =>
    apiClient.get('/admin/statistics'),
  
  getUsers: (role = null) =>
    apiClient.get('/admin/users', { params: { role } }),
  
  getAllUsers: (role = null) =>
    apiClient.get('/admin/users', { params: { role } }),
  
  getUserDetails: (userId) =>
    apiClient.get(`/admin/users/${userId}`),
  
  deleteUser: (userId) =>
    apiClient.delete(`/admin/users/${userId}`),
  
  getJobs: (status = null) =>
    apiClient.get('/admin/jobs', { params: { status } }),
  
  getAllJobs: (status = null) =>
    apiClient.get('/admin/jobs', { params: { status } }),
  
  updateJobStatus: (jobId, status) =>
    apiClient.put(`/admin/jobs/${jobId}/status?status=${status}`),
};

export default apiClient;
