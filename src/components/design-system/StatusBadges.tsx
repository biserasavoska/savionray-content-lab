import { Badge } from "@/components/ui/lovable/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/lovable/card";
import { CheckCircle2, XCircle, Clock, AlertCircle, Eye, Archive, Trash2, FileText, Video, Image, Music, File } from "lucide-react";

export const StatusBadges = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Badge Patterns</CardTitle>
        <CardDescription>Consistent visual language for all workflow states</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Content Workflow Status */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Content Workflow Status</h3>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-success text-success-foreground hover:bg-success/80">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Approved
            </Badge>
            <Badge className="bg-success text-success-foreground hover:bg-success/80">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Published
            </Badge>
            <Badge className="bg-info text-info-foreground hover:bg-info/80">
              <Clock className="mr-1 h-3 w-3" />
              Pending Review
            </Badge>
            <Badge className="bg-warning text-warning-foreground hover:bg-warning/80">
              <AlertCircle className="mr-1 h-3 w-3" />
              Draft
            </Badge>
            <Badge className="bg-warning text-warning-foreground hover:bg-warning/80">
              <Clock className="mr-1 h-3 w-3" />
              In Review
            </Badge>
            <Badge className="bg-destructive text-destructive-foreground hover:bg-destructive/80">
              <XCircle className="mr-1 h-3 w-3" />
              Rejected
            </Badge>
            <Badge className="bg-muted text-muted-foreground hover:bg-muted/80">
              <Archive className="mr-1 h-3 w-3" />
              Archived
            </Badge>
            <Badge className="bg-muted text-muted-foreground hover:bg-muted/80">
              <Trash2 className="mr-1 h-3 w-3" />
              Deleted
            </Badge>
          </div>
        </div>

        {/* Publication Status */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Publication Status</h3>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-success text-success-foreground hover:bg-success/80">
              <Eye className="mr-1 h-3 w-3" />
              Live
            </Badge>
            <Badge className="bg-info text-info-foreground hover:bg-info/80">
              <Clock className="mr-1 h-3 w-3" />
              Scheduled
            </Badge>
            <Badge className="bg-warning text-warning-foreground hover:bg-warning/80">
              <FileText className="mr-1 h-3 w-3" />
              Unpublished
            </Badge>
          </div>
        </div>

        {/* Content Types */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Content Types</h3>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-primary text-primary">
              <FileText className="mr-1 h-3 w-3" />
              Article
            </Badge>
            <Badge variant="outline" className="border-primary text-primary">
              <Video className="mr-1 h-3 w-3" />
              Video
            </Badge>
            <Badge variant="outline" className="border-primary text-primary">
              <Image className="mr-1 h-3 w-3" />
              Image
            </Badge>
            <Badge variant="outline" className="border-primary text-primary">
              <Music className="mr-1 h-3 w-3" />
              Audio
            </Badge>
            <Badge variant="outline" className="border-primary text-primary">
              <File className="mr-1 h-3 w-3" />
              Document
            </Badge>
          </div>
        </div>

        {/* Priority Levels */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Priority Levels</h3>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-destructive text-destructive-foreground hover:bg-destructive/80">
              Urgent
            </Badge>
            <Badge className="bg-warning text-warning-foreground hover:bg-warning/80">
              High
            </Badge>
            <Badge className="bg-info text-info-foreground hover:bg-info/80">
              Medium
            </Badge>
            <Badge className="bg-muted text-muted-foreground hover:bg-muted/80">
              Low
            </Badge>
          </div>
        </div>

        {/* User Roles */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">User Roles</h3>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Admin</Badge>
            <Badge variant="secondary">Editor</Badge>
            <Badge variant="secondary">Writer</Badge>
            <Badge variant="secondary">Viewer</Badge>
            <Badge variant="secondary">Guest</Badge>
          </div>
        </div>

        {/* General States */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">General States</h3>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-success text-success-foreground">Active</Badge>
            <Badge className="bg-muted text-muted-foreground">Inactive</Badge>
            <Badge className="bg-info text-info-foreground">Processing</Badge>
            <Badge className="bg-warning text-warning-foreground">Pending</Badge>
            <Badge className="bg-destructive text-destructive-foreground">Failed</Badge>
            <Badge variant="outline">Completed</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
