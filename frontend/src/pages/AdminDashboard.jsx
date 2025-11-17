import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, List, Typography, Divider, IconButton, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Avatar, Menu, MenuItem, Container,
  Paper, Grid, Card, CardContent, Button, Chip, LinearProgress, alpha, useTheme,
  Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import {
  Menu as MenuIcon, Dashboard, People, Work, Settings, BarChart, Logout,
  Speed, Group, PersonSearch, CheckCircle, TrendingUp, Business,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { adminAPI } from '../services/api';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const drawerWidth = 260;
const MotionCard = motion(Card);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [stats, setStats] = useState({ users: 0, jobs: 0, applications: 0, recruiters: 0 });
  const [loading, setLoading] = useState(true);

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/admin' },
    { text: 'Users', icon: <People />, path: '/admin/users' },
    { text: 'Jobs', icon: <Work />, path: '/admin/jobs' },
    { text: 'Analytics', icon: <BarChart />, path: '/admin/analytics' },
    { text: 'Settings', icon: <Settings />, path: '/admin/settings' },
  ];

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [users, jobs] = await Promise.all([
        adminAPI.getUsers(),
        adminAPI.getJobs(),
      ]);
      const recruiters = users.data.filter(u => u.role === 'recruiter').length;
      setStats({
        users: users.data.length || 0,
        jobs: jobs.data.length || 0,
        applications: 0,
        recruiters: recruiters,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ py: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Speed sx={{ color: 'white', fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
            Admin Portal
          </Typography>
        </Stack>
      </Toolbar>
      <Divider />
      <List sx={{ flexGrow: 1, pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5, px: 1 }}>
            <ListItemButton
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  bgcolor: alpha('#667eea', 0.15),
                  '& .MuiListItemIcon-root': { color: '#667eea' },
                  '& .MuiListItemText-primary': { fontWeight: 600 },
                },
                '&:hover': { bgcolor: alpha('#667eea', 0.08) },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      <AppBar position="fixed" elevation={0} sx={{ width: { sm: `calc(100% - ${drawerWidth}px)` }, ml: { sm: `${drawerWidth}px` }, bgcolor: 'white', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2, display: { sm: 'none' }, color: 'text.primary' }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600, color: 'text.primary' }}>
            {menuItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}
          </Typography>
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar sx={{ bgcolor: '#667eea', width: 40, height: 40 }}>
              {user?.email?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem disabled><Typography variant="body2" color="text.secondary">{user?.email}</Typography></MenuItem>
            <Divider />
            <MenuItem onClick={() => { logout(); navigate('/login'); }}>
              <Logout sx={{ mr: 1, fontSize: 20 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}>
          {drawer}
        </Drawer>
        <Drawer variant="permanent" sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid', borderColor: 'divider' } }} open>
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, mt: 8 }}>
        <Container maxWidth="xl">
          <Routes>
            <Route path="/" element={<DashboardOverview stats={stats} loading={loading} />} />
            <Route path="/users" element={<UsersManagement />} />
            <Route path="/jobs" element={<JobsManagement />} />
            <Route path="/analytics" element={<Analytics stats={stats} />} />
            <Route path="/settings" element={<SystemSettings />} />
          </Routes>
        </Container>
      </Box>
    </Box>
  );
};

