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
        
        const usersHTML = `
            <h2 style="margin-top: 40px;">All Users</h2>
            ${users.map(user => `
                <div class="job-card">
                    <h3>${user.email}</h3>
                    <p>Role: <strong>${user.role}</strong></p>
                    <p>Name: ${user.first_name || ''} ${user.last_name || ''}</p>
                    <p>Registered: ${formatDate(user.created_at)}</p>
                    <select id="role-select-${user.id}" onchange="updateUserRole(${user.id}, this.value)">
                        <option value="jobseeker" ${user.role === 'jobseeker' ? 'selected' : ''}>Job Seeker</option>
                        <option value="recruiter" ${user.role === 'recruiter' ? 'selected' : ''}>Recruiter</option>
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                    </select>
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

// Make functions globally available
window.updateUserRole = updateUserRole;

// Load dashboard on page load
window.addEventListener('DOMContentLoaded', () => {
    if (getCurrentUserRole() !== 'admin') {
        window.location.href = 'index.html';
        return;
    }
    loadDashboard();
});

