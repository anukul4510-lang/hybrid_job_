/**
 * Job Seeker Dashboard Module
 * Handles jobseeker-specific functionality
 */

import { apiClient } from './api-client.js';

let currentProfile = null;
let allJobs = [];

/**
 * Show profile section
 */
async function showProfile() {
    const content = document.getElementById('content');
    content.innerHTML = '<h2>My Profile</h2>';
    
    const loader = createLoader();
    content.appendChild(loader);
    
    try {
        currentProfile = await apiClient.getProfile();
        
        const profileHTML = `
            <div class="profile-form">
                <div class="form-group">
                    <label>First Name:</label>
                    <input type="text" id="first-name" value="${currentProfile?.first_name || ''}">
                </div>
                <div class="form-group">
                    <label>Last Name:</label>
                    <input type="text" id="last-name" value="${currentProfile?.last_name || ''}">
                </div>
                <div class="form-group">
                    <label>Phone:</label>
                    <input type="text" id="phone" value="${currentProfile?.phone || ''}">
                </div>
                <div class="form-group">
                    <label>Location:</label>
                    <input type="text" id="location" value="${currentProfile?.location || ''}">
                </div>
                <div class="form-group full-width">
                    <label>Bio:</label>
                    <textarea id="bio" rows="5">${currentProfile?.bio || ''}</textarea>
                </div>
                <button class="btn btn-primary" onclick="updateProfile()">Update Profile</button>
            </div>
        `;
        
        content.innerHTML = profileHTML;
    } catch (error) {
        // Profile doesn't exist yet, show create profile form
        const createProfileHTML = `
            <div class="profile-form">
                <p class="info-message">Complete your profile to get started!</p>
                <div class="form-group">
                    <label>First Name:</label>
                    <input type="text" id="first-name" placeholder="Enter your first name">
                </div>
                <div class="form-group">
                    <label>Last Name:</label>
                    <input type="text" id="last-name" placeholder="Enter your last name">
                </div>
                <div class="form-group">
                    <label>Phone:</label>
                    <input type="text" id="phone" placeholder="Enter your phone number">
                </div>
                <div class="form-group">
                    <label>Location:</label>
                    <input type="text" id="location" placeholder="e.g., San Francisco, CA">
                </div>
                <div class="form-group full-width">
                    <label>Bio:</label>
                    <textarea id="bio" rows="5" placeholder="Tell us about yourself..."></textarea>
                </div>
                <button class="btn btn-primary" onclick="createProfile()">Create Profile</button>
            </div>
        `;
        
        content.innerHTML = createProfileHTML;
    }
}

/**
 * Create new profile
 */
async function createProfile() {
    const profileData = {
        first_name: document.getElementById('first-name').value,
        last_name: document.getElementById('last-name').value,
        phone: document.getElementById('phone').value,
        location: document.getElementById('location').value,
        bio: document.getElementById('bio').value
    };
    
    try {
        await apiClient.createProfile(profileData);
        showSuccess('Profile created successfully!', document.getElementById('content'));
        // Reload profile view
        await showProfile();
    } catch (error) {
        showError('Failed to create profile: ' + error.message, document.getElementById('content'));
    }
}

/**
 * Update profile
 */
async function updateProfile() {
    const profileData = {
        first_name: document.getElementById('first-name').value,
        last_name: document.getElementById('last-name').value,
        phone: document.getElementById('phone').value,
        location: document.getElementById('location').value,
        bio: document.getElementById('bio').value
    };
    
    try {
        await apiClient.updateProfile(profileData);
        showSuccess('Profile updated successfully!', document.getElementById('content'));
    } catch (error) {
        showError('Failed to update profile: ' + error.message, document.getElementById('content'));
    }
}

/**
 * Browse jobs
 */
