import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach, type Mocked } from 'vitest'
import axios from 'axios'
import Login from './Login'

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

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

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
    mockedAxios.post.mockResolvedValueOnce({ data: { access: '123', refresh: '456' } })
    renderLogin()

    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'testuser' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'testpass' } })
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }))

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('http://127.0.0.1:8000/api/token/', {
        username: 'testuser',
        password: 'testpass'
      })
    })
  })

  it('4. displays an error message if the API rejects the login', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Unauthorized'))
    renderLogin()

    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'wrong' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrongpass' } })
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }))

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

    fireEvent.change(usernameInput, { target: { value: 'admin' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText('Invalid username or password. Please try again.')).toBeInTheDocument()
    })

    mockedAxios.post.mockResolvedValueOnce({ data: { access: '123', refresh: '456' } })
    fireEvent.click(submitBtn)

    expect(screen.queryByText('Invalid username or password. Please try again.')).not.toBeInTheDocument()
  })

  it('6. saves JWT tokens to localStorage on successful login', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { access: 'fake-access-token', refresh: 'fake-refresh-token' }
    })
    renderLogin()

    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'admin' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'secret123' } })
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }))

    await waitFor(() => {
      expect(localStorage.getItem('access_token')).toBe('fake-access-token')
      expect(localStorage.getItem('refresh_token')).toBe('fake-refresh-token')
      expect(localStorage.getItem('username')).toBe('admin')
    })
  })

})