"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { type TemplateTagihan, type TemplateTagihanForm, templateTagihanFormSchema } from "../data/schema"
import { useTemplateTagihan } from "../hooks/template_tagihan" // Import hook

type TemplateTagihanMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: TemplateTagihan
}


export function TemplateTagihanMutateDrawer({ open, onOpenChange, currentRow }: TemplateTagihanMutateDrawerProps) {
  const isUpdate = !!currentRow

  // Gunakan hook untuk mutations
  const { addTemplateTagihan, updateTemplateTagihan, isAdding, isUpdating } = useTemplateTagihan()

  const form = useForm<TemplateTagihanForm>({
    resolver: zodResolver(templateTagihanFormSchema),
    defaultValues: currentRow ?? {
      nama: "",
      deskripsi: "",
      jumlah: "",
      periode: "bulanan",
      tanggalMulai: "",
      jatuhTempo: "",
      aktif: true,
    },
  })

  const onSubmit = async (data: TemplateTagihanForm) => {
    try {

      if (isUpdate && currentRow) {
        // Update template tagihan
        await updateTemplateTagihan.mutateAsync({
          templateId: currentRow.id,
          templateData: data,
        })
      } else {
        // Create template tagihan baru
        await addTemplateTagihan.mutateAsync(data)
      }

      // Close drawer dan reset form setelah berhasil
      onOpenChange(false)
      form.reset()
    } catch (error) {
      // Error handling sudah ditangani di hook via toast
      console.error('Error submitting template tagihan:', error)
    }
  }

  // Determine loading state
  const isSubmitting = isAdding || isUpdating

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!isSubmitting) { // Prevent closing while submitting
          onOpenChange(v)
          form.reset()
        }
      }}
    >
      <SheetContent className="flex flex-col">
        <SheetHeader className="text-start">
          <SheetTitle>{isUpdate ? "Update" : "Create"} Template Tagihan</SheetTitle>
          <SheetDescription>
            {isUpdate ? "Perbarui template tagihan." : "Tambahkan template tagihan baru."} Klik save saat selesai.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id="template-tagihan-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 space-y-6 overflow-y-auto px-4"
          >
            <FormField
              control={form.control}
              name="nama"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Template</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nama template tagihan" disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deskripsi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Deskripsi template" rows={3} disabled={isSubmitting} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="jumlah"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="0.00" inputMode="decimal" disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="periode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Periode</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value ?? undefined}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih periode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="harian">Harian</SelectItem>
                      <SelectItem value="mingguan">Mingguan</SelectItem>
                      <SelectItem value="bulanan">Bulanan</SelectItem>
                      <SelectItem value="tahunan">Tahunan</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="tanggalMulai"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Mulai</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jatuhTempo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jatuh Tempo</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" disabled={isSubmitting} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="aktif"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Status Aktif</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Template akan digunakan untuk generate tagihan otomatis
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value ?? true}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>

        <SheetFooter className="gap-2">
          <SheetClose asChild>
            <Button variant="outline" disabled={isSubmitting}>
              Close
            </Button>
          </SheetClose>
          <Button
            form="template-tagihan-form"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? (isUpdate ? "Updating..." : "Creating...")
              : "Save changes"
            }
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}