'use client'

import Button from '@/components/ui/common/Button'

export default function TestSimplePage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Simple Test Page</h1>
      <p>This is a basic test page to verify routing works.</p>
      <Button 
        onClick={() => alert('Button clicked!')}
        variant="default"
        className="mt-4"
      >
        Test Button
      </Button>
    </div>
  )
}
