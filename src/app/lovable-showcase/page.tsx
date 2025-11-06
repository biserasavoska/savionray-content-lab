"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/lovable/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/lovable/tabs";
import { LoadingStateCard, ErrorStateCard, SuccessStateCard, EmptyStateCard } from "@/components/design-system/StateCards";
import { FormValidationPattern, AutoSavePattern } from "@/components/design-system/FormPatterns";
import { NotificationPatterns } from "@/components/design-system/NotificationPatterns";
import { StatusBadges } from "@/components/design-system/StatusBadges";
import { ActionButtons } from "@/components/design-system/ActionButtons";
import { LayoutPatterns } from "@/components/design-system/LayoutPatterns";
import { NavigationPatterns } from "@/components/design-system/NavigationPatterns";
import DataDisplay from "@/components/design-system/DataDisplay";
import { ComplexInteractions } from "@/components/design-system/ComplexInteractions";
import { DashboardPatterns } from "@/components/design-system/DashboardPatterns";
import { SearchFiltering } from "@/components/design-system/SearchFiltering";
import { MediaManagement } from "@/components/design-system/MediaManagement";
import { PermissionsAccess } from "@/components/design-system/PermissionsAccess";
import { VersionHistory } from "@/components/design-system/VersionHistory";
import OnboardingTutorials from "@/components/design-system/OnboardingTutorials";
import EmptyStates from "@/components/design-system/EmptyStates";
import ModalDialogPatterns from "@/components/design-system/ModalDialogPatterns";
import AdvancedTablePatterns from "@/components/design-system/AdvancedTablePatterns";
import AnimationTransitions from "@/components/design-system/AnimationTransitions";
import DateTimePickers from "@/components/design-system/DateTimePickers";
import { Palette, Layout, FileText, Bell, Navigation, Layers, Database, MousePointerClick, BarChart3, Search, Image as ImageIcon, Shield, History, Sparkles, AlertCircle, Square, Table as TableIcon, CalendarDays } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">CMS Design System & Patterns</h1>
          <p className="text-muted-foreground">
            Complete interactive design reference • Phase 15: Date & Time Pickers
          </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="states" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-15">
            <TabsTrigger value="states" className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              <span className="hidden sm:inline">States</span>
            </TabsTrigger>
            <TabsTrigger value="forms" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Forms</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="badges" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Badges</span>
            </TabsTrigger>
            <TabsTrigger value="buttons" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Buttons</span>
            </TabsTrigger>
            <TabsTrigger value="layouts" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              <span className="hidden sm:inline">Layouts</span>
            </TabsTrigger>
            <TabsTrigger value="navigation" className="flex items-center gap-2">
              <Navigation className="h-4 w-4" />
              <span className="hidden sm:inline">Navigation</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Data</span>
            </TabsTrigger>
            <TabsTrigger value="interactions" className="flex items-center gap-2">
              <MousePointerClick className="h-4 w-4" />
              <span className="hidden sm:inline">Interactions</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Search</span>
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Media</span>
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Permissions</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
            <TabsTrigger value="onboarding" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Onboarding</span>
            </TabsTrigger>
            <TabsTrigger value="empty-states" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Empty States</span>
            </TabsTrigger>
            <TabsTrigger value="modals" className="flex items-center gap-2">
              <Square className="h-4 w-4" />
              <span className="hidden sm:inline">Modals</span>
            </TabsTrigger>
            <TabsTrigger value="tables" className="flex items-center gap-2">
              <TableIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Tables</span>
            </TabsTrigger>
            <TabsTrigger value="animations" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Animations</span>
            </TabsTrigger>
            <TabsTrigger value="datetime" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">Date/Time</span>
            </TabsTrigger>
            <TabsTrigger value="design" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Design</span>
            </TabsTrigger>
          </TabsList>

          {/* Component States Tab */}
          <TabsContent value="states" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Component State Patterns</CardTitle>
                <CardDescription>
                  These patterns ensure consistent UX across all features. Every async operation should have loading, success, error, and empty states.
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <LoadingStateCard />
              <ErrorStateCard />
              <SuccessStateCard />
              <EmptyStateCard />
            </div>

            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">Implementation Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="space-y-1">
                  <p className="font-medium">For Next.js App Router:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                    <li>Use Suspense boundaries with skeleton fallbacks</li>
                    <li>Create error.tsx files for error boundaries</li>
                    <li>Implement loading.tsx for route-level loading states</li>
                    <li>Use React Server Components for initial data fetching</li>
                  </ul>
                </div>
                <div className="space-y-1 pt-2">
                  <p className="font-medium">Best Practices:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                    <li>Always show loading state for operations &gt;200ms</li>
                    <li>Provide actionable error messages with retry options</li>
                    <li>Use optimistic updates for better perceived performance</li>
                    <li>Empty states should guide users to their next action</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Form Patterns Tab */}
          <TabsContent value="forms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Form & Input Patterns</CardTitle>
                <CardDescription>
                  Validation, auto-save, and submission patterns for robust form experiences.
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <FormValidationPattern />
              <AutoSavePattern />
            </div>

            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">Implementation Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="space-y-1">
                  <p className="font-medium">For Next.js Implementation:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                    <li>Use Server Actions for form submissions (built-in validation)</li>
                    <li>Leverage useFormState and useFormStatus hooks</li>
                    <li>Implement debounced auto-save with SWR or React Query</li>
                    <li>Add Zod schema validation on both client and server</li>
                  </ul>
                </div>
                <div className="space-y-1 pt-2">
                  <p className="font-medium">Your Current Setup:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                    <li>You already have Prisma models for content drafts</li>
                    <li>Socket.IO can handle real-time auto-save broadcasts</li>
                    <li>Integrate with your existing TipTap editor for rich text</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Patterns</CardTitle>
                <CardDescription>
                  Toast notifications for user feedback. Click the buttons below to see them in action.
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <NotificationPatterns />
              
              <Card>
                <CardHeader>
                  <CardTitle>When to Use Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-medium text-success mb-1">✓ Success (Green)</h4>
                    <p className="text-muted-foreground">Content published, saved, deleted, settings updated</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-destructive mb-1">✗ Error (Red)</h4>
                    <p className="text-muted-foreground">Network failures, validation errors, permission denied</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-warning mb-1">⚠ Warning (Orange)</h4>
                    <p className="text-muted-foreground">Unsaved changes, quota limits, destructive actions</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-info mb-1">ℹ Info (Blue)</h4>
                    <p className="text-muted-foreground">Tips, feature announcements, onboarding hints</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">Implementation Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="space-y-1">
                  <p className="font-medium">For Next.js:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                    <li>Use sonner or react-hot-toast for notifications</li>
                    <li>Create a centralized toast utility for consistency</li>
                    <li>Auto-dismiss success toasts after 3-5 seconds</li>
                    <li>Keep error toasts persistent with dismiss button</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-6">
            <StatusBadges />
            
            <Card>
              <CardHeader>
                <CardTitle>Implementation Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Badge Component Usage</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                    <li>Use semantic color tokens from your design system (success, warning, info, destructive)</li>
                    <li>Always include icons for better visual recognition</li>
                    <li>Keep badge text short and descriptive (1-2 words)</li>
                    <li>Use outline variant for non-critical categorization (content types, tags)</li>
                  </ul>
                </div>
                <div className="space-y-1 pt-2">
                  <p className="font-medium">Your Current Setup:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                    <li>Map these to your Prisma enums (ContentStatus, ContentType, etc.)</li>
                    <li>Store status colors in your database for dynamic badges</li>
                    <li>Use these in your content tables and detail views</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Buttons Tab */}
          <TabsContent value="buttons" className="space-y-6">
            <ActionButtons />
            
            <Card>
              <CardHeader>
                <CardTitle>Implementation Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Button Component Usage</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                    <li>Primary actions: Use default variant for main workflow actions</li>
                    <li>Destructive actions: Always confirm before executing (use AlertDialog)</li>
                    <li>Secondary actions: Use for supporting actions that don't change data</li>
                    <li>Loading states: Always show feedback during async operations</li>
                  </ul>
                </div>
                <div className="space-y-1 pt-2">
                  <p className="font-medium">Your Current Setup:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                    <li>Connect to your Server Actions for form submissions</li>
                    <li>Use with your role-based permissions (RBAC) system</li>
                    <li>Integrate with your audit logging for critical actions</li>
                    <li>Add confirmation dialogs for destructive operations</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Layouts Tab */}
          <TabsContent value="layouts" className="space-y-6">
            <LayoutPatterns />
            
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">Implementation Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Layout Structure</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                    <li>Use Next.js App Router layout.tsx for consistent structure</li>
                    <li>Implement responsive breakpoints (mobile: &lt;768px, tablet: &lt;1024px, desktop: 1024px+)</li>
                    <li>Sidebar should collapse to hamburger menu on mobile</li>
                    <li>Use CSS Grid for main layout, Flexbox for component internals</li>
                  </ul>
                </div>
                <div className="space-y-1 pt-2">
                  <p className="font-medium">Your Current Setup:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                    <li>Sidebar layout for main navigation (Dashboard, Content, Team)</li>
                    <li>Split view for content management (list + detail)</li>
                    <li>Three-column for editor (outline + content + activity)</li>
                    <li>Use Radix UI Collapsible for expandable sidebar groups</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Navigation Tab */}
          <TabsContent value="navigation" className="space-y-6">
            <NavigationPatterns />
            
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">Implementation Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
...
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Display Tab */}
          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Display Patterns</CardTitle>
                <CardDescription>
                  Tables, lists, grids, and detail views for presenting content and records.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <DataDisplay />
            
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">Implementation Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Data Display Best Practices</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                    <li>Tables: Best for dense data requiring comparison and sorting</li>
                    <li>Lists: Ideal for content with descriptions and preview needs</li>
                    <li>Grids: Perfect for visual content and quick scanning</li>
                    <li>Detail views: Use for comprehensive single-record inspection</li>
                  </ul>
                </div>
                <div className="space-y-1 pt-2">
                  <p className="font-medium">Your Current Setup:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                    <li>Use tables for content lists with filters and bulk actions</li>
                    <li>List view for blog posts with thumbnails and metadata</li>
                    <li>Grid view for media library and content collections</li>
                    <li>Detail view for content editing with sidebar activity</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Complex Interactions Tab */}
          <TabsContent value="interactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Complex Interaction Patterns</CardTitle>
                <CardDescription>
                  Advanced UI patterns for modal workflows, drag & drop, inline editing, and bulk operations.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <ComplexInteractions />
            
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">Implementation Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Interaction Pattern Guidelines</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                    <li>Modal workflows: Use for focused tasks requiring user attention</li>
                    <li>Drag & drop: Install @dnd-kit/core and @dnd-kit/sortable packages</li>
                    <li>Inline editing: Provide clear visual feedback for editable states</li>
                    <li>Bulk actions: Always show selection count and confirm destructive actions</li>
                  </ul>
                </div>
                <div className="space-y-1 pt-2">
                  <p className="font-medium">Your Current Setup:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                    <li>Multi-step wizards for content creation workflows</li>
                    <li>Drag & drop for content ordering and organization</li>
                    <li>Inline editing for quick content updates</li>
                    <li>Bulk publish/unpublish/delete operations</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dashboard & Analytics Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dashboard & Analytics Patterns</CardTitle>
                <CardDescription>
                  KPI metrics, charts, activity feeds, and performance tracking for CMS dashboards.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <DashboardPatterns />
            
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">Implementation Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Dashboard Implementation</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                    <li>Charts: Use Recharts library (already in dependencies) for responsive visualizations</li>
                    <li>Real-time updates: Integrate with Socket.IO for live activity feed</li>
                    <li>Data fetching: Use React Query for caching and background updates</li>
                    <li>Performance: Lazy load chart components, debounce filter updates</li>
                  </ul>
                </div>
                <div className="space-y-1 pt-2">
                  <p className="font-medium">Your Current Setup:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                    <li>Analytics dashboard showing content performance and user engagement</li>
                    <li>Team activity feed with real-time collaboration updates</li>
                    <li>Editorial calendar with publication goals and progress</li>
                    <li>Content metrics: views, engagement time, conversion tracking</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Search & Filtering Tab */}
          <TabsContent value="search" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Search & Filtering Patterns</CardTitle>
                <CardDescription>
                  Command palette, advanced filters, filter presets, and search results for content discovery.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <SearchFiltering />
            
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">Implementation Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Search & Filter Implementation</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                    <li>Command palette: Use cmdk package with ⌘K keyboard shortcut listener</li>
                    <li>Search: Implement debounced search with backend API, highlight matches in results</li>
                    <li>Filters: Build filter query object, update URL params for shareable filtered views</li>
                    <li>Presets: Store in localStorage or user preferences table in database</li>
                  </ul>
                </div>
                <div className="space-y-1 pt-2">
                  <p className="font-medium">Your Current Setup:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                    <li>Global search across content, users, and settings</li>
                    <li>Filter by status, category, author, tags, and date range</li>
                    <li>Save filter presets for quick access to common views</li>
                    <li>Grouped search results by content type with highlighted matches</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Media Management Tab */}
          <TabsContent value="media" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Media Management Patterns</CardTitle>
                <CardDescription>
                  File uploads, media library, preview modals, folder organization, and tagging system.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <MediaManagement />
            
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">Implementation Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Media Management Implementation</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                    <li>Upload: Use FileReader API or libraries like react-dropzone for drag & drop</li>
                    <li>Storage: Integrate with Supabase Storage or S3 for file hosting</li>
                    <li>Thumbnails: Generate on upload using sharp or serverless functions</li>
                    <li>Search: Index file metadata (name, tags, type) for fast filtering</li>
                  </ul>
                </div>
                <div className="space-y-1 pt-2">
                  <p className="font-medium">Your Current Setup:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                    <li>Media library with drag & drop upload and progress tracking</li>
                    <li>Grid/list view toggle with bulk selection and operations</li>
                    <li>Folder organization and tag-based filtering</li>
                    <li>Preview modal with metadata editing and navigation</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Permissions & Access Control Tab */}
          <TabsContent value="permissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Permissions & Access Control Patterns</CardTitle>
                <CardDescription>
                  Role indicators, permission matrices, user management, and access control interfaces.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <PermissionsAccess />
            
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">Implementation Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Permissions Implementation</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                    <li>Roles: Create user_roles table with enum (admin, editor, viewer)</li>
                    <li>Permissions: Use RLS policies to enforce database-level access control</li>
                    <li>UI: Check user role in components, conditionally render based on permissions</li>
                    <li>Sharing: Implement content-level permissions with share links</li>
                  </ul>
                </div>
                <div className="space-y-1 pt-2">
                  <p className="font-medium">Your Current Setup:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                    <li>Role-based access control with admin, editor, and viewer roles</li>
                    <li>Permission matrix showing capabilities for each role</li>
                    <li>User management interface with role assignment</li>
                    <li>Content sharing with granular access controls</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Version History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Version Control & History Patterns</CardTitle>
                <CardDescription>
                  Timeline views, diff viewers, restore interfaces, change indicators, and author attribution.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <VersionHistory />
            
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">Implementation Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Version History Implementation</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                    <li>Storage: Create versions table with snapshots, metadata, and author info</li>
                    <li>Diff: Use diff-match-patch or similar libraries for change detection</li>
                    <li>Restore: Create new version on restore, notify collaborators of changes</li>
                    <li>Real-time: Track changes as they happen, show live indicators</li>
                  </ul>
                </div>
                <div className="space-y-1 pt-2">
                  <p className="font-medium">Your Current Setup:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                    <li>Timeline view showing all changes with author attribution</li>
                    <li>Side-by-side and inline diff viewers for version comparison</li>
                    <li>Version restore with preview and confirmation</li>
                    <li>Visual change indicators and contributor statistics</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Design System Tab */}
          <TabsContent value="design" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Design System Tokens</CardTitle>
                <CardDescription>
                  These semantic color tokens ensure consistency across your application.
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Primary Colors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-primary" />
                    <div className="text-sm">
                      <p className="font-medium">Primary</p>
                      <p className="text-muted-foreground">Main brand color</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-secondary" />
                    <div className="text-sm">
                      <p className="font-medium">Secondary</p>
                      <p className="text-muted-foreground">Supporting color</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Status Colors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-success" />
                    <div className="text-sm">
                      <p className="font-medium">Success</p>
                      <p className="text-muted-foreground">Positive actions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-destructive" />
                    <div className="text-sm">
                      <p className="font-medium">Destructive</p>
                      <p className="text-muted-foreground">Errors, danger</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Feedback Colors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-warning" />
                    <div className="text-sm">
                      <p className="font-medium">Warning</p>
                      <p className="text-muted-foreground">Caution states</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-info" />
                    <div className="text-sm">
                      <p className="font-medium">Info</p>
                      <p className="text-muted-foreground">Informational</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">Your Next.js Implementation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="space-y-2">
                  <p className="font-medium">Color System Updates Needed:</p>
                  <div className="bg-background rounded-md p-4 font-mono text-xs space-y-1">
                    {/* Add to your globals.css or tailwind config: */}
                    <p>--success: 142 76% 36%;</p>
                    <p>--success-foreground: 210 40% 98%;</p>
                    <p>--warning: 38 92% 50%;</p>
                    <p>--info: 199 89% 48%;</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="font-medium">Apply Consistently:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                    <li>Update your existing UI components to use these tokens</li>
                    <li>Replace hardcoded colors (green-500, red-600) with semantic tokens</li>
                    <li>Ensure dark mode variations are defined</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onboarding & Tutorials Tab */}
          <TabsContent value="onboarding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Onboarding & Tutorial Patterns</CardTitle>
                <CardDescription>
                  Welcome flows, checklists, product tours, and contextual help for user guidance.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <OnboardingTutorials />
          </TabsContent>

          {/* Empty States & Error Handling Tab */}
          <TabsContent value="empty-states" className="space-y-6">
            <EmptyStates />
          </TabsContent>

          {/* Modal & Dialog Patterns Tab */}
          <TabsContent value="modals" className="space-y-6">
            <ModalDialogPatterns />
          </TabsContent>

          {/* Advanced Table Features Tab */}
          <TabsContent value="tables" className="space-y-6">
            <AdvancedTablePatterns />
          </TabsContent>

          {/* Animation & Transitions Tab */}
          <TabsContent value="animations" className="space-y-6">
            <AnimationTransitions />
          </TabsContent>

          {/* Date & Time Pickers Tab */}
          <TabsContent value="datetime" className="space-y-6">
            <DateTimePickers />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
