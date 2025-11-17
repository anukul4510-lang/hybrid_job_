import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
  useTheme,
  alpha,
  Chip,
  Avatar,
  AvatarGroup,
} from '@mui/material';
import {
  WorkOutline,
  PersonSearch,
  TrendingUp,
  Security,
  ArrowForward,
  CheckCircle,
  Speed,
  Stars,
  Group,
  Business,
  EmojiEvents,
  AutoAwesome,
  Rocket,
  Verified,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/jobseeker');
    }
  }, [isAuthenticated, navigate]);

  const features = [
    {
      icon: <WorkOutline sx={{ fontSize: 48 }} />,
      title: 'Find Your Dream Job',
      description: 'Access thousands of job opportunities tailored to your skills and preferences.',
      color: '#667eea',
    },
    {
      icon: <PersonSearch sx={{ fontSize: 48 }} />,
      title: 'AI-Powered Matching',
      description: 'Our intelligent system matches you with the perfect candidates or jobs.',
      color: '#764ba2',
    },
    {
      icon: <TrendingUp sx={{ fontSize: 48 }} />,
      title: 'Career Growth',
      description: 'Get personalized recommendations to advance your career journey.',
      color: '#f093fb',
    },
    {
      icon: <Security sx={{ fontSize: 48 }} />,
      title: 'Secure & Private',
      description: 'Your data is protected with enterprise-grade security measures.',
      color: '#4facfe',
    },
  ];

  const stats = [
    { number: '10K+', label: 'Active Jobs', icon: <WorkOutline />, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { number: '5K+', label: 'Companies', icon: <Business />, gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { number: '50K+', label: 'Job Seekers', icon: <PersonSearch />, gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { number: '95%', label: 'Success Rate', icon: <EmojiEvents />, gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  ];

  const testimonials = [
    { name: 'Sarah Johnson', role: 'Software Engineer', company: 'TechCorp', avatar: 'S', rating: 5 },
    { name: 'Michael Chen', role: 'Product Manager', company: 'InnovateCo', avatar: 'M', rating: 5 },
    { name: 'Emily Davis', role: 'Designer', company: 'CreativeHub', avatar: 'E', rating: 5 },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha('#667eea', 0.97)} 0%, ${alpha('#764ba2', 0.97)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.08,
          background: 'radial-gradient(circle at 20% 50%, white 0%, transparent 50%), radial-gradient(circle at 80% 80%, white 0%, transparent 50%), radial-gradient(circle at 40% 20%, white 0%, transparent 40%)',
        }}
      />

      {/* Floating elements */}
      <MotionBox
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        sx={{
          position: 'absolute',
          top: '15%',
          right: '10%',
          width: 100,
          height: 100,
          borderRadius: '30%',
          background: alpha('#fff', 0.1),
          backdropFilter: 'blur(10px)',
          zIndex: 0,
        }}
      />

      <MotionBox
        animate={{
          y: [0, 20, 0],
          rotate: [0, -5, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        sx={{
          position: 'absolute',
          bottom: '20%',
          left: '8%',
          width: 80,
          height: 80,
          borderRadius: '40%',
          background: alpha('#fff', 0.1),
          backdropFilter: 'blur(10px)',
          zIndex: 0,
        }}
      />

      {/* Navigation */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${alpha('#fff', 0.1)}`,
          bgcolor: alpha('#fff', 0.08),
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            py={2}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Speed sx={{ fontSize: 32 }} />
              JobMatch AI
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                onClick={() => navigate('/login')}
                sx={{
                  color: 'white',
                  borderColor: alpha('#fff', 0.5),
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: alpha('#fff', 0.1),
                  },
                }}
              >
                Login
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/register')}
                sx={{
                  bgcolor: 'white',
                  color: theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: alpha('#fff', 0.9),
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s',
                }}
              >
                Get Started
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          sx={{ textAlign: 'center', py: { xs: 8, md: 12 } }}
        >
          <Chip
            icon={<Stars />}
            label="AI-Powered Job Matching Platform"
            sx={{
              bgcolor: alpha('#fff', 0.2),
              color: 'white',
              fontWeight: 600,
              mb: 3,
              backdropFilter: 'blur(10px)',
            }}
          />
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.5rem', md: '4rem', lg: '5rem' },
              fontWeight: 900,
              color: 'white',
              mb: 3,
              textShadow: '0 4px 20px rgba(0,0,0,0.2)',
            }}
          >
            Find Your Perfect
            <br />
            Career Match
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: alpha('#fff', 0.95),
              mb: 5,
              maxWidth: 700,
              mx: 'auto',
              fontWeight: 400,
              lineHeight: 1.6,
            }}
          >
            Leverage the power of AI to discover opportunities that truly align with your skills,
            experience, and career aspirations.
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            alignItems="center"
          >
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              onClick={() => navigate('/register')}
              sx={{
                bgcolor: 'white',
                color: theme.palette.primary.main,
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 700,
                '&:hover': {
                  bgcolor: alpha('#fff', 0.95),
                  transform: 'translateY(-4px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                },
                transition: 'all 0.3s',
              }}
            >
              Start Your Journey
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/login')}
              sx={{
                borderColor: 'white',
                color: 'white',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: alpha('#fff', 0.15),
                },
              }}
            >
              Sign In
            </Button>
          </Stack>

          {/* Stats Section */}
          <Grid container spacing={3} sx={{ mt: 8 }}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
                >
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      bgcolor: alpha('#fff', 0.15),
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha('#fff', 0.2)}`,
                    }}
                  >
                    <Box sx={{ color: 'white', mb: 1 }}>{stat.icon}</Box>
                    <Typography
                      variant="h3"
                      sx={{ fontWeight: 800, color: 'white', mb: 0.5 }}
                    >
                      {stat.number}
                    </Typography>
                    <Typography sx={{ color: alpha('#fff', 0.9), fontWeight: 500 }}>
                      {stat.label}
                    </Typography>
                  </Box>
                </MotionBox>
              </Grid>
            ))}
          </Grid>
        </MotionBox>

        {/* Features Section */}
        <Box sx={{ pb: 12 }}>
          <Typography
            variant="h2"
            align="center"
            sx={{
              fontWeight: 800,
              color: 'white',
              mb: 6,
              fontSize: { xs: '2rem', md: '3rem' },
            }}
          >
            Why Choose JobMatch AI?
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <MotionCard
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1, duration: 0.6 }}
                  whileHover={{ 
                    y: -10,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                  }}
                  sx={{
                    height: '100%',
                    bgcolor: alpha('#fff', 0.95),
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha('#fff', 0.3)}`,
                    borderRadius: 4,
                    transition: 'all 0.3s',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: `linear-gradient(90deg, ${feature.color}, ${alpha(feature.color, 0.6)})`,
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box
                      sx={{
                        width: 70,
                        height: 70,
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${feature.color}, ${alpha(feature.color, 0.7)})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        mb: 3,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </MotionCard>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default Landing;
