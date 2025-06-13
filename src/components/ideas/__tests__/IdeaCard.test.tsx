import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import IdeaCard from '../IdeaCard'
import { formatDistanceToNow } from 'date-fns'
import { IdeaStatus } from '@prisma/client'
import { Session } from 'next-auth'

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn()
}))

// Mock date-fns
jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn(),
}))

describe('IdeaCard', () => {
  const mockIdea = {
    id: 'test-idea-id',
    title: 'Test Idea',
    description: 'Test Description',
    status: 'PENDING' as IdeaStatus,
    publishingDateTime: null,
    savedForLater: false,
    mediaType: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    createdById: 'test-user-id',
    createdBy: {
      name: 'Test User',
      email: 'test@example.com',
    },
  }

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

  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useSession).mockReturnValue(mockSession)
    ;(formatDistanceToNow as jest.Mock).mockReturnValue('1 day ago')
  })

  it('renders idea details correctly', () => {
    render(<IdeaCard idea={mockIdea} />)

    expect(screen.getByText(mockIdea.title)).toBeInTheDocument()
    expect(screen.getByText(mockIdea.description)).toBeInTheDocument()
    expect(screen.getByText(/test user/i)).toBeInTheDocument()
  })

  it('shows edit and delete buttons for idea creator', () => {
    render(<IdeaCard idea={mockIdea} />)

    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })

  it('hides edit and delete buttons for non-creators', () => {
    const nonCreatorSession = {
      data: {
        user: {
          id: 'different-user-id',
          name: 'Different User',
          email: 'different@example.com',
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      } as Session,
      status: 'authenticated' as const,
      update: jest.fn(),
    }
    jest.mocked(useSession).mockReturnValue(nonCreatorSession)

    render(<IdeaCard idea={mockIdea} />)

    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', () => {
    const mockOnEdit = jest.fn()
    render(<IdeaCard idea={mockIdea} onEdit={mockOnEdit} />)

    fireEvent.click(screen.getByRole('button', { name: /edit/i }))
    expect(mockOnEdit).toHaveBeenCalledWith(mockIdea)
  })

  it('calls onDelete when delete button is clicked', async () => {
    const mockOnDelete = jest.fn()
    render(<IdeaCard idea={mockIdea} onDelete={mockOnDelete} />)

    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    expect(mockOnDelete).toHaveBeenCalledWith(mockIdea.id)
  })

  it('shows correct status color', () => {
    const approvedIdea = {
      ...mockIdea,
      status: 'APPROVED_BY_CLIENT' as IdeaStatus,
    }

    render(<IdeaCard idea={approvedIdea} />)
    const statusElement = screen.getByText('APPROVED BY_CLIENT')
    expect(statusElement.className).toContain('bg-green-100')
    expect(statusElement.className).toContain('text-green-800')
  })
}) 