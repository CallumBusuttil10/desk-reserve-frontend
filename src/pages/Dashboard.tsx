import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import {
  AppBar, Toolbar, Typography, Container, Card,
  CardContent, CardActions, Button, CircularProgress, Box,
  Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert,
  TextField, MenuItem, CardMedia, Grid, Paper, Divider
} from '@mui/material'
import CorporateFareIcon from '@mui/icons-material/CorporateFare'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import PeopleIcon from '@mui/icons-material/People'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { TimePicker } from '@mui/x-date-pickers/TimePicker'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/en-gb'
import { jwtDecode } from 'jwt-decode'

interface Workspace {
  id: number;
  name: string;
  resource_type: string;
  floor: number;
  capacity: number;
  is_active: boolean;
  image?: string | null;
}

interface MyToken {
  user_id: number;
  exp: number;
}

function Dashboard() {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const [hasSearched, setHasSearched] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState<number | 'all'>('all');
  const [resourceFilter, setResourceFilter] = useState('All');

  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [bookingDate, setBookingDate] = useState<Dayjs | null>(dayjs())
  const [startTime, setStartTime] = useState<Dayjs | null>(dayjs().hour(9).minute(0))
  const [endTime, setEndTime] = useState<Dayjs | null>(dayjs().hour(17).minute(0))
  const [feedbackMsg, setFeedbackMsg] = useState<{type: 'success' | 'error', text: string} | null>(null)

  const token = localStorage.getItem('access_token');
  const username = localStorage.getItem('username');

  useEffect(() => {
    axios.get<Workspace[]>('http://127.0.0.1:8000/api/workspaces/')
      .then(response => {
        setWorkspaces(response.data)
        setLoading(false)
      })
      .catch(err => {
        console.error("Error fetching data:", err)
        setLoading(false)
      })
  }, [])

  const getImageUrl = (workspace: Workspace) => {
    if (workspace.image) return workspace.image;
    switch (workspace.resource_type) {
      case 'Boardroom': return "https://res.cloudinary.com/dwtbxefd8/image/upload/v1774356998/workspaces/Boardroom_viyh2k.png";
      case 'Desk': return "https://res.cloudinary.com/dwtbxefd8/image/upload/v1774356795/workspaces/standingdesk_inl2nr.png";
      case 'Focus Pod': return "https://res.cloudinary.com/dwtbxefd8/image/upload/v1774356962/workspaces/FocusPod_zyxfdt.png";
      default: return "";
    }
  }

  const handleBookSubmit = () => {
    if (!selectedWorkspace || !bookingDate || !startTime || !endTime || !token) return;
    if (endTime.isBefore(startTime) || endTime.isSame(startTime)) {
        setFeedbackMsg({ type: 'error', text: 'End time must be after start time.' });
        return;
    }
    const decodedToken = jwtDecode<MyToken>(token);
    const payload = {
      user: decodedToken.user_id,
      workspace: selectedWorkspace.id,
      booking_date: bookingDate.format('YYYY-MM-DD'),
      start_time: startTime.format('HH:mm:ss'),
      end_time: endTime.format('HH:mm:ss'),
      status: 'Confirmed'
    }
    axios.post('http://127.0.0.1:8000/api/bookings/create/', payload, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
        setFeedbackMsg({ type: 'success', text: 'Booking successful!' })
        setModalOpen(false)
    }).catch(() => {
        setFeedbackMsg({ type: 'error', text: "Booking failed." })
    })
  }

  const filteredWorkspaces = workspaces.filter(w => {
    const matchesFloor = selectedFloor === 'all' || String(w.floor) === String(selectedFloor);
    const matchesType = resourceFilter === 'All' || w.resource_type === resourceFilter;
    return matchesFloor && matchesType;
  });

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh"><CircularProgress /></Box>

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
      <Box sx={{ flexGrow: 1, bgcolor: '#f8fafc', minHeight: '100vh' }}>
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#1976d2' }}>
          <Toolbar>
            <CorporateFareIcon sx={{ mr: 2 }} />
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>DESKRESERVE</Typography>
            {token && (
              <Box display="flex" alignItems="center" gap={2}>
                <Button color="inherit" onClick={() => navigate('/bookings')}>My Bookings</Button>
                <Typography variant="body2">{username}</Typography>
                <Button color="inherit" variant="outlined" size="small" onClick={() => { localStorage.clear(); navigate('/login'); }}>Logout</Button>
              </Box>
            )}
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ py: 8 }}>
          {!hasSearched ? (
            <Box textAlign="center" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
              <Typography variant="h3" fontWeight="900" gutterBottom color="primary.main">Ready to work?</Typography>
              <Paper elevation={4} sx={{ p: 4, borderRadius: 3, width: '100%', maxWidth: '900px' }}>
                <Grid container spacing={2} justifyContent="center" alignItems="center">

                  {/* FIXED: Using size object for modern MUI */}
                  <Grid size={{ xs: 12, md: 5 }}>
                    <TextField select fullWidth label="Select Floor" value={selectedFloor} onChange={(e) => setSelectedFloor(e.target.value as any)}>
                      <MenuItem value="all">Any Floor</MenuItem>
                      <MenuItem value={1}>Floor 1</MenuItem>
                      <MenuItem value={2}>Floor 2</MenuItem>
                      <MenuItem value={3}>Floor 3</MenuItem>
                      <MenuItem value={4}>Floor 4</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField select fullWidth label="Resource Type" value={resourceFilter} onChange={(e) => setResourceFilter(e.target.value)}>
                      <MenuItem value="All">All Types</MenuItem>
                      <MenuItem value="Desk">Desk</MenuItem>
                      <MenuItem value="Focus Pod">Focus Pod</MenuItem>
                      <MenuItem value="Boardroom">Boardroom</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <Button fullWidth variant="contained" size="large" sx={{ height: 56, fontWeight: 'bold' }} onClick={() => setHasSearched(true)}>SEARCH</Button>
                  </Grid>

                </Grid>
              </Paper>
            </Box>
          ) : (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="flex-end" mb={6}>
                <Typography variant="h4" fontWeight="bold">Floor {selectedFloor === 'all' ? 'All' : selectedFloor} Results</Typography>
                <Button variant="outlined" onClick={() => setHasSearched(false)}>Modify Search</Button>
              </Box>
              <Grid container spacing={4}>
                {filteredWorkspaces.map(workspace => (
                  <Grid size={{ xs: 12, sm: 6, md: 3 }} key={workspace.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 4 }}>
                      <CardMedia component="img" height="200" image={getImageUrl(workspace)} sx={{ objectFit: 'cover' }} />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="overline" color="primary" fontWeight="bold">Floor {workspace.floor}</Typography>
                        <Typography variant="h6" fontWeight="bold">{workspace.name}</Typography>
                      </CardContent>
                      <CardActions sx={{ p: 2 }}>
                        <Button fullWidth variant="contained" onClick={() => { setSelectedWorkspace(workspace); setModalOpen(true); }}>Book Now</Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Container>

        <Dialog open={modalOpen} onClose={() => setModalOpen(false)} fullWidth maxWidth="xs">
          <DialogTitle sx={{ fontWeight: 'bold', pb: 0 }}>Reserve {selectedWorkspace?.name}</DialogTitle>
          <Box px={3} pb={2}>
              <Box display="flex" gap={2} mt={1}>
                <Box display="flex" alignItems="center" gap={0.5} color="text.secondary"><LocationOnIcon sx={{ fontSize: 16 }} /><Typography variant="caption">Floor {selectedWorkspace?.floor}</Typography></Box>
                <Box display="flex" alignItems="center" gap={0.5} color="text.secondary"><PeopleIcon sx={{ fontSize: 16 }} /><Typography variant="caption">Seats {selectedWorkspace?.capacity}</Typography></Box>
              </Box>
          </Box>
          <Divider />
          <DialogContent>
             <Box display="flex" flexDirection="column" gap={3} mt={1}>
              <DatePicker label="Date" value={bookingDate} onChange={setBookingDate} disablePast />
              <TimePicker label="Start Time" value={startTime} onChange={setStartTime} />
              <TimePicker label="End Time" value={endTime} onChange={setEndTime} />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleBookSubmit} variant="contained">Confirm Reservation</Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={!!feedbackMsg} autoHideDuration={4000} onClose={() => setFeedbackMsg(null)}>
          <Alert severity={feedbackMsg?.type} variant="filled">{feedbackMsg?.text}</Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  )
}

export default Dashboard