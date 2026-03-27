import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi, type Mocked } from 'vitest'
import axios from 'axios'
import ResetPassword from '../pages/ResetPassword'

vi.mock('axios')
const mockedAxios = axios as Mocked<typeof axios>

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ uid: '123', token: 'abc' }) // Mocks the URL parameters
  }
})

describe('ResetPassword Component', () => {
  it('1. prevents submission if passwords do not match', async () => {
    render(<BrowserRouter><ResetPassword /></BrowserRouter>)

    fireEvent.change(screen.getByLabelText(/^New Password/i), { target: { value: 'pass1' } })
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), { target: { value: 'pass2' } })
    fireEvent.click(screen.getByRole('button', { name: /Reset Password/i }))

    // API should not be called
    expect(mockedAxios.post).not.toHaveBeenCalled()
    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument()
  })

  it('2. submits successfully when passwords match', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { message: 'Password reset successfully!' } })
    render(<BrowserRouter><ResetPassword /></BrowserRouter>)

    fireEvent.change(screen.getByLabelText(/^New Password/i), { target: { value: 'securepass' } })
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), { target: { value: 'securepass' } })
    fireEvent.click(screen.getByRole('button', { name: /Reset Password/i }))

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalled()
      expect(screen.getByText('Password reset successfully!')).toBeInTheDocument()
    })
  })
})