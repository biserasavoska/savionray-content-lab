"use client";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body style={{ padding: 40, fontFamily: 'sans-serif' }}>
        <h2>Something went wrong!</h2>
        <pre style={{ color: 'red' }}>{error.message}</pre>
        <button onClick={() => reset()} style={{ marginTop: 20 }}>Try again</button>
      </body>
    </html>
  );
} 