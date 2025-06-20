import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  maxLength?: number
  className?: string
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = 'Start writing...',
  maxLength,
  className = '',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-red-600 hover:text-red-800 underline',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      ...(maxLength ? [CharacterCount.configure({ limit: maxLength })] : []),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) {
    return null
  }

  const characterCount = editor.storage.characterCount?.characters() ?? 0
  const characterLimit = maxLength ?? 0

  return (
    <div className={`relative ${className}`}>
      <div className="border rounded-md focus-within:ring-2 focus-within:ring-red-500 focus-within:border-red-500">
        <div className="flex flex-wrap gap-2 border-b p-2">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1 rounded ${
              editor.isActive('bold')
                ? 'bg-gray-200'
                : 'hover:bg-gray-100'
            }`}
            title="Bold"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1 rounded ${
              editor.isActive('italic')
                ? 'bg-gray-200'
                : 'hover:bg-gray-100'
            }`}
            title="Italic"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 4h-9M14 20H5M15 4L9 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1 rounded ${
              editor.isActive('bulletList')
                ? 'bg-gray-200'
                : 'hover:bg-gray-100'
            }`}
            title="Bullet List"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1 rounded ${
              editor.isActive('orderedList')
                ? 'bg-gray-200'
                : 'hover:bg-gray-100'
            }`}
            title="Numbered List"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 6h11M10 12h11M10 18h11M4 6h1v4M4 10h1M4 16h1c.667 0 1-.333 1-1s-.333-1-1-1H4v4h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <button
            onClick={() => {
              const url = window.prompt('Enter URL')
              if (url) {
                editor.chain().focus().setLink({ href: url }).run()
              }
            }}
            className={`p-1 rounded ${
              editor.isActive('link')
                ? 'bg-gray-200'
                : 'hover:bg-gray-100'
            }`}
            title="Add Link"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <EditorContent 
          editor={editor} 
          className="prose max-w-none p-4 min-h-[200px] focus:outline-none"
        />
      </div>

      {maxLength && (
        <div className="absolute bottom-2 right-2 text-sm text-gray-500">
          {characterCount}/{characterLimit} characters
        </div>
      )}
    </div>
  )
} 