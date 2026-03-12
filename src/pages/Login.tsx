import { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Paper, Alert } from '@mui/material';
import DeskIcon from '@mui/icons-material/Desk';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/token/', {
        username: username,
        password: password
      });

      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('username', username);

      navigate('/');

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
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 4, mb: 2 }}
              disableElevation
            >
              Sign In
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Login;