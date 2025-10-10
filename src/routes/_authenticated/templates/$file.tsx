import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Save, ArrowLeft, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Main } from '@/components/layout/main'
import { getTemplate, saveTemplate } from '@/features/hotspot/server/templates'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authenticated/templates/$file')({
  component: TemplateEditorPage,
})

function TemplateEditorPage() {
  const { file } = Route.useParams()
  const queryClient = useQueryClient()
  const [content, setContent] = useState('')

  // Load template
  const { data, isLoading } = useQuery({
    queryKey: ['template', file],
    queryFn: async () => {
      const result = await getTemplate({ data: { file } })
      setContent(result.content)
      return result
    },
  })

  console.log(data)

  // Save mutation
  const { mutate: save, isPending } = useMutation({
    mutationFn: async () => {
      return await saveTemplate({ data: { file, content } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template', file] })
      toast('Template saved successfully')
    },
    onError: (error) => {
      toast('Failed to save template')
    },
  })

  const handleSave = () => {
    save()
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
            <h1 className='text-3xl font-bold'>Edit Template</h1>
            <p className='text-muted-foreground'>{file}</p>
          </div>
        </div>
        <div className='flex gap-2'>
          <Button asChild variant='outline'>
            <Link to='/templates/preview/$file' params={{ file }}>
              <Eye className='mr-2 h-4 w-4' />
              Preview
            </Link>
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            <Save className='mr-2 h-4 w-4' />
            {isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Template Content</CardTitle>
          <CardDescription>
            Edit your Eta template. Use {'<%= it.variableName %>'} for
            variables.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='flex h-96 items-center justify-center'>
              <p className='text-muted-foreground'>Loading template...</p>
            </div>
          ) : (
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className='min-h-[600px] font-mono'
              placeholder='Enter your template content here...'
            />
          )}
        </CardContent>
      </Card>

      <Card className='mt-4'>
        <CardHeader>
          <CardTitle>Available Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid gap-2 font-mono text-sm'>
            <div>
              <code>{'<%= it.username %>'}</code> - Username
            </div>
            <div>
              <code>{'<%= it.password %>'}</code> - Password
            </div>
            <div>
              <code>{'<%= it.profile %>'}</code> - Profile name
            </div>
            <div>
              <code>{'<%= it.expiry %>'}</code> - Expiry date
            </div>
            <div>
              <code>{'<%= it.price %>'}</code> - Price
            </div>
            <div>
              <code>{'<% if (it.condition) { %> ... <% } %>'}</code> -
              Conditional
            </div>
            <div>
              <code>{'<% it.items.forEach(item => { %> ... <% }) %>'}</code> -
              Loop
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </Main>
  )
}
