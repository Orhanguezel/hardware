'use client'

import { useState, useEffect, useRef } from 'react'
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
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
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
  Check,
  Upload,
  Loader2
} from 'lucide-react'

interface RichEditorProps {
  content?: string
  onChange?: (content: string) => void
  placeholder?: string
}

export default function RichEditor({ content = '', onChange}: RichEditorProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [imageAlt, setImageAlt] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer hover:text-blue-800',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse border border-gray-300',
        },
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
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-6 border rounded-lg',
      },
    },
  }, [])

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-64 border rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        editor.chain().focus().setImage({ src: result.url, alt: imageAlt || file.name }).run()
        setImageUrl('')
        setImageAlt('')
        setShowImageDialog(false)
        toast.success('Fotoğraf başarıyla yüklendi')
      } else {
        toast.error(result.error || 'Fotoğraf yüklenirken hata oluştu')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Fotoğraf yüklenirken hata oluştu')
    } finally {
      setIsUploading(false)
    }
  }

  const addImageFromUrl = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl, alt: imageAlt }).run()
      setImageUrl('')
      setImageAlt('')
      setShowImageDialog(false)
      toast.success('Fotoğraf eklendi')
    }
  }

  const addLink = () => {
    if (linkUrl) {
      if (linkText) {
        editor.chain().focus().insertContent(`<a href="${linkUrl}">${linkText}</a>`).run()
      } else {
        editor.chain().focus().setLink({ href: linkUrl }).run()
      }
      setLinkUrl('')
      setLinkText('')
      setShowLinkDialog(false)
      toast.success('Link eklendi')
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
      <div class="callout bg-blue-50 border-l-4 border-blue-400 p-4 my-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-blue-700">
              <strong>Önemli:</strong> Bu bilgiyi dikkate alın.
            </p>
          </div>
        </div>
      </div>
    `
    editor.chain().focus().insertContent(calloutHtml).run()
  }

  const addCodeBlock = () => {
    editor.chain().focus().toggleCodeBlock().run()
  }

  const addQuote = () => {
    editor.chain().focus().toggleBlockquote().run()
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {/* Text Formatting */}
            <div className="flex gap-1 border-r pr-2 mr-2">
              <Button
                variant={editor.isActive('bold') ? 'default' : 'outline'}
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant={editor.isActive('italic') ? 'default' : 'outline'}
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
              >
                <Italic className="h-4 w-4" />
              </Button>
            </div>

            {/* Headings */}
            <div className="flex gap-1 border-r pr-2 mr-2">
              <Button
                variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'outline'}
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              >
                <Heading1 className="h-4 w-4" />
              </Button>
              <Button
                variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'outline'}
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              >
                <Heading2 className="h-4 w-4" />
              </Button>
              <Button
                variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'outline'}
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              >
                <Heading3 className="h-4 w-4" />
              </Button>
            </div>

            {/* Lists */}
            <div className="flex gap-1 border-r pr-2 mr-2">
              <Button
                variant={editor.isActive('bulletList') ? 'default' : 'outline'}
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={editor.isActive('orderedList') ? 'default' : 'outline'}
                size="sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
            </div>

            {/* Special Elements */}
            <div className="flex gap-1 border-r pr-2 mr-2">
              <Button
                variant="outline"
                size="sm"
                onClick={addQuote}
              >
                <Quote className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={addCodeBlock}
              >
                <code className="text-xs">{"</>"}</code>
              </Button>
            </div>

            {/* Media */}
            <div className="flex gap-1 border-r pr-2 mr-2">
              <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Fotoğraf Ekle</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Dosya Yükle</Label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleFileUpload(file)
                          }
                        }}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="w-full"
                      >
                        {isUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Upload className="h-4 w-4 mr-2" />
                        )}
                        Fotoğraf Yükle
                      </Button>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">veya</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>URL ile Ekle</Label>
                      <Input
                        placeholder="https://example.com/image.jpg"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                      />
                      <Input
                        placeholder="Alt text (opsiyonel)"
                        value={imageAlt}
                        onChange={(e) => setImageAlt(e.target.value)}
                      />
                      <Button onClick={addImageFromUrl} className="w-full">
                        Fotoğraf Ekle
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Link Ekle</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>URL</Label>
                      <Input
                        placeholder="https://example.com"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Link Metni (opsiyonel)</Label>
                      <Input
                        placeholder="Görüntülenecek metin"
                        value={linkText}
                        onChange={(e) => setLinkText(e.target.value)}
                      />
                    </div>
                    <Button onClick={addLink} className="w-full">
                      Link Ekle
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                variant="outline"
                size="sm"
                onClick={insertTable}
              >
                <TableIcon className="h-4 w-4" />
              </Button>
            </div>

            {/* Templates */}
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={addProsCons}
              >
                <Plus className="h-4 w-4 mr-1" />
                Artı/Eksi
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={addCallout}
              >
                <Check className="h-4 w-4 mr-1" />
                Uyarı
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editor */}
      <Card>
        <CardContent className="p-0">
          <EditorContent editor={editor} />
        </CardContent>
      </Card>

      {/* Character Count */}
      <div className="text-sm text-muted-foreground text-right">
        {editor.storage.characterCount?.characters() || 0} karakter
      </div>
    </div>
  )
}
