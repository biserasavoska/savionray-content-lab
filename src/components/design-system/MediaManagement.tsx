"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/lovable/card";
import { Button } from "@/components/ui/lovable/button";
import { Input } from "@/components/ui/lovable/input";
import { Badge } from "@/components/ui/lovable/badge";
import { Progress } from "@/components/ui/lovable/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/lovable/dialog";
import { Label } from "@/components/ui/lovable/label";
import { Textarea } from "@/components/ui/lovable/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/lovable/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/lovable/select";
import { Upload, Image, File, Video, Music, FolderOpen, Grid3x3, List, Search, Filter, MoreVertical, Download, Trash2, Edit, Copy, Eye, ChevronLeft, ChevronRight, X, Folder, Tag } from "lucide-react";
import { useState } from "react";
import { Checkbox } from "@/components/ui/lovable/checkbox";

export const MediaManagement = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);

  const mediaFiles = [
    { id: 1, name: "hero-image.jpg", type: "image", size: "2.4 MB", date: "2024-01-15", thumbnail: "/placeholder.svg" },
    { id: 2, name: "product-demo.mp4", type: "video", size: "15.8 MB", date: "2024-01-14", thumbnail: "/placeholder.svg" },
    { id: 3, name: "logo.png", type: "image", size: "145 KB", date: "2024-01-13", thumbnail: "/placeholder.svg" },
    { id: 4, name: "background-music.mp3", type: "audio", size: "4.2 MB", date: "2024-01-12", thumbnail: "/placeholder.svg" },
    { id: 5, name: "document.pdf", type: "document", size: "892 KB", date: "2024-01-11", thumbnail: "/placeholder.svg" },
    { id: 6, name: "banner.jpg", type: "image", size: "1.8 MB", date: "2024-01-10", thumbnail: "/placeholder.svg" },
  ];

  const toggleFileSelection = (id: number) => {
    setSelectedFiles(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return Image;
      case 'video': return Video;
      case 'audio': return Music;
      default: return File;
    }
  };

  return (
    <div className="space-y-8">
      {/* Upload Interfaces */}
      <Card>
        <CardHeader>
          <CardTitle>File Upload Interfaces</CardTitle>
          <CardDescription>
            Drag & drop zones and upload with progress tracking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Drag & Drop Zone */}
          <div>
            <h4 className="text-sm font-medium mb-3">Drag & Drop Upload</h4>
            <div className="border-2 border-dashed rounded-lg p-12 text-center hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Drop files here</h3>
              <p className="text-sm text-muted-foreground mb-4">
                or click to browse
              </p>
              <Button variant="outline">
                Browse Files
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                Supports: JPG, PNG, GIF, MP4, PDF (Max 20MB)
              </p>
            </div>
          </div>

          {/* Upload with Progress */}
          <div>
            <h4 className="text-sm font-medium mb-3">Upload Progress</h4>
            <div className="space-y-3">
              {[
                { name: "hero-banner.jpg", progress: 100, status: "complete" },
                { name: "product-video.mp4", progress: 67, status: "uploading" },
                { name: "document.pdf", progress: 0, status: "queued" },
              ].map((file, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                    <File className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {file.status === 'complete' ? 'Complete' : 
                         file.status === 'uploading' ? `${file.progress}%` : 
                         'Queued'}
                      </span>
                    </div>
                    <Progress value={file.progress} className="h-1" />
                  </div>
                  {file.status === 'uploading' && (
                    <Button variant="ghost" size="sm">
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Implementation: Use FileReader API, track upload progress with XMLHttpRequest or fetch, show real-time progress bars
          </p>
        </CardContent>
      </Card>

      {/* Media Library */}
      <Card>
        <CardHeader>
          <CardTitle>Media Library Interface</CardTitle>
          <CardDescription>
            Browse, search, and organize media files
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search files..." className="pl-9" />
            </div>
            <div className="flex gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Files</SelectItem>
                  <SelectItem value="images">Images</SelectItem>
                  <SelectItem value="videos">Videos</SelectItem>
                  <SelectItem value="documents">Documents</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex border rounded-lg">
                <Button 
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </div>
          </div>

          {/* Selection Actions */}
          {selectedFiles.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
              <span className="text-sm font-medium">
                {selectedFiles.length} selected
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button variant="outline" size="sm">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button variant="destructive" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          )}

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {mediaFiles.map((file) => {
                const FileIcon = getFileIcon(file.type);
                return (
                  <div 
                    key={file.id}
                    className={`group relative border rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-colors ${
                      selectedFiles.includes(file.id) ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <div className="absolute top-2 left-2 z-10">
                      <Checkbox
                        checked={selectedFiles.includes(file.id)}
                        onCheckedChange={() => toggleFileSelection(file.id)}
                        className="bg-background"
                      />
                    </div>
                    
                    {/* Thumbnail */}
                    <div className="aspect-square bg-muted flex items-center justify-center">
                      <FileIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                    
                    {/* File Info */}
                    <div className="p-3">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{file.size}</p>
                    </div>
                    
                    {/* Actions Menu */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="border rounded-lg">
              {mediaFiles.map((file, i) => {
                const FileIcon = getFileIcon(file.type);
                return (
                  <div 
                    key={file.id}
                    className={`flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer ${
                      i !== mediaFiles.length - 1 ? 'border-b' : ''
                    } ${selectedFiles.includes(file.id) ? 'bg-primary/5' : ''}`}
                  >
                    <Checkbox
                      checked={selectedFiles.includes(file.id)}
                      onCheckedChange={() => toggleFileSelection(file.id)}
                    />
                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                      <FileIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{file.type}</p>
                    </div>
                    <div className="hidden sm:block text-sm text-muted-foreground">
                      {file.size}
                    </div>
                    <div className="hidden md:block text-sm text-muted-foreground">
                      {file.date}
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Implementation: Toggle between grid/list views, checkbox selection with bulk actions, file type filtering, responsive layout
          </p>
        </CardContent>
      </Card>

      {/* File Preview Modal */}
      <Card>
        <CardHeader>
          <CardTitle>File Preview Modal</CardTitle>
          <CardDescription>
            Full-size preview with navigation and metadata
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Open Preview Example</Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[90vh]">
              <div className="flex h-full">
                {/* Preview Area */}
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">hero-image.jpg</h3>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex-1 bg-muted rounded-lg flex items-center justify-center">
                    <Image className="h-24 w-24 text-muted-foreground" />
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" className="flex-1">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Copy className="mr-2 h-4 w-4" />
                      Copy URL
                    </Button>
                    <Button variant="destructive" className="flex-1">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
                
                {/* Metadata Sidebar */}
                <div className="w-72 ml-6 space-y-6">
                  <div>
                    <h4 className="text-sm font-medium mb-3">File Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span>Image/JPEG</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Size:</span>
                        <span>2.4 MB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dimensions:</span>
                        <span>1920x1080</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Uploaded:</span>
                        <span>Jan 15, 2024</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-3">Title</h4>
                    <Input defaultValue="hero-image.jpg" />
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-3">Description</h4>
                    <Textarea placeholder="Add a description..." rows={3} />
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-3">Tags</h4>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge variant="secondary">hero</Badge>
                      <Badge variant="secondary">homepage</Badge>
                    </div>
                    <Input placeholder="Add tags..." />
                  </div>
                  
                  <Button className="w-full">
                    Save Changes
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <p className="text-xs text-muted-foreground mt-4">
            Implementation: Full-screen dialog, keyboard navigation (←/→), editable metadata, action buttons, responsive layout
          </p>
        </CardContent>
      </Card>

      {/* Folder Organization */}
      <Card>
        <CardHeader>
          <CardTitle>Folder Organization</CardTitle>
          <CardDescription>
            Hierarchical folder structure for media organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            {/* Folder Tree */}
            <div className="w-64 border rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium mb-3">
                <FolderOpen className="h-4 w-4" />
                Media Library
              </div>
              <div className="space-y-1 ml-4">
                <div className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer">
                  <Folder className="h-4 w-4 text-warning" />
                  <span className="text-sm">Images</span>
                </div>
                <div className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer ml-4">
                  <Folder className="h-4 w-4 text-warning" />
                  <span className="text-sm">Products</span>
                </div>
                <div className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer ml-4">
                  <Folder className="h-4 w-4 text-warning" />
                  <span className="text-sm">Blog</span>
                </div>
                <div className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer">
                  <Folder className="h-4 w-4 text-warning" />
                  <span className="text-sm">Videos</span>
                </div>
                <div className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer">
                  <Folder className="h-4 w-4 text-warning" />
                  <span className="text-sm">Documents</span>
                </div>
              </div>
            </div>

            {/* Breadcrumb & Content */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Media Library</span>
                <span className="text-muted-foreground">/</span>
                <span className="text-muted-foreground">Images</span>
                <span className="text-muted-foreground">/</span>
                <span className="font-medium">Products</span>
              </div>
              
              <div className="border rounded-lg p-4">
                <p className="text-sm text-muted-foreground text-center">
                  Folder contents would be displayed here
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Implementation: Nested folder structure, breadcrumb navigation, drag-and-drop to move files between folders
          </p>
        </CardContent>
      </Card>

      {/* Tagging System */}
      <Card>
        <CardHeader>
          <CardTitle>Tagging & Organization</CardTitle>
          <CardDescription>
            Tag-based organization with multi-select filtering
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-3">Browse by Tags</h4>
            <div className="flex flex-wrap gap-2">
              {['all', 'hero', 'product', 'blog', 'social', 'marketing', 'seasonal'].map(tag => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                  <span className="ml-1 text-xs text-muted-foreground">(12)</span>
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-3">Add Tags to Files</h4>
            <div className="flex gap-2">
              <Input placeholder="Enter tag name..." className="flex-1" />
              <Button>Add Tag</Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Implementation: Tag autocomplete, multi-tag filtering, tag management interface, show file counts per tag
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
