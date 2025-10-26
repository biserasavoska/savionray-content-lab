# Phase 2: OpenAI File Search API Implementation Plan

## 🎯 **Goal**
Integrate OpenAI's File Search API to enable the AI to access the actual content of uploaded PDF documents, not just metadata.

## 📋 **Current Status**
- ✅ Knowledge base UI is working
- ✅ Document upload is working
- ✅ Document metadata is stored
- ❌ AI cannot access actual PDF content

## 🔧 **Solution: OpenAI File Search API**

### **How It Works:**
1. Upload files to OpenAI's Files API
2. Create an Assistant with File Search tool enabled
3. Files are automatically indexed by OpenAI
4. AI can search and retrieve content from uploaded files
5. Full text extraction happens on OpenAI's side

### **Implementation Steps:**

#### **1. Upload Files to OpenAI**
```typescript
// Upload PDF to OpenAI Files API
const openai = new OpenAI()
const file = await openai.files.create({
  file: pdfFileBuffer,
  purpose: 'assistants',
})
```

#### **2. Store OpenAI File ID**
Update `KnowledgeDocument` schema to include:
- `openaiFileId: String?` - Store the OpenAI file ID
- Store this when file is uploaded to OpenAI

#### **3. Use Assistants API Instead of Chat API**
Replace our current chat streaming approach with Assistants API when knowledge base is selected:
- Create an Assistant with the knowledge base files
- Use the Assistant's file search capabilities
- Stream responses from the Assistant

#### **4. Modify Chat Stream API**
Update `/api/chat/stream/route.ts` to:
- Check if knowledge base is selected
- If yes, use Assistants API with File Search
- If no, use regular Chat API

## 📚 **Resources**
- [File Search Guide](https://platform.openai.com/docs/guides/tools-file-search)
- [PDF Files Handling](https://platform.openai.com/docs/guides/pdf-files?api-mode=responses)
- [Assistants API](https://platform.openai.com/docs/api-reference/assistants)
- [Files API](https://platform.openai.com/docs/api-reference/files)

## ⏱️ **Estimated Time**
- Implementation: 2-3 hours
- Testing: 1 hour
- Total: 3-4 hours

## 🚀 **Next Steps**
1. Add `openaiFileId` field to KnowledgeDocument schema
2. Create file upload service to OpenAI
3. Update document processor to upload files to OpenAI
4. Modify chat API to use Assistants API when KB is selected
5. Test PDF content extraction
6. Deploy to staging

Ready to implement?
