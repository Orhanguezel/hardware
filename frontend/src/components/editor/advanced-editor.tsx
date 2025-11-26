'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Heading1, 
  Heading2, 
  Heading3,
  Image as ImageIcon,
  Link as LinkIcon,
  Table as TableIcon,
  Plus,
  Minus,
  Check,
} from 'lucide-react'

interface AdvancedEditorProps {
  content?: string
  onChange?: (content: string) => void
  placeholder?: string
}

function AdvancedEditor({ content = '', onChange }: AdvancedEditorProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [imageAlt, setImageAlt] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4',
      },
    },
  }, [])

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl, alt: imageAlt }).run()
      setImageUrl('')
      setImageAlt('')
      setShowImageDialog(false)
    }
  }

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run()
      setLinkUrl('')
      setShowLinkDialog(false)
    }
  }

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  const addProsCons = () => {
    const prosConsHtml = `
      <div class="pros-cons-container my-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="pros bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 class="font-semibold text-green-800 mb-3 flex items-center">
              <span class="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm mr-2">+</span>
              Artılar
            </h4>
            <ul class="space-y-2">
              <li class="text-green-700">• Özellik 1</li>
              <li class="text-green-700">• Özellik 2</li>
              <li class="text-green-700">• Özellik 3</li>
            </ul>
          </div>
          <div class="cons bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 class="font-semibold text-red-800 mb-3 flex items-center">
              <span class="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm mr-2">-</span>
              Eksiler
            </h4>
            <ul class="space-y-2">
              <li class="text-red-700">• Eksik özellik 1</li>
              <li class="text-red-700">• Eksik özellik 2</li>
              <li class="text-red-700">• Eksik özellik 3</li>
            </ul>
          </div>
        </div>
      </div>
    `
    editor.chain().focus().insertContent(prosConsHtml).run()
  }

  const addCallout = () => {
    const calloutHtml = `
      <div class="callout bg-blue-50 border-l-4 border-blue-500 p-4 my-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-blue-800">Önemli Not</h3>
            <div class="mt-2 text-sm text-blue-700">
              <p>Burada önemli bir bilgi paylaşıyorsunuz.</p>
            </div>
          </div>
        </div>
      </div>
    `
    editor.chain().focus().insertContent(calloutHtml).run()
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="border-b bg-muted/50 p-2 flex flex-wrap gap-2">
        {/* Text Formatting */}
        <div className="flex gap-1 border-r pr-2 mr-2">
          <Button
            variant={editor.isActive('bold') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            variant={editor.isActive('italic') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="w-4 h-4" />
          </Button>
        </div>

        {/* Headings */}
        <div className="flex gap-1 border-r pr-2 mr-2">
          <Button
            variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          >
            <Heading1 className="w-4 h-4" />
          </Button>
          <Button
            variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <Heading2 className="w-4 h-4" />
          </Button>
          <Button
            variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            <Heading3 className="w-4 h-4" />
          </Button>
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-r pr-2 mr-2">
          <Button
            variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="w-4 h-4" />
          </Button>
        </div>

        {/* Quote */}
        <div className="flex gap-1 border-r pr-2 mr-2">
          <Button
            variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote className="w-4 h-4" />
          </Button>
        </div>

        {/* Media & Links */}
        <div className="flex gap-1 border-r pr-2 mr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowImageDialog(true)}
          >
            <ImageIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLinkDialog(true)}
          >
            <LinkIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={insertTable}
          >
            <TableIcon className="w-4 h-4" />
          </Button>
        </div>

        {/* Special Blocks */}
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={addProsCons}
            className="text-green-600 hover:text-green-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            <Minus className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={addCallout}
            className="text-blue-600 hover:text-blue-700"
          >
            <Check className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="min-h-[400px]">
        <EditorContent editor={editor} />
      </div>

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Link Ekle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="URL girin..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
                  İptal
                </Button>
                <Button onClick={addLink}>Ekle</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Image Dialog */}
      {showImageDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Resim Ekle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Resim URL'si..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <Input
                placeholder="Alt metin (opsiyonel)..."
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowImageDialog(false)}>
                  İptal
                </Button>
                <Button onClick={addImage}>Ekle</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default dynamic(() => Promise.resolve(AdvancedEditor), {
  ssr: false,
  loading: () => <div className="min-h-[400px] flex items-center justify-center border rounded-lg">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p>Editör yükleniyor...</p>
    </div>
  </div>
})
