import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import {
  AppBar, Toolbar, Typography, Container, Card,
  CardContent, CardActions, Button, CircularProgress, Box, Chip,
  Grid, CardMedia, Divider, IconButton, Alert, Snackbar,
  Paper
} from '@mui/material'
import CorporateFareIcon from '@mui/icons-material/CorporateFare'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import dayjs from 'dayjs'

interface Workspace {
  id: number;
  name: string;
  resource_type: string;
  floor: number;
  image?: string | null;
}

interface Booking {
  id: number;
  workspace: number;
  workspace_details?: Workspace;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
}

function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [feedback, setFeedback] = useState<string | null>(null)

  const token = localStorage.getItem('access_token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Fetch bookings and workspaces
        const [bookingsRes, workspacesRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/bookings/', config),
          axios.get('http://127.0.0.1:8000/api/workspaces/')
        ]);

        const enrichedBookings = bookingsRes.data.map((booking: Booking) => ({
          ...booking,
          workspace_details: workspacesRes.data.find((w: Workspace) => w.id === booking.workspace)
        }));

        setBookings(enrichedBookings);
      } catch (err: any) {
        console.error("Error fetching bookings:", err);
        if (err.response?.status === 401) {
            localStorage.clear();
            navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate]);

  const getImageUrl = (workspace?: Workspace) => {
    if (!workspace) return "";
    switch (workspace.resource_type) {
      case 'Boardroom': return "https://res.cloudinary.com/dwtbxefd8/image/upload/v1774356998/workspaces/Boardroom_viyh2k.png";
      case 'Desk': return "https://res.cloudinary.com/dwtbxefd8/image/upload/v1774356795/workspaces/standingdesk_inl2nr.png";
      case 'Focus Pod': return "https://res.cloudinary.com/dwtbxefd8/image/upload/v1774356962/workspaces/FocusPod_zyxfdt.png";
      default: return "";
    }
  }

  const handleCancel = (id: number) => {
    if (!window.confirm("Cancel this booking?")) return;
    axios.delete(`http://127.0.0.1:8000/api/bookings/${id}/delete/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        setBookings(bookings.filter(b => b.id !== id));
        setFeedback("Booking cancelled.");
      })
      .catch(err => console.error(err));
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <IconButton color="inherit" onClick={() => navigate('/')} sx={{ mr: 2 }}><ArrowBackIcon /></IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>MY RESERVATIONS</Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {bookings.length === 0 ? (
          <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 3 }}>
            <Typography variant="h6">No active bookings.</Typography>
            <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/')}>Go to Dashboard</Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {bookings.map(booking => (
              <Grid item xs={12} md={6} key={booking.id}>
                <Card sx={{ display: 'flex', borderRadius: 4, height: '100%' }}>
                  <CardMedia
                    component="img"
                    sx={{ width: 140, display: { xs: 'none', sm: 'block' } }}
                    image={getImageUrl(booking.workspace_details)}
                  />
                  <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold">{booking.workspace_details?.name || 'Workspace'}</Typography>
                      <Typography variant="body2" color="text.secondary">Floor {booking.workspace_details?.floor}</Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2"><strong>Date:</strong> {booking.booking_date}</Typography>
                      <Typography variant="body2"><strong>Time:</strong> {booking.start_time.substring(0,5)} - {booking.end_time.substring(0,5)}</Typography>
                    </CardContent>
                    <CardActions><Button color="error" size="small" onClick={() => handleCancel(booking.id)}>Cancel</Button></CardActions>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
      <Snackbar open={!!feedback} autoHideDuration={3000} onClose={() => setFeedback(null)}>
        <Alert severity="success">{feedback}</Alert>
      </Snackbar>
    </Box>
  )
}

export default MyBookings