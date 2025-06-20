import { VisualDraft } from '@prisma/client';
import Image from 'next/image';

interface VisualDraftsListProps {
  visualDrafts: (VisualDraft & { createdBy: { name: string | null; email: string | null } })[];
}

export function VisualDraftsList({ visualDrafts }: VisualDraftsListProps) {
  if (visualDrafts.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-sm text-gray-500">No visual drafts have been generated for this idea yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {visualDrafts.map((draft) => (
        <div key={draft.id} className="group relative bg-white border rounded-lg shadow-sm overflow-hidden">
          <div className="relative w-full h-48 bg-gray-200">
            <Image
              src={draft.imageUrl}
              alt={(draft.metadata as any)?.prompt || 'Generated visual draft'}
              layout="fill"
              objectFit="cover"
              className="transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-600 truncate" title={(draft.metadata as any)?.prompt}>
              <strong>Prompt:</strong> {(draft.metadata as any)?.prompt || 'No prompt provided'}
            </p>
            <div className="mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                draft.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {draft.status}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 