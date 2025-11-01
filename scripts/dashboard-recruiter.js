/**
 * Recruiter Dashboard Module
 * Handles recruiter-specific functionality including AI-powered candidate search
 */

import { apiClient } from './api-client.js';

let myJobs = [];
let searchResults = [];

/**
 * Show AI-powered candidate search (TOP FEATURE)
 */
async function showCandidateSearch() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="search-container">
            <h2 style="margin-bottom: 20px; color: white;">🔍 AI-Powered Candidate Search</h2>
            <p style="margin-bottom: 20px; opacity: 0.9;">
                Use natural language to find perfect candidates. Try: "Senior Python developer with 5+ years in San Francisco"
            </p>
            
            <input type="text" id="candidate-search-input" class="search-input" 
                   placeholder="Describe your ideal candidate...">
            
            <div class="filter-group">
                <input type="text" id="location-filter" placeholder="Location (optional)" 
                       style="padding: 12px; border: none; border-radius: 8px;">
                <input type="number" id="experience-filter" placeholder="Min years experience" 
                       min="0" max="50" step="1"
                       style="padding: 12px; border: none; border-radius: 8px;">
                <select id="job-filter" style="padding: 12px; border: none; border-radius: 8px;">
                    <option value="">For specific job (optional)</option>
                </select>
            </div>
            
            <button class="btn btn-primary" id="search-candidates-btn" onclick="searchCandidates()" 
                    style="width: 100%; padding: 16px 20px; font-size: 1.15rem; font-weight: 700; 
                           background: linear-gradient(135deg, #4169E1 0%, #0B3D91 100%);
                           color: #F8F8FF;
                           border: 2px solid rgba(212, 175, 55, 0.3);
                           box-shadow: 0 4px 15px rgba(65, 105, 225, 0.3);
                           transition: all 0.3s ease;
                           cursor: pointer;">
                🔍 Search Candidates
            </button>
            
            <style>
                #search-candidates-btn:hover {
                    background: linear-gradient(135deg, #4169E1 0%, #0B3D91 50%, #D4AF37 100%) !important;
                    box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4) !important;
                    transform: translateY(-2px);
                }
            </style>
        </div>
        
        <div id="search-results"></div>
    `;
    
    // Load jobs for filter
    try {
        myJobs = await apiClient.getMyJobs();
        const jobFilter = document.getElementById('job-filter');
        myJobs.forEach(job => {
            const option = document.createElement('option');
            option.value = job.id;
            option.textContent = job.title;
            jobFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load jobs:', error);
    }
    
    // Enter key to search
    document.getElementById('candidate-search-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchCandidates();
        }
    });
}

/**
 * Search candidates with AI
 */
async function searchCandidates() {
    const query = document.getElementById('candidate-search-input').value;
    const location = document.getElementById('location-filter').value;
    const experienceInput = document.getElementById('experience-filter').value;
    const resultsDiv = document.getElementById('search-results');
    
    if (!query.trim()) {
        showError('Please enter a search query', document.getElementById('content'));
        return;
    }
    
    // Convert experience to integer if provided
    let experience = null;
    if (experienceInput && experienceInput.trim() !== '') {
        const expValue = parseInt(experienceInput, 10);
        if (!isNaN(expValue) && expValue >= 0) {
            experience = expValue;
        }
    }
    
    resultsDiv.innerHTML = createLoader().outerHTML;
    
    try {
        const results = await apiClient.searchCandidates(
            query, 
            location || null, 
            experience, 
            50
        );
        
        searchResults = results.results || [];
        
        if (searchResults.length === 0) {
            resultsDiv.innerHTML = `
                <div class="card" style="text-align: center; padding: 40px;">
                    <h3>No candidates found</h3>
                    <p>Try adjusting your search criteria</p>
                </div>
            `;
            return;
        }
        
        // Display AI-parsed filters
        const filtersHtml = results.filters_applied ? `
            <div class="card" style="margin-bottom: 20px; background: #f0f4ff;">
                <h4>🤖 AI understood your query as:</h4>
                <p><strong>Skills:</strong> ${results.filters_applied.skills?.join(', ') || 'Any'}</p>
                <p><strong>Job of Choice:</strong> ${results.filters_applied.job_of_choice || 'Any'}</p>
                <p><strong>Location:</strong> ${results.filters_applied.location || 'Any'}</p>
                <p><strong>Experience:</strong> ${results.filters_applied.min_experience ? results.filters_applied.min_experience + '+ years' : 'Any'}</p>
            </div>
        ` : '';
        
        resultsDiv.innerHTML = `
            ${filtersHtml}
            <h3>Found ${searchResults.length} Candidates</h3>
            <p style="color: #666; margin-bottom: 20px;">Sorted by match relevance</p>
            ${searchResults.map(candidate => renderCandidateCard(candidate)).join('')}
        `;
        
    } catch (error) {
        resultsDiv.innerHTML = `<div class="error-message">Search failed: ${error.message}</div>`;
    }
}

/**
 * Render candidate card with match score
 */
function renderCandidateCard(candidate) {
    const matchScore = candidate.match_score || 0;
    const matchClass = matchScore >= 75 ? 'match-high' : matchScore >= 50 ? 'match-medium' : 'match-low';
    const skills = candidate.skills ? candidate.skills.split(',').slice(0, 5).join(', ') : 'No skills listed';
    
    return `
        <div class="candidate-card">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                <div style="flex: 1;">
                    <h3 style="margin: 0 0 10px 0; color: #667eea;">
                        ${candidate.first_name || ''} ${candidate.last_name || 'Candidate'}
                    </h3>
                    <p style="margin: 5px 0; color: #666;">
                        📍 ${candidate.location || 'Location not specified'} | 
                        💼 ${candidate.years_experience || 0} years experience
                    </p>
                    <p style="margin: 5px 0; color: #666;">
                        📧 ${candidate.email || candidate.candidate_email}
                    </p>
                </div>
                <div style="text-align: right;">
                    <div class="match-score ${matchClass}">
                        ${Math.round(matchScore)}% Match
                    </div>
                </div>
            </div>
            
            <div style="margin: 15px 0;">
                <p><strong>Skills:</strong> ${skills}</p>
                ${candidate.job_of_choice ? `<p style="margin-top: 8px;"><strong>Job of Choice:</strong> <span style="color: #667eea; font-weight: 600;">${candidate.job_of_choice}</span></p>` : ''}
                ${candidate.address ? `<p style="margin-top: 5px; color: #666;"><strong>Address:</strong> ${candidate.address.substring(0, 100)}${candidate.address.length > 100 ? '...' : ''}</p>` : ''}
                ${candidate.bio ? `<p style="color: #555; margin-top: 10px;">${candidate.bio.substring(0, 150)}${candidate.bio.length > 150 ? '...' : ''}</p>` : ''}
            </div>
            
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <button class="btn btn-primary" onclick="viewCandidateProfile(${candidate.id})">
                    View Full Profile
                </button>
                <button class="btn btn-success" onclick="shortlistCandidate(${candidate.id}, ${matchScore})">
                    ⭐ Shortlist
                </button>
                ${candidate.resume_url ? `
                    <a href="${candidate.resume_url}" target="_blank" class="btn btn-secondary">
                        📄 View Resume
                    </a>
                ` : ''}
                ${candidate.linkedin_url ? `
                    <a href="${candidate.linkedin_url}" target="_blank" class="btn btn-secondary">
                        🔗 LinkedIn
                    </a>
                ` : ''}
            </div>
        </div>
    `;
}

/**
 * View full candidate profile
 */
async function viewCandidateProfile(candidateId) {
    const content = document.getElementById('content');
    content.innerHTML = createLoader().outerHTML;
    
    try {
        const profile = await apiClient.getCandidateProfile(candidateId);
        
        content.innerHTML = `
            <button class="btn btn-secondary" onclick="showCandidateSearch()">← Back to Search</button>
            
            <div class="card" style="margin-top: 20px;">
                <h2>${profile.first_name} ${profile.last_name}</h2>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin: 20px 0;">
                    <div><strong>Email:</strong> ${profile.email || 'Not provided'}</div>
                    <div><strong>Phone:</strong> ${profile.phone || 'Not provided'}</div>
                    <div><strong>Location:</strong> ${profile.location || 'Not specified'}</div>
                    <div><strong>Experience:</strong> ${profile.years_experience || 0} years</div>
                </div>
                ${profile.address ? `<div style="margin: 15px 0;"><strong>Address:</strong><p style="color: #666;">${profile.address}</p></div>` : ''}
                ${profile.job_of_choice ? `<div style="margin: 15px 0;"><strong>Job of Choice:</strong><p style="color: #667eea; font-weight: 600; font-size: 1.1em;">${profile.job_of_choice}</p></div>` : ''}
                
                ${profile.bio ? `<div style="margin: 20px 0;"><strong>Bio:</strong><p>${profile.bio}</p></div>` : ''}
                
                <div style="margin: 20px 0;">
                    <strong>Skills:</strong>
                    <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px;">
                        ${profile.skills?.map(skill => `
                            <span class="status-badge status-shortlisted">
                                ${skill.name} (${skill.proficiency_level})
                            </span>
                        `).join('') || '<p>No skills listed</p>'}
                    </div>
                </div>
                
                ${profile.resumes?.length > 0 ? `
                    <div style="margin: 20px 0;">
                        <strong>Resumes:</strong>
                        ${profile.resumes.map(resume => `
                            <div class="job-card">
                                <strong>${resume.title}</strong>
                                ${resume.is_primary ? '<span class="status-badge match-high">Primary</span>' : ''}
                                ${resume.file_url ? `<a href="${resume.file_url}" target="_blank" class="btn btn-secondary">View</a>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                <div style="margin-top: 30px; display: flex; gap: 10px;">
                    <button class="btn btn-success" onclick="shortlistCandidate(${candidateId}, 0)">
                        ⭐ Add to Shortlist
                    </button>
                    ${profile.linkedin_url ? `
                        <a href="${profile.linkedin_url}" target="_blank" class="btn btn-secondary">LinkedIn Profile</a>
                    ` : ''}
                    ${profile.portfolio_url ? `
                        <a href="${profile.portfolio_url}" target="_blank" class="btn btn-secondary">Portfolio</a>
                    ` : ''}
                </div>
            </div>
        `;
    } catch (error) {
        content.innerHTML = `<div class="error-message">Failed to load profile: ${error.message}</div>`;
    }
}

