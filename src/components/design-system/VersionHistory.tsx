"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/lovable/card";
import { Badge } from "@/components/ui/lovable/badge";
import { Button } from "@/components/ui/lovable/button";
import { Avatar, AvatarFallback } from "@/components/ui/lovable/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/lovable/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/lovable/tabs";
import { ScrollArea } from "@/components/ui/lovable/scroll-area";
import { History, RotateCcw, GitCommit, User, Clock, FileText, Edit, Trash2, Plus, AlertCircle, Eye, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/lovable/alert";

export const VersionHistory = () => {
  const [compareMode, setCompareMode] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);

  const versions = [
    {
      id: 5,
      author: "John Doe",
      action: "Updated content",
      timestamp: "2 minutes ago",
      changes: { added: 12, removed: 5, modified: 3 },
      content: "This is the latest version of the content with recent updates and improvements."
    },
    {
      id: 4,
      author: "Jane Smith",
      action: "Fixed typos",
      timestamp: "1 hour ago",
      changes: { added: 0, removed: 0, modified: 8 },
      content: "This is version 4 with some typo fixes and minor adjustments."
    },
    {
      id: 3,
      author: "John Doe",
      action: "Added new section",
      timestamp: "3 hours ago",
      changes: { added: 45, removed: 0, modified: 2 },
      content: "This is version 3 with a completely new section added."
    },
    {
      id: 2,
      author: "Bob Johnson",
      action: "Updated images",
      timestamp: "Yesterday",
      changes: { added: 2, removed: 1, modified: 0 },
      content: "This is version 2 with updated imagery."
    },
    {
      id: 1,
      author: "Jane Smith",
      action: "Initial draft",
      timestamp: "2 days ago",
      changes: { added: 234, removed: 0, modified: 0 },
      content: "This is the initial draft version of the content."
    },
  ];

  return (
    <div className="space-y-8">
      {/* Timeline View */}
      <Card>
        <CardHeader>
          <CardTitle>Version Timeline</CardTitle>
          <CardDescription>
            Chronological history of all changes with author attribution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />
            
            <div className="space-y-6">
              {versions.map((version, i) => (
                <div key={version.id} className="relative flex gap-4 group">
                  {/* Timeline Dot */}
                  <div className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-4 border-background ${
                    i === 0 ? 'bg-primary' : 'bg-muted'
                  }`}>
                    {i === 0 ? (
                      <History className="h-6 w-6 text-primary-foreground" />
                    ) : (
                      <GitCommit className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>

                  {/* Version Card */}
                  <div className="flex-1 -mt-2">
                    <Card className={`${i === 0 ? 'border-primary' : ''}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <CardTitle className="text-base">{version.action}</CardTitle>
                              {i === 0 && <Badge variant="default">Current</Badge>}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {version.author}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {version.timestamp}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {i !== 0 && (
                              <Button variant="ghost" size="sm">
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex gap-4 text-xs">
                          <div className="flex items-center gap-1 text-success">
                            <Plus className="h-3 w-3" />
                            <span>{version.changes.added} added</span>
                          </div>
                          <div className="flex items-center gap-1 text-destructive">
                            <Trash2 className="h-3 w-3" />
                            <span>{version.changes.removed} removed</span>
                          </div>
                          <div className="flex items-center gap-1 text-warning">
                            <Edit className="h-3 w-3" />
                            <span>{version.changes.modified} modified</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-6">
            Implementation: Store version snapshots with metadata, display in reverse chronological order, show change statistics
          </p>
        </CardContent>
      </Card>

      {/* Diff Viewer */}
      <Card>
        <CardHeader>
          <CardTitle>Diff Viewer</CardTitle>
          <CardDescription>
            Compare versions side-by-side or inline with highlighted changes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Comparison Controls */}
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2">
              <Badge variant="outline">Version 4</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge variant="default">Version 5 (Current)</Badge>
            </div>
            <Tabs value={compareMode ? "side" : "inline"} onValueChange={(v) => setCompareMode(v === "side")} className="w-auto">
              <TabsList>
                <TabsTrigger value="inline">Inline</TabsTrigger>
                <TabsTrigger value="side">Side-by-side</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Inline Diff View */}
          {!compareMode && (
            <div className="border rounded-lg">
              <div className="border-b bg-muted/50 px-4 py-2">
                <span className="text-sm font-medium">Changes</span>
              </div>
              <ScrollArea className="h-[300px]">
                <div className="p-4 font-mono text-sm space-y-1">
                  <div className="text-muted-foreground">Line 1: This is the content that stayed the same</div>
                  <div className="bg-destructive/10 text-destructive px-2 py-0.5">
                    - Line 2: This line was <span className="bg-destructive/20">removed</span>
                  </div>
                  <div className="bg-success/10 text-success px-2 py-0.5">
                    + Line 2: This line was <span className="bg-success/20">added</span>
                  </div>
                  <div className="text-muted-foreground">Line 3: More unchanged content</div>
                  <div className="bg-destructive/10 text-destructive px-2 py-0.5">
                    - Line 4: Old version of this text
                  </div>
                  <div className="bg-success/10 text-success px-2 py-0.5">
                    + Line 4: New version of this text with improvements
                  </div>
                  <div className="text-muted-foreground">Line 5: Final unchanged line</div>
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Side-by-side Diff View */}
          {compareMode && (
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg">
                <div className="border-b bg-muted/50 px-4 py-2">
                  <span className="text-sm font-medium">Version 4 (Previous)</span>
                </div>
                <ScrollArea className="h-[300px]">
                  <div className="p-4 font-mono text-sm space-y-1">
                    <div>Line 1: Same content</div>
                    <div className="bg-destructive/10">Line 2: Old text here</div>
                    <div>Line 3: More content</div>
                    <div className="bg-destructive/10">Line 4: Original version</div>
                    <div>Line 5: Final line</div>
                  </div>
                </ScrollArea>
              </div>
              <div className="border rounded-lg">
                <div className="border-b bg-muted/50 px-4 py-2">
                  <span className="text-sm font-medium">Version 5 (Current)</span>
                </div>
                <ScrollArea className="h-[300px]">
                  <div className="p-4 font-mono text-sm space-y-1">
                    <div>Line 1: Same content</div>
                    <div className="bg-success/10">Line 2: New text here</div>
                    <div>Line 3: More content</div>
                    <div className="bg-success/10">Line 4: Updated version with changes</div>
                    <div>Line 5: Final line</div>
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Implementation: Use diff algorithms (e.g., diff-match-patch), highlight additions in green, deletions in red, toggle view modes
          </p>
        </CardContent>
      </Card>

      {/* Restore Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Version Restore</CardTitle>
          <CardDescription>
            Preview and restore previous versions with confirmation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <RotateCcw className="mr-2 h-4 w-4" />
                Restore Version Example
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Restore Version #3</DialogTitle>
                <DialogDescription>
                  Review the changes before restoring this version
                </DialogDescription>
              </DialogHeader>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This will replace the current version. The current version will be saved in history.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Version:</span>
                    <span className="ml-2 font-medium">#3</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Author:</span>
                    <span className="ml-2 font-medium">John Doe</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Created:</span>
                    <span className="ml-2 font-medium">3 hours ago</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Changes:</span>
                    <span className="ml-2 font-medium">+45 / -0 / ~2</span>
                  </div>
                </div>

                <div className="border rounded-lg">
                  <div className="border-b bg-muted/50 px-4 py-2">
                    <span className="text-sm font-medium">Preview</span>
                  </div>
                  <ScrollArea className="h-[200px]">
                    <div className="p-4 text-sm">
                      <p>This is version 3 with a completely new section added.</p>
                      <p className="mt-2">Preview of the content that will be restored...</p>
                    </div>
                  </ScrollArea>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setRestoreDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setRestoreDialogOpen(false)}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Restore This Version
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <p className="text-xs text-muted-foreground mt-4">
            Implementation: Show version preview, confirm before restoring, create new version entry on restore, notify affected users
          </p>
        </CardContent>
      </Card>

      {/* Change Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Change Indicators</CardTitle>
          <CardDescription>
            Visual markers for modified, added, and deleted content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="text-sm font-medium mb-3">Content with Change Markers</h4>
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-2">
                <div className="h-full w-1 bg-success rounded-full" />
                <div className="flex-1">
                  <p className="text-sm">
                    This paragraph was recently added to the document.
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      <Plus className="h-2 w-2 mr-1" />
                      Added
                    </Badge>
                    <span className="text-xs text-muted-foreground">by John Doe • 2 minutes ago</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="h-full w-1 bg-warning rounded-full" />
                <div className="flex-1">
                  <p className="text-sm">
                    This paragraph was modified with updates and improvements.
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      <Edit className="h-2 w-2 mr-1" />
                      Modified
                    </Badge>
                    <span className="text-xs text-muted-foreground">by Jane Smith • 1 hour ago</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 opacity-50">
                <div className="h-full w-1 bg-destructive rounded-full" />
                <div className="flex-1">
                  <p className="text-sm line-through">
                    This paragraph was removed from the document.
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      <Trash2 className="h-2 w-2 mr-1" />
                      Deleted
                    </Badge>
                    <span className="text-xs text-muted-foreground">by Bob Johnson • 3 hours ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-3">Document Overview with Changes</h4>
            <div className="border rounded-lg">
              <div className="flex items-center justify-between p-3 border-b">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Getting Started Guide</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1 text-success">
                    <div className="h-2 w-2 rounded-full bg-success" />
                    12 additions
                  </div>
                  <div className="flex items-center gap-1 text-destructive">
                    <div className="h-2 w-2 rounded-full bg-destructive" />
                    5 deletions
                  </div>
                  <div className="flex items-center gap-1 text-warning">
                    <div className="h-2 w-2 rounded-full bg-warning" />
                    3 modifications
                  </div>
                </div>
              </div>
              <div className="p-4 text-sm text-muted-foreground">
                Last edited 2 minutes ago by John Doe
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Implementation: Track changes in real-time, use colored borders for change types, show author and timestamp tooltips
          </p>
        </CardContent>
      </Card>

      {/* Author Attribution */}
      <Card>
        <CardHeader>
          <CardTitle>Author Attribution</CardTitle>
          <CardDescription>
            Track who made what changes and when
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="text-sm font-medium mb-3">Contributors List</h4>
            <div className="space-y-2">
              {[
                { name: "John Doe", edits: 24, lastEdit: "2 minutes ago", additions: 156, deletions: 42 },
                { name: "Jane Smith", edits: 18, lastEdit: "1 hour ago", additions: 98, deletions: 23 },
                { name: "Bob Johnson", edits: 12, lastEdit: "Yesterday", additions: 67, deletions: 15 },
              ].map((contributor, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Avatar>
                    <AvatarFallback>{contributor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{contributor.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {contributor.edits} edits • Last: {contributor.lastEdit}
                    </p>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="text-success">+{contributor.additions}</span>
                    <span className="text-destructive">-{contributor.deletions}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-3">Activity by Author</h4>
            <div className="space-y-3">
              {[
                { author: "John Doe", action: "Updated section 3", time: "2 minutes ago", type: "edit" },
                { author: "Jane Smith", action: "Fixed formatting", time: "1 hour ago", type: "edit" },
                { author: "John Doe", action: "Added new images", time: "3 hours ago", type: "add" },
                { author: "Bob Johnson", action: "Removed outdated info", time: "Yesterday", type: "delete" },
              ].map((activity, i) => (
                <div key={i} className="flex items-start gap-3 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {activity.author.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.author}</span>
                      {' '}{activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.type === 'add' && <Plus className="h-2 w-2 mr-1" />}
                    {activity.type === 'edit' && <Edit className="h-2 w-2 mr-1" />}
                    {activity.type === 'delete' && <Trash2 className="h-2 w-2 mr-1" />}
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Implementation: Store author ID with each change, aggregate statistics per author, display in activity feeds
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
