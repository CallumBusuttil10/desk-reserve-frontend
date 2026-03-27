import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi, type Mocked } from 'vitest'
import axios from 'axios'
import ForgotPassword from '../pages/ForgotPassword'

vi.mock('axios')
const mockedAxios = axios as Mocked<typeof axios>

describe('ForgotPassword Component', () => {
  it('1. submits email for password reset', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { message: 'Reset link sent' } })
    render(<BrowserRouter><ForgotPassword /></BrowserRouter>)

    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'user@test.com' } })
    fireEvent.click(screen.getByRole('button', { name: /Send Reset Link/i }))

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalled()
      expect(screen.getByText(/Reset link sent/i)).toBeInTheDocument()
    })
  })
})