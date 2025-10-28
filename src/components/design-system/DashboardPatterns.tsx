import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/lovable/card";
import { Badge } from "@/components/ui/lovable/badge";
import { Button } from "@/components/ui/lovable/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/lovable/select";
import { TrendingUp, TrendingDown, Users, FileText, Eye, Clock, ArrowUpRight, ArrowDownRight, MoreHorizontal } from "lucide-react";
import { Progress } from "@/components/ui/lovable/progress";

export const DashboardPatterns = () => {
  return (
    <div className="space-y-8">
      {/* KPI Metrics Cards */}
      <Card>
        <CardHeader>
          <CardTitle>KPI Metric Cards</CardTitle>
          <CardDescription>
            At-a-glance performance indicators with trend visualization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Users Metric */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12,453</div>
                <div className="flex items-center text-xs text-success mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>+12.5% from last month</span>
                </div>
              </CardContent>
            </Card>

            {/* Total Content Metric */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Content Items</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,429</div>
                <div className="flex items-center text-xs text-success mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>+8.2% from last month</span>
                </div>
              </CardContent>
            </Card>

            {/* Page Views Metric */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Page Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89,234</div>
                <div className="flex items-center text-xs text-destructive mt-1">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  <span>-3.4% from last month</span>
                </div>
              </CardContent>
            </Card>

            {/* Avg Time Metric */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Avg. Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3m 24s</div>
                <div className="flex items-center text-xs text-success mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>+5.1% from last month</span>
                </div>
              </CardContent>
            </Card>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Implementation: Use semantic colors for trend indicators (success/destructive), include period comparison
          </p>
        </CardContent>
      </Card>

      {/* Chart Widgets */}
      <Card>
        <CardHeader>
          <CardTitle>Chart & Graph Patterns</CardTitle>
          <CardDescription>
            Data visualization for trends, distributions, and comparisons
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Line Chart Pattern */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-medium">Content Performance</h4>
                <p className="text-xs text-muted-foreground">Views over time</p>
              </div>
              <Select defaultValue="7d">
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="h-[200px] border rounded-lg bg-muted/20 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Line Chart Placeholder - Use Recharts</p>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Implementation: Use Recharts LineChart with responsive container, gradient fills, tooltips
            </p>
          </div>

          {/* Bar Chart Pattern */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-medium">Content by Category</h4>
                <p className="text-xs text-muted-foreground">Distribution breakdown</p>
              </div>
            </div>
            <div className="h-[200px] border rounded-lg bg-muted/20 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Bar Chart Placeholder - Use Recharts</p>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Implementation: Use Recharts BarChart with custom colors matching your design tokens
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Feed Pattern</CardTitle>
          <CardDescription>
            Real-time updates and recent activity tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { user: "John Doe", action: "published", item: "Getting Started Guide", time: "2 minutes ago", type: "success" },
              { user: "Jane Smith", action: "created draft", item: "New Product Launch", time: "15 minutes ago", type: "info" },
              { user: "Bob Johnson", action: "updated", item: "Team Handbook", time: "1 hour ago", type: "info" },
              { user: "Alice Brown", action: "deleted", item: "Old Announcement", time: "2 hours ago", type: "destructive" },
            ].map((activity, i) => (
              <div key={i} className="flex items-start gap-3 pb-3 border-b last:border-0">
                <div className={`mt-1 h-2 w-2 rounded-full ${
                  activity.type === 'success' ? 'bg-success' : 
                  activity.type === 'destructive' ? 'bg-destructive' : 
                  'bg-info'
                }`} />
                <div className="flex-1 space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user}</span>
                    {' '}{activity.action}{' '}
                    <span className="font-medium">{activity.item}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="w-full mt-4">
            View All Activity
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            Implementation: Real-time updates via Socket.IO or polling, use color-coded indicators for action types
          </p>
        </CardContent>
      </Card>

      {/* Top Performers Widget */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Top Performing Content</CardTitle>
              <CardDescription>Most viewed articles this month</CardDescription>
            </div>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { title: "Complete Guide to React Hooks", views: 12543, change: 23.4, trend: "up" },
              { title: "Building Modern Web Apps", views: 9821, change: 18.2, trend: "up" },
              { title: "CSS Grid Masterclass", views: 8765, change: 15.7, trend: "up" },
              { title: "JavaScript Best Practices", views: 7432, change: -5.3, trend: "down" },
              { title: "TypeScript for Beginners", views: 6234, change: 12.1, trend: "up" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                  {i + 1}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.views.toLocaleString()} views</p>
                </div>
                <div className={`flex items-center text-xs ${
                  item.trend === 'up' ? 'text-success' : 'text-destructive'
                }`}>
                  {item.trend === 'up' ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  <span>{Math.abs(item.change)}%</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Implementation: Query analytics data, sort by metrics, display with ranking and trend indicators
          </p>
        </CardContent>
      </Card>

      {/* Progress & Goals Widget */}
      <Card>
        <CardHeader>
          <CardTitle>Goals & Progress</CardTitle>
          <CardDescription>Track targets and milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[
              { label: "Monthly Content Goal", current: 42, target: 50, unit: "articles" },
              { label: "User Engagement", current: 78, target: 100, unit: "%" },
              { label: "Team Contributions", current: 156, target: 200, unit: "edits" },
            ].map((goal, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{goal.label}</span>
                  <span className="text-muted-foreground">
                    {goal.current}/{goal.target} {goal.unit}
                  </span>
                </div>
                <Progress value={(goal.current / goal.target) * 100} className="h-2" />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {Math.round((goal.current / goal.target) * 100)}% complete
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {goal.target - goal.current} remaining
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Implementation: Use Progress component, calculate percentages, show remaining values
          </p>
        </CardContent>
      </Card>

      {/* Quick Stats Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Stats Grid</CardTitle>
          <CardDescription>
            Compact metrics for dashboard overviews
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Published", value: "1,234", color: "bg-success" },
              { label: "Drafts", value: "89", color: "bg-warning" },
              { label: "In Review", value: "23", color: "bg-info" },
              { label: "Archived", value: "567", color: "bg-muted" },
            ].map((stat, i) => (
              <div key={i} className="space-y-2 p-4 border rounded-lg">
                <div className={`h-1 w-12 rounded ${stat.color}`} />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Implementation: Map status counts from database, use color-coded indicators
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
