import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/lovable/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/lovable/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/lovable/tabs";
import { Home, FileText, Folder, ChevronRight, Search, Bell, Settings, User } from "lucide-react";
import { Badge } from "@/components/ui/lovable/badge";
import { Input } from "@/components/ui/lovable/input";

export const NavigationPatterns = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Navigation Patterns</CardTitle>
          <CardDescription>
            Navigation components and patterns for Content Lab
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Top Navigation Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Navigation Bar</CardTitle>
          <CardDescription>
            Main application header with actions and user menu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden bg-card">
            <div className="h-16 px-6 flex items-center justify-between border-b">
              {/* Left: Logo & Search */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded bg-primary" />
                  <span className="font-bold text-lg">Content Lab</span>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search content..."
                    className="pl-9 h-9"
                  />
                </div>
              </div>

              {/* Right: Actions & User */}
              <div className="flex items-center gap-3">
                <button className="relative p-2 hover:bg-muted rounded-md">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
                </button>
                <button className="p-2 hover:bg-muted rounded-md">
                  <Settings className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-2 pl-3 border-l">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">John Doe</p>
                    <p className="text-xs text-muted-foreground">Editor</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Breadcrumbs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Breadcrumb Navigation</CardTitle>
          <CardDescription>
            Show hierarchical location within the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg bg-muted/30">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/" className="flex items-center gap-1">
                    <Home className="h-4 w-4" />
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/content">Content</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/content/articles">Articles</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Getting Started Guide</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="p-4 border rounded-lg bg-muted/30">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/" className="flex items-center gap-1">
                    <Folder className="h-4 w-4" />
                    Projects
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/projects/2024">2024</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Q4 Campaign</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tab Navigation</CardTitle>
          <CardDescription>
            Section-level navigation within a page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Tabs defaultValue="overview" className="w-full">
              <div className="border-b bg-muted/30">
                <TabsList className="h-12 w-full justify-start rounded-none bg-transparent p-0">
                  <TabsTrigger
                    value="overview"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="content"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    Content
                    <Badge variant="secondary" className="ml-2">
                      12
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger
                    value="comments"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    Comments
                    <Badge variant="destructive" className="ml-2">
                      3
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger
                    value="settings"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    Settings
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="overview" className="p-6 bg-background">
                <div className="space-y-3">
                  <div className="h-16 rounded-lg bg-muted/50" />
                  <div className="h-32 rounded-lg bg-muted/50" />
                </div>
              </TabsContent>
              <TabsContent value="content" className="p-6 bg-background">
                <div className="text-sm text-muted-foreground">Content view...</div>
              </TabsContent>
              <TabsContent value="comments" className="p-6 bg-background">
                <div className="text-sm text-muted-foreground">Comments view...</div>
              </TabsContent>
              <TabsContent value="settings" className="p-6 bg-background">
                <div className="text-sm text-muted-foreground">Settings view...</div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Vertical Navigation Menu */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vertical Menu</CardTitle>
          <CardDescription>
            Sidebar navigation with sections and counters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 bg-muted/30 max-w-xs">
            <nav className="space-y-1">
              <div className="text-xs font-semibold text-muted-foreground px-3 py-2">
                CONTENT
              </div>
              <button
                type="button"
                className="flex items-center justify-between px-3 py-2 rounded-md bg-primary/10 text-primary w-full text-left"
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="h-4 w-4" />
                  All Content
                </span>
                <Badge variant="secondary">24</Badge>
              </button>
              <button
                type="button"
                className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-muted text-sm w-full text-left"
              >
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Drafts
                </span>
                <Badge variant="outline">8</Badge>
              </button>
              <button
                type="button"
                className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-muted text-sm w-full text-left"
              >
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  In Review
                </span>
                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                  5
                </Badge>
              </button>
              <button
                type="button"
                className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-muted text-sm w-full text-left"
              >
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Published
                </span>
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  11
                </Badge>
              </button>

              <div className="text-xs font-semibold text-muted-foreground px-3 py-2 mt-4">
                ORGANIZATION
              </div>
              <button
                type="button"
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted text-sm w-full text-left"
              >
                <Folder className="h-4 w-4" />
                Categories
              </button>
              <button
                type="button"
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted text-sm w-full text-left"
              >
                <Folder className="h-4 w-4" />
                Tags
              </button>
            </nav>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