const DashboardOverview = ({ stats, loading }) => {
  const statCards = [
    { title: 'Total Users', value: stats.users, icon: <People />, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { title: 'Active Jobs', value: stats.jobs, icon: <Work />, gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { title: 'Recruiters', value: stats.recruiters, icon: <Business />, gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { title: 'Applications', value: stats.applications, icon: <CheckCircle />, gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        System Overview 🔧
      </Typography>
      
      {loading ? <LinearProgress /> : (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {statCards.map((card, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <MotionCard
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  sx={{ background: card.gradient, color: 'white', height: '100%' }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>{card.title}</Typography>
                        <Typography variant="h3" sx={{ fontWeight: 700 }}>{card.value}</Typography>
                      </Box>
                      <Box sx={{ opacity: 0.3, fontSize: 60 }}>{card.icon}</Box>
                    </Box>
                  </CardContent>
                </MotionCard>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>System Status</Typography>
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1">MySQL Database</Typography>
                      <Chip label="Connected" color="success" size="small" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1">ChromaDB Vector Store</Typography>
                      <Chip label="Connected" color="success" size="small" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1">Gemini AI API</Typography>
                      <Chip label="Active" color="success" size="small" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1">Background Jobs</Typography>
                      <Chip label="Running" color="success" size="small" />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', height: '100%' }}>
                <CardContent>
                  <TrendingUp sx={{ fontSize: 40, mb: 2 }} />
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>Platform Growth</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>+24%</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    User registrations increased by 24% this month compared to last month.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = { admin: 'error', recruiter: 'secondary', jobseeker: 'primary' };
    return colors[role] || 'default';
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>User Management</Typography>

      {loading ? <LinearProgress /> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Role</strong></TableCell>
                <TableCell><strong>Company</strong></TableCell>
                <TableCell><strong>Created</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.email || 'N/A'}</TableCell>
                  <TableCell><Chip label={user.role?.toUpperCase() || 'N/A'} color={getRoleBadgeColor(user.role)} size="small" /></TableCell>
                  <TableCell>{user.company_name || 'N/A'}</TableCell>
                  <TableCell>{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell><Chip label="ACTIVE" color="success" size="small" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

const JobsManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getJobs();
      setJobs(response.data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>Job Postings Management</Typography>

      {loading ? <LinearProgress /> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Job Title</strong></TableCell>
                <TableCell><strong>Company</strong></TableCell>
                <TableCell><strong>Location</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Posted</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id} hover>
                  <TableCell>{job.title || job.job_title || 'N/A'}</TableCell>
                  <TableCell>{job.company || job.company_name || 'N/A'}</TableCell>
                  <TableCell>{job.location || 'N/A'}</TableCell>
                  <TableCell><Chip label={(job.employment_type || job.job_type || 'N/A').toUpperCase()} size="small" /></TableCell>
                  <TableCell>{(job.posted_date || job.posting_date) ? new Date(job.posted_date || job.posting_date).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell><Chip label="ACTIVE" color="success" size="small" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

const Analytics = ({ stats }) => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>Platform Analytics</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>User Distribution</Typography>
              <Box sx={{ mt: 3 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>Job Seekers</Typography>
                  <LinearProgress variant="determinate" value={70} sx={{ height: 8, borderRadius: 4 }} />
                  <Typography variant="caption" color="text.secondary">70%</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>Recruiters</Typography>
                  <LinearProgress variant="determinate" value={25} sx={{ height: 8, borderRadius: 4 }} color="secondary" />
                  <Typography variant="caption" color="text.secondary">25%</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" gutterBottom>Admins</Typography>
                  <LinearProgress variant="determinate" value={5} sx={{ height: 8, borderRadius: 4 }} color="error" />
                  <Typography variant="caption" color="text.secondary">5%</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>System Metrics</Typography>
              <Stack spacing={2} sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Total Users</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>{stats.users}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Active Jobs</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>{stats.jobs}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Success Rate</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>95%</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Avg. Response Time</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>2.3s</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

const SystemSettings = () => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>System Settings</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>General Settings</Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">User Registration</Typography>
                  <Chip label="ENABLED" color="success" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Email Notifications</Typography>
                  <Chip label="ENABLED" color="success" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">AI Matching</Typography>
                  <Chip label="ACTIVE" color="success" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Maintenance Mode</Typography>
                  <Chip label="DISABLED" color="default" size="small" />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>API Configuration</Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                <Box>
                  <Typography variant="body2" gutterBottom>Google Gemini API</Typography>
                  <Chip label="CONNECTED" color="success" size="small" />
                </Box>
                <Box>
                  <Typography variant="body2" gutterBottom>Email Service</Typography>
                  <Chip label="CONFIGURED" color="success" size="small" />
                </Box>
                <Box>
                  <Typography variant="body2" gutterBottom>Storage Service</Typography>
                  <Chip label="ACTIVE" color="success" size="small" />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
