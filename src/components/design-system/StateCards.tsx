import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/lovable/card";
import { Skeleton } from "@/components/ui/lovable/skeleton";
import { AlertCircle, CheckCircle2, Info, Loader2, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/lovable/alert";

export const LoadingStateCard = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <CardTitle>Loading State Pattern</CardTitle>
        </div>
        <CardDescription>Skeleton loaders for content that's being fetched</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
  );
};

export const ErrorStateCard = () => {
  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <XCircle className="h-5 w-5 text-destructive" />
          <CardTitle>Error State Pattern</CardTitle>
        </div>
        <CardDescription>Clear error messages with recovery actions</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to load content</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>We couldn't retrieve your content. This might be due to a network issue.</p>
            <button className="text-sm font-medium underline underline-offset-4 hover:no-underline">
              Try again
            </button>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export const SuccessStateCard = () => {
  return (
    <Card className="border-success/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-success" />
          <CardTitle>Success State Pattern</CardTitle>
        </div>
        <CardDescription>Confirmation messages for completed actions</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="border-success bg-success/10">
          <CheckCircle2 className="h-4 w-4 text-success" />
          <AlertTitle className="text-success">Content published successfully</AlertTitle>
          <AlertDescription className="text-success-foreground/80">
            Your content is now live and visible to all users.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export const EmptyStateCard = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-info" />
          <CardTitle>Empty State Pattern</CardTitle>
        </div>
        <CardDescription>Guidance when no content exists yet</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Info className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No content yet</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm">
            Get started by creating your first piece of content. Our AI assistant can help you draft ideas.
          </p>
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-10 px-4 py-2 hover:bg-primary/90">
            Create your first content
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
