import { Button } from "@/components/ui/lovable/button";
import { Card } from "@/components/ui/lovable/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/lovable/alert";
import { Badge } from "@/components/ui/lovable/badge";
import {
  FileX,
  Search,
  Package,
  Users,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  RefreshCcw,
  Home,
  Plus,
  Upload,
  FolderOpen,
  Mail,
  Inbox,
  WifiOff,
  Database,
  ShieldAlert,
} from "lucide-react";

const EmptyStates = () => {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Empty States & Error Handling</h2>
        <p className="text-muted-foreground">
          Comprehensive patterns for empty states, error messages, and user feedback
        </p>
      </div>

      {/* Empty State Variations */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Empty State Patterns</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* No Results Empty State */}
          <Card className="p-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              We couldn't find any items matching your search. Try adjusting your filters or search terms.
            </p>
            <div className="flex gap-2">
              <Button variant="outline">Clear Filters</Button>
              <Button>Browse All</Button>
            </div>
          </Card>

          {/* No Content Yet */}
          <Card className="p-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No items yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Get started by creating your first item. It only takes a few seconds.
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create First Item
            </Button>
          </Card>

          {/* Empty Inbox */}
          <Card className="p-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Inbox className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">All caught up!</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              You're all done. No new messages in your inbox.
            </p>
            <Button variant="outline">
              <RefreshCcw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </Card>

          {/* No Files Uploaded */}
          <Card className="p-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <FolderOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No files uploaded</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Upload your first file to get started with organization and collaboration.
            </p>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
            </Button>
          </Card>
        </div>
      </section>

      {/* Error Messages */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Error Messages</h3>
        
        <div className="space-y-4">
          {/* Critical Error */}
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Critical Error</AlertTitle>
            <AlertDescription>
              Failed to save your changes. Please try again or contact support if the problem persists.
            </AlertDescription>
          </Alert>

          {/* Warning */}
          <Alert className="border-yellow-500/50 text-yellow-600 dark:text-yellow-500">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              Your session will expire in 5 minutes. Please save your work to avoid losing changes.
            </AlertDescription>
          </Alert>

          {/* Info */}
          <Alert className="border-blue-500/50 text-blue-600 dark:text-blue-500">
            <Info className="h-4 w-4" />
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>
              Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM EST. Service may be temporarily unavailable.
            </AlertDescription>
          </Alert>

          {/* Success */}
          <Alert className="border-green-500/50 text-green-600 dark:text-green-500">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              Your changes have been saved successfully and are now live.
            </AlertDescription>
          </Alert>
        </div>
      </section>

      {/* Error State Pages */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Full Page Error States</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* 404 Error */}
          <Card className="p-12 flex flex-col items-center text-center">
            <div className="text-6xl font-bold text-muted-foreground mb-2">404</div>
            <h3 className="text-xl font-semibold mb-2">Page not found</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              The page you're looking for doesn't exist or has been moved.
            </p>
            <Button>
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Card>

          {/* Network Error */}
          <Card className="p-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <WifiOff className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Connection lost</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Unable to connect to the server. Please check your internet connection.
            </p>
            <Button variant="outline">
              <RefreshCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </Card>

          {/* Server Error */}
          <Card className="p-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <Database className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Something went wrong</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              We're experiencing technical difficulties. Our team has been notified and is working on a fix.
            </p>
            <div className="flex gap-2">
              <Button variant="outline">Contact Support</Button>
              <Button>
                <RefreshCcw className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
            </div>
          </Card>

          {/* Access Denied */}
          <Card className="p-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <ShieldAlert className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Access denied</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              You don't have permission to view this content. Contact an administrator for access.
            </p>
            <Button variant="outline">Request Access</Button>
          </Card>
        </div>
      </section>

      {/* Inline Error States */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Inline Error States</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Form Error */}
          <Card className="p-6">
            <h4 className="font-semibold mb-4">User Registration</h4>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-destructive rounded-md focus:outline-none focus:ring-2 focus:ring-destructive"
                  placeholder="email@example.com"
                  value="invalid-email"
                />
                <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Please enter a valid email address
                </p>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-destructive rounded-md focus:outline-none focus:ring-2 focus:ring-destructive"
                  placeholder="Enter password"
                  value="123"
                />
                <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Password must be at least 8 characters
                </p>
              </div>
              <Button disabled className="w-full">Submit</Button>
            </div>
          </Card>

          {/* Card Error State */}
          <Card className="p-6 border-destructive/50">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Payment Failed</h4>
                <p className="text-sm text-muted-foreground">
                  Your payment could not be processed. Please verify your payment details and try again.
                </p>
              </div>
            </div>
            <div className="bg-muted p-3 rounded-md text-sm mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-muted-foreground">Error Code:</span>
                <span className="font-mono">PAYMENT_001</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction ID:</span>
                <span className="font-mono">txn_1234567890</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Contact Support</Button>
              <Button size="sm">Update Payment Method</Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Loading Error States */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Failed Loading States</h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          {/* Failed to Load Image */}
          <Card className="p-6">
            <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-3">
              <div className="text-center">
                <FileX className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Failed to load image</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              <RefreshCcw className="w-3 h-3 mr-2" />
              Retry
            </Button>
          </Card>

          {/* Failed to Load Data */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">Failed to load data</p>
                <p className="text-sm text-muted-foreground">Network error occurred</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              <RefreshCcw className="w-3 h-3 mr-2" />
              Try Again
            </Button>
          </Card>

          {/* Failed to Load Users */}
          <Card className="p-6">
            <div className="space-y-3 mb-4">
              <div className="h-4 bg-muted rounded animate-pulse opacity-50" />
              <div className="h-4 bg-muted rounded animate-pulse opacity-50" />
              <div className="h-4 bg-muted rounded animate-pulse opacity-50" />
            </div>
            <Alert variant="destructive" className="mb-3">
              <AlertCircle className="h-3 w-3" />
              <AlertDescription className="text-xs">
                Unable to fetch users
              </AlertDescription>
            </Alert>
            <Button variant="outline" size="sm" className="w-full">
              Retry
            </Button>
          </Card>
        </div>
      </section>

      {/* Implementation Notes */}
      <Card className="p-6 bg-muted/50">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Info className="w-4 h-4" />
          Implementation Notes
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Empty states should be friendly and action-oriented with clear next steps</li>
          <li>• Use appropriate icons and visual hierarchy to communicate state clearly</li>
          <li>• Error messages should be specific and provide actionable solutions</li>
          <li>• Include error codes for technical issues to help with debugging</li>
          <li>• Provide retry mechanisms for recoverable errors</li>
          <li>• Use consistent color coding: red for errors, yellow for warnings, blue for info</li>
          <li>• Consider adding illustrations for major empty states to improve UX</li>
          <li>• Always provide a way for users to get help or go back to safety</li>
        </ul>
      </Card>
    </div>
  );
};

export default EmptyStates;
