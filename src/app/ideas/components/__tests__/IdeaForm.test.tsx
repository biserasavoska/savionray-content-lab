import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { IdeaStatus } from '@prisma/client'
import { Session } from 'next-auth'

import IdeaForm from '../IdeaForm'

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn()
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

describe('IdeaForm', () => {
  const mockSession = {
    data: {
      user: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    } as Session,
    status: 'authenticated' as const,
    update: jest.fn(),
  }

  const mockRouter = {
    push: jest.fn(),
  }

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()
    
    // Setup default mocks
    jest.mocked(useSession).mockReturnValue(mockSession)
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  it('renders the form correctly', () => {
    render(<IdeaForm />)
    
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create idea/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('handles form submission correctly', async () => {
    const mockOnSuccess = jest.fn()
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'new-idea-id' }),
    })

    render(<IdeaForm onSuccess={mockOnSuccess} />)

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test Idea' },
    })
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Test Description' },
    })
    
    // Select content type (required field)
    fireEvent.change(screen.getByLabelText(/content type/i), {
      target: { value: 'BLOG_POST' },
    })

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /create idea/i }))

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled()
      const fetchCall = (fetch as jest.Mock).mock.calls[0]
      expect(fetchCall[0]).toBe('/api/ideas')
      expect(fetchCall[1].method).toBe('POST')
      expect(fetchCall[1].headers).toEqual({ 'Content-Type': 'application/json' })
      const body = JSON.parse(fetchCall[1].body)
      expect(body).toEqual(
        expect.objectContaining({
          title: 'Test Idea',
          description: 'Test Description',
          contentType: 'BLOG_POST',
          publishingDateTime: null,
          savedForLater: false,
        })
      )
      expect(mockOnSuccess).toHaveBeenCalled()
      expect(mockRouter.push).toHaveBeenCalledWith('/ideas')
    })
  })

  it('displays error message on failed submission', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Failed to save idea' }),
    })

    render(<IdeaForm />)

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test Idea' },
    })
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Test Description' },
    })
    
    // Select content type (required field)
    fireEvent.change(screen.getByLabelText(/content type/i), {
      target: { value: 'BLOG_POST' },
    })

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /create idea/i }))

    await waitFor(() => {
      expect(screen.getByText(/failed to save idea/i)).toBeInTheDocument()
    })
  })

  it('handles edit mode correctly', () => {
    const mockIdea = {
      id: 'test-idea-id',
      title: 'Existing Idea',
      description: 'Existing Description',
      status: 'PENDING' as IdeaStatus,
      publishingDateTime: null,
      savedForLater: false,
      mediaType: null,
      contentType: null,
      deliveryItemId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdById: 'test-user-id',
    }

    render(<IdeaForm idea={mockIdea} />)

    expect(screen.getByLabelText(/title/i)).toHaveValue('Existing Idea')
    expect(screen.getByLabelText(/description/i)).toHaveValue('Existing Description')
    expect(screen.getByRole('button', { name: /update idea/i })).toBeInTheDocument()
  })
}) 