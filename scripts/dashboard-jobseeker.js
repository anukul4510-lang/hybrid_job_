/**
 * Job Seeker Dashboard Module
 * Handles jobseeker-specific functionality
 */

import { apiClient } from './api-client.js';

let currentProfile = null;
let allJobs = [];

/**
 * Show home/welcome screen
 */
function showHome() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="welcome-hero">
            <div class="welcome-icon">🚀</div>
            <h1 class="welcome-title">
                <span class="gradient-text">Welcome to Your Dashboard</span>
            </h1>
            <p class="welcome-subtitle">
                Your career journey starts here! Manage your profile, explore opportunities, and connect with your dream job.
            </p>
            
            <div class="welcome-quick-actions">
                <div class="quick-action-card" onclick="showProfile()">
                    <div class="action-icon">👤</div>
                    <h3>Complete Profile</h3>
                    <p>Add your details</p>
                </div>
                <div class="quick-action-card" onclick="showSkills()">
                    <div class="action-icon">🎯</div>
                    <h3>Build Skills</h3>
                    <p>Enhance your profile</p>
                </div>
                <div class="quick-action-card" onclick="showBrowseJobs()">
                    <div class="action-icon">🔍</div>
                    <h3>Browse Jobs</h3>
                    <p>Find opportunities</p>
                </div>
                <div class="quick-action-card" onclick="showRecommendations()">
                    <div class="action-icon">✨</div>
                    <h3>AI Matches</h3>
                    <p>Get recommendations</p>
                </div>
            </div>
        </div>
    `;
}

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
        
        // Fetch email if not included in profile (for older profiles)
        if (!currentProfile.email) {
            try {
                const currentUser = await apiClient.getCurrentUser();
                currentProfile.email = currentUser.email || '';
            } catch (e) {
                console.warn('Could not fetch email:', e);
            }
        }
        
        const profileHTML = `
            <div class="profile-form">
                <div class="form-group">
                    <label>Email:</label>
                    <input type="email" id="email" value="${currentProfile?.email || ''}" disabled 
                           style="background-color: #f5f5f5; cursor: not-allowed;" 
                           title="Email cannot be changed. It was set during registration.">
                    <small style="color: #666; display: block; margin-top: 5px;">Email is from your registration and cannot be changed</small>
                </div>
                <div class="form-group">
                    <label>First Name: <span class="required-star">*</span></label>
                    <input type="text" id="first-name" value="${currentProfile?.first_name || ''}" required>
                </div>
                <div class="form-group">
                    <label>Last Name: <span class="required-star">*</span></label>
                    <input type="text" id="last-name" value="${currentProfile?.last_name || ''}" required>
                </div>
                <div class="form-group">
                    <label>Phone: <span class="required-star">*</span></label>
                    <input type="text" id="phone" value="${currentProfile?.phone || ''}" disabled required style="background-color: #f5f5f5; cursor: not-allowed;" title="Phone is from your registration and cannot be changed">
                    <small style="color: #666; display: block; margin-top: 5px;">Phone is from registration and cannot be changed</small>
                </div>
                <div class="form-group">
                    <label>Location: <span class="required-star">*</span></label>
                    <input type="text" id="location" value="${currentProfile?.location || ''}" placeholder="e.g., San Francisco, CA" required>
                </div>
                <div class="form-group full-width">
                    <label>Address: <span class="required-star">*</span></label>
                    <textarea id="address" rows="3" placeholder="Enter your full address (street, city, state, zip)" required>${currentProfile?.address || ''}</textarea>
                </div>
                <div class="form-group full-width">
                    <label>Job of Choice: <span class="required-star">*</span></label>
                    <input type="text" id="job-of-choice" value="${currentProfile?.job_of_choice || ''}" placeholder="e.g., Software Engineer, Data Analyst, Marketing Manager" required>
                    <small style="color: #666; display: block; margin-top: 5px;">What type of job are you looking for?</small>
                </div>
                <div class="form-group full-width">
                    <label>Bio:</label>
                    <textarea id="bio" rows="5" placeholder="Tell us about yourself, your experience, and career goals...">${currentProfile?.bio || ''}</textarea>
                </div>
                <button type="button" class="btn btn-primary" onclick="updateProfile()">Update Profile</button>
            </div>
        `;
        
        content.innerHTML = profileHTML;
    } catch (error) {
        // Profile doesn't exist yet, show create profile form
        const createProfileHTML = `
            <div class="profile-form">
                <div class="form-group">
                    <label>Email:</label>
                    <input type="email" id="email" disabled 
                           style="background-color: #f5f5f5; cursor: not-allowed;" 
                           title="Email is from your registration">
                    <small style="color: #666; display: block; margin-top: 5px;">Email from registration (cannot be changed)</small>
                </div>
                <div class="form-group">
                    <label>First Name: <span class="required-star">*</span></label>
                    <input type="text" id="first-name" placeholder="Enter your first name" required>
                </div>
                <div class="form-group">
                    <label>Last Name: <span class="required-star">*</span></label>
                    <input type="text" id="last-name" placeholder="Enter your last name" required>
                </div>
                <div class="form-group">
                    <label>Phone: <span class="required-star">*</span></label>
                    <input type="text" id="phone" value="${currentProfile?.phone || ''}" disabled required style="background-color: #f5f5f5; cursor: not-allowed;" title="Phone is from your registration and cannot be changed">
                    <small style="color: #666; display: block; margin-top: 5px;">Phone is from registration and cannot be changed</small>
                </div>
                <div class="form-group">
                    <label>Location: <span class="required-star">*</span></label>
                    <input type="text" id="location" placeholder="e.g., San Francisco, CA" required>
                </div>
                <div class="form-group full-width">
                    <label>Address: <span class="required-star">*</span></label>
                    <textarea id="address" rows="3" placeholder="Enter your full address (street, city, state, zip)" required></textarea>
                </div>
                <div class="form-group full-width">
                    <label>Job of Choice: <span class="required-star">*</span></label>
                    <input type="text" id="job-of-choice" placeholder="e.g., Software Engineer, Data Analyst, Marketing Manager" required>
                    <small style="color: #666; display: block; margin-top: 5px;">What type of job are you looking for?</small>
                </div>
                <div class="form-group full-width">
                    <label>Bio:</label>
                    <textarea id="bio" rows="5" placeholder="Tell us about yourself, your experience, and career goals..."></textarea>
                </div>
                <button type="button" class="btn btn-primary" onclick="createProfile()">Create Profile</button>
            </div>
        `;
        
        content.innerHTML = createProfileHTML;
        
        // Pre-fill email and phone in create form
        try {
            const currentUser = await apiClient.getCurrentUser();
            const emailInput = document.getElementById('email');
            if (emailInput && currentUser.email) {
                emailInput.value = currentUser.email;
            }
            
            // Try to get phone from profile or user data
            try {
                const profile = await apiClient.getProfile();
                const phoneInput = document.getElementById('phone');
                if (phoneInput && profile.phone) {
                    phoneInput.value = profile.phone;
                }
            } catch (e) {
                // Profile doesn't exist yet - phone will be set from registration data
                console.warn('Could not fetch phone for create form:', e);
            }
        } catch (e) {
            console.warn('Could not fetch user data for create form:', e);
        }
    }
}

/**
 * Create new profile
 */
async function createProfile() {
    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    const phone = document.getElementById('phone').value.trim(); // use the disabled value as is
    const location = document.getElementById('location').value.trim();
    const address = document.getElementById('address').value.trim();
    const jobOfChoice = document.getElementById('job-of-choice').value.trim();
    const bio = document.getElementById('bio').value.trim();

    if (!firstName || !lastName || !phone || !location || !address || !jobOfChoice) {
        alert('Please fill in all required fields (all except bio).');
        return;
    }

    const profileData = {
        first_name: firstName,
        last_name: lastName,
        phone: phone, // use the disabled value as is
        location: location,
        address: address,
        job_of_choice: jobOfChoice,
        bio: bio
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
    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    const phone = document.getElementById('phone').value.trim(); // use the disabled value as is
    const location = document.getElementById('location').value.trim();
    const address = document.getElementById('address').value.trim();
    const jobOfChoice = document.getElementById('job-of-choice').value.trim();
    const bio = document.getElementById('bio').value.trim();

    if (!firstName || !lastName || !phone || !location || !address || !jobOfChoice) {
        alert('Please fill in all required fields (all except bio).');
        return;
    }

    const profileData = {
        first_name: firstName,
        last_name: lastName,
        phone: phone, // use the disabled value as is
        location: location,
        address: address,
        job_of_choice: jobOfChoice,
        bio: bio
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
        <div class="job-search-bar">
            <input type="text" id="job-search" placeholder="Search for jobs...">
            <button type="button" class="job-search-btn" onclick="searchJobs()">Search</button>
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
    
    jobsGrid.innerHTML = jobs.map(job => {
        const recruiterEmail = job.recruiter_email || '';
        const companyName = job.recruiter_company_name || job.company || 'Company';
        const jobTitle = job.title || 'Job Position';
        
        // Create mailto link with subject and body
        const subject = encodeURIComponent(`Inquiry about ${jobTitle} position at ${companyName}`);
        const body = encodeURIComponent(`Hello,\n\nI am interested in the ${jobTitle} position at ${companyName}. Please let me know if there are any questions about my application.\n\nThank you,\n[Your Name]`);
        const gmailUrl = recruiterEmail ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recruiterEmail)}&su=${subject}&body=${body}` : '#';
        
        return `
        <div class="job-card">
            <h3>${job.title}</h3>
            <p class="company">${job.company}</p>
            <p class="location">📍 ${job.location || 'Remote'}</p>
            <p class="description">${job.description}</p>
            <div class="actions">
                <button class="btn btn-primary" onclick="applyToJob(${job.id})">Apply</button>
                <button class="btn btn-secondary" onclick="saveJob(${job.id})">Save</button>
                ${recruiterEmail ? `<a href="${gmailUrl}" target="_blank" class="btn" style="background: #EA4335; color: white; text-decoration: none; display: inline-block; padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; transition: all 0.3s ease;">
                    ✉️ Contact via Gmail
                </a>` : ''}
            </div>
        </div>
    `;
    }).join('');
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
        
        const appsHTML = applications.map(app => {
            const companyName = app.recruiter_company_name || app.company || 'Company not specified';
            return `
            <div class="job-card">
                <h3>${app.job_title}</h3>
                <p class="company">Company: <strong style="color: #0B3D91;">${companyName}</strong></p>
                <p>Status: <strong>${app.status}</strong></p>
                <p>Applied on: ${formatDate(app.applied_date)}</p>
            </div>
        `;
        }).join('');
        
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
        
        const jobsHTML = savedJobs.map(job => {
            const recruiterEmail = job.recruiter_email || '';
            const companyName = job.recruiter_company_name || job.company || 'Company';
            const jobTitle = job.job_title || 'Job Position';
            
            // Create Gmail URL with pre-filled subject and body
            const subject = encodeURIComponent(`Inquiry about ${jobTitle} position at ${companyName}`);
            const body = encodeURIComponent(`Hello,\n\nI am interested in the ${jobTitle} position at ${companyName}. Please let me know if there are any questions about my application.\n\nThank you,\n[Your Name]`);
            const gmailUrl = recruiterEmail ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recruiterEmail)}&su=${subject}&body=${body}` : '#';
            
            return `
            <div class="job-card">
                <h3>${job.job_title}</h3>
                <p class="company">${job.company}</p>
                <div class="actions">
                    <button class="btn btn-primary" onclick="applyToJob(${job.job_id})">Apply Now</button>
                    ${recruiterEmail ? `<a href="${gmailUrl}" target="_blank" class="btn" style="background: #EA4335; color: white; text-decoration: none; display: inline-block; padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; transition: all 0.3s ease;">
                        ✉️ Contact via Gmail
                    </a>` : ''}
                </div>
            </div>
        `;
        }).join('');
        
        content.innerHTML = '<h2>Saved Jobs</h2>' + jobsHTML;
    } catch (error) {
        content.innerHTML = '<div class="error-message">Failed to load saved jobs: ' + error.message + '</div>';
    }
}

/**
 * Show skills management with recommendations
 */
async function showSkills() {
    const content = document.getElementById('content');
    content.innerHTML = '<h2>My Skills</h2>';
    
    const loader = createLoader();
    content.appendChild(loader);
    
    try {
        const [mySkills, popularSkills] = await Promise.all([
            apiClient.getMySkills(),
            apiClient.getSkillRecommendations()
        ]);
        
        const mySkillsIds = new Set(mySkills.map(s => s.skill_id));
        const suggestedSkills = popularSkills.filter(s => !mySkillsIds.has(s.id));
        
        content.innerHTML = `
            <h2>My Skills</h2>
            
            <!-- Current Skills -->
            <div style="margin-bottom: 30px;">
                <h3>Current Skills:</h3>
                ${mySkills.length > 0 ? mySkills.map(skill => `
                    <div class="job-card" style="display: flex; justify-content: space-between; align-items: center;">
                        <span><strong>${skill.skill_name}</strong> - ${skill.proficiency_level}</span>
                        <button type="button" class="btn btn-danger" onclick="removeSkill(${skill.skill_id}, event)">Remove</button>
                    </div>
                `).join('') : '<p>No skills added yet. Add skills to improve job matching!</p>'}
            </div>
            
            <!-- Add New Skill -->
            <div style="margin-bottom: 30px;">
                <h3>Add New Skill:</h3>
                <div class="skill-search-container">
                    <div class="skill-search-wrapper">
                        <div class="skill-search-icon">🔍</div>
                        <input type="text" id="skill-input" placeholder="Start typing to search skills..." autocomplete="off">
                        <div id="skill-search-loader" class="skill-search-loader hidden">
                            <div class="loader-spinner"></div>
                        </div>
                    </div>
                    <div class="skill-action-buttons">
                        <button type="button" class="btn btn-primary" onclick="addCustomSkill(event)">
                            <span>➕</span> Add
                        </button>
                        <button type="button" class="btn btn-secondary skill-search-btn" onclick="searchSkills(event)">
                            <span>🔎</span> Search
                        </button>
                    </div>
                </div>
                <div id="skill-recommendations" class="skill-recommendations-dropdown"></div>
            </div>
            
            <!-- Recommended Skills -->
            <div>
                <h3>Popular Skills:</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                    ${suggestedSkills.slice(0, 15).map(skill => `
                        <button type="button" class="btn btn-secondary" onclick="addSkillByName('${skill.name.replace(/'/g, "\\'")}', event)" 
                                style="padding: 8px 16px;">
                            ${skill.name} ${skill.user_count ? `(${skill.user_count} users)` : ''}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Add real-time search for skills with enhanced UX
        const skillInput = document.getElementById('skill-input');
        const loader = document.getElementById('skill-search-loader');
        const recommendations = document.getElementById('skill-recommendations');
        
        // Focus effect
        skillInput.addEventListener('focus', () => {
            skillInput.parentElement.classList.add('focused');
        });
        
        skillInput.addEventListener('blur', () => {
            // Delay to allow clicks on dropdown items
            setTimeout(() => {
                skillInput.parentElement.classList.remove('focused');
                const activeElement = document.activeElement;
                if (!recommendations.contains(activeElement) && activeElement !== skillInput) {
                    recommendations.classList.remove('active');
                }
            }, 300);
        });
        
        // Keep dropdown open when clicking inside it
        recommendations.addEventListener('mousedown', (e) => {
            e.preventDefault(); // Prevent input blur
        });
        
        // Real-time search with loading indicator
        skillInput.addEventListener('input', debounce(async (e) => {
            const query = e.target.value.trim();
            
            if (query.length === 0) {
                recommendations.innerHTML = '';
                recommendations.classList.remove('active');
                if (loader) loader.classList.add('hidden');
                return;
            }
            
            if (query.length > 1) {
                // Show loader
                if (loader) {
                    loader.classList.remove('hidden');
                }
                recommendations.classList.add('active');
                
                try {
                    const results = await apiClient.getSkillRecommendations(query);
                    displaySkillRecommendations(results);
                } catch (error) {
                    if (loader) loader.classList.add('hidden');
                    recommendations.innerHTML = `
                        <div class="skill-dropdown">
                            <div class="skill-dropdown-error">
                                ⚠️ Failed to search skills. Please try again.
                            </div>
                        </div>
                    `;
                }
            } else {
                if (loader) loader.classList.add('hidden');
                recommendations.innerHTML = `
                    <div class="skill-dropdown">
                        <div class="skill-dropdown-hint">
                            💡 Type at least 2 characters to search...
                        </div>
                    </div>
                `;
            }
        }, 300));
        
        // Handle Enter key
        skillInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchSkills(e);
            }
        });
        
    } catch (error) {
        content.innerHTML = '<div class="error-message">Failed to load skills: ' + error.message + '</div>';
    }
}

/**
 * Display skill recommendations
 */
function displaySkillRecommendations(skills) {
    const container = document.getElementById('skill-recommendations');
    const loader = document.getElementById('skill-search-loader');
    
    // Hide loader
    if (loader) {
        loader.classList.add('hidden');
    }
    
    if (!skills || skills.length === 0) {
        container.innerHTML = '';
        container.classList.remove('active');
        return;
    }
    
    // Show dropdown
    container.classList.add('active');
    
    container.innerHTML = `
        <div class="skill-dropdown">
            <div class="skill-dropdown-header">
                <span>💡 Found ${skills.length} skill${skills.length !== 1 ? 's' : ''}</span>
            </div>
            <div class="skill-dropdown-items">
                ${skills.slice(0, 8).map((skill, index) => `
                    <div class="skill-dropdown-item" 
                         onclick="addSkillByName('${skill.name.replace(/'/g, "\\'")}', event)"
                         style="animation-delay: ${index * 0.05}s">
                        <span class="skill-icon">✨</span>
                        <span class="skill-name">${skill.name}</span>
                        ${skill.user_count ? `<span class="skill-count">${skill.user_count} users</span>` : ''}
                        <span class="skill-add-icon">+</span>
                    </div>
                `).join('')}
                ${skills.length > 8 ? `
                    <div class="skill-dropdown-footer">
                        <span>And ${skills.length - 8} more... (keep typing to refine)</span>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

/**
 * Search skills
 */
async function searchSkills(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    const query = document.getElementById('skill-input').value.trim();
    const loader = document.getElementById('skill-search-loader');
    const recommendations = document.getElementById('skill-recommendations');
    
    if (query.length < 2) {
        recommendations.innerHTML = `
            <div class="skill-dropdown">
                <div class="skill-dropdown-hint">
                    💡 Please enter at least 2 characters to search...
                </div>
            </div>
        `;
        recommendations.classList.add('active');
        return;
    }
    
    // Show loader
    if (loader) {
        loader.classList.remove('hidden');
    }
    recommendations.classList.add('active');
    
    try {
        const results = await apiClient.getSkillRecommendations(query);
        displaySkillRecommendations(results);
    } catch (error) {
        if (loader) loader.classList.add('hidden');
        recommendations.innerHTML = `
            <div class="skill-dropdown">
                <div class="skill-dropdown-error">
                    ⚠️ Failed to search skills: ${error.message}
                </div>
            </div>
        `;
    }
}

/**
 * Add custom skill by typing
 */
async function addCustomSkill(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    const skillName = document.getElementById('skill-input').value.trim();
    if (!skillName) {
        const recommendations = document.getElementById('skill-recommendations');
        recommendations.innerHTML = `
            <div class="skill-dropdown">
                <div class="skill-dropdown-hint">
                    💡 Please enter a skill name to add...
                </div>
            </div>
        `;
        recommendations.classList.add('active');
        return;
    }
    
    try {
        await apiClient.createSkill(skillName);
        showSuccess('Skill added successfully!', document.getElementById('content'));
        document.getElementById('skill-input').value = '';
        document.getElementById('skill-recommendations').innerHTML = '';
        document.getElementById('skill-recommendations').classList.remove('active');
        showSkills(); // Reload
    } catch (error) {
        showError('Failed to add skill: ' + error.message, document.getElementById('content'));
    }
}

/**
 * Add skill by name (from recommendations)
 */
async function addSkillByName(skillName, event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    try {
        // Visual feedback - highlight the clicked item
        if (event && event.target) {
            event.target.closest('.skill-dropdown-item')?.classList.add('adding');
        }
        
        await apiClient.createSkill(skillName);
        showSuccess(`✨ ${skillName} added!`, document.getElementById('content'));
        document.getElementById('skill-input').value = '';
        document.getElementById('skill-recommendations').innerHTML = '';
        document.getElementById('skill-recommendations').classList.remove('active');
        showSkills(); // Reload
    } catch (error) {
        showError('Failed to add skill: ' + error.message, document.getElementById('content'));
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
async function removeSkill(skillId, event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
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
                    ${job.recruiter_email ? (() => {
                        const subject = encodeURIComponent(`Inquiry about ${job.title || 'Job'} position at ${job.recruiter_company_name || job.company || 'Company'}`);
                        const body = encodeURIComponent(`Hello,\n\nI am interested in the ${job.title || 'Job'} position at ${job.recruiter_company_name || job.company || 'Company'}. Please let me know if there are any questions about my application.\n\nThank you,\n[Your Name]`);
                        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(job.recruiter_email)}&su=${subject}&body=${body}`;
                        return `<a href="${gmailUrl}" target="_blank" class="btn" style="background: #EA4335; color: white; text-decoration: none; display: inline-block; padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; transition: all 0.3s ease;">
                            ✉️ Contact via Gmail
                        </a>`;
                    })() : ''}
                </div>
            </div>
        `).join('');
        
        content.innerHTML = '<h2>AI Job Recommendations</h2>' + jobsHTML;
    } catch (error) {
        content.innerHTML = '<div class="error-message">Failed to load recommendations: ' + error.message + '</div>';
    }
}

/**
 * Show resumes section
 */
async function showResumes() {
    const content = document.getElementById('content');
    content.innerHTML = '<h2>📄 My Resumes</h2>';
    
    const loader = createLoader();
    content.appendChild(loader);
    
    try {
        const resumes = await apiClient.getResumes();
        
        content.innerHTML = `
            <style>
                .resumes-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid rgba(65, 105, 225, 0.2);
                }
                .resumes-title {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #0B3D91;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .resume-card {
                    background: white;
                    border-radius: 12px;
                    padding: 25px;
                    margin-bottom: 20px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                    border-left: 4px solid #4169E1;
                    position: relative;
                }
                .resume-card:hover {
                    box-shadow: 0 6px 12px rgba(65, 105, 225, 0.2);
                    transform: translateY(-2px);
                }
                .primary-badge {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
                    color: white;
                    padding: 6px 14px;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    box-shadow: 0 2px 4px rgba(76, 175, 80, 0.3);
                }
                .resume-title {
                    font-size: 1.4rem;
                    font-weight: 600;
                    color: #0B3D91;
                    margin-bottom: 12px;
                    margin-right: 120px;
                }
                .resume-meta {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 15px;
                    margin: 15px 0;
                    padding: 12px;
                    background: #f8f9fa;
                    border-radius: 8px;
                }
                .resume-meta-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    color: #666;
                    font-size: 0.9rem;
                }
                .resume-preview {
                    margin: 15px 0;
                    padding: 15px;
                    background: #f8f9fa;
                    border-radius: 8px;
                    border-left: 3px solid #4169E1;
                    max-height: 200px;
                    overflow-y: auto;
                }
                .resume-preview strong {
                    color: #0B3D91;
                    display: block;
                    margin-bottom: 8px;
                }
                .resume-actions {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                    margin-top: 20px;
                    padding-top: 15px;
                    border-top: 1px solid #e0e0e0;
                }
                .empty-state {
                    text-align: center;
                    padding: 60px 30px;
                    background: linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%);
                    border-radius: 12px;
                    border: 2px dashed #4169E1;
                    margin-bottom: 30px;
                }
                .empty-state-icon {
                    font-size: 4rem;
                    margin-bottom: 20px;
                }
                .empty-state h3 {
                    color: #0B3D91;
                    font-size: 1.5rem;
                    margin-bottom: 15px;
                }
                .empty-state p {
                    color: #666;
                    font-size: 1.1rem;
                    margin-bottom: 25px;
                    max-width: 500px;
                    margin-left: auto;
                    margin-right: auto;
                }
                .tips-card {
                    background: linear-gradient(135deg, #fff8e1 0%, #fff3cd 100%);
                    border-radius: 12px;
                    padding: 25px;
                    margin-top: 30px;
                    border-left: 4px solid #FFC107;
                }
                .tips-card h3 {
                    color: #856404;
                    margin-bottom: 15px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .tips-card ul {
                    line-height: 1.8;
                    color: #856404;
                    padding-left: 20px;
                }
                .tips-card li {
                    margin-bottom: 8px;
                }
                .btn-add-resume {
                    background: linear-gradient(135deg, #4169E1 0%, #0B3D91 100%);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 6px rgba(65, 105, 225, 0.3);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .btn-add-resume:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 12px rgba(65, 105, 225, 0.4);
                }
                .btn-primary-action {
                    background: linear-gradient(135deg, #4169E1 0%, #0B3D91 100%);
                    color: white;
                    border: none;
                    padding: 14px 28px;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 1.05rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 8px rgba(65, 105, 225, 0.3);
                }
                .btn-primary-action:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 14px rgba(65, 105, 225, 0.4);
                }
            </style>
            
            <div class="resumes-header">
                <div class="resumes-title">
                    <span>📄</span>
                    <span>My Resumes</span>
                </div>
                ${resumes.length > 0 ? `
                    <button class="btn-add-resume" onclick="showCreateResumeForm()">
                        ➕ Add Resume
                    </button>
                ` : ''}
            </div>
            
            ${resumes.length > 0 ? `
                <div style="margin-bottom: 30px;">
                    ${resumes.map(resume => `
                        <div class="resume-card">
                            ${resume.is_primary ? '<span class="primary-badge">⭐ Primary Resume</span>' : ''}
                            
                            <h3 class="resume-title">${resume.title}</h3>
                            
                            <div class="resume-meta">
                                <div class="resume-meta-item">
                                    <span>📅</span>
                                    <span>Created: ${formatDate(resume.created_at)}</span>
                                </div>
                                ${resume.updated_at !== resume.created_at ? `
                                    <div class="resume-meta-item">
                                        <span>🔄</span>
                                        <span>Updated: ${formatDate(resume.updated_at)}</span>
                                    </div>
                                ` : ''}
                                ${resume.is_primary ? `
                                    <div class="resume-meta-item">
                                        <span>✅</span>
                                        <span>Used for Applications</span>
                                    </div>
                                ` : ''}
                            </div>
                            
                            ${resume.file_url ? `
                                <div style="margin: 15px 0; padding: 12px; background: #e3f2fd; border-radius: 8px;">
                                    <strong>📎 Resume File:</strong>
                                    <a href="${resume.file_url}" target="_blank" style="color: #1976d2; text-decoration: none; margin-left: 8px; font-weight: 600;">
                                        View File →
                                    </a>
                                </div>
                            ` : ''}
                            
                            ${resume.content ? `
                                <div class="resume-preview">
                                    <strong>Content Preview</strong>
                                    <p style="white-space: pre-wrap; margin-top: 8px; color: #555; line-height: 1.6;">
                                        ${resume.content.substring(0, 300)}${resume.content.length > 300 ? '...' : ''}
                                    </p>
                                </div>
                            ` : ''}
                            
                            <div class="resume-actions">
                                ${!resume.is_primary ? `
                                    <button class="btn btn-success" onclick="setPrimaryResume(${resume.id})" 
                                            style="padding: 10px 20px; border-radius: 8px; font-weight: 600;">
                                        ⭐ Set as Primary
                                    </button>
                                ` : ''}
                                <button class="btn btn-secondary" onclick="editResume(${resume.id})"
                                        style="padding: 10px 20px; border-radius: 8px; font-weight: 600;">
                                    ✏️ Edit
                                </button>
                                <button class="btn btn-danger" onclick="deleteResume(${resume.id})"
                                        style="padding: 10px 20px; border-radius: 8px; font-weight: 600;">
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : `
                <div class="empty-state">
                    <div class="empty-state-icon">📄</div>
                    <h3>No Resumes Yet</h3>
                    <p>Create your first resume to get started with job applications. You can upload a file, add a URL, or build one step by step!</p>
                    <button class="btn-primary-action" onclick="showCreateResumeForm()">
                        Get Started
                    </button>
                </div>
            `}
            
            <div class="tips-card">
                <h3>💡 Resume Tips</h3>
                <ul>
                    <li><strong>Primary Resume:</strong> Your primary resume is automatically attached to job applications</li>
                    <li><strong>Multiple Resumes:</strong> Create different resumes for different types of jobs</li>
                    <li><strong>Keep Updated:</strong> Regularly update your resume with new skills and experiences</li>
                    <li><strong>Flexible Options:</strong> Upload PDF files, add URLs, or build resumes with our step-by-step builder</li>
                </ul>
            </div>
        `;
        
    } catch (error) {
        content.innerHTML = '<div class="error-message">Failed to load resumes: ' + error.message + '</div>';
    }
}

/**
 * Show create resume form with tabs for different options
 */
function showCreateResumeForm() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <h2>Create New Resume</h2>
        <button class="btn btn-secondary" onclick="showResumes()" style="margin-bottom: 20px;">
            ← Back to Resumes
        </button>
        
        <!-- Tabs -->
        <div style="margin-bottom: 30px;">
            <button class="btn" id="tab-upload" onclick="switchResumeTab('upload')" 
                    style="background: linear-gradient(135deg, #4169E1 0%, #0B3D91 100%); color: white;">
                📎 Upload File
            </button>
            <button class="btn" id="tab-url" onclick="switchResumeTab('url')" 
                    style="background: #f0f0f0; color: #333;">
                🔗 Add URL
            </button>
            <button class="btn" id="tab-build" onclick="switchResumeTab('build')" 
                    style="background: #f0f0f0; color: #333;">
                ✏️ Build Resume
            </button>
        </div>
        
        <!-- Upload File Tab -->
        <div id="resume-tab-upload" class="resume-tab-content" style="display: block;">
            <div class="profile-form">
                <div class="form-group full-width">
                    <label><strong>Resume Title:</strong> <span style="color: red;">*</span></label>
                    <input type="text" id="upload-title" placeholder="e.g., Software Engineer Resume" required>
                    <small style="color: #666;">Give your resume a descriptive title</small>
                </div>
                
                <div class="form-group full-width">
                    <label><strong>Upload Resume File:</strong> <span style="color: red;">*</span></label>
                    <input type="file" id="resume-file" accept=".pdf,.doc,.docx" required>
                    <small style="color: #666;">Upload PDF, DOC, or DOCX file (Max: 10MB)</small>
                </div>
                
                <div class="form-group full-width">
                    <label style="display: flex; align-items: center; gap: 10px;">
                        <input type="checkbox" id="upload-set-primary" style="width: auto;">
                        <span>Set as primary resume</span>
                    </label>
                </div>
                
                <div class="form-group full-width">
                    <button class="btn btn-primary" onclick="uploadResumeFile()" style="width: 100%; padding: 15px; font-size: 1.1rem;">
                        📤 Upload Resume
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Add URL Tab -->
        <div id="resume-tab-url" class="resume-tab-content" style="display: none;">
            <div class="profile-form">
                <div class="form-group full-width">
                    <label><strong>Resume Title:</strong> <span style="color: red;">*</span></label>
                    <input type="text" id="url-title" placeholder="e.g., Software Engineer Resume" required>
                    <small style="color: #666;">Give your resume a descriptive title</small>
                </div>
                
                <div class="form-group full-width">
                    <label><strong>Resume URL:</strong> <span style="color: red;">*</span></label>
                    <input type="url" id="resume-url" placeholder="https://drive.google.com/file/..." required>
                    <small style="color: #666;">Paste a link to your resume file (Google Drive, Dropbox, etc.)</small>
                </div>
                
                <div class="form-group full-width">
                    <label style="display: flex; align-items: center; gap: 10px;">
                        <input type="checkbox" id="url-set-primary" style="width: auto;">
                        <span>Set as primary resume</span>
                    </label>
                </div>
                
                <div class="form-group full-width">
                    <button class="btn btn-primary" onclick="addResumeByUrl()" style="width: 100%; padding: 15px; font-size: 1.1rem;">
                        ✅ Add Resume
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Build Resume Tab -->
        <div id="resume-tab-build" class="resume-tab-content" style="display: none;">
            <div class="profile-form">
                <div class="form-group full-width">
                    <label><strong>Resume Title:</strong> <span style="color: red;">*</span></label>
                    <input type="text" id="build-title" placeholder="e.g., Software Engineer Resume" required>
                    <small style="color: #666;">Give your resume a descriptive title</small>
                </div>
                
                <div class="form-group full-width">
                    <label><strong>Summary/Objective:</strong></label>
                    <textarea id="build-summary" rows="3" placeholder="Brief professional summary or career objective..."></textarea>
                </div>
                
                <div class="form-group full-width">
                    <button class="btn btn-secondary" onclick="addWorkExperience()" style="width: 100%;">
                        ➕ Add Work Experience
                    </button>
                    <div id="work-experiences-container" style="margin-top: 15px;"></div>
                </div>
                
                <div class="form-group full-width">
                    <button class="btn btn-secondary" onclick="addEducation()" style="width: 100%;">
                        ➕ Add Education
                    </button>
                    <div id="educations-container" style="margin-top: 15px;"></div>
                </div>
                
                <div class="form-group full-width">
                    <label><strong>Certifications:</strong></label>
                    <div id="certifications-container"></div>
                    <button type="button" class="btn btn-secondary" onclick="addCertification()" style="margin-top: 10px;">
                        ➕ Add Certification
                    </button>
                </div>
                
                <div class="form-group full-width">
                    <label><strong>Languages:</strong></label>
                    <div id="languages-container"></div>
                    <button type="button" class="btn btn-secondary" onclick="addLanguage()" style="margin-top: 10px;">
                        ➕ Add Language
                    </button>
                </div>
                
                <div class="form-group full-width">
                    <label><strong>Projects:</strong></label>
                    <button type="button" class="btn btn-secondary" onclick="addProject()" style="width: 100%; margin-bottom: 10px;">
                        ➕ Add Project
                    </button>
                    <div id="projects-container"></div>
                </div>
                
                <div class="form-group full-width">
                    <label><strong>Volunteer Experience:</strong></label>
                    <button type="button" class="btn btn-secondary" onclick="addVolunteer()" style="width: 100%; margin-bottom: 10px;">
                        ➕ Add Volunteer Experience
                    </button>
                    <div id="volunteers-container"></div>
                </div>
                
                <div class="form-group full-width">
                    <label><strong>Publications:</strong></label>
                    <button type="button" class="btn btn-secondary" onclick="addPublication()" style="width: 100%; margin-bottom: 10px;">
                        ➕ Add Publication
                    </button>
                    <div id="publications-container"></div>
                </div>
                
                <div class="form-group full-width">
                    <label><strong>Hobbies & Interests:</strong></label>
                    <div id="hobbies-container"></div>
                    <button type="button" class="btn btn-secondary" onclick="addHobby()" style="margin-top: 10px;">
                        ➕ Add Hobby
                    </button>
                </div>
                
                <div class="form-group full-width">
                    <label><strong>Professional Links:</strong></label>
                    <input type="url" id="build-linkedin" placeholder="LinkedIn URL (optional)">
                    <input type="url" id="build-github" placeholder="GitHub URL (optional)" style="margin-top: 10px;">
                    <input type="url" id="build-portfolio" placeholder="Portfolio URL (optional)" style="margin-top: 10px;">
                    <input type="url" id="build-twitter" placeholder="Twitter URL (optional)" style="margin-top: 10px;">
                    <input type="url" id="build-stackoverflow" placeholder="Stack Overflow URL (optional)" style="margin-top: 10px;">
                </div>
                
                <div class="form-group full-width">
                    <label style="display: flex; align-items: center; gap: 10px;">
                        <input type="checkbox" id="build-set-primary" style="width: auto;">
                        <span>Set as primary resume</span>
                    </label>
                </div>
                
                <div class="form-group full-width">
                    <button class="btn btn-primary" onclick="buildResume()" style="width: 100%; padding: 15px; font-size: 1.1rem;">
                        ✅ Build Resume
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Store counters for dynamic fields
    window.workExpCounter = 0;
    window.eduCounter = 0;
    window.certCounter = 0;
    window.langCounter = 0;
    window.projectCounter = 0;
    window.volunteerCounter = 0;
    window.publicationCounter = 0;
    window.hobbyCounter = 0;
}

/**
 * Switch between resume tabs
 */
function switchResumeTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.resume-tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    
    // Reset all tab buttons
    document.querySelectorAll('[id^="tab-"]').forEach(btn => {
        btn.style.background = '#f0f0f0';
        btn.style.color = '#333';
    });
    
    // Show selected tab
    document.getElementById(`resume-tab-${tabName}`).style.display = 'block';
    document.getElementById(`tab-${tabName}`).style.background = 'linear-gradient(135deg, #4169E1 0%, #0B3D91 100%)';
    document.getElementById(`tab-${tabName}`).style.color = 'white';
}

/**
 * Add work experience field
 */
function addWorkExperience() {
    const id = window.workExpCounter++;
    const container = document.getElementById('work-experiences-container');
    container.innerHTML += `
        <div class="work-exp-item" data-id="${id}" style="border: 2px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 8px; background: #f9f9f9;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <strong>Work Experience</strong>
                <button type="button" class="btn btn-danger" onclick="removeWorkExp(${id})" style="padding: 5px 10px;">Remove</button>
            </div>
            <input type="text" id="we-company-${id}" placeholder="Company name" required style="width: 100%; padding: 8px; margin-bottom: 8px;">
            <input type="text" id="we-position-${id}" placeholder="Position/Title" required style="width: 100%; padding: 8px; margin-bottom: 8px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
                <input type="text" id="we-start-${id}" placeholder="Start date (YYYY-MM)" required>
                <input type="text" id="we-end-${id}" placeholder="End date (YYYY-MM or Present)">
            </div>
            <input type="text" id="we-location-${id}" placeholder="Location (optional)" style="width: 100%; padding: 8px; margin-bottom: 8px;">
            <textarea id="we-description-${id}" placeholder="Job description (optional)" rows="2" style="width: 100%; padding: 8px;"></textarea>
        </div>
    `;
}

/**
 * Remove work experience field
 */
function removeWorkExp(id) {
    document.querySelector(`[data-id="${id}"]`).remove();
}

/**
 * Add education field
 */
function addEducation() {
    const id = window.eduCounter++;
    const container = document.getElementById('educations-container');
    container.innerHTML += `
        <div class="edu-item" data-id="${id}" style="border: 2px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 8px; background: #f9f9f9;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <strong>Education</strong>
                <button type="button" class="btn btn-danger" onclick="removeEducation(${id})" style="padding: 5px 10px;">Remove</button>
            </div>
            <input type="text" id="edu-institution-${id}" placeholder="Institution name" required style="width: 100%; padding: 8px; margin-bottom: 8px;">
            <input type="text" id="edu-degree-${id}" placeholder="Degree" required style="width: 100%; padding: 8px; margin-bottom: 8px;">
            <input type="text" id="edu-field-${id}" placeholder="Field of study (optional)" style="width: 100%; padding: 8px; margin-bottom: 8px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
                <input type="text" id="edu-start-${id}" placeholder="Start date (YYYY-MM)" required>
                <input type="text" id="edu-end-${id}" placeholder="End date (YYYY-MM or Present)">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <input type="text" id="edu-location-${id}" placeholder="Location (optional)">
                <input type="text" id="edu-gpa-${id}" placeholder="GPA (optional)">
            </div>
        </div>
    `;
}

/**
 * Remove education field
 */
function removeEducation(id) {
    document.querySelector(`[data-id="${id}"]`).remove();
}

/**
 * Add certification field
 */
function addCertification() {
    const id = window.certCounter++;
    const container = document.getElementById('certifications-container');
    container.innerHTML += `
        <div style="display: flex; gap: 10px; margin-bottom: 10px;">
            <input type="text" id="cert-${id}" placeholder="Certification name" style="flex: 1; padding: 8px;">
            <button type="button" class="btn btn-danger" onclick="this.parentElement.remove()">Remove</button>
        </div>
    `;
}

/**
 * Add language field
 */
function addLanguage() {
    const id = window.langCounter++;
    const container = document.getElementById('languages-container');
    container.innerHTML += `
        <div style="display: flex; gap: 10px; margin-bottom: 10px;">
            <input type="text" id="lang-${id}" placeholder="Language name" style="flex: 1; padding: 8px;">
            <button type="button" class="btn btn-danger" onclick="this.parentElement.remove()">Remove</button>
        </div>
    `;
}

/**
 * Add project field
 */
function addProject() {
    const id = window.projectCounter++;
    const container = document.getElementById('projects-container');
    container.innerHTML += `
        <div class="project-item" data-id="${id}" style="border: 2px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 8px; background: #f9f9f9;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <strong>Project</strong>
                <button type="button" class="btn btn-danger" onclick="removeProject(${id})" style="padding: 5px 10px;">Remove</button>
            </div>
            <input type="text" id="proj-name-${id}" placeholder="Project name" required style="width: 100%; padding: 8px; margin-bottom: 8px;">
            <textarea id="proj-description-${id}" placeholder="Project description" rows="2" required style="width: 100%; padding: 8px; margin-bottom: 8px;"></textarea>
            <input type="text" id="proj-technologies-${id}" placeholder="Technologies (e.g., React, Node.js, MongoDB)" style="width: 100%; padding: 8px; margin-bottom: 8px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
                <input type="text" id="proj-start-${id}" placeholder="Start date (YYYY-MM)">
                <input type="text" id="proj-end-${id}" placeholder="End date (YYYY-MM)">
            </div>
            <input type="url" id="proj-url-${id}" placeholder="Project URL (optional)" style="width: 100%; padding: 8px;">
        </div>
    `;
}

function removeProject(id) {
    document.querySelector(`[data-id="${id}"]`).remove();
}

/**
 * Add volunteer field
 */
function addVolunteer() {
    const id = window.volunteerCounter++;
    const container = document.getElementById('volunteers-container');
    container.innerHTML += `
        <div class="volunteer-item" data-id="${id}" style="border: 2px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 8px; background: #f9f9f9;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <strong>Volunteer Experience</strong>
                <button type="button" class="btn btn-danger" onclick="removeVolunteer(${id})" style="padding: 5px 10px;">Remove</button>
            </div>
            <input type="text" id="vol-role-${id}" placeholder="Role/Position" required style="width: 100%; padding: 8px; margin-bottom: 8px;">
            <input type="text" id="vol-organization-${id}" placeholder="Organization name" required style="width: 100%; padding: 8px; margin-bottom: 8px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
                <input type="text" id="vol-start-${id}" placeholder="Start date (YYYY-MM)" required>
                <input type="text" id="vol-end-${id}" placeholder="End date (YYYY-MM or Present)">
            </div>
            <input type="text" id="vol-location-${id}" placeholder="Location (optional)" style="width: 100%; padding: 8px; margin-bottom: 8px;">
            <textarea id="vol-description-${id}" placeholder="Description (optional)" rows="2" style="width: 100%; padding: 8px;"></textarea>
        </div>
    `;
}

function removeVolunteer(id) {
    document.querySelector(`[data-id="${id}"]`).remove();
}

/**
 * Add publication field
 */
function addPublication() {
    const id = window.publicationCounter++;
    const container = document.getElementById('publications-container');
    container.innerHTML += `
        <div class="publication-item" data-id="${id}" style="border: 2px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 8px; background: #f9f9f9;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <strong>Publication</strong>
                <button type="button" class="btn btn-danger" onclick="removePublication(${id})" style="padding: 5px 10px;">Remove</button>
            </div>
            <input type="text" id="pub-title-${id}" placeholder="Publication title" required style="width: 100%; padding: 8px; margin-bottom: 8px;">
            <input type="text" id="pub-authors-${id}" placeholder="Authors (optional)" style="width: 100%; padding: 8px; margin-bottom: 8px;">
            <input type="text" id="pub-journal-${id}" placeholder="Journal/Conference (optional)" style="width: 100%; padding: 8px; margin-bottom: 8px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
                <input type="text" id="pub-date-${id}" placeholder="Publication date">
                <input type="url" id="pub-url-${id}" placeholder="URL (optional)">
            </div>
        </div>
    `;
}

function removePublication(id) {
    document.querySelector(`[data-id="${id}"]`).remove();
}

/**
 * Add hobby field
 */
function addHobby() {
    const id = window.hobbyCounter++;
    const container = document.getElementById('hobbies-container');
    container.innerHTML += `
        <div style="display: flex; gap: 10px; margin-bottom: 10px;">
            <input type="text" id="hobby-${id}" placeholder="Hobby or interest" style="flex: 1; padding: 8px;">
            <button type="button" class="btn btn-danger" onclick="this.parentElement.remove()">Remove</button>
        </div>
    `;
}

/**
 * Create new resume
 */
async function createResume() {
    const title = document.getElementById('resume-title').value.trim();
    const fileUrl = document.getElementById('resume-file-url').value.trim();
    const content = document.getElementById('resume-content').value.trim();
    const setPrimary = document.getElementById('set-primary').checked;
    
    // Validation
    if (!title) {
        showError('Please enter a resume title', document.getElementById('content'));
        return;
    }
    
    if (!fileUrl && !content) {
        showError('Please either provide a file URL or enter resume content', document.getElementById('content'));
        return;
    }
    
    try {
        const resume = await apiClient.createResume(title, content || null, fileUrl || null);
        
        // Set as primary if checkbox is checked
        if (setPrimary && resume.id) {
            await apiClient.setPrimaryResume(resume.id);
        }
        
        showSuccess('Resume created successfully!', document.getElementById('content'));
        
        // Wait a moment then redirect to resumes list
        setTimeout(() => {
            showResumes();
        }, 1500);
        
    } catch (error) {
        showError('Failed to create resume: ' + error.message, document.getElementById('content'));
    }
}

/**
 * Edit resume
 */
async function editResume(resumeId) {
    const content = document.getElementById('content');
    
    try {
        // Get all resumes and find the one to edit
        const resumes = await apiClient.getResumes();
        const resume = resumes.find(r => r.id === resumeId);
        
        if (!resume) {
            showError('Resume not found', content);
            return;
        }
        
        content.innerHTML = `
            <h2>Edit Resume</h2>
            <button class="btn btn-secondary" onclick="showResumes()" style="margin-bottom: 20px;">
                ← Back to Resumes
            </button>
            
            <div class="profile-form">
                <div class="form-group full-width">
                    <label><strong>Resume Title:</strong> <span style="color: red;">*</span></label>
                    <input type="text" id="resume-title" value="${resume.title}" required>
                </div>
                
                <div class="form-group full-width">
                    <label><strong>Resume File URL:</strong></label>
                    <input type="url" id="resume-file-url" value="${resume.file_url || ''}" placeholder="Enter resume URL">
                </div>
                
                <div class="form-group full-width">
                    <label><strong>Resume Content:</strong></label>
                    <textarea id="resume-content" rows="15">${resume.content || ''}</textarea>
                </div>
                
                <div class="form-group full-width">
                    <button class="btn btn-primary" onclick="updateResume(${resumeId})" style="width: 100%; padding: 15px;">
                        💾 Save Changes
                    </button>
                </div>
            </div>
        `;
        
    } catch (error) {
        showError('Failed to load resume: ' + error.message, content);
    }
}

/**
 * Update resume
 */
async function updateResume(resumeId) {
    const title = document.getElementById('resume-title').value.trim();
    const fileUrl = document.getElementById('resume-file-url').value.trim();
    const content = document.getElementById('resume-content').value.trim();
    
    if (!title) {
        showError('Please enter a resume title', document.getElementById('content'));
        return;
    }
    
    try {
        await apiClient.updateResume(resumeId, title, content || null, fileUrl || null);
        showSuccess('Resume updated successfully!', document.getElementById('content'));
        
        setTimeout(() => {
            showResumes();
        }, 1500);
        
    } catch (error) {
        showError('Failed to update resume: ' + error.message, document.getElementById('content'));
    }
}

/**
 * Set primary resume
 */
async function setPrimaryResume(resumeId) {
    try {
        await apiClient.setPrimaryResume(resumeId);
        showSuccess('Primary resume updated!', document.getElementById('content'));
        
        // Reload resumes to show updated primary status
        setTimeout(() => {
            showResumes();
        }, 1000);
        
    } catch (error) {
        showError('Failed to set primary resume: ' + error.message, document.getElementById('content'));
    }
}

/**
 * Delete resume
 */
async function deleteResume(resumeId) {
    if (!confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
        return;
    }
    
    try {
        await apiClient.deleteResume(resumeId);
        showSuccess('Resume deleted successfully!', document.getElementById('content'));
        
        // Reload resumes
        setTimeout(() => {
            showResumes();
        }, 1000);
        
    } catch (error) {
        showError('Failed to delete resume: ' + error.message, document.getElementById('content'));
    }
}

/**
 * Upload resume file
 */
async function uploadResumeFile() {
    const title = document.getElementById('upload-title').value.trim();
    const fileInput = document.getElementById('resume-file');
    const file = fileInput.files[0];
    const setPrimary = document.getElementById('upload-set-primary').checked;
    
    if (!title) {
        showError('Please enter a resume title', document.getElementById('content'));
        return;
    }
    
    if (!file) {
        showError('Please select a file to upload', document.getElementById('content'));
        return;
    }
    
    try {
        const resume = await apiClient.uploadResumeFile(title, file);
        
        if (setPrimary && resume.id) {
            await apiClient.setPrimaryResume(resume.id);
        }
        
        showSuccess('Resume uploaded successfully!', document.getElementById('content'));
        
        setTimeout(() => {
            showResumes();
        }, 1500);
    } catch (error) {
        showError('Failed to upload resume: ' + error.message, document.getElementById('content'));
    }
}

/**
 * Add resume by URL
 */
async function addResumeByUrl() {
    const title = document.getElementById('url-title').value.trim();
    const fileUrl = document.getElementById('resume-url').value.trim();
    const setPrimary = document.getElementById('url-set-primary').checked;
    
    if (!title) {
        showError('Please enter a resume title', document.getElementById('content'));
        return;
    }
    
    if (!fileUrl) {
        showError('Please enter a resume URL', document.getElementById('content'));
        return;
    }
    
    try {
        const resume = await apiClient.addResumeByUrl(title, fileUrl);
        
        if (setPrimary && resume.id) {
            await apiClient.setPrimaryResume(resume.id);
        }
        
        showSuccess('Resume added successfully!', document.getElementById('content'));
        
        setTimeout(() => {
            showResumes();
        }, 1500);
    } catch (error) {
        showError('Failed to add resume: ' + error.message, document.getElementById('content'));
    }
}

/**
 * Build resume from structured data
 */
async function buildResume() {
    const title = document.getElementById('build-title').value.trim();
    const summary = document.getElementById('build-summary').value.trim();
    const linkedinUrl = document.getElementById('build-linkedin').value.trim();
    const githubUrl = document.getElementById('build-github').value.trim();
    const portfolioUrl = document.getElementById('build-portfolio').value.trim();
    const twitterUrl = document.getElementById('build-twitter').value.trim();
    const stackoverflowUrl = document.getElementById('build-stackoverflow').value.trim();
    const setPrimary = document.getElementById('build-set-primary').checked;
    
    if (!title) {
        showError('Please enter a resume title', document.getElementById('content'));
        return;
    }
    
    // Collect work experiences
    const workExperiences = [];
    document.querySelectorAll('.work-exp-item').forEach(item => {
        const id = item.dataset.id;
        workExperiences.push({
            company: document.getElementById(`we-company-${id}`).value.trim(),
            position: document.getElementById(`we-position-${id}`).value.trim(),
            start_date: document.getElementById(`we-start-${id}`).value.trim(),
            end_date: document.getElementById(`we-end-${id}`).value.trim() || null,
            location: document.getElementById(`we-location-${id}`).value.trim() || null,
            description: document.getElementById(`we-description-${id}`).value.trim() || null
        });
    });
    
    // Collect educations
    const educations = [];
    document.querySelectorAll('.edu-item').forEach(item => {
        const id = item.dataset.id;
        educations.push({
            institution: document.getElementById(`edu-institution-${id}`).value.trim(),
            degree: document.getElementById(`edu-degree-${id}`).value.trim(),
            field_of_study: document.getElementById(`edu-field-${id}`).value.trim() || null,
            start_date: document.getElementById(`edu-start-${id}`).value.trim(),
            end_date: document.getElementById(`edu-end-${id}`).value.trim() || null,
            location: document.getElementById(`edu-location-${id}`).value.trim() || null,
            gpa: document.getElementById(`edu-gpa-${id}`).value.trim() || null
        });
    });
    
    // Collect certifications
    const certifications = [];
    document.querySelectorAll('[id^="cert-"]').forEach(input => {
        const value = input.value.trim();
        if (value) certifications.push(value);
    });
    
    // Collect languages
    const languages = [];
    document.querySelectorAll('[id^="lang-"]').forEach(input => {
        const value = input.value.trim();
        if (value) languages.push(value);
    });
    
    // Collect projects
    const projects = [];
    document.querySelectorAll('.project-item').forEach(item => {
        const id = item.dataset.id;
        projects.push({
            name: document.getElementById(`proj-name-${id}`).value.trim(),
            description: document.getElementById(`proj-description-${id}`).value.trim(),
            technologies: document.getElementById(`proj-technologies-${id}`).value.trim() || null,
            start_date: document.getElementById(`proj-start-${id}`).value.trim() || null,
            end_date: document.getElementById(`proj-end-${id}`).value.trim() || null,
            url: document.getElementById(`proj-url-${id}`).value.trim() || null
        });
    });
    
    // Collect volunteer experiences
    const volunteers = [];
    document.querySelectorAll('.volunteer-item').forEach(item => {
        const id = item.dataset.id;
        volunteers.push({
            organization: document.getElementById(`vol-organization-${id}`).value.trim(),
            role: document.getElementById(`vol-role-${id}`).value.trim(),
            description: document.getElementById(`vol-description-${id}`).value.trim() || null,
            start_date: document.getElementById(`vol-start-${id}`).value.trim(),
            end_date: document.getElementById(`vol-end-${id}`).value.trim() || null,
            location: document.getElementById(`vol-location-${id}`).value.trim() || null
        });
    });
    
    // Collect publications
    const publications = [];
    document.querySelectorAll('.publication-item').forEach(item => {
        const id = item.dataset.id;
        publications.push({
            title: document.getElementById(`pub-title-${id}`).value.trim(),
            authors: document.getElementById(`pub-authors-${id}`).value.trim() || null,
            journal: document.getElementById(`pub-journal-${id}`).value.trim() || null,
            date: document.getElementById(`pub-date-${id}`).value.trim() || null,
            url: document.getElementById(`pub-url-${id}`).value.trim() || null
        });
    });
    
    // Collect hobbies
    const hobbies = [];
    document.querySelectorAll('[id^="hobby-"]').forEach(input => {
        const value = input.value.trim();
        if (value) hobbies.push(value);
    });
    
    const resumeData = {
        title,
        summary: summary || null,
        work_experience: workExperiences,
        education: educations,
        certifications,
        languages,
        projects,
        volunteer_experience: volunteers,
        publications,
        hobbies,
        linkedin_url: linkedinUrl || null,
        github_url: githubUrl || null,
        portfolio_url: portfolioUrl || null,
        twitter_url: twitterUrl || null,
        stackoverflow_url: stackoverflowUrl || null
    };
    
    try {
        const resume = await apiClient.buildResume(resumeData);
        
        if (setPrimary && resume.id) {
            await apiClient.setPrimaryResume(resume.id);
        }
        
        showSuccess('Resume built successfully!', document.getElementById('content'));
        
        setTimeout(() => {
            showResumes();
        }, 1500);
    } catch (error) {
        showError('Failed to build resume: ' + error.message, document.getElementById('content'));
    }
}

// Make functions globally available
window.showHome = showHome;
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
window.addCustomSkill = addCustomSkill;
window.addSkillByName = addSkillByName;
window.searchSkills = searchSkills;
window.showResumes = showResumes;
window.showCreateResumeForm = showCreateResumeForm;
window.switchResumeTab = switchResumeTab;
window.uploadResumeFile = uploadResumeFile;
window.addResumeByUrl = addResumeByUrl;
window.buildResume = buildResume;
window.addWorkExperience = addWorkExperience;
window.removeWorkExp = removeWorkExp;
window.addEducation = addEducation;
window.removeEducation = removeEducation;
window.addCertification = addCertification;
window.addLanguage = addLanguage;
window.addProject = addProject;
window.removeProject = removeProject;
window.addVolunteer = addVolunteer;
window.removeVolunteer = removeVolunteer;
window.addPublication = addPublication;
window.removePublication = removePublication;
window.addHobby = addHobby;
window.createResume = createResume;
window.editResume = editResume;
window.updateResume = updateResume;
window.setPrimaryResume = setPrimaryResume;
window.deleteResume = deleteResume;

// Show home screen on page load and update welcome message
window.addEventListener('DOMContentLoaded', async () => {
    // Only show home if we're on the dashboard page
    // Authentication is handled by auth.js and api-client.js
    const currentPath = window.location.pathname;
    if (currentPath.includes('jobseeker-dashboard')) {
        // Load user info to display welcome message with first name
        try {
            const userInfo = await apiClient.getCurrentUser();
            const userNameEl = document.getElementById('user-name');
            
            if (userNameEl && userInfo) {
                // Try to get first name from profile, fallback to email username
                const firstName = userInfo.first_name || '';
                const displayName = firstName || (userInfo.email ? userInfo.email.split('@')[0] : 'User');
                userNameEl.textContent = displayName;
            }
        } catch (error) {
            console.warn('Could not load user info for welcome message:', error);
        }
        
        showHome();
    }
});

// Log to confirm the script loaded
console.log('Dashboard Jobseeker script loaded successfully');

