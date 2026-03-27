import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach, type Mocked } from 'vitest'
import axios from 'axios'
import Register from '../pages/Register'

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

describe('Register Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderRegister = () => render(<BrowserRouter><Register /></BrowserRouter>)

  it('1. renders all registration fields', () => {
    renderRegister()
    expect(screen.getByText('Create an account')).toBeInTheDocument()
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument()
  })

  it('2. successfully registers and navigates to login', async () => {
    mockedAxios.post.mockResolvedValueOnce({ status: 201 })
    renderRegister()

    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'newuser' } })
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@test.com' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'secure123' } })
    fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }))

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalled()
      expect(screen.getByText(/Registration successful/i)).toBeInTheDocument()
    })
  })

  it('3. displays error on failed registration', async () => {
      const mockError = {
        response: {
          data: {
            username: ['A user with that username already exists.']
          }
        }
      };
      mockedAxios.post.mockRejectedValueOnce(mockError)

      renderRegister()

      fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'existinguser' } })
      fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@test.com' } })
      fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'secure123' } })
      fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }))

      await waitFor(() => {
        expect(screen.getByText(/A user with that username already exists/i)).toBeInTheDocument()
      })
    })
})