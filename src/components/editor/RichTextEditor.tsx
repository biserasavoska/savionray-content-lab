'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  Code, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Image as ImageIcon,
  Link as LinkIcon,
  Table as TableIcon,
  Palette,
  Highlighter,
  Undo,
  Redo
} from 'lucide-react'

interface RichTextEditorProps {
  content: string
  onContentChange: (content: string) => void
  placeholder?: string
  disabled?: boolean
  isCollaborating?: boolean
  onCursorChange?: (position: number) => void
}

const MenuBar = ({ editor }: { editor: any }) => {
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [showImageInput, setShowImageInput] = useState(false)
  const [imageUrl, setImageUrl] = useState('')

  if (!editor) {
    return null
  }

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run()
      setLinkUrl('')
      setShowLinkInput(false)
    }
  }

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run()
      setImageUrl('')
      setShowImageInput(false)
    }
  }

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  return (
    <div className="border-b bg-gray-50 p-2">
      <div className="flex flex-wrap items-center gap-1">
        {/* Text Formatting */}
        <div className="flex items-center gap-1 border-r pr-2">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-blue-100 text-blue-700' : ''}`}
            title="Bold"
          >
            <Bold size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-blue-100 text-blue-700' : ''}`}
            title="Italic"
          >
            <Italic size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('underline') ? 'bg-blue-100 text-blue-700' : ''}`}
            title="Underline"
          >
            <UnderlineIcon size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('strike') ? 'bg-blue-100 text-blue-700' : ''}`}
            title="Strikethrough"
          >
            <Strikethrough size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('code') ? 'bg-blue-100 text-blue-700' : ''}`}
            title="Code"
          >
            <Code size={16} />
          </button>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-1 border-r pr-2">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 1 }) ? 'bg-blue-100 text-blue-700' : ''}`}
            title="Heading 1"
          >
            <Heading1 size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-100 text-blue-700' : ''}`}
            title="Heading 2"
          >
            <Heading2 size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 3 }) ? 'bg-blue-100 text-blue-700' : ''}`}
            title="Heading 3"
          >
            <Heading3 size={16} />
          </button>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 border-r pr-2">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-blue-100 text-blue-700' : ''}`}
            title="Bullet List"
          >
            <List size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-blue-100 text-blue-700' : ''}`}
            title="Numbered List"
          >
            <ListOrdered size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('blockquote') ? 'bg-blue-100 text-blue-700' : ''}`}
            title="Quote"
          >
            <Quote size={16} />
          </button>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-1 border-r pr-2">
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'left' }) ? 'bg-blue-100 text-blue-700' : ''}`}
            title="Align Left"
          >
            <AlignLeft size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'center' }) ? 'bg-blue-100 text-blue-700' : ''}`}
            title="Align Center"
          >
            <AlignCenter size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'right' }) ? 'bg-blue-100 text-blue-700' : ''}`}
            title="Align Right"
          >
            <AlignRight size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'justify' }) ? 'bg-blue-100 text-blue-700' : ''}`}
            title="Justify"
          >
            <AlignJustify size={16} />
          </button>
        </div>

        {/* Media & Tables */}
        <div className="flex items-center gap-1 border-r pr-2">
          <button
            onClick={() => setShowImageInput(true)}
            className="p-2 rounded hover:bg-gray-200"
            title="Insert Image"
          >
            <ImageIcon size={16} />
          </button>
          <button
            onClick={() => setShowLinkInput(true)}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('link') ? 'bg-blue-100 text-blue-700' : ''}`}
            title="Insert Link"
          >
            <LinkIcon size={16} />
          </button>
          <button
            onClick={addTable}
            className="p-2 rounded hover:bg-gray-200"
            title="Insert Table"
          >
            <TableIcon size={16} />
          </button>
        </div>

        {/* Colors */}
        <div className="flex items-center gap-1 border-r pr-2">
          <button
            onClick={() => editor.chain().focus().setColor('#958DF1').run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('textStyle') ? 'bg-blue-100 text-blue-700' : ''}`}
            title="Text Color"
          >
            <Palette size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('highlight') ? 'bg-blue-100 text-blue-700' : ''}`}
            title="Highlight"
          >
            <Highlighter size={16} />
          </button>
        </div>

        {/* History */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
            title="Undo"
          >
            <Undo size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
            title="Redo"
          >
            <Redo size={16} />
          </button>
        </div>
      </div>

      {/* Link Input Modal */}
      {showLinkInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full p-2 border rounded mb-4"
              onKeyPress={(e) => e.key === 'Enter' && addLink()}
            />
            <div className="flex gap-2">
              <button
                onClick={addLink}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Insert
              </button>
              <button
                onClick={() => setShowLinkInput(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Input Modal */}
      {showImageInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Insert Image</h3>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full p-2 border rounded mb-4"
              onKeyPress={(e) => e.key === 'Enter' && addImage()}
            />
            <div className="flex gap-2">
              <button
                onClick={addImage}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Insert
              </button>
              <button
                onClick={() => setShowImageInput(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function RichTextEditor({
  content,
  onContentChange,
  placeholder = 'Start writing your content here...',
  disabled = false,
  isCollaborating = false,
  onCursorChange
}: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Image.configure({
        allowBase64: true,
        inline: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    editable: !disabled,
    immediatelyRender: false, // Fix SSR hydration issues
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onContentChange(html)
    },
    onSelectionUpdate: ({ editor }) => {
      if (onCursorChange) {
        const { from } = editor.state.selection
        onCursorChange(from)
      }
    },
  })

  // Update content when prop changes (for real-time collaboration)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false)
    }
  }, [content, editor])

  // Update editable state when disabled prop changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled)
    }
  }, [disabled, editor])

  if (!isMounted || !editor) {
    return (
      <div className="border border-gray-300 rounded-md">
        <div className="p-4 min-h-[200px] flex items-center justify-center text-gray-500 bg-gray-50">
          Loading editor...
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <MenuBar editor={editor} />
      
      {/* Collaboration indicator */}
      {isCollaborating && (
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1 border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Live
          </div>
        </div>
      )}

      <div className="relative">
        <EditorContent 
          editor={editor} 
          className="prose max-w-none p-4 min-h-[400px] focus:outline-none"
        />
        
        {/* Bubble menu for quick formatting */}
        {editor && (
          <BubbleMenu 
            editor={editor} 
            tippyOptions={{ duration: 100 }}
            className="bg-white border rounded-lg shadow-lg p-1 flex items-center gap-1"
          >
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-1 rounded hover:bg-gray-100 ${editor.isActive('bold') ? 'bg-blue-100' : ''}`}
            >
              <Bold size={14} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-1 rounded hover:bg-gray-100 ${editor.isActive('italic') ? 'bg-blue-100' : ''}`}
            >
              <Italic size={14} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-1 rounded hover:bg-gray-100 ${editor.isActive('underline') ? 'bg-blue-100' : ''}`}
            >
              <UnderlineIcon size={14} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              className={`p-1 rounded hover:bg-gray-100 ${editor.isActive('highlight') ? 'bg-blue-100' : ''}`}
            >
              <Highlighter size={14} />
            </button>
          </BubbleMenu>
        )}

        {/* Floating menu for adding content */}
        {editor && (
          <FloatingMenu 
            editor={editor} 
            tippyOptions={{ duration: 100 }}
            className="bg-white border rounded-lg shadow-lg p-1"
          >
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className="block w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
            >
              Heading 1
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className="block w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
            >
              Heading 2
            </button>
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className="block w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
            >
              Bullet List
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className="block w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
            >
              Numbered List
            </button>
            <button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className="block w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
            >
              Quote
            </button>
          </FloatingMenu>
        )}
      </div>
    </div>
  )
} 