/**
 * Shortlist a candidate
 */
async function shortlistCandidate(candidateId, matchScore) {
    const jobId = document.getElementById('job-filter')?.value || null;
    
    try {
        await apiClient.addToShortlist(candidateId, jobId, matchScore, null);
        showSuccess('Candidate added to shortlist!', document.getElementById('content'));
    } catch (error) {
        showError('Failed to shortlist: ' + error.message, document.getElementById('content'));
    }
}

/**
 * Show shortlisted candidates
 */
async function showShortlist() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="dashboard-header">
            <h2>⭐ Shortlisted Candidates</h2>
            <div style="display: flex; gap: 10px; align-items: center;">
                <select id="status-filter" style="padding: 10px; border-radius: 8px;">
                    <option value="">All Statuses</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="contacted">Contacted</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="hired">Hired</option>
                    <option value="rejected">Rejected</option>
                </select>
                <button class="btn btn-primary" onclick="filterShortlist()">Filter</button>
                <button class="btn btn-secondary" onclick="downloadShortlistCSV()">Download CSV</button>
            </div>
        </div>
        <div id="shortlist-results"></div>
    `;
    
    loadShortlist();
}

/**
 * Load shortlist
 */
async function loadShortlist(status = null) {
    const resultsDiv = document.getElementById('shortlist-results');
    resultsDiv.innerHTML = createLoader().outerHTML;
    
    try {
        const shortlist = await apiClient.getShortlist(status);
        
        if (shortlist.length === 0) {
            resultsDiv.innerHTML = `
                <div class="card" style="text-align: center; padding: 40px;">
                    <h3>No shortlisted candidates yet</h3>
                    <p>Use the candidate search to find and shortlist candidates</p>
                    <button class="btn btn-primary" onclick="showCandidateSearch()">Search Candidates</button>
                </div>
            `;
            return;
        }
        
        resultsDiv.innerHTML = `
            <p style="margin-bottom: 20px; color: #666;">${shortlist.length} candidates shortlisted</p>
            ${shortlist.map(candidate => renderShortlistCard(candidate)).join('')}
        `;
    } catch (error) {
        resultsDiv.innerHTML = `<div class="error-message">Failed to load shortlist: ${error.message}</div>`;
    }
}

/**
 * Filter shortlist
 */
function filterShortlist() {
    const status = document.getElementById('status-filter').value;
    loadShortlist(status || null);
}

/**
 * Render shortlist card
 */
function renderShortlistCard(candidate) {
    const matchScore = candidate.match_score || 0;
    const matchClass = matchScore >= 75 ? 'match-high' : matchScore >= 50 ? 'match-medium' : 'match-low';
    
    return `
        <div class="candidate-card">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                <div style="flex: 1;">
                    <h3 style="margin: 0 0 10px 0; color: #667eea;">
                        ${candidate.first_name || ''} ${candidate.last_name || 'Candidate'}
                    </h3>
                    <span class="status-badge status-${candidate.status}">${candidate.status}</span>
                    ${candidate.job_title ? `<span class="status-badge" style="background: #607d8b; color: white;">For: ${candidate.job_title}</span>` : ''}
                </div>
                ${matchScore > 0 ? `<div class="match-score ${matchClass}">${Math.round(matchScore)}% Match</div>` : ''}
            </div>
            
            <p style="margin: 5px 0; color: #666;">
                📍 ${candidate.location || 'N/A'} | 
                💼 ${candidate.years_experience || 0} years | 
                📧 ${candidate.candidate_email}
            </p>
            
            ${candidate.skills ? `<p><strong>Skills:</strong> ${candidate.skills.split(',').slice(0, 5).join(', ')}</p>` : ''}
            ${candidate.notes ? `<p style="font-style: italic; color: #666;">Notes: ${candidate.notes}</p>` : ''}
            <p style="font-size: 0.9rem; color: #999;">Shortlisted: ${formatDate(candidate.shortlisted_date)}</p>
            
            <div style="margin-top: 15px; display: flex; gap: 10px; flex-wrap: wrap;">
                <button class="btn btn-primary" onclick="viewCandidateProfile(${candidate.candidate_id})">
                    View Profile
                </button>
                <select id="status-${candidate.id}" onchange="updateShortlistStatus(${candidate.id}, this.value)" 
                        style="padding: 8px; border-radius: 8px;">
                    <option value="">Update Status...</option>
                    <option value="contacted">Mark as Contacted</option>
                    <option value="interviewing">Mark as Interviewing</option>
                    <option value="hired">Mark as Hired</option>
                    <option value="rejected">Mark as Rejected</option>
                </select>
                ${candidate.phone ? `<a href="tel:${candidate.phone}" class="btn btn-secondary">📞 Call</a>` : ''}
                ${candidate.candidate_email ? `<a href="mailto:${candidate.candidate_email}" class="btn btn-secondary">✉️ Email</a>` : ''}
                <button class="btn btn-danger" onclick="removeFromShortlist(${candidate.id})">Remove</button>
            </div>
        </div>
    `;
}

/**
 * Update shortlist status
 */
async function updateShortlistStatus(shortlistId, status) {
    if (!status) return;
    
    try {
        await apiClient.updateShortlistStatus(shortlistId, status);
        showSuccess('Status updated!', document.getElementById('content'));
        loadShortlist();
    } catch (error) {
        showError('Failed to update status: ' + error.message, document.getElementById('content'));
    }
}

/**
 * Download shortlisted candidates as CSV
 */
async function downloadShortlistCSV() {
    try {
        const shortlist = await apiClient.getShortlist();
        
        if (!shortlist || shortlist.length === 0) {
            alert('No candidates to download.');
            return;
        }
        
        // CSV headers
        const headers = ['Name', 'Email', 'Phone', 'Location', 'Address', 'Job of Choice', 'Skills', 'Match Score', 'Status', 'Notes', 'Shortlisted Date'];
        
        // CSV rows
        const rows = shortlist.map(candidate => {
            const name = `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim();
            const email = candidate.candidate_email || '';
            const phone = candidate.phone || '';
            const location = candidate.location || '';
            const address = candidate.address || '';
            const jobOfChoice = candidate.job_of_choice || '';
            const skills = candidate.skills ? candidate.skills.split(',').map(s => s.trim()).join('; ') : '';
            const matchScore = candidate.match_score ? Math.round(candidate.match_score) : '';
            const status = candidate.status || '';
            const notes = (candidate.notes || '').replace(/"/g, '""'); // Escape quotes
            const date = candidate.shortlisted_date ? formatDate(candidate.shortlisted_date) : '';
            
            // Escape CSV values
            const escapeCSV = (val) => {
                if (val === null || val === undefined) return '';
                const str = String(val);
                if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            };
            
            return [
                escapeCSV(name),
                escapeCSV(email),
                escapeCSV(phone),
                escapeCSV(location),
                escapeCSV(address),
                escapeCSV(jobOfChoice),
                escapeCSV(skills),
                escapeCSV(matchScore),
                escapeCSV(status),
                escapeCSV(notes),
                escapeCSV(date)
            ].join(',');
        });
        
        // Combine headers and rows
        const csvContent = [headers.join(','), ...rows].join('\n');
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `shortlisted_candidates_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showSuccess('CSV downloaded successfully!', document.getElementById('content'));
    } catch (error) {
        showError('Failed to download CSV: ' + error.message, document.getElementById('content'));
    }
}

/**
 * Remove from shortlist
 */
async function removeFromShortlist(shortlistId) {
    if (!confirm('Remove this candidate from shortlist?')) return;
    
    try {
        await apiClient.removeFromShortlist(shortlistId);
        showSuccess('Candidate removed from shortlist', document.getElementById('content'));
        loadShortlist();
    } catch (error) {
        showError('Failed to remove: ' + error.message, document.getElementById('content'));
    }
}

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
                    <button class="btn btn-primary" onclick="viewApplications(${job.id})">View Applications</button>
                    <button class="btn btn-secondary" onclick="editJob(${job.id})">Edit</button>
                    <button class="btn btn-danger" onclick="deleteJob(${job.id})">Delete</button>
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
        <div style="margin-bottom: 30px;">
            <h2 style="margin: 0; color: #0B3D91; font-size: 2rem; font-weight: 700;">✨ Create New Job Posting</h2>
            <p style="color: #666; margin-top: 8px; font-size: 1.1rem;">Fill in the details below to post a new job opportunity</p>
        </div>
        
        <form id="create-job-form" style="background: white; padding: 40px; border-radius: 16px; box-shadow: 0 8px 32px rgba(11, 61, 145, 0.1); border: 2px solid rgba(65, 105, 225, 0.1);">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px;">
                <div class="form-group" style="margin: 0;">
                    <label style="display: block; font-weight: 600; color: #0B3D91; margin-bottom: 8px; font-size: 0.95rem;">Job Title: <span style="color: #e74c3c;">*</span></label>
                    <input type="text" id="job-title" required 
                           style="width: 100%; padding: 14px 16px; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 1rem; transition: all 0.3s ease; background: #fafafa;"
                           onfocus="this.style.borderColor='#4169E1'; this.style.background='white'; this.style.boxShadow='0 0 0 3px rgba(65,105,225,0.1)'"
                           onblur="this.style.borderColor='#e0e0e0'; this.style.background='#fafafa'; this.style.boxShadow='none'"
                           placeholder="e.g., Senior Software Engineer">
                </div>
                
                <div class="form-group" style="margin: 0;">
                    <label style="display: block; font-weight: 600; color: #0B3D91; margin-bottom: 8px; font-size: 0.95rem;">Company: <span style="color: #e74c3c;">*</span></label>
                    <input type="text" id="company" required 
                           style="width: 100%; padding: 14px 16px; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 1rem; transition: all 0.3s ease; background: #fafafa;"
                           onfocus="this.style.borderColor='#4169E1'; this.style.background='white'; this.style.boxShadow='0 0 0 3px rgba(65,105,225,0.1)'"
                           onblur="this.style.borderColor='#e0e0e0'; this.style.background='#fafafa'; this.style.boxShadow='none'"
                           placeholder="Your company name">
                </div>
                
                <div class="form-group" style="margin: 0;">
                    <label style="display: block; font-weight: 600; color: #0B3D91; margin-bottom: 8px; font-size: 0.95rem;">📍 Location:</label>
                    <input type="text" id="location" 
                           style="width: 100%; padding: 14px 16px; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 1rem; transition: all 0.3s ease; background: #fafafa;"
                           onfocus="this.style.borderColor='#4169E1'; this.style.background='white'; this.style.boxShadow='0 0 0 3px rgba(65,105,225,0.1)'"
                           onblur="this.style.borderColor='#e0e0e0'; this.style.background='#fafafa'; this.style.boxShadow='none'"
                           placeholder="e.g., San Francisco, CA">
                </div>
                
                <div class="form-group" style="margin: 0;">
                    <label style="display: block; font-weight: 600; color: #0B3D91; margin-bottom: 8px; font-size: 0.95rem;">Employment Type:</label>
                    <select id="employment-type" 
                            style="width: 100%; padding: 14px 16px; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 1rem; transition: all 0.3s ease; background: #fafafa; cursor: pointer;"
                            onfocus="this.style.borderColor='#4169E1'; this.style.background='white'; this.style.boxShadow='0 0 0 3px rgba(65,105,225,0.1)'"
                            onblur="this.style.borderColor='#e0e0e0'; this.style.background='#fafafa'; this.style.boxShadow='none'">
                        <option value="full-time">Full Time</option>
                        <option value="part-time">Part Time</option>
                        <option value="contract">Contract</option>
                        <option value="internship">Internship</option>
                    </select>
                </div>
                
                <div class="form-group" style="margin: 0;">
                    <label style="display: block; font-weight: 600; color: #0B3D91; margin-bottom: 8px; font-size: 0.95rem;">💰 Min Salary:</label>
                    <input type="number" id="min-salary" 
                           style="width: 100%; padding: 14px 16px; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 1rem; transition: all 0.3s ease; background: #fafafa;"
                           onfocus="this.style.borderColor='#4169E1'; this.style.background='white'; this.style.boxShadow='0 0 0 3px rgba(65,105,225,0.1)'"
                           onblur="this.style.borderColor='#e0e0e0'; this.style.background='#fafafa'; this.style.boxShadow='none'"
                           placeholder="e.g., 80000">
                </div>
                
                <div class="form-group" style="margin: 0;">
                    <label style="display: block; font-weight: 600; color: #0B3D91; margin-bottom: 8px; font-size: 0.95rem;">💰 Max Salary:</label>
                    <input type="number" id="max-salary" 
                           style="width: 100%; padding: 14px 16px; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 1rem; transition: all 0.3s ease; background: #fafafa;"
                           onfocus="this.style.borderColor='#4169E1'; this.style.background='white'; this.style.boxShadow='0 0 0 3px rgba(65,105,225,0.1)'"
                           onblur="this.style.borderColor='#e0e0e0'; this.style.background='#fafafa'; this.style.boxShadow='none'"
                           placeholder="e.g., 120000">
                </div>
            </div>
            
            <div class="form-group full-width" style="margin: 25px 0 0 0;">
                <label style="display: block; font-weight: 600; color: #0B3D91; margin-bottom: 8px; font-size: 0.95rem;">📝 Description: <span style="color: #e74c3c;">*</span></label>
                <textarea id="description" rows="10" required 
                          style="width: 100%; padding: 14px 16px; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 1rem; transition: all 0.3s ease; background: #fafafa; resize: vertical; font-family: inherit;"
                          onfocus="this.style.borderColor='#4169E1'; this.style.background='white'; this.style.boxShadow='0 0 0 3px rgba(65,105,225,0.1)'"
                          onblur="this.style.borderColor='#e0e0e0'; this.style.background='#fafafa'; this.style.boxShadow='none'"
                          placeholder="Provide a detailed description of the job, including responsibilities, requirements, and benefits..."></textarea>
            </div>
            
            <div style="display: flex; gap: 12px; margin-top: 35px; justify-content: flex-end;">
                <button type="button" class="btn btn-secondary" onclick="showMyJobs()" 
                        style="padding: 12px 30px; font-size: 1rem; font-weight: 600; border-radius: 10px; transition: all 0.3s ease;">
                    Cancel
                </button>
                <button type="submit" class="btn btn-primary" 
                        style="padding: 12px 35px; font-size: 1rem; font-weight: 600; border-radius: 10px; 
                               background: linear-gradient(135deg, #4169E1 0%, #0B3D91 100%);
                               box-shadow: 0 4px 15px rgba(65, 105, 225, 0.3);
                               transition: all 0.3s ease; border: none;">
                    ✨ Create Job
                </button>
            </div>
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
    
    // Store jobId for the update function
    window.currentJobApplicationsJobId = jobId;
    
    content.innerHTML = '<h2>Applications</h2>';
    
    const loader = createLoader();
    content.appendChild(loader);
    
    try {
        const applications = await apiClient.getJobApplications(jobId);
        
        if (!applications || applications.length === 0) {
            content.innerHTML = '<p>No applications yet.</p>';
            return;
        }
        
        const appsHTML = applications.map(app => {
            const companyName = app.recruiter_company_name || 'Company not specified';
            const statusBadgeClass = getStatusBadgeClass(app.status);
            const currentStatus = app.status || 'pending';
            
            return `
            <div class="job-card" style="position: relative;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                    <div style="flex: 1;">
                        <h3>${app.first_name} ${app.last_name}</h3>
                        <div style="display: flex; align-items: center; gap: 15px; margin-top: 5px;">
                            <p style="margin: 5px 0;">📧 ${app.email}</p>
                            ${app.phone ? `<p style="margin: 5px 0;">📱 ${app.phone}</p>` : ''}
                        </div>
                    </div>
                    <span class="status-badge ${statusBadgeClass}" style="font-size: 0.85rem; font-weight: 600;">
                        ${currentStatus.toUpperCase()}
                    </span>
                </div>
                
                <div style="display: flex; gap: 20px; margin: 15px 0; padding: 12px; background: #f8f9fa; border-radius: 8px;">
                    <div style="flex: 1;">
                        <strong>Company:</strong><br>
                        <span style="color: #0B3D91;">${companyName}</span>
                    </div>
                    <div style="flex: 1;">
                        <strong>Applied:</strong><br>
                        ${formatDate(app.applied_date)}
                    </div>
                    ${app.reviewed_date ? `
                        <div style="flex: 1;">
                            <strong>Reviewed:</strong><br>
                            ${formatDate(app.reviewed_date)}
                        </div>
                    ` : ''}
                </div>
                
                ${app.cover_letter ? `
                    <div style="margin: 15px 0; padding: 12px; background: #f0f4ff; border-radius: 8px; border-left: 3px solid #4169E1;">
                        <strong>Cover Letter:</strong>
                        <p style="margin-top: 8px; color: #555;">${app.cover_letter.substring(0, 200)}${app.cover_letter.length > 200 ? '...' : ''}</p>
                    </div>
                ` : ''}
                
                <div class="actions" style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 20px; padding-top: 15px; border-top: 2px solid #e9ecef;">
                    <div style="flex: 1; min-width: 150px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #555;">
                            Change Status:
                        </label>
                        <select id="status-select-${app.id}" style="width: 100%; padding: 10px; border: 2px solid #4169E1; border-radius: 8px; font-weight: 600; background: white;">
                            <option value="pending" ${currentStatus === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="reviewed" ${currentStatus === 'reviewed' ? 'selected' : ''}>Reviewed</option>
                            <option value="shortlisted" ${currentStatus === 'shortlisted' ? 'selected' : ''}>Shortlisted</option>
                            <option value="accepted" ${currentStatus === 'accepted' ? 'selected' : ''}>Accepted</option>
                            <option value="rejected" ${currentStatus === 'rejected' ? 'selected' : ''}>Rejected</option>
                        </select>
                    </div>
                    <div style="flex: 1; min-width: 150px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #555;">
                            Actions:
                        </label>
                        <div style="display: flex; gap: 5px;">
                            <button class="btn btn-success" onclick="updateAppStatusFromSelect(${app.id}, ${app.id})" 
                                    style="flex: 1; padding: 10px; border-radius: 8px; font-weight: 600;">
                                ✅ Update Status
                            </button>
                            <button class="btn" onclick="contactCandidate(${app.id}, '${app.email}', '${app.first_name}', '${app.last_name}')" 
                                    style="flex: 1; padding: 10px; background: #4169E1; color: white; border-radius: 8px; font-weight: 600; border: none;">
                                ✉️ Contact
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        }).join('');
        
        content.innerHTML = `
            <style>
                .status-badge.match-high { background: #4CAF50; color: white; padding: 6px 12px; border-radius: 20px; }
                .status-badge.match-medium { background: #FF9800; color: white; padding: 6px 12px; border-radius: 20px; }
                .status-badge.match-low { background: #F44336; color: white; padding: 6px 12px; border-radius: 20px; }
                .status-badge.status-neutral { background: #2196F3; color: white; padding: 6px 12px; border-radius: 20px; }
            </style>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                <h2 style="margin: 0;">📋 Job Applications</h2>
                <button class="btn btn-secondary" onclick="showMyJobs()" style="padding: 10px 20px; border-radius: 8px;">
                    ← Back to Jobs
                </button>
            </div>
            ${appsHTML}
        `;
    } catch (error) {
        content.innerHTML = '<div class="error-message">Failed to load applications: ' + error.message + '</div>';
    }
}

