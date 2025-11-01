/**
 * Admin Dashboard Module
 * Handles admin-specific functionality
 */

import { apiClient } from './api-client.js';

/**
 * Load dashboard data
 */
async function loadDashboard() {
    try {
        const stats = await apiClient.request('/admin/stats', { method: 'GET' });
        
        // Display stats
        const statsHTML = `
            <div class="features" style="margin-top: 20px;">
                <div class="feature-card">
                    <h3>Total Users</h3>
                    <p style="font-size: 2rem; color: #667eea; font-weight: bold;">
                        ${stats.users_by_role.reduce((sum, role) => sum + role.count, 0)}
                    </p>
                </div>
                <div class="feature-card">
                    <h3>Total Jobs</h3>
                    <p style="font-size: 2rem; color: #667eea; font-weight: bold;">${stats.total_jobs}</p>
                </div>
                <div class="feature-card">
                    <h3>Active Jobs</h3>
                    <p style="font-size: 2rem; color: #667eea; font-weight: bold;">${stats.active_jobs}</p>
                </div>
                <div class="feature-card">
                    <h3>Applications</h3>
                    <p style="font-size: 2rem; color: #667eea; font-weight: bold;">${stats.total_applications}</p>
                </div>
            </div>
        `;
        
        document.getElementById('stats').innerHTML = statsHTML;
        
        // Load and display users
        await loadUsers();
    } catch (error) {
        showError('Failed to load dashboard data: ' + error.message, document.getElementById('content'));
    }
}

/**
 * Load users list
 */
async function loadUsers() {
    try {
        const users = await apiClient.request('/admin/users', { method: 'GET' });
        
        // Filter out admin users - only show jobseekers and recruiters
        const filteredUsers = users.filter(user => user.role !== 'admin');
        
        const usersHTML = `
            <h2 style="margin-top: 40px;">All Users</h2>
            ${filteredUsers.map(user => `
                <div class="job-card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                    <div style="flex: 1;">
                        <h3>${user.email}</h3>
                        <p>Role: <strong>${user.role}</strong></p>
                        <p>Name: ${user.first_name || ''} ${user.last_name || ''}</p>
                        <p>Registered: ${formatDate(user.created_at)}</p>
                    </div>
                    <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                        <select id="role-select-${user.id}" onchange="updateUserRole(${user.id}, this.value)" 
                                style="padding: 8px 12px; border-radius: 6px; border: 1px solid #ddd;">
                            <option value="jobseeker" ${user.role === 'jobseeker' ? 'selected' : ''}>Job Seeker</option>
                            <option value="recruiter" ${user.role === 'recruiter' ? 'selected' : ''}>Recruiter</option>
                        </select>
                        <button type="button" class="btn btn-danger" onclick="deleteUser(${user.id}, '${user.email.replace(/'/g, "\\'")}')" 
                                style="padding: 8px 16px; background: #dc3545; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            `).join('')}
        `;
        
        document.getElementById('users-list').innerHTML = usersHTML;
    } catch (error) {
        showError('Failed to load users: ' + error.message, document.getElementById('users-list'));
    }
}

/**
 * Update user role
 */
async function updateUserRole(userId, newRole) {
    if (!confirm('Are you sure you want to change this user\'s role?')) {
        return;
    }
    
    try {
        await apiClient.request(`/admin/users/${userId}/role`, {
            method: 'PUT',
            body: JSON.stringify({ new_role: newRole })
        });
        
        showSuccess('User role updated successfully!', document.getElementById('content'));
        loadUsers();
    } catch (error) {
        showError('Failed to update user role: ' + error.message, document.getElementById('content'));
    }
}

/**
 * Delete user
 */
async function deleteUser(userId, userEmail) {
    // Strong confirmation warning
    const confirmMessage = `⚠️ WARNING: This will permanently delete the user "${userEmail}" and ALL their data!\n\n` +
                          `This includes:\n` +
                          `- User profile\n` +
                          `- All skills\n` +
                          `- All resumes\n` +
                          `- All applications\n` +
                          `- All saved jobs\n` +
                          `- Job postings (if recruiter)\n` +
                          `- Shortlisted candidates (if recruiter)\n\n` +
                          `This action CANNOT be undone!\n\n` +
                          `Type "DELETE" to confirm:`;
    
    const confirmation = prompt(confirmMessage);
    
    if (confirmation !== 'DELETE') {
        if (confirmation !== null) {
            alert('Deletion cancelled. You must type "DELETE" exactly to confirm.');
        }
        return;
    }
    
    try {
        const result = await apiClient.deleteUser(userId);
        
        // Show detailed success message
        const message = `✅ User deleted successfully!\n\n` +
                       `Deleted: ${result.deleted_user.email}\n` +
                       `Role: ${result.deleted_user.role}\n` +
                       `Resumes deleted: ${result.cleanup.resumes_deleted}\n` +
                       `Job postings deleted: ${result.cleanup.job_postings_deleted}\n` +
                       `Embeddings cleaned: ${result.cleanup.embeddings_cleaned}`;
        
        alert(message);
        
        // Reload users list
        await loadUsers();
        await loadDashboard(); // Refresh stats
    } catch (error) {
        showError('Failed to delete user: ' + error.message, document.getElementById('content'));
    }
}

// Make functions globally available
window.updateUserRole = updateUserRole;
window.deleteUser = deleteUser;

// Load dashboard on page load
window.addEventListener('DOMContentLoaded', () => {
    if (getCurrentUserRole() !== 'admin') {
        window.location.href = 'index.html';
        return;
    }
    loadDashboard();
});

