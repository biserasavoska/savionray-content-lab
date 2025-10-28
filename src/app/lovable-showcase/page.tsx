'use client'

import { Button } from '@/components/ui/lovable/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/lovable/card'
import { Badge } from '@/components/ui/lovable/badge'
import { Input } from '@/components/ui/lovable/input'
import { Textarea } from '@/components/ui/lovable/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/lovable/select'
import { Checkbox } from '@/components/ui/lovable/checkbox'
import { Switch } from '@/components/ui/lovable/switch'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/lovable/alert'
import { Skeleton } from '@/components/ui/lovable/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/lovable/tabs'
import { Separator } from '@/components/ui/lovable/separator'
import { useState } from 'react'

export default function LovableShowcase() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            🎨 Lovable Design System Showcase
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Preview of integrated Lovable components and design tokens
          </p>
        </div>

        {/* Theme Toggle */}
        <div className="mb-8 flex justify-center">
          <Button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            variant="outline"
            className="mb-4"
          >
            {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </Button>
        </div>

        <div className={theme === 'dark' ? 'dark' : ''}>
          {/* Buttons Section */}
          <Card className="mb-8 bg-white shadow-lg dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>Different button variants and sizes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon">🚀</Button>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button disabled>Disabled</Button>
                <Button variant="outline" disabled>
                  Disabled Outline
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Badges Section */}
          <Card className="mb-8 bg-white shadow-lg dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Badges</CardTitle>
              <CardDescription>Status indicators and labels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge className="bg-green-500">Success</Badge>
                <Badge className="bg-blue-500">Info</Badge>
                <Badge className="bg-yellow-500">Warning</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Form Elements Section */}
          <Card className="mb-8 bg-white shadow-lg dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Form Elements</CardTitle>
              <CardDescription>Input fields and controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Input Field</label>
                <Input placeholder="Enter your name..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Textarea</label>
                <Textarea placeholder="Enter your message..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Select</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                    <SelectItem value="option3">Option 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" />
                <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Accept terms and conditions
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="notifications" />
                <label htmlFor="notifications" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Enable notifications
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Alerts Section */}
          <Card className="mb-8 bg-white shadow-lg dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Alerts</CardTitle>
              <CardDescription>Notifications and messages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTitle>Heads up!</AlertTitle>
                <AlertDescription>This is a default alert message.</AlertDescription>
              </Alert>
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>This is an error alert message.</AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Tabs Section */}
          <Card className="mb-8 bg-white shadow-lg dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Tabs</CardTitle>
              <CardDescription>Organized content sections</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="tab1" className="w-full">
                <TabsList>
                  <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                  <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                  <TabsTrigger value="tab3">Tab 3</TabsTrigger>
                </TabsList>
                <TabsContent value="tab1" className="mt-4">
                  <p className="text-gray-600 dark:text-gray-400">Content for Tab 1</p>
                </TabsContent>
                <TabsContent value="tab2" className="mt-4">
                  <p className="text-gray-600 dark:text-gray-400">Content for Tab 2</p>
                </TabsContent>
                <TabsContent value="tab3" className="mt-4">
                  <p className="text-gray-600 dark:text-gray-400">Content for Tab 3</p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Loading States Section */}
          <Card className="mb-8 bg-white shadow-lg dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Loading States</CardTitle>
              <CardDescription>Skeleton loaders</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[80%]" />
                <Skeleton className="h-4 w-[60%]" />
              </div>
              <Skeleton className="h-[125px] w-[250px] rounded-xl" />
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Design Tokens Section */}
          <Card className="mb-8 bg-white shadow-lg dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Design Tokens</CardTitle>
              <CardDescription>Lovable color system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <div className="h-20 rounded bg-lovable-primary"></div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Primary</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded bg-lovable-secondary"></div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Secondary</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded bg-lovable-destructive"></div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Destructive</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded bg-lovable-muted"></div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Muted</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <Separator className="my-8" />
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          <p>Lovable Design System Integration Complete ✅</p>
          <p className="mt-2">
            Branch: <code className="rounded bg-gray-200 px-2 py-1 dark:bg-gray-700">feature/ui-glow-up-lovable-safe</code>
          </p>
        </div>
      </div>
    </div>
  )
}