/**
 * Get status badge class based on status
 */
function getStatusBadgeClass(status) {
    switch (status) {
        case 'accepted':
        case 'hired':
            return 'match-high';
        case 'shortlisted':
        case 'reviewed':
            return 'match-medium';
        case 'rejected':
            return 'match-low';
        default:
            return 'status-neutral';
    }
}

/**
 * Update application status from select dropdown
 */
async function updateAppStatusFromSelect(appId, selectId) {
    const select = document.getElementById(`status-select-${selectId}`);
    const newStatus = select.value;
    
    if (!newStatus) {
        showError('Please select a status', document.getElementById('content'));
        return;
    }
    
    try {
        await apiClient.updateApplicationStatus(appId, newStatus);
        showSuccess(`Status updated to ${newStatus}!`, document.getElementById('content'));
        
        // Reload applications to show updated status
        if (window.currentJobApplicationsJobId) {
            await viewApplications(window.currentJobApplicationsJobId);
        } else {
            // If viewing all applications, reload that view
            await showApplications();
        }
    } catch (error) {
        showError('Failed to update status: ' + error.message, document.getElementById('content'));
    }
}

/**
 * Update application status
 */
async function updateAppStatus(applicationId, status) {
    try {
        await apiClient.updateApplicationStatus(applicationId, status);
        showSuccess('Application status updated!', document.getElementById('content'));
        
        // Reload applications to show updated status
        if (window.currentJobApplicationsJobId) {
            await viewApplications(window.currentJobApplicationsJobId);
        }
    } catch (error) {
        showError('Failed to update status: ' + error.message, document.getElementById('content'));
    }
}

