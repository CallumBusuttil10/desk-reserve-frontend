import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach, type Mocked } from 'vitest'
import axios from 'axios'
import MyBookings from '../pages/MyBookings'

vi.mock('axios')
const mockedAxios = axios as Mocked<typeof axios>

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockBookings = [{ id: 100, workspace: 1, booking_date: '2026-04-01', start_time: '09:00:00', end_time: '17:00:00', status: 'Confirmed' }]
const mockWorkspaces = [{ id: 1, name: 'Alpha Desk', resource_type: 'Desk', floor: 2 }]

describe('MyBookings Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('access_token', 'fake-token')
    window.confirm = vi.fn().mockReturnValue(true)  })

  it('1. fetches and displays user bookings', async () => {
    mockedAxios.get
      .mockResolvedValueOnce({ data: mockBookings })
      .mockResolvedValueOnce({ data: mockWorkspaces })

    render(<BrowserRouter><MyBookings /></BrowserRouter>)

    await waitFor(() => {
      expect(screen.getByText('Alpha Desk')).toBeInTheDocument()
      expect(screen.getByText(/2026-04-01/i)).toBeInTheDocument()
    })
  })

  it('2. cancels a booking successfully', async () => {
    mockedAxios.get
      .mockResolvedValueOnce({ data: mockBookings })
      .mockResolvedValueOnce({ data: mockWorkspaces })
    mockedAxios.delete.mockResolvedValueOnce({ status: 200 })

    render(<BrowserRouter><MyBookings /></BrowserRouter>)

    await waitFor(() => expect(screen.getByText('Alpha Desk')).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }))

    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalledWith(expect.stringContaining('/api/bookings/100/delete/'), expect.any(Object))
      expect(screen.getByText('Booking cancelled.')).toBeInTheDocument()
    })
  })
})