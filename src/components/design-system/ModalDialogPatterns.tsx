"use client";
import { useState } from "react";
import { Button } from "@/components/ui/lovable/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/lovable/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/lovable/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/lovable/alert-dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/lovable/drawer";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/lovable/sheet";
import { Input } from "@/components/ui/lovable/input";
import { Label } from "@/components/ui/lovable/label";
import { Textarea } from "@/components/ui/lovable/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/lovable/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/lovable/tabs";
import { Progress } from "@/components/ui/lovable/progress";
import { Separator } from "@/components/ui/lovable/separator";
import { Badge } from "@/components/ui/lovable/badge";
import {
  Info,
  AlertTriangle,
  Trash2,
  Edit,
  Plus,
  Settings,
  Upload,
  Download,
  Share2,
  CheckCircle,
  X,
  ChevronRight,
  Menu,
} from "lucide-react";

const ModalDialogPatterns = () => {
  const [wizardStep, setWizardStep] = useState(1);
  const [progress, setProgress] = useState(33);

  const handleNextStep = () => {
    if (wizardStep < 3) {
      setWizardStep(wizardStep + 1);
      setProgress(wizardStep === 1 ? 66 : 100);
    }
  };

  const handlePrevStep = () => {
    if (wizardStep > 1) {
      setWizardStep(wizardStep - 1);
      setProgress(wizardStep === 2 ? 33 : 66);
    }
  };

  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Modal & Dialog Patterns</h2>
        <p className="text-muted-foreground">
          Comprehensive dialog patterns for different use cases and contexts
        </p>
      </div>

      {/* Basic Dialog Sizes */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Dialog Sizes</h3>
        
        <div className="flex flex-wrap gap-3">
          {/* Small Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Small Dialog</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Quick Action</DialogTitle>
                <DialogDescription>
                  Small dialogs for simple confirmations or brief information.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-muted-foreground">
                  This is a small dialog, perfect for quick actions that don't require much space.
                </p>
              </div>
              <DialogFooter>
                <Button type="submit">Confirm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Medium Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Medium Dialog</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Medium Size Dialog</DialogTitle>
                <DialogDescription>
                  Default size for forms and detailed content.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Enter your name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter your email" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Type your message here" rows={4} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Large Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Large Dialog</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>Large Dialog with Tabs</DialogTitle>
                <DialogDescription>
                  Large dialogs for complex content with multiple sections.
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>
                <TabsContent value="general" className="space-y-4 py-4">
                  <div className="grid gap-2">
                    <Label>Project Name</Label>
                    <Input placeholder="My Project" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Description</Label>
                    <Textarea placeholder="Project description" rows={3} />
                  </div>
                </TabsContent>
                <TabsContent value="settings" className="space-y-4 py-4">
                  <div className="grid gap-2">
                    <Label>Visibility</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="team">Team Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
                <TabsContent value="advanced" className="space-y-4 py-4">
                  <p className="text-sm text-muted-foreground">Advanced settings go here.</p>
                </TabsContent>
              </Tabs>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* Alert Dialogs */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Alert & Confirmation Dialogs</h3>
        
        <div className="flex flex-wrap gap-3">
          {/* Destructive Confirmation */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Item
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Are you absolutely sure?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this item and remove all associated data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Warning Confirmation */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="border-warning text-warning">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Warning Action
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  Proceed with caution
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action may affect other users. Please review the changes before proceeding.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="rounded-md bg-warning/10 p-4">
                <p className="text-sm text-warning-foreground">
                  • 5 users will be affected
                  <br />
                  • Changes take effect immediately
                  <br />
                  • Email notifications will be sent
                </p>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Success Confirmation */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="border-success text-success">
                <CheckCircle className="w-4 h-4 mr-2" />
                Success Dialog
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  Action Completed Successfully
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Your changes have been saved and are now live.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction>Close</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>

      {/* Form Dialogs */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Form Dialogs</h3>
        
        <div className="flex flex-wrap gap-3">
          {/* Create Item Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create New Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Item</DialogTitle>
                <DialogDescription>
                  Fill out the form below to create a new item.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="item-title">Title *</Label>
                  <Input id="item-title" placeholder="Enter title" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="item-category">Category</Label>
                  <Select>
                    <SelectTrigger id="item-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="article">Article</SelectItem>
                      <SelectItem value="tutorial">Tutorial</SelectItem>
                      <SelectItem value="guide">Guide</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="item-description">Description</Label>
                  <Textarea
                    id="item-description"
                    placeholder="Enter description"
                    rows={4}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-md bg-muted">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-info" />
                    <span className="text-sm">Items are visible to team members only</span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button type="submit">Create Item</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Edit Item</DialogTitle>
                <DialogDescription>
                  Make changes to your item here. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input id="edit-title" defaultValue="Existing Item Title" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select defaultValue="draft">
                    <SelectTrigger id="edit-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Metadata</Label>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Created:</div>
                    <div>Jan 15, 2025</div>
                    <div className="text-muted-foreground">Modified:</div>
                    <div>Jan 20, 2025</div>
                    <div className="text-muted-foreground">Author:</div>
                    <div>John Doe</div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Upload Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Upload Files</DialogTitle>
                <DialogDescription>
                  Select files to upload to your workspace.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="border-2 border-dashed rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Upload to folder</Label>
                  <Select defaultValue="images">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="images">Images</SelectItem>
                      <SelectItem value="documents">Documents</SelectItem>
                      <SelectItem value="media">Media</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Upload</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* Multi-Step Wizard Dialog */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Multi-Step Wizard Dialog</h3>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Settings className="w-4 h-4 mr-2" />
              Setup Wizard
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Project Setup Wizard</DialogTitle>
              <DialogDescription>
                Step {wizardStep} of 3 - Complete the setup process
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <Progress value={progress} className="mb-6" />
              
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Basic Information</h4>
                      <p className="text-sm text-muted-foreground">Set up your project details</p>
                    </div>
                  </div>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label>Project Name *</Label>
                      <Input placeholder="My Awesome Project" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Project Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="website">Website</SelectItem>
                          <SelectItem value="app">Application</SelectItem>
                          <SelectItem value="blog">Blog</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
              
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Configuration</h4>
                      <p className="text-sm text-muted-foreground">Configure your settings</p>
                    </div>
                  </div>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label>Domain</Label>
                      <Input placeholder="myproject.com" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Team Size</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-5">1-5 members</SelectItem>
                          <SelectItem value="6-20">6-20 members</SelectItem>
                          <SelectItem value="21+">21+ members</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
              
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Review & Confirm</h4>
                      <p className="text-sm text-muted-foreground">Review your settings</p>
                    </div>
                  </div>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Project Name:</span>
                          <span className="font-medium">My Awesome Project</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Type:</span>
                          <Badge>Website</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Domain:</span>
                          <span className="font-medium">myproject.com</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Team Size:</span>
                          <span className="font-medium">1-5 members</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
            
            <DialogFooter className="flex justify-between sm:justify-between">
              <Button
                variant="outline"
                onClick={handlePrevStep}
                disabled={wizardStep === 1}
              >
                Previous
              </Button>
              <div className="flex gap-2">
                <Button variant="outline">Cancel</Button>
                {wizardStep < 3 ? (
                  <Button onClick={handleNextStep}>
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button>Complete Setup</Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>

      {/* Drawer & Sheet Patterns */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Drawers & Side Panels</h3>
        
        <div className="flex flex-wrap gap-3">
          {/* Bottom Drawer (Mobile) */}
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline">
                <Menu className="w-4 h-4 mr-2" />
                Bottom Drawer
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Mobile Actions</DrawerTitle>
                <DrawerDescription>
                  Drawers slide from bottom on mobile devices.
                </DrawerDescription>
              </DrawerHeader>
              <div className="p-4 space-y-3">
                <Button className="w-full" variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button className="w-full" variant="outline">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button className="w-full" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button variant="outline">Close</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          {/* Right Side Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Right Side Panel</Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Item Details</SheetTitle>
                <SheetDescription>
                  View and edit item information in the side panel.
                </SheetDescription>
              </SheetHeader>
              <div className="py-6 space-y-6">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input defaultValue="Sample Item" />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select defaultValue="active">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea rows={5} defaultValue="Item description here..." />
                </div>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Activity</h4>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <p className="font-medium">Updated</p>
                      <p className="text-muted-foreground">2 hours ago by John Doe</p>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">Created</p>
                      <p className="text-muted-foreground">Jan 15, 2025 by Jane Smith</p>
                    </div>
                  </div>
                </div>
              </div>
              <SheetFooter>
                <SheetClose asChild>
                  <Button variant="outline">Cancel</Button>
                </SheetClose>
                <Button>Save Changes</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          {/* Left Side Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Left Side Panel</Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Filter Options</SheetTitle>
                <SheetDescription>
                  Customize your view with advanced filters.
                </SheetDescription>
              </SheetHeader>
              <div className="py-6 space-y-6">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="articles">Articles</SelectItem>
                      <SelectItem value="guides">Guides</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">Last 7 days</SelectItem>
                      <SelectItem value="month">Last 30 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <SheetFooter>
                <SheetClose asChild>
                  <Button variant="outline">Clear</Button>
                </SheetClose>
                <Button>Apply Filters</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </section>

      {/* Implementation Notes */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            Implementation Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div>
            <h4 className="font-semibold text-foreground mb-2">Dialog Usage Guidelines</h4>
            <ul className="space-y-1">
              <li>• Use <code className="text-xs bg-muted px-1 py-0.5 rounded">Dialog</code> for complex forms and content-heavy interactions</li>
              <li>• Use <code className="text-xs bg-muted px-1 py-0.5 rounded">AlertDialog</code> for confirmations and destructive actions</li>
              <li>• Use <code className="text-xs bg-muted px-1 py-0.5 rounded">Drawer</code> for mobile-first bottom sheets</li>
              <li>• Use <code className="text-xs bg-muted px-1 py-0.5 rounded">Sheet</code> for side panels with contextual information</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Best Practices</h4>
            <ul className="space-y-1">
              <li>• Always provide a clear way to close dialogs (X button or Cancel)</li>
              <li>• Use appropriate dialog sizes based on content complexity</li>
              <li>• Show progress indicators in multi-step wizards</li>
              <li>• Validate forms before allowing dialog submission</li>
              <li>• Confirm destructive actions with explicit warnings</li>
              <li>• Consider mobile experience when choosing between dialogs and drawers</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Accessibility</h4>
            <ul className="space-y-1">
              <li>• All dialogs trap focus and support keyboard navigation</li>
              <li>• Escape key closes dialogs</li>
              <li>• ARIA labels are automatically applied</li>
              <li>• Focus returns to trigger element on close</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModalDialogPatterns;
