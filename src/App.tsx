import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  AppBar, Toolbar, Typography, Container, Grid, Card,
  CardContent, CardActions, Button, CircularProgress, Box, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert
} from '@mui/material'
import DeskIcon from '@mui/icons-material/Desk'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { TimePicker } from '@mui/x-date-pickers/TimePicker'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/en-gb'

interface Workspace {
  id: number;
  name: string;
  resource_type: string;
  capacity: number;
  is_active: boolean;
  image_url?: string | null;
}

function App() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [bookingDate, setBookingDate] = useState<Dayjs | null>(dayjs())
  const [startTime, setStartTime] = useState<Dayjs | null>(dayjs().hour(9).minute(0))
  const [endTime, setEndTime] = useState<Dayjs | null>(dayjs().hour(17).minute(0))

  const [feedbackMsg, setFeedbackMsg] = useState<{type: 'success' | 'error', text: string} | null>(null)

  useEffect(() => {
    axios.get<Workspace[]>('http://127.0.0.1:8000/api/workspaces/')
      .then(response => {
        setWorkspaces(response.data)
        setLoading(false)
      })
      .catch(err => {
        console.error("Error fetching data:", err)
        setError("Could not connect to the backend.")
        setLoading(false)
      })
  }, [])

  const handleOpenModal = (workspace: Workspace) => {
    setSelectedWorkspace(workspace)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedWorkspace(null)
  }

  const handleBookSubmit = () => {
    if (!selectedWorkspace || !bookingDate || !startTime || !endTime) return;

    const payload = {
      user: 1,
      workspace: selectedWorkspace.id,
      booking_date: bookingDate.format('YYYY-MM-DD'),
      start_time: startTime.format('HH:mm:ss'),
      end_time: endTime.format('HH:mm:ss'),
      status: 'Confirmed'
    }

    axios.post('http://127.0.0.1:8000/api/bookings/create/', payload)
      .then(response => {
        setFeedbackMsg({ type: 'success', text: 'Booking confirmed successfully!' })
        handleCloseModal()
      })
      .catch(err => {
        const errorText = err.response?.data?.non_field_errors?.[0] || "Failed to create booking."
        setFeedbackMsg({ type: 'error', text: errorText })
      })
  }

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <CircularProgress />
    </Box>
  )

  if (error) return (
    <Box display="flex" justifyContent="center" mt={5}>
      <Typography color="error" variant="h5">{error}</Typography>
    </Box>
  )

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
      <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh', pb: 5 }}>
        <AppBar position="static" elevation={0} sx={{ bgcolor: '#1976d2', mb: 4 }}>
          <Toolbar>
            <DeskIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              DeskReserve
            </Typography>
            <Button color="inherit">Login</Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg">
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="text.primary">
            Available Workspaces
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
            Select a desk or meeting room to view availability and book your slot.
          </Typography>

          <Grid container spacing={3}>
            {workspaces.map(workspace => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={workspace.id}>
                <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Typography variant="h6" component="h2" fontWeight="bold">
                        {workspace.name}
                      </Typography>
                      {workspace.is_active ? (
                        <Chip label="Available" color="success" size="small" />
                      ) : (
                        <Chip label="Offline" color="error" size="small" />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      <strong>Type:</strong> {workspace.resource_type}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Capacity:</strong> {workspace.capacity} {workspace.capacity > 1 ? 'People' : 'Person'}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      disabled={!workspace.is_active}
                      disableElevation
                      onClick={() => handleOpenModal(workspace)}
                    >
                      Book Resource
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>

        <Dialog open={modalOpen} onClose={handleCloseModal} fullWidth maxWidth="sm">
          <DialogTitle fontWeight="bold">
            Book {selectedWorkspace?.name}
          </DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={3} mt={1}>
              <DatePicker
                label="Date"
                value={bookingDate}
                onChange={(newValue) => setBookingDate(newValue)}
                disablePast
              />
              <Box display="flex" gap={2}>
                <TimePicker
                  label="Start Time"
                  value={startTime}
                  onChange={(newValue) => setStartTime(newValue)}
                  sx={{ flex: 1 }}
                />
                <TimePicker
                  label="End Time"
                  value={endTime}
                  onChange={(newValue) => setEndTime(newValue)}
                  sx={{ flex: 1 }}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleCloseModal} color="inherit">Cancel</Button>
            <Button onClick={handleBookSubmit} variant="contained" disableElevation>
              Confirm Booking
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={!!feedbackMsg}
          autoHideDuration={6000}
          onClose={() => setFeedbackMsg(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setFeedbackMsg(null)} severity={feedbackMsg?.type} sx={{ width: '100%' }}>
            {feedbackMsg?.text}
          </Alert>
        </Snackbar>

      </Box>
    </LocalizationProvider>
  )
}

export default App