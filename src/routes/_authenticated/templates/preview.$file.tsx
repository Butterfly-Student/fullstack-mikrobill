import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { renderTemplate } from '@/features/hotspot/server/templates';
import { Main } from '@/components/layout/main'
import { toast } from 'sonner';


export const Route = createFileRoute('/_authenticated/templates/preview/$file')({
  component: TemplatePreviewPage,
})

function TemplatePreviewPage() {
  const { file } = Route.useParams()

  // Sample data untuk preview
  const [previewData, setPreviewData] = useState([{
    username: 'user123',
    password: 'pass456',
    profile: '1-Day',
    expiry: '2025-10-09',
    price: '10000',
  }])

  const [renderedHtml, setRenderedHtml] = useState('')

  // Render mutation
  const { mutate: render, isPending } = useMutation({
    mutationFn: async () => {
      return await renderTemplate({
        data: {
          file,
          data: previewData,
        },
      })
    },
    onSuccess: (result) => {
      setRenderedHtml(result.html)
      toast.success('Template rendered successfully',)
    },
    onError: (error) => {
      toast('Failed to render template')
    },
  })

  const handlePreview = () => {
    render()
  }

  const handleInputChange = (field: string, value: string) => {
    setPreviewData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Main>
      <div className='container mx-auto py-8'>
      <div className='mb-6 flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button asChild variant='ghost' size='sm'>
            <Link to='/templates'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back
            </Link>
          </Button>
          <div>
            <h1 className='text-3xl font-bold'>Preview Template</h1>
            <p className='text-muted-foreground'>{file}</p>
          </div>
        </div>
        <Button asChild variant='outline'>
          <Link to='/templates/$file' params={{ file }}>
            Edit Template
          </Link>
        </Button>
      </div>

      <div className='grid gap-6 lg:grid-cols-2'>
        {/* Preview Data Form */}
        <Card>
          <CardHeader>
            <CardTitle>Preview Data</CardTitle>
            <CardDescription>
              Enter sample data to preview the template
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='username'>Username</Label>
              <Input
                id='username'
                value={previewData[0].username}
                onChange={(e) => handleInputChange('username', e.target.value)}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='password'>Password</Label>
              <Input
                id='password'
                value={previewData[0].password}
                onChange={(e) => handleInputChange('password', e.target.value)}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='profile'>Profile</Label>
              <Input
                id='profile'
                value={previewData[0].profile}
                onChange={(e) => handleInputChange('profile', e.target.value)}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='expiry'>Expiry</Label>
              <Input
                id='expiry'
                type='date'
                value={previewData[0].expiry}
                onChange={(e) => handleInputChange('expiry', e.target.value)}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='price'>Price</Label>
              <Input
                id='price'
                value={previewData[0].price}
                onChange={(e) => handleInputChange('price', e.target.value)}
              />
            </div>
            <Button
              onClick={handlePreview}
              disabled={isPending}
              className='w-full'
            >
              <RefreshCw className='mr-2 h-4 w-4' />
              {isPending ? 'Rendering...' : 'Render Preview'}
            </Button>
          </CardContent>
        </Card>

        {/* Preview Result */}
        <Card>
          <CardHeader>
            <CardTitle>Preview Result</CardTitle>
            <CardDescription>Rendered template output</CardDescription>
          </CardHeader>
          <CardContent>
            {renderedHtml ? (
              <div className='rounded-lg border bg-white p-4'>
                <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />
              </div>
            ) : (
              <div className='bg-muted/50 flex h-96 items-center justify-center rounded-lg border'>
                <p className='text-muted-foreground'>
                  Click "Render Preview" to see the result
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </Main>
  )
}