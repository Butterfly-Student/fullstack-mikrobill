import { createFileRoute, Link } from '@tanstack/react-router'
import { FileText, Eye, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Main } from '@/components/layout/main'

// Daftar template yang tersedia
const templates = [
  {
    file: 'voucher.eta',
    name: 'Voucher Template',
    description: 'Template untuk print voucher hotspot',
  },
  {
    file: 'receipt.eta',
    name: 'Receipt Template',
    description: 'Template untuk struk pembayaran',
  },
  {
    file: 'batch-voucher.eta',
    name: 'Batch Voucher Template',
    description: 'Template untuk print multiple vouchers',
  },
]

export const Route = createFileRoute('/_authenticated/templates/')({
  component: TemplateListPage,
})

function TemplateListPage() {
  return (
    <Main>
      <div className='container mx-auto py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold'>Templates</h1>
        <p className='text-muted-foreground mt-2'>
          Manage your template files for vouchers and receipts
        </p>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {templates.map((template) => (
          <Card key={template.file}>
            <CardHeader>
              <div className='flex items-start justify-between'>
                <FileText className='text-muted-foreground h-8 w-8' />
              </div>
              <CardTitle className='mt-4'>{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='flex gap-2'>
                <Button asChild variant='outline' size='sm' className='flex-1'>
                  <Link
                    to='/templates/preview/$file'
                    params={{ file: template.file }}
                  >
                    <Eye className='mr-2 h-4 w-4' />
                    Preview
                  </Link>
                </Button>
                <Button asChild size='sm' className='flex-1'>
                  <Link to='/templates/$file' params={{ file: template.file }}>
                    <Edit className='mr-2 h-4 w-4' />
                    Edit
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
    </Main>
  )
}
