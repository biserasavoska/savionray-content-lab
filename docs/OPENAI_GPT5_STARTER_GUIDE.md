# OpenAI GPT-5 Product Starter Guide

*Version: 2025-10-27*

This guide provides a comprehensive overview of the OpenAI GPT-5 ecosystem and best practices for building AI-powered products.

## 📚 **Key Resources**

### **Models & APIs**
- GPT-5: https://openai.com/gpt-5/
- Responses API: https://developers.openai.com/blog/responses-api/
- Realtime API: https://developers.openai.com/blog/realtime-api/
- Assistants API: https://platform.openai.com/docs/api-reference/assistants
- Files API: https://platform.openai.com/docs/api-reference/files

### **Documentation**
- Developer Hub: https://developers.openai.com/
- GPT-5 Documentation: https://openai.com/gpt-5/
- Cookbooks & Examples: https://cookbook.openai.com/

### **Tools & Features**
- Web Search: https://developers.openai.com/topics/tools/
- File Search: https://platform.openai.com/docs/guides/tools-file-search
- Image Generation: https://platform.openai.com/docs/guides/image-generation
- Computer Use: https://developers.openai.com/topics/cua/
- Agents SDK: https://developers.openai.com/tracks/building-agents/
- AgentKit: https://openai.com/index/introducing-agentkit/

### **Policy & Security**
- Usage Policies: https://openai.com/policies/usage-policies/
- Enterprise Privacy: https://openai.com/enterprise-privacy/
- Privacy Guide: https://help.openai.com/en/articles/10898952-openai-scope-of-privacy-and-closed-data

### **Pricing**
- Pricing: https://openai.com/api/pricing/
- Model Capabilities: https://openai.com/gpt-5/

## 🎯 **Current Implementation**

Our AI Assistant uses:
- **GPT-4o-mini** as the default model (fast and cost-effective)
- **Assistants API** with **File Search** for knowledge base integration
- **Real streaming** via OpenAI's streaming API
- **Knowledge Base** feature with PDF/document upload and search
- **Model Selection** UI with GPT-5 thinking modes

## 🔧 **Technical Architecture**

```
Client (React) → Chat Service → Chat Stream API → OpenAI Assistants/Chat API
                                    ↓
                              Knowledge Base (File Search)
```

### **File Search Integration**
1. Upload documents to **OpenAI Files API** (stored in `openaiFileId` field)
2. Create **Vector Store** with uploaded files
3. Create **Assistant** with `file_search` tool enabled
4. Stream responses from the Assistant
5. Assistant automatically searches and retrieves content from uploaded files

### **Key Files**
- `src/app/api/chat/stream/route.ts` - Main streaming endpoint
- `src/lib/openai-file-service.ts` - OpenAI Files API wrapper
- `src/components/ai-assistant/ChatGPTChatArea.tsx` - Chat interface
- `src/components/ai-assistant/KnowledgeBaseSidebar.tsx` - KB selector
- `src/lib/knowledge-base/knowledge-base-service.ts` - KB service

## 🚀 **Best Practices**

1. **Use built-in tools first** (web_search, file_search, code_interpreter)
2. **Optimize for latency**: Use `gpt-5-mini` for chatty interfaces
3. **Add reasoning controls**: Use `reasoning.effort` parameter (minimal/medium/high)
4. **Monitor costs**: Track token usage and optimize accordingly
5. **Implement guardrails**: Add safety checks and output filters
6. **Log everything**: Track tool calls, inputs, and outputs for debugging

## 📝 **Implementation Notes**

### **File Search**
- Files must be uploaded to OpenAI Files API with `purpose: 'assistants'`
- Vector stores are created per knowledge base request
- File content is automatically indexed and searchable
- Large files may take time to process

### **Streaming**
- Uses Server-Sent Events (SSE) format
- Events encoded with `data: ` prefix
- Completion signaled with `done: true`
- Full response saved to database after streaming

### **Authentication**
- Uses NextAuth.js for session management
- Session cookies required (`credentials: 'include'`)
- Organization-scoped access control

## 🔍 **Debugging**

Use the debug script to check document status:
```bash
node scripts/check-openai-files.js
```

This will show:
- Documents with/without OpenAI File IDs
- Document status and metadata
- Knowledge base associations

## ⚠️ **Known Issues**

1. **PDF Content Access**: Documents uploaded before OpenAI integration may lack `openaiFileId` and need to be re-uploaded
2. **Streaming Events**: Assistants API events must be formatted for SSE compatibility
3. **Model Selection**: Some models (GPT-5, O-series) are placeholders and map to available models

## 📚 **Additional Resources**

See `OPENAI_RESOURCES_COMPREHENSIVE.md` for more detailed documentation.

## 🎯 **Next Steps**

1. Implement **GPT-5 reasoning modes** when officially supported
2. Add **conversation state management** for multi-turn interactions
3. Implement **structured outputs** for consistent responses
4. Add **background mode** for long-running tasks
5. Integrate **monitoring and analytics** for production




