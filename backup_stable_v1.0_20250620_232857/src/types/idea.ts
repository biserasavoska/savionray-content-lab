import { Idea, User, Feedback, ContentDraft, IdeaComment } from '@prisma/client';

export type IdeaWithCreator = Idea & {
  createdBy: Pick<User, 'name' | 'email'>;
  feedbacks?: (Feedback & {
    createdBy: Pick<User, 'name' | 'email'>;
  })[];
  contentDrafts: (ContentDraft & {
    createdBy: Pick<User, 'name' | 'email'>;
    feedbacks: (Feedback & {
      createdBy: Pick<User, 'name' | 'email'>;
    })[];
  })[];
  comments: (IdeaComment & {
    createdBy: Pick<User, 'name' | 'email'>;
  })[];
}; 