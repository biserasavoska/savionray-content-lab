'use client';

import { useRouter } from 'next/navigation';
import { VisualDraftGenerator } from './VisualDraftGenerator';
import { VisualDraftsList } from './VisualDraftsList';
import { Idea, VisualDraft } from '@prisma/client';

interface VisualDraftsSectionProps {
  idea: Idea;
  visualDrafts: (VisualDraft & { createdBy: { name: string | null; email: string | null } })[];
}

export function VisualDraftsSection({ idea, visualDrafts }: VisualDraftsSectionProps) {
  const router = useRouter();

  const handleGenerationComplete = () => {
    // Refresh the page to fetch the new list of visual drafts
    router.refresh();
  };

  return (
    <div className="mt-10">
      <div className="mb-8">
        <VisualDraftGenerator
          ideaId={idea.id}
          onGenerationComplete={handleGenerationComplete}
        />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Generated Visuals</h2>
      <VisualDraftsList visualDrafts={visualDrafts} />
    </div>
  );
} 