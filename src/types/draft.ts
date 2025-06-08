export interface DraftMetadata {
  contentType: 'social-media' | 'blog' | 'newsletter'
}

export type DraftWithMetadata = {
  metadata: DraftMetadata | null
} 