import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/lovable/card";
import { Sidebar, Users, FileText, Settings, LayoutDashboard, MessageSquare } from "lucide-react";

export const LayoutPatterns = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Layout Patterns</CardTitle>
          <CardDescription>
            Common layout structures for the Content Lab application
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Sidebar Layout */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sidebar Layout</CardTitle>
          <CardDescription>
            Main navigation with collapsible sidebar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden bg-background">
            <div className="flex h-[400px]">
              {/* Sidebar */}
              <div className="w-56 border-r bg-muted/30 flex flex-col">
                <div className="p-4 border-b bg-card">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded bg-primary" />
                    <span className="font-semibold">Content Lab</span>
                  </div>
                </div>
                <nav className="flex-1 p-3 space-y-1">
                  <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-primary/10 text-primary">
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="text-sm font-medium">Dashboard</span>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">Content</span>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-sm">Comments</span>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">Team</span>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted">
                    <Settings className="h-4 w-4" />
                    <span className="text-sm">Settings</span>
                  </div>
                </nav>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col">
                <header className="h-14 border-b bg-card px-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sidebar className="h-5 w-5 text-muted-foreground" />
                    <h2 className="font-semibold">Dashboard</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/20" />
                  </div>
                </header>
                <main className="flex-1 p-6 bg-muted/20">
                  <div className="space-y-3">
                    <div className="h-20 rounded-lg bg-card border" />
                    <div className="h-32 rounded-lg bg-card border" />
                    <div className="h-24 rounded-lg bg-card border" />
                  </div>
                </main>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Split View Layout */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Split View Layout</CardTitle>
          <CardDescription>
            List/Detail pattern for content management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden bg-background">
            <div className="flex h-[400px]">
              {/* List Panel */}
              <div className="w-80 border-r flex flex-col">
                <div className="h-14 border-b bg-card px-4 flex items-center justify-between">
                  <h3 className="font-semibold">Articles</h3>
                  <span className="text-xs text-muted-foreground">24 items</span>
                </div>
                <div className="flex-1 overflow-auto p-2 space-y-2">
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <div
                      key={item}
                      className={`p-3 rounded-md border cursor-pointer transition-colors ${
                        item === 1
                          ? "bg-primary/10 border-primary"
                          : "bg-card hover:bg-muted/50"
                      }`}
                    >
                      <h4 className="font-medium text-sm mb-1">
                        Article Title {item}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Last edited 2 hours ago
                      </p>
                      <div className="flex gap-1 mt-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success">
                          Published
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detail Panel */}
              <div className="flex-1 flex flex-col">
                <div className="h-14 border-b bg-card px-6 flex items-center justify-between">
                  <h3 className="font-semibold">Article Details</h3>
                  <div className="flex gap-2">
                    <button className="text-xs px-3 py-1.5 rounded-md border hover:bg-muted">
                      Edit
                    </button>
                    <button className="text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
                      Publish
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-auto p-6 bg-muted/20">
                  <div className="space-y-4 max-w-2xl">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Article Title 1</h2>
                      <p className="text-sm text-muted-foreground">
                        Created by John Doe • 3 days ago
                      </p>
                    </div>
                    <div className="space-y-3">
                      <div className="h-32 rounded-lg bg-muted/50" />
                      <div className="space-y-2">
                        <div className="h-4 rounded bg-muted/50 w-full" />
                        <div className="h-4 rounded bg-muted/50 w-5/6" />
                        <div className="h-4 rounded bg-muted/50 w-4/6" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Three Column Layout */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Three Column Layout</CardTitle>
          <CardDescription>
            Editor with sidebar and activity panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden bg-background">
            <div className="flex h-[400px]">
              {/* Left Sidebar */}
              <div className="w-48 border-r bg-muted/30 p-3">
                <div className="text-xs font-semibold text-muted-foreground mb-2">
                  SECTIONS
                </div>
                <div className="space-y-1">
                  {["Introduction", "Body", "Conclusion", "References"].map(
                    (section, i) => (
                      <div
                        key={i}
                        className="text-sm p-2 rounded hover:bg-muted cursor-pointer"
                      >
                        {section}
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Main Editor Area */}
              <div className="flex-1 flex flex-col">
                <div className="h-12 border-b bg-card px-4 flex items-center gap-2">
                  <div className="flex gap-1">
                    <button className="p-1.5 rounded hover:bg-muted">
                      <span className="text-xs font-bold">B</span>
                    </button>
                    <button className="p-1.5 rounded hover:bg-muted">
                      <span className="text-xs italic">I</span>
                    </button>
                    <button className="p-1.5 rounded hover:bg-muted">
                      <span className="text-xs underline">U</span>
                    </button>
                  </div>
                </div>
                <div className="flex-1 p-6 overflow-auto">
                  <div className="max-w-2xl mx-auto space-y-3">
                    <div className="h-6 rounded bg-muted/50 w-2/3" />
                    <div className="space-y-2">
                      <div className="h-3 rounded bg-muted/30 w-full" />
                      <div className="h-3 rounded bg-muted/30 w-5/6" />
                      <div className="h-3 rounded bg-muted/30 w-4/6" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Activity Panel */}
              <div className="w-64 border-l bg-muted/30 flex flex-col">
                <div className="h-12 border-b bg-card px-4 flex items-center">
                  <span className="text-sm font-semibold">Activity</span>
                </div>
                <div className="flex-1 overflow-auto p-3 space-y-3">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="flex gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium">User {item}</p>
                        <p className="text-xs text-muted-foreground">
                          Commented on section
                        </p>
                        <p className="text-xs text-muted-foreground">
                          2 mins ago
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
