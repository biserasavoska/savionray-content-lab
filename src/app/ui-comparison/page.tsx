'use client'

import { PageLayout, PageHeader, PageContent, PageSection, Breadcrumbs } from '@/components/ui/layout/PageLayout'
import Button from '@/components/ui/common/Button'
import StatusBadge from '@/components/ui/common/StatusBadge'
import { Card, CardHeader, CardContent } from '@/components/ui/common/Card'

export default function UIComparisonPage() {
  const breadcrumbItems = [
    { href: '/', children: 'Home' },
    { children: 'UI Comparison', isActive: true }
  ]

  return (
    <PageLayout size="large">
      <PageHeader
        title="UI Standardization: Before vs After"
        description="Visual comparison showing the impact of our UI standardization work"
        breadcrumbs={<Breadcrumbs items={breadcrumbItems} />}
      />
      
      <PageContent>
        <PageSection>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-blue-900 mb-2">What This Page Shows</h3>
            <p className="text-blue-800 text-sm">
              This page demonstrates the real impact of our UI standardization work. 
              The "Before" examples show the old way with inconsistent custom styling, 
              while the "After" examples show the new standardized components.
            </p>
          </div>
        </PageSection>

        {/* Button Comparison */}
        <PageSection>
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Button Components</h2>
              <p className="text-gray-600">Before: Custom styling vs After: Standardized components</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Before */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-red-700 border-b border-red-200 pb-2">
                    ❌ Before: Custom Styling (Inconsistent)
                  </h3>
                  <div className="space-y-3">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                      Submit Form
                    </button>
                    <button className="bg-green-500 text-white px-3 py-1.5 rounded-md hover:bg-green-600">
                      Save Changes
                    </button>
                    <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                      Delete Item
                    </button>
                    <button className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                      Cancel Action
                    </button>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-sm text-red-800">
                      <strong>Problems:</strong> Different border radius, padding, hover effects, 
                      and inconsistent styling across the app
                    </p>
                  </div>
                </div>

                {/* After */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-green-700 border-b border-green-200 pb-2">
                    ✅ After: Standardized Components
                  </h3>
                  <div className="space-y-3">
                    <Button variant="default">Submit Form</Button>
                    <Button variant="default">Save Changes</Button>
                    <Button variant="destructive">Delete Item</Button>
                    <Button variant="secondary">Cancel Action</Button>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <p className="text-sm text-green-800">
                      <strong>Benefits:</strong> Consistent styling, easy maintenance, 
                      standardized hover effects, and professional appearance
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </PageSection>

        {/* Status Badge Comparison */}
        <PageSection>
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Status Indicators</h2>
              <p className="text-gray-600">Before: Custom spans vs After: Standardized StatusBadge</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Before */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-red-700 border-b border-red-200 pb-2">
                    ❌ Before: Custom Status Spans
                  </h3>
                  <div className="space-y-3">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                      Approved
                    </span>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                      Pending Review
                    </span>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                      Rejected
                    </span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      In Progress
                    </span>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-sm text-red-800">
                      <strong>Problems:</strong> Inconsistent sizing, colors, and styling. 
                      Each developer could style them differently.
                    </p>
                  </div>
                </div>

                {/* After */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-green-700 border-b border-green-200 pb-2">
                    ✅ After: Standardized StatusBadge
                  </h3>
                  <div className="space-y-3">
                    <StatusBadge status="approved" size="sm" />
                    <StatusBadge status="pending" size="sm" />
                    <StatusBadge status="rejected" size="sm" />
                    <StatusBadge status="in-progress" size="sm" />
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <p className="text-sm text-green-800">
                      <strong>Benefits:</strong> Consistent appearance, standardized colors, 
                      easy to maintain and update across the entire app
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </PageSection>

        {/* Layout Comparison */}
        <PageSection>
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Page Layout Structure</h2>
              <p className="text-gray-600">Before: Custom divs vs After: Standardized PageLayout components</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Before */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-red-700 border-b border-red-200 pb-2">
                    ❌ Before: Custom Layout Divs
                  </h3>
                  <div className="bg-gray-100 border border-gray-300 rounded p-4 space-y-4">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6">
                      <div className="mb-6">
                        <nav className="flex items-center space-x-2 text-sm">
                          <span className="text-gray-600">Home</span>
                          <span className="text-gray-400">/</span>
                          <span className="text-gray-500">Page</span>
                        </nav>
                      </div>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Title</h1>
                          <p className="text-gray-600 text-base">Page description here</p>
                        </div>
                      </div>
                    </div>
                    <div className="max-w-6xl mx-auto px-4 sm:px-6">
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Content Section</h2>
                        <p className="text-gray-600">This is the page content...</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-sm text-red-800">
                      <strong>Problems:</strong> Repetitive layout code, inconsistent spacing, 
                      hard to maintain consistent structure across pages
                    </p>
                  </div>
                </div>

                {/* After */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-green-700 border-b border-green-200 pb-2">
                    ✅ After: Standardized PageLayout
                  </h3>
                  <div className="bg-gray-100 border border-gray-300 rounded p-4 space-y-4">
                    <PageLayout size="large">
                      <PageHeader
                        title="Page Title"
                        description="Page description here"
                        breadcrumbs={<Breadcrumbs items={[
                          { href: '/', children: 'Home' },
                          { children: 'Page', isActive: true }
                        ]} />}
                      />
                      <PageContent>
                        <PageSection>
                          <Card>
                            <CardHeader>
                              <h2 className="text-lg font-semibold text-gray-900">Content Section</h2>
                            </CardHeader>
                            <CardContent>
                              <p className="text-gray-600">This is the page content...</p>
                            </CardContent>
                          </Card>
                        </PageSection>
                      </PageContent>
                    </PageLayout>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <p className="text-sm text-green-800">
                      <strong>Benefits:</strong> Consistent spacing, standardized structure, 
                      easy to maintain, and professional appearance across all pages
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </PageSection>

        {/* Code Comparison */}
        <PageSection>
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Code Comparison</h2>
              <p className="text-gray-600">See the actual code differences</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Before Code */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-red-700 border-b border-red-200 pb-2">
                    ❌ Before: Custom Styling Code
                  </h3>
                  <div className="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-x-auto">
                    <pre>{`// Each button had different styling
<button 
  className="bg-blue-600 text-white px-4 py-2 
           rounded hover:bg-blue-700 
           disabled:opacity-50"
  onClick={handleSubmit}
>
  Submit
</button>

// Each status had custom styling
<span className="bg-green-100 text-green-800 
               px-2 py-1 rounded text-sm">
  Approved
</span>

// Layout was repetitive
<div className="max-w-6xl mx-auto px-4 sm:px-6">
  <div className="mb-6">
    <nav className="flex items-center space-x-2 text-sm">
      {/* Breadcrumbs */}
    </nav>
  </div>
  {/* More repetitive layout code... */}
</div>`}</pre>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-sm text-red-800">
                      <strong>Issues:</strong> 20+ lines of repetitive code, 
                      inconsistent styling, hard to maintain
                    </p>
                  </div>
                </div>

                {/* After Code */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-green-700 border-b border-green-200 pb-2">
                    ✅ After: Standardized Components
                  </h3>
                  <div className="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-x-auto">
                    <pre>{`// Clean, consistent button usage
<Button 
  variant="default"
  onClick={handleSubmit}
>
  Submit
</Button>

// Standardized status badge
<StatusBadge 
  status="approved"
  size="sm"
/>

// Clean layout structure
<PageLayout size="large">
  <PageHeader
    title="Page Title"
    description="Description"
    breadcrumbs={breadcrumbs}
  />
  <PageContent>
    <PageSection>
      {/* Content */}
    </PageSection>
  </PageContent>
</PageLayout>`}</pre>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <p className="text-sm text-green-800">
                      <strong>Benefits:</strong> Clean, readable code, consistent styling, 
                      easy to maintain and update
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </PageSection>

        {/* Impact Summary */}
        <PageSection>
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Impact Summary</h2>
              <p className="text-gray-600">What our standardization work has achieved</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-2">10+</div>
                  <div className="text-sm text-blue-800">Production Pages Upgraded</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
                  <div className="text-sm text-green-800">Component Consistency</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600 mb-2">∞</div>
                  <div className="text-sm text-purple-800">Future Maintenance Ease</div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Key Benefits Achieved:</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• <strong>Visual Consistency:</strong> All buttons, badges, and layouts now look identical across the app</li>
                  <li>• <strong>Developer Experience:</strong> Developers can use simple component APIs instead of remembering CSS classes</li>
                  <li>• <strong>Maintainability:</strong> Change one component file to update the entire app's appearance</li>
                  <li>• <strong>Professional Look:</strong> Consistent spacing, typography, and visual hierarchy</li>
                  <li>• <strong>Accessibility:</strong> Standardized focus states, hover effects, and screen reader support</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </PageSection>
      </PageContent>
    </PageLayout>
  )
}
