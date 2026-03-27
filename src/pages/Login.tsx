import { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Paper, Alert, Link as MuiLink } from '@mui/material';
import DeskIcon from '@mui/icons-material/Desk';
import axios from 'axios';
import { Link as RouterLink } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/token/`, {
        username: username,
        password: password
      });

      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('username', username);

      window.location.href = '/';

    } catch (err) {
      console.error("Login failed:", err);
      setError('Invalid username or password. Please try again.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box display="flex" flexDirection="column" justifyContent="center" minHeight="100vh">
        <Paper elevation={3} sx={{ p: 5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box display="flex" alignItems="center" mb={3}>
            <DeskIcon color="primary" sx={{ fontSize: 40, mr: 1 }} />
            <Typography variant="h4" fontWeight="bold" color="primary">
              DeskReserve
            </Typography>
          </Box>

          <Typography variant="h6" color="text.secondary" gutterBottom>
            Sign in to your account
          </Typography>

          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleLogin} sx={{ width: '100%', mt: 2 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Box textAlign="right" mt={1}>
              <MuiLink component={RouterLink} to="/forgot-password" variant="body2" underline="hover">
                Forgot password?
              </MuiLink>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2 }}
              disableElevation
            >
              Sign In
            </Button>

            <Box textAlign="center" mt={2}>
              <Typography variant="body2">
                Don't have an account?{' '}
                <MuiLink component={RouterLink} to="/register" underline="hover">
                  Sign up here
                </MuiLink>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Login;