# Database Cleanup Commands

## Your Database Connection
```bash
psql "postgresql://postgres:Bisera24@localhost:5432/savionray_content_lab"
```

## View Commands

### See all ideas
```sql
SELECT id, title, status, "createdAt" 
FROM "Idea" 
ORDER BY "createdAt" DESC;
```

### See all drafts for a specific idea
```sql
SELECT id, status, "createdAt" 
FROM "ContentDraft" 
WHERE "ideaId" = 'YOUR_IDEA_ID_HERE';
```

### See drafts for approved ideas
```sql
SELECT cd.id, cd.status, i.title as idea_title 
FROM "ContentDraft" cd 
JOIN "Idea" i ON cd."ideaId" = i.id 
WHERE i.status = 'APPROVED';
```

## Delete Commands

### Delete a specific draft (by ID)
```sql
DELETE FROM "ContentDraft" WHERE id = 'YOUR_DRAFT_ID_HERE';
```

### Delete all drafts for a specific idea (except published)
```sql
DELETE FROM "ContentDraft" 
WHERE "ideaId" = 'YOUR_IDEA_ID_HERE' 
AND status != 'PUBLISHED';
```

### Delete a specific idea (this will also delete its drafts)
```sql
DELETE FROM "Idea" WHERE id = 'YOUR_IDEA_ID_HERE';
```

### Change draft status to REJECTED (soft delete)
```sql
UPDATE "ContentDraft" 
SET status = 'REJECTED' 
WHERE "ideaId" = 'YOUR_IDEA_ID_HERE' 
AND status != 'PUBLISHED';
```

## Example: If you reject an approved idea and want to clean up drafts

1. Find the idea:
```sql
SELECT id, title FROM "Idea" WHERE title LIKE '%keyword%';
```

2. Update idea status:
```sql
UPDATE "Idea" SET status = 'REJECTED' WHERE id = 'idea-id-here';
```

3. Delete or reject its drafts:
```sql
DELETE FROM "ContentDraft" 
WHERE "ideaId" = 'idea-id-here' 
AND status != 'PUBLISHED';
```

## Safety Tips
- Always SELECT first to see what you're about to delete
- Use transactions for complex operations (BEGIN; ... COMMIT; or ROLLBACK;)
- Backup important data before deleting



