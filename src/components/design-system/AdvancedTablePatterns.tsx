"use client";
import { useState } from "react";
import { Button } from "@/components/ui/lovable/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/lovable/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/lovable/table";
import { Checkbox } from "@/components/ui/lovable/checkbox";
import { Input } from "@/components/ui/lovable/input";
import { Badge } from "@/components/ui/lovable/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/lovable/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/lovable/select";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  Edit,
  Trash2,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Filter,
  Columns,
  Check,
  X,
  Info,
} from "lucide-react";

interface TableData {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive" | "pending";
  lastActive: string;
  projects: number;
}

const initialData: TableData[] = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "Admin", status: "active", lastActive: "2 hours ago", projects: 12 },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Editor", status: "active", lastActive: "1 day ago", projects: 8 },
  { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "Viewer", status: "inactive", lastActive: "1 week ago", projects: 3 },
  { id: 4, name: "Alice Williams", email: "alice@example.com", role: "Editor", status: "active", lastActive: "5 mins ago", projects: 15 },
  { id: 5, name: "Charlie Brown", email: "charlie@example.com", role: "Admin", status: "pending", lastActive: "3 days ago", projects: 6 },
  { id: 6, name: "Diana Prince", email: "diana@example.com", role: "Editor", status: "active", lastActive: "1 hour ago", projects: 9 },
  { id: 7, name: "Ethan Hunt", email: "ethan@example.com", role: "Viewer", status: "inactive", lastActive: "2 weeks ago", projects: 2 },
  { id: 8, name: "Fiona Apple", email: "fiona@example.com", role: "Editor", status: "active", lastActive: "30 mins ago", projects: 11 },
];

type SortField = keyof TableData;
type SortDirection = "asc" | "desc" | null;

