import { Button } from "@/components/ui/lovable/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/lovable/card";
import { 
  CheckCircle2, XCircle, Send, Save, Trash2, Edit, Eye, 
  Download, Upload, Share2, Copy, RefreshCw, Plus, 
  Settings, Archive, Clock, AlertCircle, FileText
} from "lucide-react";

export const ActionButtons = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Action Button Patterns</CardTitle>
        <CardDescription>Complete set of action buttons for all workflows</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Primary Actions */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Primary Actions</h3>
          <div className="flex flex-wrap gap-2">
            <Button>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Approve
            </Button>
            <Button>
              <Send className="mr-2 h-4 w-4" />
              Submit
            </Button>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
            <Button>
              <Send className="mr-2 h-4 w-4" />
              Publish
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create
            </Button>
          </div>
        </div>

        {/* Destructive Actions */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Destructive Actions</h3>
          <div className="flex flex-wrap gap-2">
            <Button variant="destructive">
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
            <Button variant="destructive">
              <XCircle className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button variant="destructive">
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </Button>
          </div>
        </div>

        {/* Secondary Actions */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Secondary Actions</h3>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="secondary">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button variant="secondary">
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
            <Button variant="secondary">
              <Clock className="mr-2 h-4 w-4" />
              Schedule
            </Button>
          </div>
        </div>

        {/* Outline Actions */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Outline Actions</h3>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
            <Button variant="outline">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button variant="outline">
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </Button>
            <Button variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>

        {/* Review Workflow Actions */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Review Workflow</h3>
          <div className="flex flex-wrap gap-2">
            <Button>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Approve
            </Button>
            <Button variant="destructive">
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button variant="secondary">
              <AlertCircle className="mr-2 h-4 w-4" />
              Request Changes
            </Button>
            <Button variant="outline">
              <Clock className="mr-2 h-4 w-4" />
              Mark Pending
            </Button>
            <Button variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              Review
            </Button>
          </div>
        </div>

        {/* Content Actions */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Content Management</h3>
          <div className="flex flex-wrap gap-2">
            <Button>
              <Send className="mr-2 h-4 w-4" />
              Publish Now
            </Button>
            <Button variant="secondary">
              <Clock className="mr-2 h-4 w-4" />
              Schedule Publish
            </Button>
            <Button variant="outline">
              <XCircle className="mr-2 h-4 w-4" />
              Unpublish
            </Button>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Save as Draft
            </Button>
            <Button variant="outline">
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </Button>
          </div>
        </div>

        {/* Ghost Actions */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Ghost Actions (Minimal)</h3>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="ghost">
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
            <Button variant="ghost">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button variant="ghost">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Button Sizes */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Button Sizes</h3>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm">
              <CheckCircle2 className="mr-2 h-3 w-3" />
              Small
            </Button>
            <Button size="default">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Default
            </Button>
            <Button size="lg">
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Large
            </Button>
          </div>
        </div>

        {/* Icon Only Buttons */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Icon Only Buttons</h3>
          <div className="flex flex-wrap gap-2">
            <Button size="icon" variant="default">
              <Edit className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="secondary">
              <Eye className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="outline">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost">
              <Settings className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Loading States */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Loading States</h3>
          <div className="flex flex-wrap gap-2">
            <Button disabled>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </Button>
            <Button variant="secondary" disabled>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </Button>
            <Button variant="destructive" disabled>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Deleting...
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