/**
 * Contact candidate via email
 */
function contactCandidate(appId, email, firstName, lastName) {
    const candidateName = `${firstName} ${lastName}`;
    const subject = encodeURIComponent(`Regarding Your Job Application`);
    const body = encodeURIComponent(`Hello ${firstName},\n\nThank you for your interest in the position. We wanted to reach out regarding your application.\n\nBest regards,\n[Your Name]`);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${subject}&body=${body}`;
    
    window.open(gmailUrl, '_blank');
}

/**
 * Edit job
 */
function editJob(jobId) {
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
                // Add company info to each application
                const appsWithCompany = apps.map(app => ({
                    ...app,
                    company: job.company || app.recruiter_company_name
                }));
                allApps.push(...appsWithCompany);
            } catch (error) {
                console.error(`Error fetching applications for job ${job.id}:`, error);
            }
        }
        
        if (!allApps || allApps.length === 0) {
            content.innerHTML = '<p>No applications yet.</p>';
            return;
        }
        
        const appsHTML = allApps.map(app => {
            const companyName = app.company || app.recruiter_company_name || 'Company not specified';
            const statusBadgeClass = getStatusBadgeClass(app.status);
            const currentStatus = app.status || 'pending';
            
            return `
            <div class="job-card" style="position: relative;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                    <div style="flex: 1;">
                        <h3>${app.first_name} ${app.last_name}</h3>
                        <div style="display: flex; align-items: center; gap: 15px; margin-top: 5px;">
                            <p style="margin: 5px 0;">📧 ${app.email}</p>
                            ${app.phone ? `<p style="margin: 5px 0;">📱 ${app.phone}</p>` : ''}
                        </div>
                    </div>
                    <span class="status-badge ${statusBadgeClass}" style="font-size: 0.85rem; font-weight: 600;">
                        ${currentStatus.toUpperCase()}
                    </span>
                </div>
                
                <div style="display: flex; gap: 20px; margin: 15px 0; padding: 12px; background: #f8f9fa; border-radius: 8px;">
                    <div style="flex: 1;">
                        <strong>Company:</strong><br>
                        <span style="color: #0B3D91;">${companyName}</span>
                    </div>
                    ${app.job_title ? `
                        <div style="flex: 1;">
                            <strong>Position:</strong><br>
                            <span style="color: #4169E1;">${app.job_title}</span>
                        </div>
                    ` : ''}
                    <div style="flex: 1;">
                        <strong>Applied:</strong><br>
                        ${formatDate(app.applied_date)}
                    </div>
                    ${app.reviewed_date ? `
                        <div style="flex: 1;">
                            <strong>Reviewed:</strong><br>
                            ${formatDate(app.reviewed_date)}
                        </div>
                    ` : ''}
                </div>
                
                ${app.cover_letter ? `
                    <div style="margin: 15px 0; padding: 12px; background: #f0f4ff; border-radius: 8px; border-left: 3px solid #4169E1;">
                        <strong>Cover Letter:</strong>
                        <p style="margin-top: 8px; color: #555;">${app.cover_letter.substring(0, 200)}${app.cover_letter.length > 200 ? '...' : ''}</p>
                    </div>
                ` : ''}
                
                <div class="actions" style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 20px; padding-top: 15px; border-top: 2px solid #e9ecef;">
                    <div style="flex: 1; min-width: 150px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #555;">
                            Change Status:
                        </label>
                        <select id="status-select-${app.id}" style="width: 100%; padding: 10px; border: 2px solid #4169E1; border-radius: 8px; font-weight: 600; background: white;">
                            <option value="pending" ${currentStatus === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="reviewed" ${currentStatus === 'reviewed' ? 'selected' : ''}>Reviewed</option>
                            <option value="shortlisted" ${currentStatus === 'shortlisted' ? 'selected' : ''}>Shortlisted</option>
                            <option value="accepted" ${currentStatus === 'accepted' ? 'selected' : ''}>Accepted</option>
                            <option value="rejected" ${currentStatus === 'rejected' ? 'selected' : ''}>Rejected</option>
                        </select>
                    </div>
                    <div style="flex: 1; min-width: 150px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #555;">
                            Actions:
                        </label>
                        <div style="display: flex; gap: 5px;">
                            <button class="btn btn-success" onclick="updateAppStatusFromSelect(${app.id}, ${app.id})" 
                                    style="flex: 1; padding: 10px; border-radius: 8px; font-weight: 600;">
                                ✅ Update Status
                            </button>
                            <button class="btn" onclick="contactCandidate(${app.id}, '${app.email}', '${app.first_name}', '${app.last_name}')" 
                                    style="flex: 1; padding: 10px; background: #4169E1; color: white; border-radius: 8px; font-weight: 600; border: none;">
                                ✉️ Contact
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        }).join('');
        
        content.innerHTML = `
            <style>
                .status-badge.match-high { background: #4CAF50; color: white; padding: 6px 12px; border-radius: 20px; }
                .status-badge.match-medium { background: #FF9800; color: white; padding: 6px 12px; border-radius: 20px; }
                .status-badge.match-low { background: #F44336; color: white; padding: 6px 12px; border-radius: 20px; }
                .status-badge.status-neutral { background: #2196F3; color: white; padding: 6px 12px; border-radius: 20px; }
            </style>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                <h2 style="margin: 0;">📋 All Applications</h2>
            </div>
            ${appsHTML}
        `;
    } catch (error) {
        content.innerHTML = '<div class="error-message">Failed to load applications: ' + error.message + '</div>';
    }
}

