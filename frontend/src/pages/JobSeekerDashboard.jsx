import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, List, Typography, Divider, IconButton, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Avatar, Menu, MenuItem, Container,
  Paper, Grid, Card, CardContent, Button, Chip, LinearProgress, alpha, useTheme,
  Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions, InputAdornment,
  Autocomplete, Tabs, Tab, Stepper, Step, StepLabel, Radio, RadioGroup, FormControlLabel,
  CircularProgress,
} from '@mui/material';
import {
  Menu as MenuIcon, Dashboard, Work, Description, FolderSpecial, Assignment,
  Person, Logout, TrendingUp, Add, Search, LocationOn, AttachMoney, Business,
  Delete, CloudUpload, CheckCircle, Stars, Speed, Group, PersonSearch,
  Edit, Create, Phone, Email, Language, School, WorkHistory, LinkedIn,
  GitHub, Public, CalendarToday, Badge,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { jobSeekerAPI } from '../services/api';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const drawerWidth = 260;
const MotionCard = motion(Card);

const JobSeekerDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [stats, setStats] = useState({ applications: 0, savedJobs: 0, resumes: 0, skills: 0 });
  const [loading, setLoading] = useState(true);

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/jobseeker' },
    { text: 'Recommended Jobs', icon: <Stars />, path: '/jobseeker/recommended' },
    { text: 'Browse Jobs', icon: <Work />, path: '/jobseeker/jobs' },
    { text: 'My Applications', icon: <Assignment />, path: '/jobseeker/applications' },
    { text: 'My Resumes', icon: <Description />, path: '/jobseeker/resumes' },
    { text: 'My Skills', icon: <FolderSpecial />, path: '/jobseeker/skills' },
    { text: 'Profile', icon: <Person />, path: '/jobseeker/profile' },
  ];

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [apps, resumes, skills] = await Promise.all([
        jobSeekerAPI.getApplications(),
        jobSeekerAPI.getResumes(),
        jobSeekerAPI.getSkills(),
      ]);
      setStats({
        applications: apps.data.length || 0,
        resumes: resumes.data.length || 0,
        skills: skills.data.length || 0,
        savedJobs: 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ py: 2, background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})` }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Speed sx={{ color: 'white', fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
            JobMatch AI
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
                  bgcolor: alpha(theme.palette.primary.main, 0.15),
                  '& .MuiListItemIcon-root': { color: 'primary.main' },
                  '& .MuiListItemText-primary': { fontWeight: 600 },
                },
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
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
            <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40 }}>
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
            <Route path="/recommended" element={<RecommendedJobs />} />
            <Route path="/jobs" element={<BrowseJobs />} />
            <Route path="/applications" element={<MyApplications />} />
            <Route path="/resumes" element={<MyResumes loadStats={loadStats} />} />
            <Route path="/skills" element={<MySkills loadStats={loadStats} />} />
            <Route path="/profile" element={<MyProfile />} />
          </Routes>
        </Container>
      </Box>
    </Box>
  );
};

const DashboardOverview = ({ stats, loading }) => {
  const navigate = useNavigate();
  const statCards = [
    { title: 'Applications', value: stats.applications, icon: <Assignment />, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', path: '/jobseeker/applications' },
    { title: 'Saved Jobs', value: stats.savedJobs, icon: <Work />, gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', path: '/jobseeker/jobs' },
    { title: 'Resumes', value: stats.resumes, icon: <Description />, gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', path: '/jobseeker/resumes' },
    { title: 'Skills', value: stats.skills, icon: <FolderSpecial />, gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', path: '/jobseeker/skills' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        Welcome Back! 👋
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
                  whileHover={{ y: -5, cursor: 'pointer' }}
                  onClick={() => navigate(card.path)}
                  sx={{ background: card.gradient, color: 'white', height: '100%', position: 'relative', overflow: 'hidden' }}
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
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>Quick Actions</Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={6}><Button fullWidth variant="outlined" startIcon={<Stars />} onClick={() => navigate('/jobseeker/recommended')} sx={{ py: 1.5, borderColor: 'primary.main', color: 'primary.main', '&:hover': { bgcolor: 'primary.light', borderColor: 'primary.dark' } }}>Recommended Jobs</Button></Grid>
                    <Grid item xs={6}><Button fullWidth variant="outlined" startIcon={<Work />} onClick={() => navigate('/jobseeker/jobs')} sx={{ py: 1.5 }}>Browse Jobs</Button></Grid>
                    <Grid item xs={6}><Button fullWidth variant="outlined" startIcon={<Description />} onClick={() => navigate('/jobseeker/resumes')} sx={{ py: 1.5 }}>Upload Resume</Button></Grid>
                    <Grid item xs={6}><Button fullWidth variant="outlined" startIcon={<FolderSpecial />} onClick={() => navigate('/jobseeker/skills')} sx={{ py: 1.5 }}>Add Skills</Button></Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', height: '100%' }}>
                <CardContent>
                  <TrendingUp sx={{ fontSize: 40, mb: 2 }} />
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>Profile Strength</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
                    {Math.min(100, (stats.resumes * 30) + (stats.skills * 10) + 20)}%
                  </Typography>
                  <LinearProgress variant="determinate" value={Math.min(100, (stats.resumes * 30) + (stats.skills * 10) + 20)} sx={{ bgcolor: alpha('#fff', 0.3), '& .MuiLinearProgress-bar': { bgcolor: 'white' } }} />
                  <Typography variant="body2" sx={{ mt: 2, opacity: 0.9 }}>
                    {stats.resumes === 0 ? 'Upload a resume to boost your profile!' : stats.skills < 5 ? 'Add more skills to stand out!' : 'Great! Your profile looks strong.'}
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

const RecommendedJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    loadRecommendedJobs();
  }, [limit]);

  const loadRecommendedJobs = async () => {
    try {
      setLoading(true);
      const response = await jobSeekerAPI.getRecommendedJobs(limit);
      console.log('Recommended jobs loaded:', response.data);
      const jobsData = response.data || [];
      setJobs(jobsData);
    } catch (error) {
      console.error('Error loading recommended jobs:', error);
      toast.error('Failed to load recommended jobs');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId) => {
    try {
      await jobSeekerAPI.applyToJob({ job_id: jobId });
      toast.success('Application submitted successfully!');
      loadRecommendedJobs();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to apply to job');
    }
  };

  const filteredJobs = jobs;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Stars sx={{ color: 'primary.main' }} />
            Recommended Jobs For You
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Jobs matched based on your skills and profile
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Stars />}
          onClick={loadRecommendedJobs}
        >
          Refresh
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      ) : filteredJobs.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Work sx={{ fontSize: 80, opacity: 0.7, mb: 2 }} />
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            No Recommendations Yet
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
            Complete your profile and add skills to get personalized job recommendations
          </Typography>
          <Button variant="contained" sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }} onClick={() => window.location.href = '/jobseeker/skills'}>
            Add Skills
          </Button>
        </Paper>
      ) : (
        <>
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip icon={<TrendingUp />} label={`${filteredJobs.length} Jobs Matched`} color="primary" />
            <Typography variant="body2" color="text.secondary">
              Showing top matches based on your profile
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {filteredJobs.map((job) => (
              <Grid item xs={12} key={job.id}>
                <Card
                  sx={{
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6,
                    },
                    border: '2px solid',
                    borderColor: 'primary.light',
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            {job.title || job.job_title || 'Untitled Position'}
                          </Typography>
                          <Chip
                            icon={<Stars />}
                            label={`${job.match_score || 85}% Match`}
                            size="small"
                            sx={{
                              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                              color: 'white',
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Business sx={{ fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {job.company || job.company_name || 'Company Name'}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <LocationOn sx={{ fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {job.location || 'Location'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Button
                        variant="contained"
                        size="large"
                        onClick={() => handleApply(job.id)}
                        sx={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          minWidth: 120,
                          '&:hover': {
                            background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                          },
                        }}
                      >
                        Apply Now
                      </Button>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                      {job.description || job.job_description || 'No description available'}
                    </Typography>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Work sx={{ fontSize: 18, color: 'primary.main' }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary">Type</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {job.employment_type || job.job_type || 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AttachMoney sx={{ fontSize: 18, color: 'success.main' }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary">Salary</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {job.min_salary && job.max_salary
                                ? `$${job.min_salary.toLocaleString()} - $${job.max_salary.toLocaleString()}`
                                : 'Competitive'}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Group sx={{ fontSize: 18, color: 'info.main' }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary">Applicants</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {job.application_count || 0}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TrendingUp sx={{ fontSize: 18, color: 'warning.main' }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary">Posted</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {job.posted_date ? new Date(job.posted_date).toLocaleDateString() : 'Recently'}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>

                    {job.reason && (
                      <Paper sx={{ p: 2, bgcolor: 'rgba(102, 126, 234, 0.08)', border: '1px solid', borderColor: 'primary.light' }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                          <Speed sx={{ fontSize: 16 }} />
                          Why this job matches you:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {job.reason || 'This job matches your skills and experience profile.'}
                        </Typography>
                      </Paper>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Box>
  );
};

const BrowseJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await jobSeekerAPI.getJobs();
      console.log('Jobs loaded:', response.data);
      const jobsData = response.data || [];
      console.log('Number of jobs:', jobsData.length);
      if (jobsData.length > 0) {
        console.log('First job:', jobsData[0]);
      }
      setJobs(jobsData);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId) => {
    try {
      await jobSeekerAPI.applyToJob({ job_id: jobId });
      toast.success('Application submitted successfully!');
      loadJobs(); // Reload jobs to update application status
    } catch (error) {
      console.error('Application error:', error);
      toast.error(error.response?.data?.detail || 'Failed to apply');
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>Browse Jobs</Typography>
        <TextField
          fullWidth
          placeholder="Search by job title, company, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
          sx={{ mt: 2 }}
        />
      </Box>

      {loading ? <LinearProgress /> : (
        <Grid container spacing={3}>
          {filteredJobs.length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Work sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">No jobs found</Typography>
              </Paper>
            </Grid>
          ) : (
            filteredJobs.map((job) => (
              <Grid item xs={12} key={job.id}>
                <MotionCard 
                  whileHover={{ y: -5, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }} 
                  sx={{ 
                    borderLeft: 4, 
                    borderColor: 'primary.main',
                    borderRadius: 2,
                    transition: 'all 0.3s'
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={9}>
                        {/* Job Title */}
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
                          {job.title || 'Untitled Position'}
                        </Typography>
                        
                        {/* Company and Location */}
                        <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                          {job.company && (
                            <Chip 
                              icon={<Business />} 
                              label={job.company} 
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          )}
                          {job.location && (
                            <Chip 
                              icon={<LocationOn />} 
                              label={job.location} 
                              size="small"
                            />
                          )}
                          {job.employment_type && (
                            <Chip 
                              label={job.employment_type.toUpperCase()} 
                              size="small"
                              color="secondary"
                            />
                          )}
                          {(job.min_salary || job.max_salary) && (
                            <Chip 
                              icon={<AttachMoney />} 
                              label={
                                job.min_salary && job.max_salary 
                                  ? `$${job.min_salary}k - $${job.max_salary}k`
                                  : job.min_salary 
                                    ? `From $${job.min_salary}k`
                                    : `Up to $${job.max_salary}k`
                              }
                              size="small"
                              color="success"
                            />
                          )}
                        </Stack>
                        
                        {/* Job Description */}
                        {job.description && (
                          <Typography variant="body1" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
                            {job.description.length > 250 
                              ? `${job.description.substring(0, 250)}...` 
                              : job.description
                            }
                          </Typography>
                        )}
                        
                        {/* Application Deadline */}
                        {job.application_deadline && (
                          <Box sx={{ mt: 2 }}>
                            <Chip
                              label={`Deadline: ${new Date(job.application_deadline).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}`}
                              size="small"
                              color="warning"
                              variant="outlined"
                            />
                          </Box>
                        )}
                        
                        {/* Posted Date */}
                        {job.posted_date && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                            Posted: {new Date(job.posted_date).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </Typography>
                        )}
                      </Grid>
                      
                      <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2 }}>
                        <Button 
                          variant="contained" 
                          size="large"
                          startIcon={<Assignment />} 
                          onClick={() => handleApply(job.id)}
                          sx={{ 
                            py: 1.5,
                            fontWeight: 600,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)',
                            },
                            transition: 'all 0.3s'
                          }}
                        >
                          Apply Now
                        </Button>
                        
                        {/* Additional Info */}
                        <Box sx={{ 
                          p: 2, 
                          bgcolor: alpha('#667eea', 0.05), 
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: alpha('#667eea', 0.1)
                        }}>
                          <Stack spacing={1}>
                            {job.recruiter_id && (
                              <Typography variant="caption" color="text.secondary">
                                <strong>Job ID:</strong> #{job.id}
                              </Typography>
                            )}
                            {job.status && (
                              <Chip 
                                label={job.status.toUpperCase()} 
                                size="small"
                                color="success"
                                sx={{ width: 'fit-content' }}
                              />
                            )}
                          </Stack>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </MotionCard>
              </Grid>
            ))
          )}
        </Grid>
      )}
    </Box>
  );
};

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await jobSeekerAPI.getApplications();
      setApplications(response.data || []);
    } catch (error) {
      console.error('Error loading applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = { pending: 'warning', accepted: 'success', rejected: 'error', reviewed: 'info' };
    return colors[status] || 'default';
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>My Applications</Typography>

      {loading ? <LinearProgress /> : applications.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Assignment sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">No applications yet</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Start applying to jobs to see them here</Typography>
          <Button variant="contained" startIcon={<Work />} onClick={() => window.location.href = '/jobseeker/jobs'}>Browse Jobs</Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Job Title</strong></TableCell>
                <TableCell><strong>Company</strong></TableCell>
                <TableCell><strong>Applied Date</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id} hover>
                  <TableCell>{app.job_title || app.title || 'N/A'}</TableCell>
                  <TableCell>{app.company || app.company_name || 'N/A'}</TableCell>
                  <TableCell>
                    {app.applied_date 
                      ? new Date(app.applied_date).toLocaleDateString() 
                      : app.application_date 
                        ? new Date(app.application_date).toLocaleDateString()
                        : 'N/A'}
                  </TableCell>
                  <TableCell><Chip label={app.status.toUpperCase()} color={getStatusColor(app.status)} size="small" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

const MyResumes = ({ loadStats }) => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [resumeData, setResumeData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    workExperience: [{ company: '', position: '', startDate: '', endDate: '', description: '' }],
    education: [{ institution: '', degree: '', field: '', graduationYear: '' }],
    skills: [],
    certifications: '',
  });

  const steps = ['Personal Info', 'Work Experience', 'Education', 'Skills & Certifications', 'Preview'];

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      setLoading(true);
      const response = await jobSeekerAPI.getResumes();
      setResumes(response.data || []);
    } catch (error) {
      console.error('Error loading resumes:', error);
      toast.error('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!resumeFile) {
      toast.error('Please select a file');
      return;
    }
    try {
      await jobSeekerAPI.uploadResume(resumeFile);
      toast.success('Resume uploaded successfully!');
      setUploadDialog(false);
      setResumeFile(null);
      loadResumes();
      loadStats();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to upload resume');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      try {
        await jobSeekerAPI.deleteResume(id);
        toast.success('Resume deleted successfully');
        loadResumes();
        loadStats();
      } catch (error) {
        toast.error('Failed to delete resume');
      }
    }
  };

  const handleSetPrimary = async (id) => {
    try {
      await jobSeekerAPI.setPrimaryResume(id);
      toast.success('Primary resume set successfully');
      loadResumes();
    } catch (error) {
      toast.error('Failed to set primary resume');
    }
  };

  const handleResumeDataChange = (field, value) => {
    setResumeData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddWorkExperience = () => {
    setResumeData(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, { company: '', position: '', startDate: '', endDate: '', description: '' }]
    }));
  };

  const handleAddEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, { institution: '', degree: '', field: '', graduationYear: '' }]
    }));
  };

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleCreateResume = async () => {
    try {
      toast.success('Resume created successfully! (Feature in development)');
      setActiveStep(0);
      setResumeData({
        fullName: '',
        email: '',
        phone: '',
        location: '',
        summary: '',
        workExperience: [{ company: '', position: '', startDate: '', endDate: '', description: '' }],
        education: [{ institution: '', degree: '', field: '', graduationYear: '' }],
        skills: [],
        certifications: '',
      });
    } catch (error) {
      toast.error('Failed to create resume');
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField fullWidth label="Full Name" value={resumeData.fullName} onChange={(e) => handleResumeDataChange('fullName', e.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Email" type="email" value={resumeData.email} onChange={(e) => handleResumeDataChange('email', e.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Phone" value={resumeData.phone} onChange={(e) => handleResumeDataChange('phone', e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Location" value={resumeData.location} onChange={(e) => handleResumeDataChange('location', e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={4} label="Professional Summary" value={resumeData.summary} onChange={(e) => handleResumeDataChange('summary', e.target.value)} />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Box>
            {resumeData.workExperience.map((exp, index) => (
              <Paper key={index} sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Company" value={exp.company} onChange={(e) => { const newExp = [...resumeData.workExperience]; newExp[index].company = e.target.value; handleResumeDataChange('workExperience', newExp); }} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Position" value={exp.position} onChange={(e) => { const newExp = [...resumeData.workExperience]; newExp[index].position = e.target.value; handleResumeDataChange('workExperience', newExp); }} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Start Date" type="month" value={exp.startDate} onChange={(e) => { const newExp = [...resumeData.workExperience]; newExp[index].startDate = e.target.value; handleResumeDataChange('workExperience', newExp); }} InputLabelProps={{ shrink: true }} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="End Date" type="month" value={exp.endDate} onChange={(e) => { const newExp = [...resumeData.workExperience]; newExp[index].endDate = e.target.value; handleResumeDataChange('workExperience', newExp); }} InputLabelProps={{ shrink: true }} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth multiline rows={3} label="Description" value={exp.description} onChange={(e) => { const newExp = [...resumeData.workExperience]; newExp[index].description = e.target.value; handleResumeDataChange('workExperience', newExp); }} />
                  </Grid>
                </Grid>
              </Paper>
            ))}
            <Button startIcon={<Add />} onClick={handleAddWorkExperience}>Add Work Experience</Button>
          </Box>
        );
      case 2:
        return (
          <Box>
            {resumeData.education.map((edu, index) => (
              <Paper key={index} sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Institution" value={edu.institution} onChange={(e) => { const newEdu = [...resumeData.education]; newEdu[index].institution = e.target.value; handleResumeDataChange('education', newEdu); }} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Degree" value={edu.degree} onChange={(e) => { const newEdu = [...resumeData.education]; newEdu[index].degree = e.target.value; handleResumeDataChange('education', newEdu); }} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Field of Study" value={edu.field} onChange={(e) => { const newEdu = [...resumeData.education]; newEdu[index].field = e.target.value; handleResumeDataChange('education', newEdu); }} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Graduation Year" type="number" value={edu.graduationYear} onChange={(e) => { const newEdu = [...resumeData.education]; newEdu[index].graduationYear = e.target.value; handleResumeDataChange('education', newEdu); }} />
                  </Grid>
                </Grid>
              </Paper>
            ))}
            <Button startIcon={<Add />} onClick={handleAddEducation}>Add Education</Button>
          </Box>
        );
      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField fullWidth label="Skills (comma-separated)" placeholder="e.g., JavaScript, React, Node.js" value={resumeData.skills.join(', ')} onChange={(e) => handleResumeDataChange('skills', e.target.value.split(',').map(s => s.trim()))} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={4} label="Certifications" value={resumeData.certifications} onChange={(e) => handleResumeDataChange('certifications', e.target.value)} />
            </Grid>
          </Grid>
        );
      case 4:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Resume Preview</Typography>
            <Paper sx={{ p: 3, backgroundColor: '#f5f5f5' }}>
              <Typography variant="h5" gutterBottom>{resumeData.fullName}</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>{resumeData.email} | {resumeData.phone} | {resumeData.location}</Typography>
              {resumeData.summary && (<Box sx={{ mt: 2 }}><Typography variant="h6">Summary</Typography><Typography variant="body2">{resumeData.summary}</Typography></Box>)}
              <Box sx={{ mt: 2 }}><Typography variant="h6">Work Experience</Typography>{resumeData.workExperience.map((exp, index) => (<Box key={index} sx={{ mt: 1 }}><Typography variant="subtitle1">{exp.position} at {exp.company}</Typography><Typography variant="body2" color="text.secondary">{exp.startDate} - {exp.endDate}</Typography><Typography variant="body2">{exp.description}</Typography></Box>))}</Box>
              <Box sx={{ mt: 2 }}><Typography variant="h6">Education</Typography>{resumeData.education.map((edu, index) => (<Box key={index} sx={{ mt: 1 }}><Typography variant="subtitle1">{edu.degree} in {edu.field}</Typography><Typography variant="body2" color="text.secondary">{edu.institution}, {edu.graduationYear}</Typography></Box>))}</Box>
              {resumeData.skills.length > 0 && (<Box sx={{ mt: 2 }}><Typography variant="h6">Skills</Typography><Typography variant="body2">{resumeData.skills.join(', ')}</Typography></Box>)}
              {resumeData.certifications && (<Box sx={{ mt: 2 }}><Typography variant="h6">Certifications</Typography><Typography variant="body2">{resumeData.certifications}</Typography></Box>)}
            </Paper>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>My Resumes</Typography>

      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tab icon={<CloudUpload />} iconPosition="start" label="Upload Resume" />
        <Tab icon={<Create />} iconPosition="start" label="Create Resume" />
      </Tabs>

      {tabValue === 0 ? (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Button variant="contained" startIcon={<Add />} onClick={() => setUploadDialog(true)} sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', '&:hover': { background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)' } }}>Upload New Resume</Button>
          </Box>

          {loading ? <LinearProgress /> : resumes.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Description sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">No resumes uploaded</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Upload your resume to start applying for jobs</Typography>
              <Button variant="contained" startIcon={<CloudUpload />} onClick={() => setUploadDialog(true)}>Upload Resume</Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {resumes.map((resume) => (
                <Grid item xs={12} md={6} key={resume.id}>
                  <Card sx={{ '&:hover': { transform: 'translateY(-4px)', transition: 'all 0.3s ease' } }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Description sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="h6">{resume.file_name || 'Resume'}</Typography>
                        </Box>
                        {resume.is_primary && <Chip label="Primary" color="success" size="small" />}
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>Uploaded: {new Date(resume.upload_date).toLocaleDateString()}</Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                        {!resume.is_primary && <Button size="small" variant="outlined" onClick={() => handleSetPrimary(resume.id)}>Set as Primary</Button>}
                        <IconButton size="small" color="error" onClick={() => handleDelete(resume.id)}><Delete /></IconButton>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Upload Resume</DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setResumeFile(e.target.files[0])} style={{ display: 'block', marginBottom: 16 }} />
                <Typography variant="caption" color="text.secondary">Supported formats: PDF, DOC, DOCX (Max 5MB)</Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setUploadDialog(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleUpload}>Upload</Button>
            </DialogActions>
          </Dialog>
        </Box>
      ) : (
        <Paper sx={{ p: 3 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (<Step key={label}><StepLabel>{label}</StepLabel></Step>))}
          </Stepper>

          <Box sx={{ mb: 3 }}>
            {renderStepContent(activeStep)}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button disabled={activeStep === 0} onClick={handleBack}>Back</Button>
            <Button variant="contained" onClick={activeStep === steps.length - 1 ? handleCreateResume : handleNext} sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              {activeStep === steps.length - 1 ? 'Create Resume' : 'Next'}
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

const MySkills = ({ loadStats }) => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addDialog, setAddDialog] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [proficiency, setProficiency] = useState('intermediate');
  const [availableSkills, setAvailableSkills] = useState([]);
  const [skillsLoading, setSkillsLoading] = useState(false);

  useEffect(() => {
    loadSkills();
    loadAvailableSkills();
  }, []);

  const loadSkills = async () => {
    try {
      setLoading(true);
      const response = await jobSeekerAPI.getSkills();
      setSkills(response.data || []);
    } catch (error) {
      console.error('Error loading skills:', error);
      toast.error('Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSkills = async () => {
    try {
      setSkillsLoading(true);
      const response = await jobSeekerAPI.getAllSkills();
      setAvailableSkills(response.data || []);
    } catch (error) {
      console.error('Error loading available skills:', error);
    } finally {
      setSkillsLoading(false);
    }
  };

  const handleAddSkill = async () => {
    if (!selectedSkill) {
      toast.error('Please select a skill');
      return;
    }
    try {
      await jobSeekerAPI.addSkill({ skill_name: selectedSkill, proficiency_level: proficiency });
      toast.success('Skill added successfully!');
      setAddDialog(false);
      setSelectedSkill('');
      setProficiency('intermediate');
      loadSkills();
      loadStats();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add skill');
    }
  };

  const handleDeleteSkill = async (id) => {
    try {
      await jobSeekerAPI.deleteSkill(id);
      toast.success('Skill removed successfully');
      loadSkills();
      loadStats();
    } catch (error) {
      toast.error('Failed to remove skill');
    }
  };

  const getProficiencyColor = (level) => {
    const colors = { beginner: '#f5576c', intermediate: '#ffa726', advanced: '#66bb6a', expert: '#42a5f5' };
    return colors[level] || '#999';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>My Skills</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setAddDialog(true)} sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', '&:hover': { background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)' } }}>Add Skill</Button>
      </Box>

      {loading ? <LinearProgress /> : skills.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <FolderSpecial sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">No skills added yet</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Add your skills to improve job matching</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => setAddDialog(true)}>Add Skill</Button>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {skills.map((skill) => (
            <Grid item xs={12} sm={6} md={4} key={skill.id}>
              <Card sx={{ '&:hover': { transform: 'translateY(-4px)', transition: 'all 0.3s ease', boxShadow: 4 } }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>{skill.skill_name}</Typography>
                      <Chip label={skill.proficiency_level.toUpperCase()} size="small" sx={{ bgcolor: getProficiencyColor(skill.proficiency_level), color: 'white', fontWeight: 600 }} />
                    </Box>
                    <IconButton size="small" color="error" onClick={() => handleDeleteSkill(skill.id)}><Delete /></IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={addDialog} onClose={() => setAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Skill</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Autocomplete
              freeSolo
              options={availableSkills.map(skill => skill.name || skill.skill_name || skill)}
              value={selectedSkill}
              onChange={(event, newValue) => setSelectedSkill(newValue || '')}
              onInputChange={(event, newInputValue) => setSelectedSkill(newInputValue)}
              loading={skillsLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search or Enter Skill"
                  placeholder="e.g., JavaScript, Python, Project Management"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {skillsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              select
              label="Proficiency Level"
              value={proficiency}
              onChange={(e) => setProficiency(e.target.value)}
              SelectProps={{ native: true }}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddSkill} sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>Add Skill</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const MyProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', phone: '', location: '', bio: '', 
    linkedin_url: '', github_url: '', portfolio_url: '',
    years_of_experience: '', current_position: '', current_company: '',
    education: '', degree: '', field_of_study: '', graduation_year: '',
    preferred_job_type: '', expected_salary: '', availability: 'immediate'
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await jobSeekerAPI.getProfile();
      setProfile(response.data);
      setFormData({
        first_name: response.data.first_name || '',
        last_name: response.data.last_name || '',
        phone: response.data.phone || '',
        location: response.data.location || '',
        bio: response.data.bio || '',
        linkedin_url: response.data.linkedin_url || '',
        github_url: response.data.github_url || '',
        portfolio_url: response.data.portfolio_url || '',
        years_of_experience: response.data.years_of_experience || '',
        current_position: response.data.current_position || '',
        current_company: response.data.current_company || '',
        education: response.data.education || '',
        degree: response.data.degree || '',
        field_of_study: response.data.field_of_study || '',
        graduation_year: response.data.graduation_year || '',
        preferred_job_type: response.data.preferred_job_type || '',
        expected_salary: response.data.expected_salary || '',
        availability: response.data.availability || 'immediate',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (profile) {
        await jobSeekerAPI.updateProfile(formData);
        toast.success('Profile updated successfully!');
      } else {
        await jobSeekerAPI.createProfile(formData);
        toast.success('Profile created successfully!');
      }
      setEditing(false);
      loadProfile();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save profile');
    }
  };

  if (loading) return <LinearProgress />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>My Profile</Typography>
        {!editing ? (
          <Button variant="contained" startIcon={<Edit />} onClick={() => setEditing(true)} sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', '&:hover': { background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)' } }}>Edit Profile</Button>
        ) : (
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={() => { setEditing(false); loadProfile(); }}>Cancel</Button>
            <Button variant="contained" onClick={handleSave} sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>Save Changes</Button>
          </Stack>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Personal Information Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Person sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Personal Information</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="First Name" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} disabled={!editing} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Last Name" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} disabled={!editing} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Email" value={user?.email} disabled InputProps={{ startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} /> }} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} disabled={!editing} InputProps={{ startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} /> }} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} disabled={!editing} InputProps={{ startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} /> }} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth multiline rows={3} label="Professional Bio" value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} disabled={!editing} placeholder="Tell us about yourself..." />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Professional Details Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <WorkHistory sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Professional Details</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField fullWidth label="Years of Experience" type="number" value={formData.years_of_experience} onChange={(e) => setFormData({ ...formData, years_of_experience: e.target.value })} disabled={!editing} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Current Position" value={formData.current_position} onChange={(e) => setFormData({ ...formData, current_position: e.target.value })} disabled={!editing} placeholder="e.g., Senior Software Engineer" />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Current Company" value={formData.current_company} onChange={(e) => setFormData({ ...formData, current_company: e.target.value })} disabled={!editing} InputProps={{ startAdornment: <Business sx={{ mr: 1, color: 'text.secondary' }} /> }} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Preferred Job Type" value={formData.preferred_job_type} onChange={(e) => setFormData({ ...formData, preferred_job_type: e.target.value })} disabled={!editing} placeholder="e.g., Full-time, Remote" />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Expected Salary" value={formData.expected_salary} onChange={(e) => setFormData({ ...formData, expected_salary: e.target.value })} disabled={!editing} placeholder="e.g., $80,000 - $100,000" InputProps={{ startAdornment: <AttachMoney sx={{ mr: 1, color: 'text.secondary' }} /> }} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth select label="Availability" value={formData.availability} onChange={(e) => setFormData({ ...formData, availability: e.target.value })} disabled={!editing} SelectProps={{ native: true }}>
                    <option value="immediate">Immediate</option>
                    <option value="2_weeks">2 Weeks Notice</option>
                    <option value="1_month">1 Month Notice</option>
                    <option value="2_months">2 Months Notice</option>
                  </TextField>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Education Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <School sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Education</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField fullWidth label="Institution/University" value={formData.education} onChange={(e) => setFormData({ ...formData, education: e.target.value })} disabled={!editing} placeholder="e.g., Stanford University" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Degree" value={formData.degree} onChange={(e) => setFormData({ ...formData, degree: e.target.value })} disabled={!editing} placeholder="e.g., Bachelor's, Master's" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Graduation Year" type="number" value={formData.graduation_year} onChange={(e) => setFormData({ ...formData, graduation_year: e.target.value })} disabled={!editing} InputProps={{ startAdornment: <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} /> }} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Field of Study" value={formData.field_of_study} onChange={(e) => setFormData({ ...formData, field_of_study: e.target.value })} disabled={!editing} placeholder="e.g., Computer Science, Business" />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Social Links Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Language sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Social & Portfolio Links</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField fullWidth label="LinkedIn Profile" value={formData.linkedin_url} onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })} disabled={!editing} placeholder="https://linkedin.com/in/yourprofile" InputProps={{ startAdornment: <LinkedIn sx={{ mr: 1, color: '#0077b5' }} /> }} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="GitHub Profile" value={formData.github_url} onChange={(e) => setFormData({ ...formData, github_url: e.target.value })} disabled={!editing} placeholder="https://github.com/yourusername" InputProps={{ startAdornment: <GitHub sx={{ mr: 1, color: 'text.secondary' }} /> }} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Portfolio Website" value={formData.portfolio_url} onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })} disabled={!editing} placeholder="https://yourportfolio.com" InputProps={{ startAdornment: <Public sx={{ mr: 1, color: 'text.secondary' }} /> }} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default JobSeekerDashboard;
