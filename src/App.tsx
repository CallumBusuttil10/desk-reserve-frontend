import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  AppBar, Toolbar, Typography, Container, Grid, Card,
  CardContent, CardActions, Button, CircularProgress, Box, Chip
} from '@mui/material'
import DeskIcon from '@mui/icons-material/Desk'

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
                  >
                    Book Resource
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}

export default App