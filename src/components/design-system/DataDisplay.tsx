import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/lovable/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/lovable/table";
import { Badge } from "@/components/ui/lovable/badge";
import { Button } from "@/components/ui/lovable/button";
import { Input } from "@/components/ui/lovable/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/lovable/avatar";
import { MoreVertical, Search, Filter, Download, Eye, Edit, Trash2, User } from "lucide-react";

const DataDisplay = () => {
  const sampleData = [
    { id: 1, name: "John Doe", email: "john@example.com", role: "Admin", status: "active", lastActive: "2 hours ago" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Editor", status: "active", lastActive: "1 day ago" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "Viewer", status: "inactive", lastActive: "1 week ago" },
    { id: 4, name: "Alice Williams", email: "alice@example.com", role: "Editor", status: "active", lastActive: "5 mins ago" },
  ];

  return (
    <div className="space-y-8">
      {/* Data Table Pattern */}
      <Card>
        <CardHeader>
          <CardTitle>Data Table</CardTitle>
          <CardDescription>
            Sortable, filterable table with actions. Best for dense data requiring scanning and comparison.
          </CardDescription>
          <div className="flex items-center gap-2 pt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search users..." className="pl-9" />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleData.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://avatar.vercel.sh/${user.email}`} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === "active" ? "default" : "secondary"}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.lastActive}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* List View Pattern */}
      <Card>
        <CardHeader>
          <CardTitle>List View</CardTitle>
          <CardDescription>
            Detailed list items with actions. Ideal for content with preview/description needs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sampleData.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={`https://avatar.vercel.sh/${user.email}`} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{user.name}</h4>
                      <Badge variant={user.status === "active" ? "default" : "secondary"} className="text-xs">
                        {user.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {user.role} • Last active {user.lastActive}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Card Grid Pattern */}
      <Card>
        <CardHeader>
          <CardTitle>Card Grid</CardTitle>
          <CardDescription>
            Visual grid layout. Perfect for content with images or requiring visual hierarchy.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sampleData.map((user) => (
              <Card key={user.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={`https://avatar.vercel.sh/${user.email}`} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardTitle className="text-lg mt-2">{user.name}</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Role</span>
                    <span className="font-medium">{user.role}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={user.status === "active" ? "default" : "secondary"}>
                      {user.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last Active</span>
                    <span className="font-medium">{user.lastActive}</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detail View Pattern */}
      <Card>
        <CardHeader>
          <CardTitle>Detail View</CardTitle>
          <CardDescription>
            Comprehensive single-item view. Use for detailed record inspection and editing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="https://avatar.vercel.sh/john@example.com" />
                    <AvatarFallback><User className="h-8 w-8" /></AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-2xl font-bold">John Doe</h3>
                    <p className="text-muted-foreground">john@example.com</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge>Admin</Badge>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Account Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">User ID</label>
                    <p className="font-medium">#001</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Member Since</label>
                    <p className="font-medium">Jan 15, 2024</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Last Login</label>
                    <p className="font-medium">2 hours ago</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Login Count</label>
                    <p className="font-medium">147 times</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Permissions</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Read</Badge>
                  <Badge variant="outline">Write</Badge>
                  <Badge variant="outline">Delete</Badge>
                  <Badge variant="outline">Admin</Badge>
                </div>
              </div>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Recent Actions</p>
                    <p className="text-xs text-muted-foreground">Updated profile settings</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Login</p>
                    <p className="text-xs text-muted-foreground">From San Francisco, CA</p>
                    <p className="text-xs text-muted-foreground">3 hours ago</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Posts</span>
                    <span className="font-bold">42</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Comments</span>
                    <span className="font-bold">128</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Likes</span>
                    <span className="font-bold">1.2k</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataDisplay;
