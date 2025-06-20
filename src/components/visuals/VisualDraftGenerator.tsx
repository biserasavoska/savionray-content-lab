'use client';

import { useState } from 'react';

interface VisualDraftGeneratorProps {
  ideaId: string;
  onGenerationComplete: () => void;
}

export function VisualDraftGenerator({ ideaId, onGenerationComplete }: VisualDraftGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);

    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      setIsGenerating(false);
      return;
    }

    try {
      const response = await fetch(`/api/ideas/${ideaId}/visuals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to generate visual draft.');
      }

      // Reset form and notify parent component
      setPrompt('');
      onGenerationComplete();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Visual Draft</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
            Image Prompt
          </label>
          <textarea
            id="prompt"
            name="prompt"
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A futuristic cityscape at sunset with flying cars..."
            disabled={isGenerating}
          />
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Image'}
          </button>
        </div>
      </form>
    </div>
  );
} 