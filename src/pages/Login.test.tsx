import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import Login from './Login'

// 1. Mock Axios so we don't hit the real network during tests
vi.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

// 2. Mock React Router's useNavigate hook to track if the user gets redirected
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Login Component', () => {
  // Before every single test, clear out any saved data or fake API calls
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  // Helper function to render the component with the Router wrapper
  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )
  }

  it('1. renders all form elements correctly', () => {
    renderLogin()
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument()
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument()
  })

  it('2. allows the user to type into the input fields', () => {
    renderLogin()
    const usernameInput = screen.getByLabelText(/Username/i) as HTMLInputElement
    const passwordInput = screen.getByLabelText(/Password/i) as HTMLInputElement

    fireEvent.change(usernameInput, { target: { value: 'admin' } })
    fireEvent.change(passwordInput, { target: { value: 'secret123' } })

    expect(usernameInput.value).toBe('admin')
    expect(passwordInput.value).toBe('secret123')
  })

  it('3. sends the correct data to the API when submitted', async () => {
    // Setup the fake API to return success
    mockedAxios.post.mockResolvedValueOnce({ data: { access: '123', refresh: '456' } })
    renderLogin()

    // Fill out and submit the form
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'testuser' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'testpass' } })
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }))

    // Verify Axios was called with the exact right URL and payload
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('http://127.0.0.1:8000/api/token/', {
        username: 'testuser',
        password: 'testpass'
      })
    })
  })

  it('4. displays an error message if the API rejects the login', async () => {
    // Setup the fake API to throw an error (like a bad password)
    mockedAxios.post.mockRejectedValueOnce(new Error('Unauthorized'))
    renderLogin()

    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'wrong' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrongpass' } })
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }))

    // Wait for the UI to update with the error banner
    await waitFor(() => {
      expect(screen.getByText('Invalid username or password. Please try again.')).toBeInTheDocument()
    })
  })

  it('5. clears previous errors when trying to log in again', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Unauthorized'))
    renderLogin()

    const usernameInput = screen.getByLabelText(/Username/i)
    const passwordInput = screen.getByLabelText(/Password/i)
    const submitBtn = screen.getByRole('button', { name: /Sign In/i })

    // Fill out both required fields to trigger the first error!
    fireEvent.change(usernameInput, { target: { value: 'admin' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } })
    fireEvent.click(submitBtn)

    // Wait for the error to show up
    await waitFor(() => {
      expect(screen.getByText('Invalid username or password. Please try again.')).toBeInTheDocument()
    })

    // Setup the mock for the next click and click submit again
    mockedAxios.post.mockResolvedValueOnce({ data: { access: '123', refresh: '456' } })
    fireEvent.click(submitBtn)

    // The error should instantly clear
    expect(screen.queryByText('Invalid username or password. Please try again.')).not.toBeInTheDocument()
  })

  it('6. saves JWT tokens to localStorage on successful login', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { access: 'fake-access-token', refresh: 'fake-refresh-token' }
    })
    renderLogin()

    // Fill out BOTH required fields!
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'admin' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'secret123' } })
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }))

    await waitFor(() => {
      expect(localStorage.getItem('access_token')).toBe('fake-access-token')
      expect(localStorage.getItem('refresh_token')).toBe('fake-refresh-token')
      expect(localStorage.getItem('username')).toBe('admin')
    })
  })

  it('7. navigates the user to the dashboard on successful login', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { access: '123', refresh: '456' } })
    renderLogin()

    // Fill out BOTH required fields!
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'admin' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'secret123' } })
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }))

    // Check if React Router's navigate function was called with '/'
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })
})