// Make functions globally available
window.showCandidateSearch = showCandidateSearch;
window.searchCandidates = searchCandidates;
window.viewCandidateProfile = viewCandidateProfile;
window.shortlistCandidate = shortlistCandidate;
window.showShortlist = showShortlist;
window.filterShortlist = filterShortlist;
window.updateShortlistStatus = updateShortlistStatus;
window.removeFromShortlist = removeFromShortlist;
window.downloadShortlistCSV = downloadShortlistCSV;
window.showMyJobs = showMyJobs;
window.showCreateJob = showCreateJob;
window.viewApplications = viewApplications;
window.updateAppStatusFromSelect = updateAppStatusFromSelect;
window.contactCandidate = contactCandidate;
window.updateAppStatus = updateAppStatus;
window.getStatusBadgeClass = getStatusBadgeClass;
window.editJob = editJob;
window.deleteJob = deleteJob;
window.showApplications = showApplications;
window.createJob = createJob;

// Load candidate search by default and show welcome message
window.addEventListener('DOMContentLoaded', async () => {
    if (getCurrentUserRole() === 'recruiter') {
        // Load user info to display welcome message
        try {
            const userInfo = await apiClient.getCurrentUser();
            const userNameEl = document.getElementById('user-name');
            const companyNameSpan = document.getElementById('company-name-span');
            
            if (userNameEl && userInfo) {
                const firstName = userInfo.first_name || '';
                const lastName = userInfo.last_name || '';
                const displayName = firstName || lastName ? `${firstName} ${lastName}`.trim() : userInfo.email.split('@')[0];
                userNameEl.textContent = displayName;
            }
            
            if (companyNameSpan && userInfo && userInfo.company_name) {
                companyNameSpan.innerHTML = ` | <strong style="color: #FFD700;">${userInfo.company_name}</strong>`;
            }
        } catch (error) {
            console.warn('Could not load user info:', error);
        }
        
        showCandidateSearch();
    }
});

// Expose functions globally for onclick handlers
window.showCandidateSearch = showCandidateSearch;
window.searchCandidates = searchCandidates;
window.viewCandidateProfile = viewCandidateProfile;
window.shortlistCandidate = shortlistCandidate;
window.filterShortlist = filterShortlist;
window.downloadShortlistCSV = downloadShortlistCSV;
window.removeFromShortlist = removeFromShortlist;
window.showCreateJob = showCreateJob;
window.createJob = createJob;
window.showMyJobs = showMyJobs;
window.viewApplications = viewApplications;
window.updateAppStatusFromSelect = updateAppStatusFromSelect;
window.contactCandidate = contactCandidate;
window.updateAppStatus = updateAppStatus;
window.getStatusBadgeClass = getStatusBadgeClass;
window.editJob = editJob;
window.deleteJob = deleteJob;
