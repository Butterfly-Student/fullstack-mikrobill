"use client"

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { showSubmittedData } from "@/lib/show-submitted-data"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  file: z
    .instanceof(FileList)
    .refine((files) => files?.length === 1, "File wajib dipilih.")
    .refine((files) => files?.[0]?.type === "text/csv", "File harus berformat CSV."),
})

type TemplateTagihanImportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TemplateTagihanImportDialog({ open, onOpenChange }: TemplateTagihanImportDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  const fileRef = form.register("file")

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    onOpenChange(false)
    form.reset()
    showSubmittedData(data)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        form.reset()
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Template Tagihan</DialogTitle>
          <DialogDescription>Import template tagihan dari CSV.</DialogDescription>
        </DialogHeader>
        <form id="template-tagihan-import-form" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <Form {...form}>
              <FormField
                control={form.control}
                name="file"
                render={() => (
                  <FormItem>
                    <FormLabel>File CSV</FormLabel>
                    <FormControl>
                      <Input type="file" accept=".csv" {...fileRef} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Form>
          </div>
        </form>
        <DialogFooter>
          <Button type="submit" form="template-tagihan-import-form">
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
