import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach, type Mocked } from 'vitest'
import axios from 'axios'
import Dashboard from '../pages/Dashboard'

vi.mock('axios')
const mockedAxios = axios as Mocked<typeof axios>

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const mockWorkspaces = [
  { id: 1, name: 'Corner Desk', resource_type: 'Desk', floor: 1, capacity: 1, is_active: true },
  { id: 2, name: 'Big Boardroom', resource_type: 'Boardroom', floor: 2, capacity: 10, is_active: true }
]

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('access_token', 'fake-token')
  })

  it('1. fetches and displays workspaces on search', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockWorkspaces })
    render(<BrowserRouter><Dashboard /></BrowserRouter>)

    // Wait for the initial load to finish
    await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument())

    // Click search to view results
    fireEvent.click(screen.getByRole('button', { name: /SEARCH/i }))

    await waitFor(() => {
      expect(screen.getByText('Corner Desk')).toBeInTheDocument()
      expect(screen.getByText('Big Boardroom')).toBeInTheDocument()
    })
  })
})