async function showBrowseJobs() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <h2>Browse Jobs</h2>
        <div class="search-bar">
            <input type="text" id="job-search" placeholder="Search for jobs...">
            <button class="btn btn-primary" onclick="searchJobs()">Search</button>
        </div>
        <div id="jobs-grid"></div>
    `;
    
    try {
        allJobs = await apiClient.getJobs();
        displayJobs(allJobs);
        
        // Add search functionality
        document.getElementById('job-search').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchJobs();
            }
        });
    } catch (error) {
        showError('Failed to load jobs: ' + error.message, content);
    }
}

/**
 * Search jobs
 */
async function searchJobs() {
    const query = document.getElementById('job-search').value;
    const jobsGrid = document.getElementById('jobs-grid');
    
    if (!query) {
        displayJobs(allJobs);
        return;
    }
    
    try {
        const results = await apiClient.hybridSearch(query, {}, 20);
        displayJobs(results.results);
    } catch (error) {
        showError('Search failed: ' + error.message, document.getElementById('content'));
    }
}

/**
 * Display jobs in grid
 */
function displayJobs(jobs) {
    const jobsGrid = document.getElementById('jobs-grid');
    
    if (!jobs || jobs.length === 0) {
        jobsGrid.innerHTML = '<p>No jobs found.</p>';
        return;
    }
    
    jobsGrid.innerHTML = jobs.map(job => `
        <div class="job-card">
            <h3>${job.title}</h3>
            <p class="company">${job.company}</p>
            <p class="location">📍 ${job.location || 'Remote'}</p>
            <p class="description">${job.description}</p>
            <div class="actions">
                <button class="btn btn-primary" onclick="applyToJob(${job.id})">Apply</button>
                <button class="btn btn-secondary" onclick="saveJob(${job.id})">Save</button>
            </div>
        </div>
    `).join('');
}

/**
 * Apply to a job
 */
async function applyToJob(jobId) {
    try {
        await apiClient.applyToJob({ job_id: jobId });
        showSuccess('Application submitted successfully!', document.getElementById('content'));
    } catch (error) {
        showError('Failed to apply: ' + error.message, document.getElementById('content'));
    }
}

/**
 * Save a job
 */
async function saveJob(jobId) {
    try {
        await apiClient.saveJob(jobId);
        showSuccess('Job saved!', document.getElementById('content'));
    } catch (error) {
        showError('Failed to save job: ' + error.message, document.getElementById('content'));
    }
}

/**
 * Show my applications
 */
async function showMyApplications() {
    const content = document.getElementById('content');
    content.innerHTML = '<h2>My Applications</h2>';
    
    const loader = createLoader();
    content.appendChild(loader);
    
    try {
        const applications = await apiClient.getMyApplications();
        
        if (!applications || applications.length === 0) {
            content.innerHTML = '<p>You have no applications yet.</p>';
            return;
        }
        
        const appsHTML = applications.map(app => `
            <div class="job-card">
                <h3>${app.job_title}</h3>
                <p class="company">${app.company}</p>
                <p>Status: <strong>${app.status}</strong></p>
                <p>Applied on: ${formatDate(app.applied_date)}</p>
            </div>
        `).join('');
        
        content.innerHTML = '<h2>My Applications</h2>' + appsHTML;
    } catch (error) {
        content.innerHTML = '<div class="error-message">Failed to load applications: ' + error.message + '</div>';
    }
}

/**
 * Show saved jobs
 */
async function showSavedJobs() {
    const content = document.getElementById('content');
    content.innerHTML = '<h2>Saved Jobs</h2>';
    
    const loader = createLoader();
    content.appendChild(loader);
    
    try {
        const savedJobs = await apiClient.getSavedJobs();
        
        if (!savedJobs || savedJobs.length === 0) {
            content.innerHTML = '<p>You have no saved jobs.</p>';
            return;
        }
        
        const jobsHTML = savedJobs.map(job => `
            <div class="job-card">
                <h3>${job.job_title}</h3>
                <p class="company">${job.company}</p>
                <div class="actions">
                    <button class="btn btn-primary" onclick="applyToJob(${job.job_id})">Apply Now</button>
                </div>
            </div>
        `).join('');
        
        content.innerHTML = '<h2>Saved Jobs</h2>' + jobsHTML;
    } catch (error) {
        content.innerHTML = '<div class="error-message">Failed to load saved jobs: ' + error.message + '</div>';
    }
}

/**
 * Show skills management
 */
async function showSkills() {
    const content = document.getElementById('content');
    content.innerHTML = '<h2>My Skills</h2>';
    
    const loader = createLoader();
    content.appendChild(loader);
    
    try {
        const [allSkills, mySkills] = await Promise.all([
            apiClient.getAllSkills(),
            apiClient.getMySkills()
        ]);
        
        const mySkillsIds = new Set(mySkills.map(s => s.skill_id));
        const availableSkills = allSkills.filter(s => !mySkillsIds.has(s.id));
        
        content.innerHTML = `
            <h2>My Skills</h2>
            <div>
                <h3>Current Skills:</h3>
                ${mySkills.length > 0 ? mySkills.map(skill => `
                    <div class="job-card">
                        <span>${skill.skill_name} - ${skill.proficiency_level}</span>
                        <button class="btn btn-danger" onclick="removeSkill(${skill.skill_id})">Remove</button>
                    </div>
                `).join('') : '<p>No skills added yet.</p>'}
            </div>
            <div style="margin-top: 20px;">
                <h3>Add Skill:</h3>
                <select id="skill-select">
                    ${availableSkills.map(skill => `<option value="${skill.id}">${skill.name}</option>`).join('')}
                </select>
                <button class="btn btn-primary" onclick="addSkill()">Add Skill</button>
            </div>
        `;
    } catch (error) {
        content.innerHTML = '<div class="error-message">Failed to load skills: ' + error.message + '</div>';
    }
}

/**
 * Add skill
 */
async function addSkill() {
    const skillId = document.getElementById('skill-select').value;
    try {
        await apiClient.addSkill(parseInt(skillId));
        showSuccess('Skill added successfully!', document.getElementById('content'));
        showSkills();
    } catch (error) {
        showError('Failed to add skill: ' + error.message, document.getElementById('content'));
    }
}

/**
 * Remove skill
 */
async function removeSkill(skillId) {
    try {
        await apiClient.removeSkill(skillId);
        showSuccess('Skill removed successfully!', document.getElementById('content'));
        showSkills();
    } catch (error) {
        showError('Failed to remove skill: ' + error.message, document.getElementById('content'));
    }
}

/**
 * Show AI recommendations
 */
async function showRecommendations() {
    const content = document.getElementById('content');
    content.innerHTML = '<h2>AI Job Recommendations</h2>';
    
    const loader = createLoader();
    content.appendChild(loader);
    
    try {
        const recommendations = await apiClient.getJobRecommendations();
        
        if (!recommendations || recommendations.length === 0) {
            content.innerHTML = '<p>No recommendations available. Add skills to your profile for better recommendations.</p>';
            return;
        }
        
        const jobsHTML = recommendations.map(job => `
            <div class="job-card">
                <h3>${job.title}</h3>
                <p class="company">${job.company}</p>
                <p class="location">📍 ${job.location || 'Remote'}</p>
                <p class="description">${job.description}</p>
                <div class="actions">
                    <button class="btn btn-primary" onclick="applyToJob(${job.id})">Apply</button>
                    <button class="btn btn-secondary" onclick="saveJob(${job.id})">Save</button>
                </div>
            </div>
        `).join('');
        
        content.innerHTML = '<h2>AI Job Recommendations</h2>' + jobsHTML;
    } catch (error) {
        content.innerHTML = '<div class="error-message">Failed to load recommendations: ' + error.message + '</div>';
    }
}

// Make functions globally available
window.showProfile = showProfile;
window.showBrowseJobs = showBrowseJobs;
window.searchJobs = searchJobs;
window.showMyApplications = showMyApplications;
window.showSavedJobs = showSavedJobs;
window.showSkills = showSkills;
window.showRecommendations = showRecommendations;
window.createProfile = createProfile;
window.updateProfile = updateProfile;
window.applyToJob = applyToJob;
window.saveJob = saveJob;
window.addSkill = addSkill;
window.removeSkill = removeSkill;

