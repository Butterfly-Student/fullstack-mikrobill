import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { getTemplate, renderTemplate, saveTemplate } from '../server/templates'

export default function TemplateEditorPage() {
  const [file, setFile] = useState('invoice.html')
  const [content, setContent] = useState('')
  const [preview, setPreview] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    async function load() {
      const res = await getTemplate({ data: { file } })
      if (res.success) setContent(res.content)
    }
    load()
  }, [file])

  const handleSave = async () => {
    const res = await saveTemplate({ data: { file, content } })
    setStatus(res.message)
  }

  const handlePreview = async () => {
    const res = await renderTemplate({
      data: {
        file,
        data: { username: 'Iqmam', ip: '192.168.1.1', plan: 'Premium' },
      },
    })
    if (res.success) setPreview(res.html)
  }

  return (
    <div className='space-y-4 p-6'>
      <h1 className='text-xl font-bold'>🧩 Template Editor</h1>

      <div className='flex gap-2'>
        <select
          value={file}
          onChange={(e) => setFile(e.target.value)}
          className='rounded border p-2'
        >
          <option value='invoice.html'>invoice.html</option>
          <option value='user_card.html'>user_card.html</option>
          <option value='hotspot.html'>hotspot.html</option>
        </select>
        <Button onClick={handleSave}>💾 Save</Button>
        <Button onClick={handlePreview}>👁️ Preview</Button>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={18}
        className='w-full rounded border p-2 font-mono text-sm'
      />

      {status && <p className='text-green-600'>{status}</p>}

      {preview && (
        <div
          className='mt-4 rounded border bg-gray-50 p-4'
          dangerouslySetInnerHTML={{ __html: preview }}
        />
      )}
    </div>
  )
}
