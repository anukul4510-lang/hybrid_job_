/**
 * Recruiter Dashboard Module
 * Handles recruiter-specific functionality
 */

import { apiClient } from './api-client.js';

let myJobs = [];

/**
 * Show my job postings
 */
async function showMyJobs() {
    const content = document.getElementById('content');
    content.innerHTML = '<h2>My Job Postings</h2>';
    
    const loader = createLoader();
    content.appendChild(loader);
    
    try {
        myJobs = await apiClient.getMyJobs();
        
        if (!myJobs || myJobs.length === 0) {
            content.innerHTML = `
                <h2>My Job Postings</h2>
                <p>You haven't posted any jobs yet.</p>
                <button class="btn btn-primary" onclick="showCreateJob()">Create Your First Job</button>
            `;
            return;
        }
        
        const jobsHTML = myJobs.map(job => `
            <div class="job-card">
                <h3>${job.title}</h3>
                <p class="company">${job.company}</p>
                <p class="location">📍 ${job.location || 'Remote'}</p>
                <p>Status: <strong>${job.status}</strong></p>
                <p>Posted: ${formatDate(job.posted_date)}</p>
                <div class="actions">
                    <button class="btn btn-primary" data-job-id="${job.id}" onclick="viewApplications(this.dataset.jobId)">View Applications</button>
                    <button class="btn btn-secondary" data-job-id="${job.id}" onclick="editJob(this.dataset.jobId)">Edit</button>
                    <button class="btn btn-danger" data-job-id="${job.id}" onclick="deleteJob(this.dataset.jobId)">Delete</button>
                </div>
            </div>
        `).join('');
        
        content.innerHTML = '<h2>My Job Postings</h2>' + jobsHTML;
    } catch (error) {
        content.innerHTML = '<div class="error-message">Failed to load jobs: ' + error.message + '</div>';
    }
}

/**
 * Show create job form
 */
function showCreateJob() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <h2>Create New Job Posting</h2>
        <form id="create-job-form" class="profile-form">
            <div class="form-group">
                <label>Job Title:</label>
                <input type="text" id="job-title" required>
            </div>
            <div class="form-group">
                <label>Company:</label>
                <input type="text" id="company" required>
            </div>
            <div class="form-group">
                <label>Location:</label>
                <input type="text" id="location">
            </div>
            <div class="form-group">
                <label>Employment Type:</label>
                <select id="employment-type">
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                </select>
            </div>
            <div class="form-group">
                <label>Min Salary:</label>
                <input type="number" id="min-salary">
            </div>
            <div class="form-group">
                <label>Max Salary:</label>
                <input type="number" id="max-salary">
            </div>
            <div class="form-group full-width">
                <label>Description:</label>
                <textarea id="description" rows="10" required></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Create Job</button>
        </form>
    `;
    
    document.getElementById('create-job-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await createJob();
    });
}

/**
 * Create job
 */
async function createJob() {
    const jobData = {
        title: document.getElementById('job-title').value,
        company: document.getElementById('company').value,
        location: document.getElementById('location').value,
        employment_type: document.getElementById('employment-type').value,
        description: document.getElementById('description').value,
        min_salary: document.getElementById('min-salary').value ? parseFloat(document.getElementById('min-salary').value) : null,
        max_salary: document.getElementById('max-salary').value ? parseFloat(document.getElementById('max-salary').value) : null,
        required_skills: []
    };
    
    try {
        await apiClient.createJob(jobData);
        showSuccess('Job created successfully!', document.getElementById('content'));
        showMyJobs();
    } catch (error) {
        showError('Failed to create job: ' + error.message, document.getElementById('content'));
    }
}

/**
 * View applications for a job
 */
async function viewApplications(jobId) {
    const content = document.getElementById('content');
    content.innerHTML = '<h2>Applications</h2>';
    
    const loader = createLoader();
    content.appendChild(loader);
    
    try {
        const applications = await apiClient.getJobApplications(jobId);
        
        if (!applications || applications.length === 0) {
            content.innerHTML = '<p>No applications yet.</p>';
            return;
        }
        
        const appsHTML = applications.map(app => `
            <div class="job-card">
                <h3>${app.first_name} ${app.last_name}</h3>
                <p>Email: ${app.email}</p>
                <p>Status: <strong>${app.status}</strong></p>
                <p>Applied: ${formatDate(app.applied_date)}</p>
                <div class="actions">
                    <button class="btn btn-success" onclick="updateAppStatus(${app.id}, 'shortlisted')">Shortlist</button>
                    <button class="btn btn-danger" onclick="updateAppStatus(${app.id}, 'rejected')">Reject</button>
                </div>
            </div>
        `).join('');
        
        content.innerHTML = '<h2>Applications</h2>' + appsHTML;
    } catch (error) {
        content.innerHTML = '<div class="error-message">Failed to load applications: ' + error.message + '</div>';
    }
}

/**
 * Update application status
 */
async function updateAppStatus(applicationId, status) {
    try {
        await apiClient.updateApplicationStatus(applicationId, status);
        showSuccess('Application status updated!', document.getElementById('content'));
    } catch (error) {
        showError('Failed to update status: ' + error.message, document.getElementById('content'));
    }
}

/**
 * Edit job
 */
function editJob(jobId) {
    // Similar to create job, but with pre-filled values
    showCreateJob();
    alert('Edit functionality coming soon. Please create a new job posting.');
}

/**
 * Delete job
 */
async function deleteJob(jobId) {
    if (!confirm('Are you sure you want to delete this job?')) {
        return;
    }
    
    try {
        await apiClient.deleteJob(jobId);
        showSuccess('Job deleted successfully!', document.getElementById('content'));
        showMyJobs();
    } catch (error) {
        showError('Failed to delete job: ' + error.message, document.getElementById('content'));
    }
}

/**
 * Show applications
 */
async function showApplications() {
    const content = document.getElementById('content');
    content.innerHTML = '<h2>All Applications</h2>';
    
    const loader = createLoader();
    content.appendChild(loader);
    
    try {
        myJobs = await apiClient.getMyJobs();
        const allApps = [];
        
        for (const job of myJobs) {
            try {
                const apps = await apiClient.getJobApplications(job.id);
                allApps.push(...apps);
            } catch (error) {
                console.error(`Error fetching applications for job ${job.id}:`, error);
            }
        }
        
        if (!allApps || allApps.length === 0) {
            content.innerHTML = '<p>No applications yet.</p>';
            return;
        }
        
        content.innerHTML = '<h2>All Applications</h2>';
        for (const app of allApps) {
            const appHTML = document.createElement('div');
            appHTML.className = 'job-card';
            appHTML.innerHTML = `
                <h3>${app.first_name} ${app.last_name}</h3>
                <p>Email: ${app.email}</p>
                <p>Status: <strong>${app.status}</strong></p>
            `;
            content.appendChild(appHTML);
        }
    } catch (error) {
        content.innerHTML = '<div class="error-message">Failed to load applications: ' + error.message + '</div>';
    }
}

// Make functions globally available
window.showMyJobs = showMyJobs;
window.showCreateJob = showCreateJob;
window.viewApplications = viewApplications;
window.updateAppStatus = updateAppStatus;
window.editJob = editJob;
window.deleteJob = deleteJob;
window.showApplications = showApplications;
window.createJob = createJob;

