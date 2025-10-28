"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/lovable/card";
import { Input } from "@/components/ui/lovable/input";
import { Button } from "@/components/ui/lovable/button";
import { Badge } from "@/components/ui/lovable/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/lovable/select";
import { Checkbox } from "@/components/ui/lovable/checkbox";
import { Calendar } from "@/components/ui/lovable/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/lovable/popover";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/lovable/command";
import { Search, X, Filter, Calendar as CalendarIcon, Save, Star, FileText, Users, Settings, BarChart3, Trash2 } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

export const SearchFiltering = () => {
  const [open, setOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [date, setDate] = useState<Date>();

  const removeFilter = (filter: string) => {
    setSelectedFilters(prev => prev.filter(f => f !== filter));
  };

  const addFilter = (filter: string) => {
    if (!selectedFilters.includes(filter)) {
      setSelectedFilters(prev => [...prev, filter]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Command Palette / Global Search */}
      <Card>
        <CardHeader>
          <CardTitle>Command Palette (Global Search)</CardTitle>
          <CardDescription>
            Keyboard-driven search interface for quick navigation and actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Button variant="outline" className="w-full justify-start text-muted-foreground" onClick={() => setOpen(true)}>
              <Search className="mr-2 h-4 w-4" />
              Search or press ⌘K
            </Button>
            
            <CommandDialog open={open} onOpenChange={setOpen}>
              <CommandInput placeholder="Type a command or search..." />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Quick Actions">
                  <CommandItem>
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Create New Article</span>
                  </CommandItem>
                  <CommandItem>
                    <Users className="mr-2 h-4 w-4" />
                    <span>Manage Team</span>
                  </CommandItem>
                  <CommandItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </CommandItem>
                </CommandGroup>
                <CommandGroup heading="Recent Content">
                  <CommandItem>
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Getting Started Guide</span>
                  </CommandItem>
                  <CommandItem>
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Product Launch Article</span>
                  </CommandItem>
                  <CommandItem>
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Team Handbook</span>
                  </CommandItem>
                </CommandGroup>
                <CommandGroup heading="Navigation">
                  <CommandItem>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </CommandItem>
                  <CommandItem>
                    <FileText className="mr-2 h-4 w-4" />
                    <span>All Content</span>
                  </CommandItem>
                  <CommandItem>
                    <Users className="mr-2 h-4 w-4" />
                    <span>Team</span>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </CommandDialog>
          </div>
          <p className="text-xs text-muted-foreground">
            Implementation: Use cmdk package (already imported), listen for ⌘K/Ctrl+K keyboard shortcut, organize by action types
          </p>
        </CardContent>
      </Card>

      {/* Search Bar with Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Bar with Integrated Filters</CardTitle>
          <CardDescription>
            Combined search input with quick filter access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search content, users, or settings..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute right-1 top-1 h-7 w-7 p-0"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                  {selectedFilters.length > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                      {selectedFilters.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Filter Content</h4>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <div className="space-y-2">
                      {['Published', 'Draft', 'Review', 'Archived'].map(status => (
                        <div key={status} className="flex items-center space-x-2">
                          <Checkbox 
                            id={status}
                            checked={selectedFilters.includes(status)}
                            onCheckedChange={(checked) => {
                              if (checked) addFilter(status);
                              else removeFilter(status);
                            }}
                          />
                          <label htmlFor={status} className="text-sm cursor-pointer">
                            {status}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Content Type</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="article">Article</SelectItem>
                        <SelectItem value="page">Page</SelectItem>
                        <SelectItem value="post">Blog Post</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setSelectedFilters([])}>
                      Clear
                    </Button>
                    <Button size="sm" className="flex-1">
                      Apply
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Active Filter Chips */}
          {selectedFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {selectedFilters.map(filter => (
                <Badge key={filter} variant="secondary" className="gap-1">
                  {filter}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-destructive" 
                    onClick={() => removeFilter(filter)}
                  />
                </Badge>
              ))}
              <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setSelectedFilters([])}>
                Clear all
              </Button>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Implementation: Popover for filter panel, maintain filter state, show active filters as removable chips
          </p>
        </CardContent>
      </Card>

      {/* Advanced Filters Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Filters Panel</CardTitle>
          <CardDescription>
            Comprehensive filtering with multiple criteria types
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Date Range Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Category Multi-Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Categories</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select categories..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tech">Technology</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Author Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Author</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select author..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="john">John Doe</SelectItem>
                  <SelectItem value="jane">Jane Smith</SelectItem>
                  <SelectItem value="bob">Bob Johnson</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tag Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <Input placeholder="Enter tags..." />
              <div className="flex flex-wrap gap-1 mt-2">
                <Badge variant="outline">React</Badge>
                <Badge variant="outline">TypeScript</Badge>
                <Badge variant="outline">Design</Badge>
              </div>
            </div>
          </div>

          {/* Sort Options */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Sort By</label>
            <div className="flex gap-2">
              <Select defaultValue="date">
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date Modified</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="author">Author</SelectItem>
                  <SelectItem value="views">Views</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="desc">
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Implementation: Date picker with range support, multi-select dropdowns, tag input with autocomplete, sort controls
          </p>
        </CardContent>
      </Card>

      {/* Saved Filter Presets */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Presets</CardTitle>
          <CardDescription>
            Save and load common filter combinations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            {[
              { name: "My Drafts", icon: FileText, filters: "Status: Draft, Author: Me", color: "text-info" },
              { name: "Ready to Publish", icon: Star, filters: "Status: Review, Approved", color: "text-success" },
              { name: "This Week", icon: CalendarIcon, filters: "Date: Last 7 days", color: "text-warning" },
              { name: "Needs Review", icon: Users, filters: "Status: Draft, Age: >3 days", color: "text-destructive" },
            ].map((preset, i) => (
              <div 
                key={i}
                className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <preset.icon className={`h-5 w-5 mt-0.5 ${preset.color}`} />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{preset.name}</h4>
                    <Star className="h-3 w-3 text-warning fill-warning" />
                  </div>
                  <p className="text-xs text-muted-foreground">{preset.filters}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Save className="mr-2 h-4 w-4" />
              Save Current Filters
            </Button>
            <Button variant="ghost" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Implementation: Store presets in localStorage or database, allow create/edit/delete, apply with one click
          </p>
        </CardContent>
      </Card>

      {/* Search Results */}
      <Card>
        <CardHeader>
          <CardTitle>Search Results Display</CardTitle>
          <CardDescription>
            Formatted results with highlighting and grouping
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground mb-4">
            Found 127 results for "react hooks" (0.08 seconds)
          </div>

          {/* Grouped Results */}
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Articles (89)
              </h4>
              <div className="space-y-3">
                {[
                  { title: "Complete Guide to React Hooks", excerpt: "Learn how to use React hooks effectively in your applications...", category: "Tutorial" },
                  { title: "Advanced React Hooks Patterns", excerpt: "Discover advanced patterns for using hooks in complex scenarios...", category: "Advanced" },
                  { title: "React Hooks Best Practices", excerpt: "Follow these best practices when working with hooks...", category: "Guide" },
                ].map((result, i) => (
                  <div key={i} className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h5 className="font-medium text-sm mb-1">
                          {result.title.split('React Hooks').map((part, i, arr) => (
                            i < arr.length - 1 ? (
                              <span key={i}>
                                {part}<mark className="bg-primary/20 text-foreground px-0.5">React Hooks</mark>
                              </span>
                            ) : part
                          ))}
                        </h5>
                        <p className="text-xs text-muted-foreground">{result.excerpt}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {result.category}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Users (3)
              </h4>
              <div className="space-y-2">
                {['John Hook', 'React Developer', 'Hook Master'].map((user, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {user.charAt(0)}
                    </div>
                    <span className="text-sm">{user}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Implementation: Highlight search terms with &lt;mark&gt; tag, group by content type, show result counts, truncate excerpts
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