const AdvancedTablePatterns = () => {
  // Sortable Table State
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [sortedData, setSortedData] = useState(initialData);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Selection State
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  // Column Visibility State
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    email: true,
    role: true,
    status: true,
    lastActive: true,
    projects: true,
  });

  // Inline Edit State
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editData, setEditData] = useState<TableData | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");

  // Handle Sorting
  const handleSort = (field: SortField) => {
    let direction: SortDirection = "asc";
    
    if (sortField === field) {
      if (sortDirection === "asc") {
        direction = "desc";
      } else if (sortDirection === "desc") {
        direction = null;
      }
    }

    setSortField(direction ? field : null);
    setSortDirection(direction);

    if (direction) {
      const sorted = [...sortedData].sort((a, b) => {
        if (a[field] < b[field]) return direction === "asc" ? -1 : 1;
        if (a[field] > b[field]) return direction === "asc" ? 1 : -1;
        return 0;
      });
      setSortedData(sorted);
    } else {
      setSortedData(initialData);
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    if (sortDirection === "asc") return <ArrowUp className="ml-2 h-4 w-4" />;
    if (sortDirection === "desc") return <ArrowDown className="ml-2 h-4 w-4" />;
    return <ArrowUpDown className="ml-2 h-4 w-4" />;
  };

  // Handle Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Handle Row Selection
  const toggleRowSelection = (id: number) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const toggleAllRows = () => {
    if (selectedRows.length === paginatedData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedData.map((row) => row.id));
    }
  };

  // Handle Inline Editing
  const startEdit = (row: TableData) => {
    setEditingRow(row.id);
    setEditData({ ...row });
  };

  const cancelEdit = () => {
    setEditingRow(null);
    setEditData(null);
  };

  const saveEdit = () => {
    if (editData) {
      setSortedData((prev) =>
        prev.map((row) => (row.id === editData.id ? editData : row))
      );
      setEditingRow(null);
      setEditData(null);
    }
  };

  // Handle Column Visibility
  const toggleColumn = (column: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({ ...prev, [column]: !prev[column] }));
  };

  // Filter data based on search
  const filteredData = sortedData.filter((row) =>
    Object.values(row).some((value) =>
      value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Advanced Table Features</h2>
        <p className="text-muted-foreground">
          Comprehensive table patterns with sorting, pagination, selection, and inline editing
        </p>
      </div>

      {/* Sortable & Paginated Table */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Sortable Table with Pagination</h3>
        
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Click column headers to sort</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    className="pl-9 w-[200px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Columns className="h-4 w-4 mr-2" />
                      Columns
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {Object.entries(visibleColumns).map(([key, value]) => (
                      <DropdownMenuCheckboxItem
                        key={key}
                        checked={value}
                        onCheckedChange={() => toggleColumn(key as keyof typeof visibleColumns)}
                      >
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {visibleColumns.name && (
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("name")}
                          className="h-8 p-0 hover:bg-transparent"
                        >
                          Name
                          {getSortIcon("name")}
                        </Button>
                      </TableHead>
                    )}
                    {visibleColumns.email && (
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("email")}
                          className="h-8 p-0 hover:bg-transparent"
                        >
                          Email
                          {getSortIcon("email")}
                        </Button>
                      </TableHead>
                    )}
                    {visibleColumns.role && (
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("role")}
                          className="h-8 p-0 hover:bg-transparent"
                        >
                          Role
                          {getSortIcon("role")}
                        </Button>
                      </TableHead>
                    )}
                    {visibleColumns.status && (
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("status")}
                          className="h-8 p-0 hover:bg-transparent"
                        >
                          Status
                          {getSortIcon("status")}
                        </Button>
                      </TableHead>
                    )}
                    {visibleColumns.lastActive && (
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("lastActive")}
                          className="h-8 p-0 hover:bg-transparent"
                        >
                          Last Active
                          {getSortIcon("lastActive")}
                        </Button>
                      </TableHead>
                    )}
                    {visibleColumns.projects && (
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("projects")}
                          className="h-8 p-0 hover:bg-transparent"
                        >
                          Projects
                          {getSortIcon("projects")}
                        </Button>
                      </TableHead>
                    )}
                    <TableHead className="w-[70px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((row) => (
                      <TableRow key={row.id}>
                        {visibleColumns.name && <TableCell className="font-medium">{row.name}</TableCell>}
                        {visibleColumns.email && <TableCell>{row.email}</TableCell>}
                        {visibleColumns.role && <TableCell>{row.role}</TableCell>}
                        {visibleColumns.status && (
                          <TableCell>
                            <Badge
                              variant={
                                row.status === "active"
                                  ? "default"
                                  : row.status === "pending"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {row.status}
                            </Badge>
                          </TableCell>
                        )}
                        {visibleColumns.lastActive && (
                          <TableCell className="text-muted-foreground">{row.lastActive}</TableCell>
                        )}
                        {visibleColumns.projects && <TableCell>{row.projects}</TableCell>}
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No results found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * pageSize + 1} to{" "}
                  {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => {
                    setPageSize(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 per page</SelectItem>
                    <SelectItem value="10">10 per page</SelectItem>
                    <SelectItem value="20">20 per page</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm px-3">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => goToPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Selectable Table with Bulk Actions */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Row Selection & Bulk Actions</h3>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Select rows to perform bulk actions</CardDescription>
              </div>
              {selectedRows.length > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{selectedRows.length} selected</Badge>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedRows.length === paginatedData.length}
                        onCheckedChange={toggleAllRows}
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Projects</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((row) => (
                    <TableRow
                      key={row.id}
                      className={selectedRows.includes(row.id) ? "bg-muted/50" : ""}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedRows.includes(row.id)}
                          onCheckedChange={() => toggleRowSelection(row.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell>{row.email}</TableCell>
                      <TableCell>{row.role}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            row.status === "active"
                              ? "default"
                              : row.status === "pending"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {row.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{row.projects}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Inline Editable Table */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Inline Editing</h3>
        
        <Card>
          <CardHeader>
            <CardTitle>Editable User List</CardTitle>
            <CardDescription>Click edit to modify row data inline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.slice(0, 4).map((row) => (
                    <TableRow key={row.id}>
                      {editingRow === row.id ? (
                        <>
                          <TableCell>
                            <Input
                              value={editData?.name || ""}
                              onChange={(e) =>
                                setEditData((prev) => (prev ? { ...prev, name: e.target.value } : null))
                              }
                              className="h-8"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={editData?.email || ""}
                              onChange={(e) =>
                                setEditData((prev) => (prev ? { ...prev, email: e.target.value } : null))
                              }
                              className="h-8"
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={editData?.role || ""}
                              onValueChange={(value) =>
                                setEditData((prev) => (prev ? { ...prev, role: value } : null))
                              }
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Admin">Admin</SelectItem>
                                <SelectItem value="Editor">Editor</SelectItem>
                                <SelectItem value="Viewer">Viewer</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={editData?.status || ""}
                              onValueChange={(value: "active" | "inactive" | "pending") =>
                                setEditData((prev) => (prev ? { ...prev, status: value } : null))
                              }
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={saveEdit}>
                                <Check className="h-4 w-4 text-success" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={cancelEdit}>
                                <X className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="font-medium">{row.name}</TableCell>
                          <TableCell>{row.email}</TableCell>
                          <TableCell>{row.role}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                row.status === "active"
                                  ? "default"
                                  : row.status === "pending"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {row.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => startEdit(row)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
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
            <h4 className="font-semibold text-foreground mb-2">Sorting Implementation</h4>
            <ul className="space-y-1">
              <li>• Use state to track sort field and direction (asc/desc/null)</li>
              <li>• Three-state sorting: ascending → descending → no sort</li>
              <li>• Display visual indicators (arrows) for current sort state</li>
              <li>• Preserve original data order when no sort is active</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Pagination Best Practices</h4>
            <ul className="space-y-1">
              <li>• Show current page, total pages, and items per page</li>
              <li>• Provide jump-to-first and jump-to-last page buttons</li>
              <li>• Allow users to customize page size (5, 10, 20, etc.)</li>
              <li>• Reset to page 1 when changing filters or page size</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Row Selection</h4>
            <ul className="space-y-1">
              <li>• Use checkboxes for multi-select functionality</li>
              <li>• "Select all" checkbox in header for bulk selection</li>
              <li>• Show selected count and bulk action buttons when rows are selected</li>
              <li>• Highlight selected rows with background color</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Inline Editing</h4>
            <ul className="space-y-1">
              <li>• Only one row editable at a time</li>
              <li>• Provide clear save/cancel actions</li>
              <li>• Validate data before saving changes</li>
              <li>• Show visual feedback during edit mode</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Column Visibility</h4>
            <ul className="space-y-1">
              <li>• Allow users to show/hide columns via dropdown menu</li>
              <li>• Save column preferences to local storage or user settings</li>
              <li>• Always keep at least one column visible</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedTablePatterns;
