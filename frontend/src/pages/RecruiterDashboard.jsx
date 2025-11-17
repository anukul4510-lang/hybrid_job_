import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, List, Typography, Divider, IconButton, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Avatar, Menu, MenuItem, Container,
  Paper, Grid, Card, CardContent, Button, Chip, LinearProgress, alpha, useTheme,
  Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions, InputAdornment,
} from '@mui/material';
import {
  Menu as MenuIcon, Dashboard, Work, PersonSearch, Bookmark, Assignment, Logout,
  Add, Search, LocationOn, AttachMoney, Business, Delete, Edit, Speed, Group,
  CheckCircle, TrendingUp, Stars, Email, Phone, LinkedIn, Description, 
  Schedule, ContactMail, Update,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { recruiterAPI } from '../services/api';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const drawerWidth = 260;
const MotionCard = motion(Card);

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [stats, setStats] = useState({ jobs: 0, applications: 0, shortlist: 0, views: 0 });
  const [loading, setLoading] = useState(true);

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/recruiter' },
    { text: 'My Jobs', icon: <Work />, path: '/recruiter/jobs' },
    { text: 'Search Candidates', icon: <PersonSearch />, path: '/recruiter/search' },
    { text: 'Shortlist', icon: <Bookmark />, path: '/recruiter/shortlist' },
    { text: 'Applications', icon: <Assignment />, path: '/recruiter/applications' },
  ];

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [jobs, shortlist] = await Promise.all([
        recruiterAPI.getMyJobs(),
        recruiterAPI.getShortlist(),
      ]);
      setStats({
        jobs: jobs.data.length || 0,
        applications: 0,
        shortlist: shortlist.data.length || 0,
        views: 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ py: 2, background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})` }}>
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
                  bgcolor: alpha(theme.palette.secondary.main, 0.15),
                  '& .MuiListItemIcon-root': { color: 'secondary.main' },
                  '& .MuiListItemText-primary': { fontWeight: 600 },
                },
                '&:hover': { bgcolor: alpha(theme.palette.secondary.main, 0.08) },
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
            <Avatar sx={{ bgcolor: theme.palette.secondary.main, width: 40, height: 40 }}>
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
            <Route path="/jobs" element={<MyJobs loadStats={loadStats} />} />
            <Route path="/search" element={<SearchCandidates />} />
            <Route path="/shortlist" element={<Shortlist loadStats={loadStats} />} />
            <Route path="/applications" element={<Applications />} />
          </Routes>
        </Container>
      </Box>
    </Box>
  );
};

const DashboardOverview = ({ stats, loading }) => {
  const navigate = useNavigate();
  const statCards = [
    { title: 'Active Jobs', value: stats.jobs, icon: <Work />, gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', path: '/recruiter/jobs' },
    { title: 'Applications', value: stats.applications, icon: <Assignment />, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', path: '/recruiter/applications' },
    { title: 'Shortlisted', value: stats.shortlist, icon: <Bookmark />, gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', path: '/recruiter/shortlist' },
    { title: 'Profile Views', value: stats.views, icon: <TrendingUp />, gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', path: '/recruiter/search' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        Recruiter Dashboard 🎯
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
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>Quick Actions</Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={6}><Button fullWidth variant="outlined" startIcon={<Add />} onClick={() => navigate('/recruiter/jobs')} sx={{ py: 1.5 }}>Post New Job</Button></Grid>
                    <Grid item xs={6}><Button fullWidth variant="outlined" startIcon={<PersonSearch />} onClick={() => navigate('/recruiter/search')} sx={{ py: 1.5 }}>Search Candidates</Button></Grid>
                    <Grid item xs={6}><Button fullWidth variant="outlined" startIcon={<Assignment />} onClick={() => navigate('/recruiter/applications')} sx={{ py: 1.5 }}>View Applications</Button></Grid>
                    <Grid item xs={6}><Button fullWidth variant="outlined" startIcon={<Bookmark />} onClick={() => navigate('/recruiter/shortlist')} sx={{ py: 1.5 }}>Manage Shortlist</Button></Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', height: '100%' }}>
                <CardContent>
                  <Stars sx={{ fontSize: 40, mb: 2 }} />
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>AI-Powered Matching</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>Active</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Our AI is continuously matching candidates to your job postings based on skills, experience, and preferences.
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

const MyJobs = ({ loadStats }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postDialog, setPostDialog] = useState(false);
  const [jobData, setJobData] = useState({
    job_title: '', job_description: '', requirements: '', location: '', job_type: 'full-time', salary_range: ''
  });

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await recruiterAPI.getMyJobs();
      setJobs(response.data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handlePostJob = async () => {
    try {
      await recruiterAPI.postJob(jobData);
      toast.success('Job posted successfully!');
      setPostDialog(false);
      setJobData({ job_title: '', job_description: '', requirements: '', location: '', job_type: 'full-time', salary_range: '' });
      loadJobs();
      loadStats();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to post job');
    }
  };

  const handleDeleteJob = async (id) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await recruiterAPI.deleteJob(id);
        toast.success('Job deleted successfully');
        loadJobs();
        loadStats();
      } catch (error) {
        toast.error('Failed to delete job');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>My Job Postings</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setPostDialog(true)}>Post New Job</Button>
      </Box>

      {loading ? <LinearProgress /> : jobs.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Work sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">No jobs posted yet</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Create your first job posting to start finding candidates</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => setPostDialog(true)}>Post New Job</Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {jobs.map((job) => (
            <Grid item xs={12} key={job.id}>
              <MotionCard whileHover={{ y: -5 }} sx={{ borderLeft: 4, borderColor: 'secondary.main' }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        {job.job_title || 'Untitled Job'}
                      </Typography>
                      <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                        {job.location && <Chip icon={<LocationOn />} label={job.location} size="small" />}
                        {job.job_type && <Chip label={job.job_type.toUpperCase()} size="small" />}
                        {job.salary_range && <Chip icon={<AttachMoney />} label={job.salary_range} size="small" />}
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {job.job_description 
                          ? (job.job_description.length > 200 
                              ? `${job.job_description.substring(0, 200)}...` 
                              : job.job_description)
                          : 'No description available'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <Stack spacing={1}>
                        <Button variant="outlined" startIcon={<Assignment />} size="small">View Applications</Button>
                        <Button variant="outlined" startIcon={<Delete />} color="error" size="small" onClick={() => handleDeleteJob(job.id)}>Delete</Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </MotionCard>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={postDialog} onClose={() => setPostDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Post New Job</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}><TextField fullWidth label="Job Title" value={jobData.job_title} onChange={(e) => setJobData({ ...jobData, job_title: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField fullWidth multiline rows={4} label="Job Description" value={jobData.job_description} onChange={(e) => setJobData({ ...jobData, job_description: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField fullWidth multiline rows={3} label="Requirements" value={jobData.requirements} onChange={(e) => setJobData({ ...jobData, requirements: e.target.value })} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth label="Location" value={jobData.location} onChange={(e) => setJobData({ ...jobData, location: e.target.value })} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth select label="Job Type" value={jobData.job_type} onChange={(e) => setJobData({ ...jobData, job_type: e.target.value })} SelectProps={{ native: true }}>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </TextField></Grid>
            <Grid item xs={12}><TextField fullWidth label="Salary Range (Optional)" value={jobData.salary_range} onChange={(e) => setJobData({ ...jobData, salary_range: e.target.value })} placeholder="e.g., $80k - $120k" /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPostDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handlePostJob}>Post Job</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const SearchCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error('Please enter search criteria');
      return;
    }
    try {
      setLoading(true);
      const response = await recruiterAPI.searchCandidates(searchTerm);
      // Backend returns {results: [...], total_results: n, ...}
      const candidatesData = response.data?.results || response.data || [];
      setCandidates(candidatesData);
      if (candidatesData.length === 0) {
        toast.info('No candidates found. Try different search terms.');
      }
    } catch (error) {
      console.error('Error searching candidates:', error);
      toast.error('Failed to search candidates');
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleShortlist = async (candidateId) => {
    try {
      if (!candidateId) {
        toast.error('Invalid candidate ID');
        return;
      }
      
      console.log('Adding to shortlist:', candidateId);
      await recruiterAPI.addToShortlist(candidateId, null, 'Added from search');
      toast.success('Candidate added to shortlist!');
    } catch (error) {
      console.error('Shortlist error:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.detail || error.message || 'Failed to shortlist candidate';
      toast.error(errorMsg);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>Search Candidates</Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" spacing={2}>
          <TextField
            fullWidth
            placeholder="Search by skills, experience, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
          />
          <Button variant="contained" onClick={handleSearch} startIcon={<Search />} sx={{ minWidth: 120 }}>
            Search
          </Button>
        </Stack>
      </Paper>

      {loading ? <LinearProgress /> : candidates.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <PersonSearch sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">No candidates found</Typography>
          <Typography variant="body2" color="text.secondary">Try searching with different keywords</Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {candidates.map((candidate, index) => (
            <Grid item xs={12} md={6} key={candidate.id || index}>
              <MotionCard whileHover={{ y: -5 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {candidate.first_name && candidate.last_name 
                      ? `${candidate.first_name} ${candidate.last_name}` 
                      : candidate.name || 'Candidate'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {candidate.email || 'No email'}
                  </Typography>
                  
                  {/* Job of Choice */}
                  {candidate.job_of_choice && (
                    <Chip 
                      icon={<Work />} 
                      label={candidate.job_of_choice} 
                      size="small" 
                      sx={{ mb: 1, mr: 1 }} 
                      color="primary"
                    />
                  )}
                  
                  {/* Experience */}
                  {candidate.years_experience !== undefined && candidate.years_experience !== null && (
                    <Chip 
                      label={`${candidate.years_experience} years exp`} 
                      size="small" 
                      sx={{ mb: 1, mr: 1 }} 
                      color="secondary"
                    />
                  )}
                  
                  {/* Location */}
                  {candidate.location && (
                    <Chip 
                      icon={<LocationOn />} 
                      label={candidate.location} 
                      size="small" 
                      sx={{ mb: 1 }} 
                    />
                  )}
                  
                  {/* Skills */}
                  {candidate.skills && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                        Skills:
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                        {(typeof candidate.skills === 'string' 
                          ? candidate.skills.split(',').map(s => s.trim()).filter(Boolean)
                          : Array.isArray(candidate.skills) 
                            ? candidate.skills 
                            : []
                        ).slice(0, 5).map((skill, idx) => (
                          <Chip key={idx} label={skill} size="small" variant="outlined" />
                        ))}
                      </Stack>
                    </Box>
                  )}
                  
                  {/* Bio */}
                  {candidate.bio && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 2 }}>
                      {candidate.bio.length > 150 ? `${candidate.bio.substring(0, 150)}...` : candidate.bio}
                    </Typography>
                  )}
                  
                  {/* Match Score */}
                  {candidate.match_score !== undefined && candidate.match_score !== null && (
                    <Chip 
                      label={`${Math.round(candidate.match_score)}% match`} 
                      size="small" 
                      color="success"
                      sx={{ mt: 1, mb: 2 }}
                    />
                  )}
                  
                  <Button 
                    variant="contained" 
                    startIcon={<Bookmark />} 
                    onClick={() => handleShortlist(candidate.id)} 
                    fullWidth
                    sx={{ mt: 1 }}
                  >
                    Add to Shortlist
                  </Button>
                </CardContent>
              </MotionCard>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

const Shortlist = ({ loadStats }) => {
  const [shortlist, setShortlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contactDialog, setContactDialog] = useState(false);
  const [statusDialog, setStatusDialog] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [contactMessage, setContactMessage] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');

  useEffect(() => {
    loadShortlist();
  }, []);

  const loadShortlist = async () => {
    try {
      setLoading(true);
      const response = await recruiterAPI.getShortlist();
      setShortlist(response.data || []);
    } catch (error) {
      console.error('Error loading shortlist:', error);
      toast.error('Failed to load shortlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Are you sure you want to remove this candidate from shortlist?')) return;
    
    try {
      await recruiterAPI.removeFromShortlist(id);
      toast.success('Removed from shortlist');
      loadShortlist();
      loadStats();
    } catch (error) {
      toast.error('Failed to remove from shortlist');
    }
  };

  const handleContactOpen = (candidate) => {
    setSelectedCandidate(candidate);
    setContactMessage(`Dear ${candidate.first_name || 'Candidate'},\n\nWe were impressed by your profile and would like to discuss potential opportunities with you.\n\nBest regards`);
    setContactDialog(true);
  };

  const handleSendContact = async () => {
    // In a real app, this would send an email or notification
    toast.success(`Contact message sent to ${selectedCandidate.candidate_email}!`);
    setContactDialog(false);
    setContactMessage('');
    setSelectedCandidate(null);
  };

  const handleStatusOpen = (candidate) => {
    setSelectedCandidate(candidate);
    setNewStatus(candidate.status || 'contacted');
    setStatusNotes(candidate.notes || '');
    setStatusDialog(true);
  };

  const handleUpdateStatus = async () => {
    try {
      await recruiterAPI.updateShortlistStatus(selectedCandidate.id, newStatus, statusNotes);
      toast.success('Status updated successfully!');
      setStatusDialog(false);
      setSelectedCandidate(null);
      setNewStatus('');
      setStatusNotes('');
      loadShortlist();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update status');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Shortlisted Candidates</Typography>
        <Chip 
          label={`${shortlist.length} Candidate${shortlist.length !== 1 ? 's' : ''}`} 
          color="primary" 
          sx={{ fontWeight: 600 }}
        />
      </Box>

      {loading ? <LinearProgress /> : shortlist.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Bookmark sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>No candidates shortlisted yet</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Search and shortlist candidates to see them here
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            startIcon={<PersonSearch />} 
            onClick={() => window.location.href = '/recruiter/search'}
            sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              px: 4,
              py: 1.5
            }}
          >
            Search Candidates
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {shortlist.map((candidate) => (
            <Grid item xs={12} md={6} key={candidate.id}>
              <MotionCard
                whileHover={{ y: -8, boxShadow: '0 12px 24px rgba(0,0,0,0.15)' }}
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  position: 'relative',
                  overflow: 'visible'
                }}
              >
                {/* Match Score Badge */}
                {candidate.match_score !== undefined && candidate.match_score !== null && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -10,
                      right: 20,
                      background: candidate.match_score >= 80 
                        ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
                        : candidate.match_score >= 60
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      color: 'white',
                      px: 2.5,
                      py: 1,
                      borderRadius: 3,
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    <Stars sx={{ fontSize: 18 }} />
                    {Math.round(candidate.match_score)}% Match
                  </Box>
                )}

                <CardContent sx={{ p: 3 }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2, mt: candidate.match_score ? 2 : 0 }}>
                    <Avatar
                      sx={{
                        width: 64,
                        height: 64,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        mr: 2
                      }}
                    >
                      {(candidate.first_name?.[0] || 'C')}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {candidate.first_name && candidate.last_name 
                          ? `${candidate.first_name} ${candidate.last_name}` 
                          : 'Unknown Candidate'}
                      </Typography>
                      {candidate.job_of_choice && (
                        <Chip 
                          label={candidate.job_of_choice} 
                          size="small" 
                          color="primary"
                          sx={{ mb: 0.5 }}
                        />
                      )}
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Email sx={{ fontSize: 16 }} />
                        {candidate.candidate_email || 'No email'}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Details */}
                  <Stack spacing={1.5}>
                    {candidate.years_experience !== undefined && candidate.years_experience !== null && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Speed sx={{ fontSize: 20, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          <strong>{candidate.years_experience} years</strong> of experience
                        </Typography>
                      </Box>
                    )}

                    {candidate.location && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOn sx={{ fontSize: 20, color: 'text.secondary' }} />
                        <Typography variant="body2">{candidate.location}</Typography>
                      </Box>
                    )}

                    {candidate.phone && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Phone sx={{ fontSize: 20, color: 'text.secondary' }} />
                        <Typography variant="body2">{candidate.phone}</Typography>
                      </Box>
                    )}

                    {/* Skills */}
                    {candidate.skills && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
                          Skills:
                        </Typography>
                        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                          {candidate.skills.split(',').map((skill, idx) => (
                            <Chip 
                              key={idx} 
                              label={skill.trim()} 
                              size="small" 
                              variant="outlined"
                              sx={{ borderRadius: 1.5 }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {/* Notes */}
                    {candidate.notes && (
                      <Box sx={{ 
                        bgcolor: alpha('#667eea', 0.05), 
                        p: 1.5, 
                        borderRadius: 2,
                        borderLeft: 3,
                        borderColor: 'primary.main'
                      }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                          Notes:
                        </Typography>
                        <Typography variant="body2">{candidate.notes}</Typography>
                      </Box>
                    )}

                    {/* Status */}
                    {candidate.status && (
                      <Chip 
                        label={candidate.status.toUpperCase()} 
                        size="small"
                        color={
                          candidate.status === 'hired' ? 'success' :
                          candidate.status === 'interviewed' ? 'primary' :
                          candidate.status === 'contacted' ? 'info' : 'default'
                        }
                        sx={{ width: 'fit-content' }}
                      />
                    )}
                  </Stack>

                  {/* Action Buttons */}
                  <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<ContactMail />}
                      onClick={() => handleContactOpen(candidate)}
                      sx={{ 
                        flex: 1,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      }}
                    >
                      Contact
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Update />}
                      onClick={() => handleStatusOpen(candidate)}
                      sx={{ flex: 1 }}
                    >
                      Status
                    </Button>
                    <IconButton 
                      size="small" 
                      color="error" 
                      onClick={() => handleRemove(candidate.id)}
                      sx={{ border: 1, borderColor: 'error.main' }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Stack>
                </CardContent>
              </MotionCard>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Contact Dialog */}
      <Dialog open={contactDialog} onClose={() => setContactDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ContactMail color="primary" />
            Contact Candidate
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Send a message to <strong>{selectedCandidate?.candidate_email}</strong>
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            value={contactMessage}
            onChange={(e) => setContactMessage(e.target.value)}
            placeholder="Type your message here..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setContactDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSendContact}
            disabled={!contactMessage.trim()}
            startIcon={<Email />}
          >
            Send Message
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusDialog} onClose={() => setStatusDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Update color="primary" />
            Update Candidate Status
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                SelectProps={{ native: true }}
              >
                <option value="shortlisted">Shortlisted</option>
                <option value="contacted">Contacted</option>
                <option value="interviewed">Interviewed</option>
                <option value="offered">Offered</option>
                <option value="hired">Hired</option>
                <option value="rejected">Rejected</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Notes"
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Add any additional notes..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setStatusDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleUpdateStatus}
            startIcon={<CheckCircle />}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const Applications = () => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>Job Applications</Typography>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Assignment sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">Application Management</Typography>
        <Typography variant="body2" color="text.secondary">View and manage applications for your job postings</Typography>
      </Paper>
    </Box>
  );
};

export default RecruiterDashboard;
