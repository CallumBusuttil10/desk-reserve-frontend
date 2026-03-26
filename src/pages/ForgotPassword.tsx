import { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Paper, Alert, Link as MuiLink } from '@mui/material';
import DeskIcon from '@mui/icons-material/Desk';
import axios from 'axios';
import { Link as RouterLink } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/password-reset/`, {
        email: email
      });
      setMessage(response.data.message || 'If an account exists, a reset link has been sent.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
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
            Reset Password
          </Typography>

          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
            Enter your email address and we'll send you a link to reset your password.
          </Typography>

          {message && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email Address"
              type="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2 }}
              disableElevation
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>

            <Box textAlign="center" mt={2}>
              <Typography variant="body2">
                Remember your password?{' '}
                <MuiLink component={RouterLink} to="/login" underline="hover">
                  Back to login
                </MuiLink>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default ForgotPassword;