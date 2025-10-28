"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/lovable/card";
import { Badge } from "@/components/ui/lovable/badge";
import { Button } from "@/components/ui/lovable/button";
import { Input } from "@/components/ui/lovable/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/lovable/select";
import { Switch } from "@/components/ui/lovable/switch";
import { Label } from "@/components/ui/lovable/label";
import { Avatar, AvatarFallback } from "@/components/ui/lovable/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/lovable/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/lovable/table";
import { Shield, Crown, Edit, Eye, UserPlus, Mail, MoreVertical, Check, X, Users, Lock, Globe, Link2 } from "lucide-react";
import { useState } from "react";

export const PermissionsAccess = () => {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  return (
    <div className="space-y-8">
      {/* Role Badges & Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Role Indicators</CardTitle>
          <CardDescription>
            Visual indicators showing user roles and permissions levels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="text-sm font-medium mb-3">Role Badges</h4>
            <div className="flex flex-wrap gap-3">
              <Badge variant="default" className="gap-1.5">
                <Crown className="h-3 w-3" />
                Admin
              </Badge>
              <Badge variant="secondary" className="gap-1.5">
                <Edit className="h-3 w-3" />
                Editor
              </Badge>
              <Badge variant="outline" className="gap-1.5">
                <Eye className="h-3 w-3" />
                Viewer
              </Badge>
              <Badge variant="outline" className="gap-1.5 border-warning text-warning">
                <Shield className="h-3 w-3" />
                Moderator
              </Badge>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-3">User List with Roles</h4>
            <div className="space-y-2">
              {[
                { name: "John Doe", email: "john@example.com", role: "Admin", icon: Crown, variant: "default" as const },
                { name: "Jane Smith", email: "jane@example.com", role: "Editor", icon: Edit, variant: "secondary" as const },
                { name: "Bob Johnson", email: "bob@example.com", role: "Viewer", icon: Eye, variant: "outline" as const },
              ].map((user, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Avatar>
                    <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <Badge variant={user.variant} className="gap-1.5">
                    <user.icon className="h-3 w-3" />
                    {user.role}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Implementation: Use distinct colors and icons for each role, display inline with user info, ensure accessibility with proper contrast
          </p>
        </CardContent>
      </Card>

      {/* Permission Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Matrix</CardTitle>
          <CardDescription>
            Visual grid showing what each role can do
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Action</TableHead>
                  <TableHead className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Crown className="h-4 w-4" />
                      Admin
                    </div>
                  </TableHead>
                  <TableHead className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Edit className="h-4 w-4" />
                      Editor
                    </div>
                  </TableHead>
                  <TableHead className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Eye className="h-4 w-4" />
                      Viewer
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { action: "View content", admin: true, editor: true, viewer: true },
                  { action: "Create content", admin: true, editor: true, viewer: false },
                  { action: "Edit own content", admin: true, editor: true, viewer: false },
                  { action: "Edit all content", admin: true, editor: false, viewer: false },
                  { action: "Delete content", admin: true, editor: false, viewer: false },
                  { action: "Publish content", admin: true, editor: true, viewer: false },
                  { action: "Manage users", admin: true, editor: false, viewer: false },
                  { action: "Change settings", admin: true, editor: false, viewer: false },
                ].map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{row.action}</TableCell>
                    <TableCell className="text-center">
                      {row.admin ? (
                        <Check className="h-4 w-4 mx-auto text-success" />
                      ) : (
                        <X className="h-4 w-4 mx-auto text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {row.editor ? (
                        <Check className="h-4 w-4 mx-auto text-success" />
                      ) : (
                        <X className="h-4 w-4 mx-auto text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {row.viewer ? (
                        <Check className="h-4 w-4 mx-auto text-success" />
                      ) : (
                        <X className="h-4 w-4 mx-auto text-muted-foreground" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            Implementation: Store permissions in database, render table dynamically, use checkmarks for allowed actions
          </p>
        </CardContent>
      </Card>

      {/* User Management Interface */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Assign roles, invite users, and manage team members
              </CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                  <DialogDescription>
                    Send an invitation to join your team
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="invite-email">Email Address</Label>
                    <Input id="invite-email" type="email" placeholder="colleague@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invite-role">Role</Label>
                    <Select defaultValue="editor">
                      <SelectTrigger id="invite-role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invite-message">Personal Message (Optional)</Label>
                    <Input id="invite-message" placeholder="Join our team!" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Invitation
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Active Users */}
            <div>
              <h4 className="text-sm font-medium mb-3">Team Members (8)</h4>
              <div className="space-y-2">
                {[
                  { name: "Sarah Wilson", email: "sarah@example.com", role: "admin", status: "Active" },
                  { name: "Mike Brown", email: "mike@example.com", role: "editor", status: "Active" },
                  { name: "Lisa Chen", email: "lisa@example.com", role: "editor", status: "Invited" },
                  { name: "Tom Davis", email: "tom@example.com", role: "viewer", status: "Active" },
                ].map((user, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Avatar>
                      <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <Badge variant={user.status === "Invited" ? "outline" : "secondary"}>
                      {user.status}
                    </Badge>
                    <Select defaultValue={user.role}>
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            Implementation: Email invitation flow, role dropdown with update handler, status indicators for pending invites
          </p>
        </CardContent>
      </Card>

      {/* Share & Access Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Share & Access Control</CardTitle>
          <CardDescription>
            Manage who can access specific content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Users className="mr-2 h-4 w-4" />
                Manage Access
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Share "Getting Started Guide"</DialogTitle>
                <DialogDescription>
                  Control who can view and edit this content
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* General Access */}
                <div className="space-y-3">
                  <Label>General Access</Label>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Anyone with the link</p>
                      <p className="text-xs text-muted-foreground">Anyone with the link can view</p>
                    </div>
                    <Select defaultValue="view">
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No access</SelectItem>
                        <SelectItem value="view">Can view</SelectItem>
                        <SelectItem value="edit">Can edit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Share Link */}
                <div className="space-y-3">
                  <Label>Share Link</Label>
                  <div className="flex gap-2">
                    <Input 
                      readOnly 
                      value="https://cms.example.com/content/abc123" 
                      className="flex-1"
                    />
                    <Button variant="outline">
                      <Link2 className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                  </div>
                </div>

                {/* People with Access */}
                <div className="space-y-3">
                  <Label>People with Access</Label>
                  <div className="space-y-2">
                    {[
                      { name: "John Doe", email: "john@example.com", role: "Owner", removable: false },
                      { name: "Jane Smith", email: "jane@example.com", role: "Editor", removable: true },
                      { name: "Bob Johnson", email: "bob@example.com", role: "Viewer", removable: true },
                    ].map((person, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {person.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{person.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{person.email}</p>
                        </div>
                        {person.removable ? (
                          <Select defaultValue={person.role.toLowerCase()}>
                            <SelectTrigger className="w-[110px] h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="editor">Editor</SelectItem>
                              <SelectItem value="viewer">Viewer</SelectItem>
                              <SelectItem value="remove">Remove</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant="outline">{person.role}</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add People */}
                <div className="space-y-3">
                  <Label>Add People</Label>
                  <div className="flex gap-2">
                    <Input placeholder="Enter email address" className="flex-1" />
                    <Select defaultValue="viewer">
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="editor">Can edit</SelectItem>
                        <SelectItem value="viewer">Can view</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button>Add</Button>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
                  Done
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <p className="text-xs text-muted-foreground mt-4">
            Implementation: Content-level permissions, shareable links with access levels, add/remove users with role selection
          </p>
        </CardContent>
      </Card>

      {/* Conditional UI Based on Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Permission-Based UI</CardTitle>
          <CardDescription>
            Show/hide features based on user permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="text-sm font-medium mb-3">Admin View</h4>
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Content Settings</span>
                <Badge variant="default" className="gap-1">
                  <Shield className="h-3 w-3" />
                  Admin Only
                </Badge>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">Auto-publish drafts</p>
                  <p className="text-xs text-muted-foreground">Automatically publish content after review</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">Enable versioning</p>
                  <p className="text-xs text-muted-foreground">Track all content changes</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Button variant="destructive" className="w-full">
                <Lock className="mr-2 h-4 w-4" />
                Delete All Content
              </Button>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-3">Editor View</h4>
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Available Actions</span>
                <Badge variant="secondary" className="gap-1">
                  <Edit className="h-3 w-3" />
                  Editor
                </Badge>
              </div>
              <Button variant="outline" className="w-full">
                <Edit className="mr-2 h-4 w-4" />
                Edit Content
              </Button>
              <Button variant="outline" className="w-full">
                Create New Draft
              </Button>
              <div className="border-2 border-dashed rounded-lg p-4 text-center text-sm text-muted-foreground">
                <Lock className="h-5 w-5 mx-auto mb-2" />
                Delete action not available for your role
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-3">Viewer View</h4>
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Available Actions</span>
                <Badge variant="outline" className="gap-1">
                  <Eye className="h-3 w-3" />
                  Viewer
                </Badge>
              </div>
              <Button variant="outline" className="w-full">
                <Eye className="mr-2 h-4 w-4" />
                View Content
              </Button>
              <div className="border-2 border-dashed rounded-lg p-4 text-center text-sm text-muted-foreground">
                <Lock className="h-5 w-5 mx-auto mb-2" />
                Edit and create actions require editor role
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Implementation: Check user role in components, conditionally render UI elements, show permission warnings for restricted actions
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
