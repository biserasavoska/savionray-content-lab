import OpenAI from 'openai'

export class OpenAIFileService {
  private openai: OpenAI

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured')
    }
    this.openai = new OpenAI({ apiKey })
  }

  /**
   * Upload a file to OpenAI Files API
   * @param fileBuffer - The file buffer
   * @param filename - The file name
   * @returns The OpenAI file object
   */
  async uploadFile(fileBuffer: Buffer, filename: string): Promise<any> {
    try {
      console.log(`📤 Uploading file to OpenAI: ${filename}`)
      
      // Create a blob from buffer
      const blob = new Blob([fileBuffer])
      const file = new File([blob], filename)

      // Upload to OpenAI
      const openaiFile = await this.openai.files.create({
        file: file,
        purpose: 'assistants', // For use with Assistants API
      })

      console.log(`✅ File uploaded successfully: ${openaiFile.id}`)
      return openaiFile
    } catch (error) {
      console.error('❌ Error uploading file to OpenAI:', error)
      throw error
    }
  }

  /**
   * Delete a file from OpenAI
   * @param fileId - The OpenAI file ID
   */
  async deleteFile(fileId: string): Promise<void> {
    try {
      await this.openai.files.del(fileId)
      console.log(`🗑️  Deleted file from OpenAI: ${fileId}`)
    } catch (error) {
      console.error('❌ Error deleting file from OpenAI:', error)
      throw error
    }
  }

  /**
   * Get file content from OpenAI
   * @param fileId - The OpenAI file ID
   * @returns The file content
   */
  async getFileContent(fileId: string): Promise<any> {
    try {
      return await this.openai.files.content(fileId)
    } catch (error) {
      console.error('❌ Error getting file content from OpenAI:', error)
      throw error
    }
  }
}

export const openAIFileService = new OpenAIFileService()
