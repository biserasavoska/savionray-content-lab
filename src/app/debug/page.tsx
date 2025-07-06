export default function DebugPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Information</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Environment Variables</h2>
          <div className="bg-gray-100 p-4 rounded">
            <p><strong>NEXTAUTH_SECRET:</strong> {process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing'}</p>
            <p><strong>NEXTAUTH_URL:</strong> {process.env.NEXTAUTH_URL || '❌ Missing'}</p>
            <p><strong>DATABASE_URL:</strong> {process.env.DATABASE_URL ? '✅ Set' : '❌ Missing'}</p>
            <p><strong>OPENAI_API_KEY:</strong> {process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing'}</p>
            <p><strong>LINKEDIN_CLIENT_ID:</strong> {process.env.LINKEDIN_CLIENT_ID ? '✅ Set' : '❌ Missing'}</p>
            <p><strong>LINKEDIN_CLIENT_SECRET:</strong> {process.env.LINKEDIN_CLIENT_SECRET ? '✅ Set' : '❌ Missing'}</p>
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold">System Status</h2>
          <div className="bg-gray-100 p-4 rounded">
            <p><strong>Node Environment:</strong> {process.env.NODE_ENV}</p>
            <p><strong>Build Time:</strong> {new Date().toISOString()}</p>
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold">Quick Links</h2>
          <div className="space-x-4">
            <a href="/" className="text-blue-500 hover:underline">Home Page</a>
            <a href="/test" className="text-blue-500 hover:underline">Test Page</a>
            <a href="/auth/signin" className="text-blue-500 hover:underline">Sign In</a>
          </div>
        </div>
      </div>
    </div>
  )
} 