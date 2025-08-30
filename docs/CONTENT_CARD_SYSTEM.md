# Content Card System

## Overview

The Content Card System is a comprehensive solution for displaying and managing content items in a user-friendly interface. It provides a complete set of components for building content management applications with advanced filtering, sorting, and bulk operations.

## Components

### 1. ContentCard

The core component for displaying individual content items with status-based actions and rich metadata.

#### Features
- **Status-based Actions**: Different action buttons based on content status (draft, review, approved, published, archived)
- **Rich Metadata**: Author, creation date, update date, tags, priority, content type, and estimated read time
- **Responsive Design**: Adapts to different screen sizes with proper spacing and typography
- **Interactive Elements**: Hover states, focus management, and smooth transitions

#### Props
```typescript
interface ContentCardProps {
  id: string
  title: string
  description?: string
  content?: string
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived'
  contentType: 'article' | 'blog' | 'social' | 'video' | 'podcast' | 'newsletter'
  author?: string
  createdAt: Date
  updatedAt: Date
  tags?: string[]
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  estimatedReadTime?: number
  className?: string
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onApprove?: (id: string) => void
  onPublish?: (id: string) => void
  onArchive?: (id: string) => void
}
```

#### Usage
```tsx
<ContentCard
  id="1"
  title="Sample Article"
  description="This is a sample article description"
  status="draft"
  contentType="article"
  author="John Doe"
  createdAt={new Date()}
  updatedAt={new Date()}
  tags={['sample', 'article']}
  priority="medium"
  estimatedReadTime={5}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

### 2. ContentCardGrid

A powerful grid system for displaying multiple content cards with advanced filtering, sorting, and search capabilities.

#### Features
- **Advanced Filtering**: Filter by status, content type, priority, and custom search terms
- **Multiple Sort Options**: Sort by newest, oldest, title, priority, or status
- **View Modes**: Switch between grid and list layouts
- **Real-time Results**: Dynamic result counting and filter indicators
- **Responsive Layout**: Adapts to different screen sizes with proper breakpoints

#### Props
```typescript
interface ContentCardGridProps {
  content: ContentCardProps[]
  loading?: boolean
  error?: string | null
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onApprove?: (id: string) => void
  onPublish?: (id: string) => void
  onArchive?: (id: string) => void
  className?: string
}
```

#### Usage
```tsx
<ContentCardGrid
  content={contentItems}
  loading={isLoading}
  error={error}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onApprove={handleApprove}
  onPublish={handlePublish}
  onArchive={handleArchive}
/>
```

### 3. ContentCardActions

A sticky toolbar for managing bulk operations on selected content items.

#### Features
- **Bulk Operations**: Apply actions to multiple items simultaneously
- **Quick Actions**: Common operations like approve and publish
- **Selection Management**: Select all, clear selection, and selection summary
- **Sticky Positioning**: Remains visible during scrolling for easy access

#### Props
```typescript
interface ContentCardActionsProps {
  selectedItems: string[]
  onBulkAction: (action: string, itemIds: string[]) => void
  onSelectAll: () => void
  onClearSelection: () => void
  totalItems: number
  className?: string
}
```

#### Usage
```tsx
<ContentCardActions
  selectedItems={selectedItems}
  onBulkAction={handleBulkAction}
  onSelectAll={handleSelectAll}
  onClearSelection={handleClearSelection}
  totalItems={contentItems.length}
/>
```

### 4. ContentCardSkeleton

Loading placeholders that match the structure of actual content cards for better user experience.

#### Features
- **Realistic Structure**: Matches the layout and proportions of actual cards
- **Smooth Animation**: Subtle pulse animation to indicate loading state
- **Responsive Design**: Adapts to different screen sizes
- **Consistent Styling**: Uses the same design tokens as actual components

#### Props
```typescript
interface ContentCardSkeletonProps {
  className?: string
}
```

#### Usage
```tsx
// Show multiple skeletons while loading
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {Array.from({ length: 6 }).map((_, index) => (
    <ContentCardSkeleton key={index} />
  ))}
</div>
```

## Advanced Features

### Status-Based Actions

The ContentCard component automatically shows different action buttons based on the content status:

- **Draft**: Edit, Delete
- **Review**: Approve, Edit
- **Approved**: Publish, Edit
- **Published**: Archive, Edit
- **Archived**: Restore (Edit)

### Priority System

Content items can have different priority levels that affect their visual appearance:

- **Low**: Blue styling
- **Medium**: Yellow styling
- **High**: Orange styling
- **Urgent**: Red styling

### Content Type Classification

Different content types have distinct visual styling:

- **Article**: Purple
- **Blog**: Green
- **Social**: Blue
- **Video**: Red
- **Podcast**: Indigo
- **Newsletter**: Pink

### Tag Management

Tags are displayed with intelligent overflow handling:

- Shows first 3 tags
- Displays "+X more" indicator for additional tags
- Responsive layout that adapts to available space

## Integration Examples

### Basic Content Management Page

```tsx
import { ContentCardGrid } from '@/components/ui/content'

