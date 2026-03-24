import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Container, Box, Card,
  CardContent, Button, CircularProgress, Chip, Grid,
  Snackbar, Alert
} from '@mui/material';
import DeskIcon from '@mui/icons-material/Desk';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { jwtDecode } from 'jwt-decode';

interface Booking {
  id: number;
  workspace: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
}

// NEW: We need to know what a workspace looks like to read its name
interface Workspace {
  id: number;
  name: string;
}

interface MyToken {
  user_id: number;
  exp: number;
}

function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]); // NEW STATE
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const token = localStorage.getItem('access_token');
  const username = localStorage.getItem('username');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const decodedToken = jwtDecode<MyToken>(token);
    const userId = decodedToken.user_id;

    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    // NEW: Fetch BOTH bookings and workspaces at the exact same time!
    Promise.all([
      axios.get<Booking[]>(`http://127.0.0.1:8000/api/bookings/user/${userId}/`, config),
      axios.get<Workspace[]>('http://127.0.0.1:8000/api/workspaces/')
    ])
      .then(([bookingsResponse, workspacesResponse]) => {
        setBookings(bookingsResponse.data);
        setWorkspaces(workspacesResponse.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching data:", err);
        setError("Could not load your bookings.");
        setLoading(false);
      });
  }, [navigate, token]);

  const handleCancelBooking = (bookingId: number) => {
    if (!token) return;

    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    axios.patch(`http://127.0.0.1:8000/api/bookings/${bookingId}/cancel/`, {}, config)
      .then(() => {
        setFeedbackMsg({ type: 'success', text: 'Booking successfully cancelled.' });
        setBookings(prevBookings =>
          prevBookings.map(b => b.id === bookingId ? { ...b, status: 'Cancelled' } : b)
        );
      })
      .catch(err => {
        console.error("Cancel failed:", err);
        setFeedbackMsg({ type: 'error', text: 'Failed to cancel the booking.' });
      });
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // NEW: Helper function to match the ID to the real workspace name
  const getWorkspaceName = (workspaceId: number) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    return workspace ? workspace.name : `Workspace #${workspaceId}`;
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh', pb: 5 }}>
      <AppBar position="static" elevation={0} sx={{ bgcolor: '#1976d2', mb: 4 }}>
        <Toolbar>
          <DeskIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            DeskReserve
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Button color="inherit" onClick={() => navigate('/')} startIcon={<ArrowBackIcon />}>
              Dashboard
            </Button>
            <Typography variant="body2">Hello, {username}</Typography>
            <Button color="inherit" onClick={handleLogout} variant="outlined">Logout</Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md">
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="text.primary">
          My Bookings
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {bookings.length === 0 && !error ? (
          <Box textAlign="center" py={5} bgcolor="white" borderRadius={2} boxShadow={1}>
            <Typography variant="h6" color="text.secondary">
              You don't have any bookings yet.
            </Typography>
            <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/')}>
              Book a Workspace
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {bookings.map(booking => (
              <Grid item xs={12} key={booking.id}>
                <Card elevation={2} sx={{ display: 'flex', flexDirection: 'column' }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6" fontWeight="bold">
                        {/* WE USE OUR NEW HELPER FUNCTION HERE */}
                        {getWorkspaceName(booking.workspace)}
                      </Typography>
                      <Chip
                        label={booking.status}
                        color={booking.status === 'Confirmed' ? 'success' : 'default'}
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">Date</Typography>
                        <Typography variant="body1">{booking.booking_date}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">Time</Typography>
                        <Typography variant="body1">
                          {booking.start_time.substring(0, 5)} - {booking.end_time.substring(0, 5)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4} display="flex" alignItems="center" justifyContent="flex-end">
                        {booking.status === 'Confirmed' && (
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => handleCancelBooking(booking.id)}
                          >
                            Cancel Booking
                          </Button>
                        )}
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      <Snackbar
        open={!!feedbackMsg}
        autoHideDuration={6000}
        onClose={() => setFeedbackMsg(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setFeedbackMsg(null)} severity={feedbackMsg?.type || 'info'} sx={{ width: '100%' }}>
          {feedbackMsg?.text}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default MyBookings;