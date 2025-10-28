import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/lovable/card";
import { Button } from "@/components/ui/lovable/button";
import { useToast } from "@/hooks/use-toast-lovable";
import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react";

export const NotificationPatterns = () => {
  const { toast } = useToast();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Toast Notification Patterns</CardTitle>
        <CardDescription>Consistent feedback for user actions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          onClick={() => {
            toast({
              title: "Content published",
              description: "Your content is now live and visible to all users.",
              variant: "default",
            });
          }}
          className="w-full"
          variant="outline"
        >
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Show Success Toast
        </Button>

        <Button
          onClick={() => {
            toast({
              title: "Failed to save",
              description: "There was a problem saving your changes. Please try again.",
              variant: "destructive",
            });
          }}
          className="w-full"
          variant="outline"
        >
          <XCircle className="mr-2 h-4 w-4" />
          Show Error Toast
        </Button>

        <Button
          onClick={() => {
            toast({
              title: "Heads up!",
              description: "You have unsaved changes that will be lost if you leave.",
              variant: "default",
            });
          }}
          className="w-full"
          variant="outline"
        >
          <AlertCircle className="mr-2 h-4 w-4" />
          Show Warning Toast
        </Button>

        <Button
          onClick={() => {
            toast({
              title: "Did you know?",
              description: "You can use keyboard shortcuts to speed up your workflow.",
              variant: "default",
            });
          }}
          className="w-full"
          variant="outline"
        >
          <Info className="mr-2 h-4 w-4" />
          Show Info Toast
        </Button>
      </CardContent>
    </Card>
  );
};
