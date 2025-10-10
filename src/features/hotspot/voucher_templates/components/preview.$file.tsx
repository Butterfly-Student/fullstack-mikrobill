import { useEffect, useState } from 'react'
import { renderTemplate } from '../../server/templates'

export default function PreviewPage({ params }) {
  const [html, setHtml] = useState('')

  useEffect(() => {
    async function load() {
      const res = await renderTemplate({
        data: {
          file: `${params.file}.html`,
          data: { username: 'Iqmam', ip: '192.168.1.1', plan: 'Unlimited' },
        },
      })
      if (res.success) setHtml(res.html)
    }
    load()
  }, [params.file])

  return (
    <div className='bg-white p-8'>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <button
        onClick={() => window.print()}
        className='mt-4 rounded border p-2'
      >
        🖨️ Print
      </button>
    </div>
  )
}
