"use client"

import { type z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/date-picker"
import { type Kas, kasFormSchema } from "../data/schema"
import { useKas } from "../hooks/kas" // Import hook yang sudah dibuat
import { Loader2 } from "lucide-react"

type KasMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Kas
}

type KasForm = z.infer<typeof kasFormSchema>

export function KasMutateDrawer({ open, onOpenChange, currentRow }: KasMutateDrawerProps) {
  const isUpdate = !!currentRow

  // Gunakan hook useKas
  const { addKas, updateKas, isAdding, isUpdating } = useKas()

  // Loading state untuk submit button
  const isSubmitting = isAdding || isUpdating

  const form = useForm<KasForm>({
    resolver: zodResolver(kasFormSchema),
    defaultValues: {
      tanggal: new Date(),
      keterangan: "",
      jenis: "masuk",
      jumlah: "",
    },
  })

  // Reset form ketika currentRow berubah atau drawer dibuka
  useEffect(() => {
    if (open) {
      if (currentRow) {
        form.reset({
          tanggal: currentRow.tanggal ? new Date(currentRow.tanggal) : undefined,
          keterangan: currentRow.keterangan || "",
          jenis: currentRow.jenis,
          jumlah: currentRow.jumlah,
        })
      } else {
        form.reset({
          tanggal: new Date(),
          keterangan: "",
          jenis: "masuk",
          jumlah: "",
        })
      }
    }
  }, [open, currentRow, form])

  const onSubmit = async (data: KasForm) => {
    try {
      if (isUpdate && currentRow?.id) {
        // Update kas yang sudah ada
        await updateKas.mutateAsync({
          kasId: currentRow.id,
          kasData: data,
        })
      } else {
        // Tambah kas baru
        await addKas.mutateAsync(data)
      }

      // Tutup drawer dan reset form setelah berhasil
      onOpenChange(false)
      form.reset()
    } catch (error) {
      // Error sudah dihandle di hook melalui toast
      console.error('Submit error:', error)
    }
  }

  const handleOpenChange = (v: boolean) => {
    onOpenChange(v)
    if (!v) {
      // Reset form ketika drawer ditutup
      form.reset()
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader className="text-start">
          <SheetTitle>{isUpdate ? "Update" : "Create"} Transaksi Kas</SheetTitle>
          <SheetDescription>
            {isUpdate ? "Perbarui data transaksi kas." : "Tambahkan transaksi kas baru."} Klik save saat selesai.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id="kas-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 space-y-6 overflow-y-auto px-4"
          >
            <FormField
              control={form.control}
              name="tanggal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal</FormLabel>
                  <FormControl>
                    <DatePicker
                      placeholder="Pilih tanggal"
                      selected={field.value ?? undefined}
                      onSelect={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="keterangan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keterangan</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Keterangan transaksi"
                      rows={3}
                      value={field.value ?? ''}
                      disabled={isSubmitting} // Disable saat loading
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="jenis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isSubmitting} // Disable saat loading
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="masuk">Masuk</SelectItem>
                          <SelectItem value="keluar">Keluar</SelectItem>
                        </SelectContent>
                      </Select>
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
                      <Input
                        {...field}
                        type="text"
                        placeholder="0"
                        value={field.value}
                        disabled={isSubmitting} // Disable saat loading
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>

        <SheetFooter className="gap-2">
          <SheetClose asChild>
            <Button variant="outline" disabled={isSubmitting}>
              Close
            </Button>
          </SheetClose>
          <Button
            form="kas-form"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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