export default function ContentManagementPage() {
  const [content, setContent] = useState([])
  const [loading, setLoading] = useState(true)

  const handleEdit = (id: string) => {
    // Navigate to edit page
    router.push(`/content/${id}/edit`)
  }

  const handleDelete = async (id: string) => {
    // Delete content item
    await deleteContent(id)
    setContent(prev => prev.filter(item => item.id !== id))
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Content Management</h1>
      
      <ContentCardGrid
        content={content}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}
```

### Advanced Content Dashboard

```tsx
import { 
  ContentCardGrid, 
  ContentCardActions 
} from '@/components/ui/content'

export default function ContentDashboard() {
  const [selectedItems, setSelectedItems] = useState([])
  const [content, setContent] = useState([])

  const handleBulkAction = async (action: string, itemIds: string[]) => {
    switch (action) {
      case 'approve':
        await approveMultipleItems(itemIds)
        break
      case 'publish':
        await publishMultipleItems(itemIds)
        break
      case 'delete':
        await deleteMultipleItems(itemIds)
        break
    }
    
    // Refresh content and clear selection
    await refreshContent()
    setSelectedItems([])
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Content Dashboard</h1>
      
      {/* Bulk Actions Toolbar */}
      {selectedItems.length > 0 && (
        <ContentCardActions
          selectedItems={selectedItems}
          onBulkAction={handleBulkAction}
          onSelectAll={() => setSelectedItems(content.map(item => item.id))}
          onClearSelection={() => setSelectedItems([])}
          totalItems={content.length}
          className="mb-6"
        />
      )}
      
      {/* Content Grid */}
      <ContentCardGrid
        content={content}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onApprove={handleApprove}
        onPublish={handlePublish}
        onArchive={handleArchive}
      />
    </div>
  )
}
```

## Styling and Customization

### CSS Classes

The components use Tailwind CSS classes and can be customized through:

- **className prop**: Add custom classes to any component
- **CSS Variables**: Override design tokens for consistent theming
- **Component variants**: Use different visual styles through props

### Responsive Breakpoints

- **Mobile**: Single column layout
- **Tablet**: Two column layout
- **Desktop**: Three column layout
- **Large Desktop**: Four column layout

### Dark Mode Support

The components automatically adapt to dark mode when using Tailwind's dark mode classes:

```tsx
<ContentCard
  className="dark:bg-gray-800 dark:text-white"
  // ... other props
/>
```

## Performance Considerations

### Lazy Loading

For large content lists, consider implementing:

- **Virtual Scrolling**: Only render visible items
- **Pagination**: Load content in chunks
- **Infinite Scroll**: Load more content as user scrolls

### Memoization

Use React.memo for components that don't need frequent re-renders:

```tsx
const MemoizedContentCard = React.memo(ContentCard)
```

### Debounced Search

Implement debounced search to avoid excessive API calls:

```tsx
import { useDebounce } from 'use-debounce'

const [searchTerm, setSearchTerm] = useState('')
const [debouncedSearchTerm] = useDebounce(searchTerm, 300)

useEffect(() => {
  // Search API call with debounced term
  searchContent(debouncedSearchTerm)
}, [debouncedSearchTerm])
```

## Accessibility Features

### Keyboard Navigation

- **Tab Order**: Logical tab sequence through interactive elements
- **Arrow Keys**: Navigate between cards in grid view
- **Enter/Space**: Activate buttons and interactive elements

### Screen Reader Support

- **ARIA Labels**: Proper labeling for interactive elements
- **Status Announcements**: Screen reader announcements for status changes
- **Focus Management**: Clear focus indicators and management

### Color Contrast

- **WCAG Compliance**: Meets AA accessibility standards
- **High Contrast**: Sufficient contrast ratios for all text
- **Color Independence**: Information not conveyed solely through color

## Testing

### Unit Tests

Test individual component functionality:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ContentCard } from '@/components/ui/content'

test('ContentCard renders with correct props', () => {
  const mockProps = {
    id: '1',
    title: 'Test Title',
    status: 'draft' as const,
    contentType: 'article' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  render(<ContentCard {...mockProps} />)
  
  expect(screen.getByText('Test Title')).toBeInTheDocument()
  expect(screen.getByText('draft')).toBeInTheDocument()
})
```

### Integration Tests

Test component interactions:

```tsx
test('ContentCard calls onEdit when edit button is clicked', () => {
  const mockOnEdit = jest.fn()
  const mockProps = {
    // ... props
    onEdit: mockOnEdit,
  }

  render(<ContentCard {...mockProps} />)
  
  fireEvent.click(screen.getByText('Edit'))
  expect(mockOnEdit).toHaveBeenCalledWith('1')
})
```

## Troubleshooting

### Common Issues

1. **Cards not rendering**: Check that content array is properly formatted
2. **Actions not working**: Verify callback functions are properly passed
3. **Styling issues**: Ensure Tailwind CSS is properly configured
4. **Performance problems**: Implement pagination or virtual scrolling for large lists

### Debug Mode

Enable debug logging for development:

```tsx
const DEBUG = process.env.NODE_ENV === 'development'

if (DEBUG) {
  console.log('ContentCard props:', props)
  console.log('ContentCard state:', state)
}
```

## Future Enhancements

### Planned Features

- **Drag and Drop**: Reorder content items
- **Bulk Tag Management**: Add/remove tags from multiple items
- **Advanced Filters**: Date ranges, custom metadata filters
- **Export Options**: CSV, JSON export of filtered content
- **Real-time Updates**: WebSocket integration for live updates

### Customization Options

- **Theme System**: Multiple visual themes
- **Layout Presets**: Pre-configured layout options
- **Plugin System**: Extensible component architecture
- **Internationalization**: Multi-language support

## Contributing

When contributing to the Content Card System:

1. **Follow Patterns**: Maintain consistent component structure
2. **Add Tests**: Include unit and integration tests
3. **Update Docs**: Keep documentation current
4. **Accessibility**: Ensure all changes maintain accessibility standards
5. **Performance**: Consider performance impact of changes

## Support

For questions and support:

- **Documentation**: Check this guide and component examples
- **Issues**: Report bugs through the project issue tracker
- **Discussions**: Join community discussions for help
- **Examples**: Review showcase pages for usage patterns
