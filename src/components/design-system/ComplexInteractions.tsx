"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/lovable/card";
import { Button } from "@/components/ui/lovable/button";
import { Badge } from "@/components/ui/lovable/badge";
import { Input } from "@/components/ui/lovable/input";
import { Checkbox } from "@/components/ui/lovable/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/lovable/dialog";
import { Label } from "@/components/ui/lovable/label";
import { Textarea } from "@/components/ui/lovable/textarea";
import { GripVertical, Edit2, Trash2, Save, X } from "lucide-react";
import { useState } from "react";

export const ComplexInteractions = () => {
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [currentStep, setCurrentStep] = useState(1);

  const items = [
    { id: 1, title: "Article 1", status: "Published", author: "John Doe" },
    { id: 2, title: "Article 2", status: "Draft", author: "Jane Smith" },
    { id: 3, title: "Article 3", status: "Review", author: "Bob Johnson" },
  ];

  const toggleSelection = (id: number) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const startEditing = (id: number, value: string) => {
    setEditingId(id);
    setEditValue(value);
  };

  const saveEdit = () => {
    // Save logic here
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  return (
    <div className="space-y-8">
      {/* Modal Workflows */}
      <Card>
        <CardHeader>
          <CardTitle>Modal Workflows</CardTitle>
          <CardDescription>
            Multi-step forms and wizards for complex data entry
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Simple Modal */}
          <div>
            <h4 className="text-sm font-medium mb-2">Simple Form Modal</h4>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Create New Item</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Article</DialogTitle>
                  <DialogDescription>
                    Fill in the details for your new article
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" placeholder="Article title" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea id="content" placeholder="Article content" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button>Create Article</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <p className="text-xs text-muted-foreground mt-2">
              Implementation: Use Dialog component with form fields
            </p>
          </div>

          {/* Multi-step Wizard */}
          <div>
            <h4 className="text-sm font-medium mb-2">Multi-Step Wizard</h4>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Start Setup Wizard</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Content Setup Wizard</DialogTitle>
                  <DialogDescription>
                    Step {currentStep} of 3
                  </DialogDescription>
                </DialogHeader>
                
                {/* Progress Indicator */}
                <div className="flex gap-2 mb-4">
                  {[1, 2, 3].map(step => (
                    <div 
                      key={step}
                      className={`flex-1 h-2 rounded ${
                        step <= currentStep ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>

                {/* Step Content */}
                <div className="py-4 min-h-[200px]">
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <h3 className="font-medium">Basic Information</h3>
                      <div className="space-y-2">
                        <Label>Project Name</Label>
                        <Input placeholder="My Project" />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea placeholder="Describe your project" />
                      </div>
                    </div>
                  )}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <h3 className="font-medium">Configure Settings</h3>
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Input placeholder="Technology" />
                      </div>
                      <div className="space-y-2">
                        <Label>Tags</Label>
                        <Input placeholder="tag1, tag2, tag3" />
                      </div>
                    </div>
                  )}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <h3 className="font-medium">Review & Confirm</h3>
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm">Review your settings before creating</p>
                      </div>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                    disabled={currentStep === 1}
                  >
                    Previous
                  </Button>
                  {currentStep < 3 ? (
                    <Button onClick={() => setCurrentStep(currentStep + 1)}>
                      Next
                    </Button>
                  ) : (
                    <Button>Complete</Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <p className="text-xs text-muted-foreground mt-2">
              Implementation: State management for steps, progress indicator, conditional rendering
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Drag & Drop */}
      <Card>
        <CardHeader>
          <CardTitle>Drag & Drop Interfaces</CardTitle>
          <CardDescription>
            Reorderable lists and drag-to-organize functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Sortable List</h4>
            <div className="space-y-2">
              {items.map(item => (
                <div 
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-muted rounded-lg cursor-move hover:bg-muted/80 transition-colors"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1">{item.title}</span>
                  <Badge variant="outline">{item.status}</Badge>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Implementation: Use @dnd-kit/core and @dnd-kit/sortable for drag & drop
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Drag Between Lists</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium mb-2">Available</div>
                <div className="border-2 border-dashed rounded-lg p-4 min-h-[200px] space-y-2">
                  <div className="p-2 bg-background rounded cursor-move">Item A</div>
                  <div className="p-2 bg-background rounded cursor-move">Item B</div>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Selected</div>
                <div className="border-2 border-dashed rounded-lg p-4 min-h-[200px] space-y-2">
                  <div className="p-2 bg-background rounded cursor-move">Item C</div>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Implementation: Multiple droppable containers with transfer logic
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Inline Editing */}
      <Card>
        <CardHeader>
          <CardTitle>Inline Editing</CardTitle>
          <CardDescription>
            Edit content directly without navigating to separate forms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Click-to-Edit Fields</h4>
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg group">
                  {editingId === item.id ? (
                    <>
                      <Input 
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1"
                        autoFocus
                      />
                      <Button size="sm" variant="ghost" onClick={saveEdit}>
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={cancelEdit}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1">{item.title}</span>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => startEditing(item.id, item.title)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Implementation: Toggle between display/edit mode with state management
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Contenteditable Fields</h4>
            <div className="border rounded-lg p-4">
              <div 
                contentEditable
                className="outline-none focus:ring-2 focus:ring-primary rounded p-2 min-h-[100px]"
                suppressContentEditableWarning
              >
                Click here to edit this content directly. Changes are saved automatically.
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Implementation: contentEditable with auto-save debouncing
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Actions</CardTitle>
          <CardDescription>
            Select multiple items and perform actions on them
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Checkbox 
                  checked={selectedItems.length === items.length}
                  onCheckedChange={(checked) => {
                    setSelectedItems(checked ? items.map(i => i.id) : []);
                  }}
                />
                <span className="text-sm">
                  {selectedItems.length > 0 
                    ? `${selectedItems.length} selected` 
                    : 'Select all'}
                </span>
              </div>
              
              {selectedItems.length > 0 && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Export Selected
                  </Button>
                  <Button size="sm" variant="outline">
                    Change Status
                  </Button>
                  <Button size="sm" variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              {items.map(item => (
                <div 
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    selectedItems.includes(item.id) 
                      ? 'bg-primary/10 border-2 border-primary' 
                      : 'bg-muted'
                  }`}
                >
                  <Checkbox 
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={() => toggleSelection(item.id)}
                  />
                  <span className="flex-1">{item.title}</span>
                  <span className="text-sm text-muted-foreground">{item.author}</span>
                  <Badge variant="outline">{item.status}</Badge>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Implementation: Array of selected IDs, conditional action bar, batch operations
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
