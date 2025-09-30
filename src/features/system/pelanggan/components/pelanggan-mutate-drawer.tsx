"use client"

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
import { usePelanggan } from "../hooks/pelanggan" // Import hook
import { type Pelanggan, type PelangganForm, pelangganFormSchema } from "../data/schema"

type PelangganMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Pelanggan
}


// type PelangganForm = z.infer<typeof pelangganSchema>

export function PelangganMutateDrawer({ open, onOpenChange, currentRow }: PelangganMutateDrawerProps) {
  const isUpdate = !!currentRow

  // Gunakan hook usePelanggan
  const {
    addPelanggan,
    updatePelanggan,
    isAdding,
    isUpdating
  } = usePelanggan()

  const form = useForm<PelangganForm>({
    resolver: zodResolver(pelangganFormSchema),
    defaultValues: {
      name: "",
      email: "",
      telepon: "",
      alamat: "",
      password: "",
    },
  })

  // Reset form ketika currentRow berubah
  useEffect(() => {
    if (currentRow) {
      form.reset({
        name: currentRow.name || "",
        email: currentRow.email || "",
        telepon: currentRow.telepon || "",
        alamat: currentRow.alamat || "",
        password: "", // Password tidak diisi saat update
      })
    } else {
      form.reset({
        name: "",
        email: "",
        telepon: "",
        alamat: "",
        password: "",
      })
    }
  }, [currentRow, form])

  const onSubmit = async (data: PelangganForm) => {
    try {
      // Filter data kosong untuk optional fields
      const cleanData = {
        ...data,
        email: data.email || null,
        telepon: data.telepon || null,
        alamat: data.alamat || null,
        password: data.password || null,
        createdAt: currentRow?.createdAt ?? null,
      }

      if (isUpdate && currentRow) {
        // Update pelanggan
        await updatePelanggan.mutateAsync({
          pelangganId: currentRow.id,
          pelangganData: cleanData,
        })
      } else {
        // Create pelanggan baru
        await addPelanggan.mutateAsync(cleanData)
      }

      // Tutup drawer dan reset form setelah berhasil
      onOpenChange(false)
      form.reset()
    } catch (error) {
      // Error handling sudah ditangani di dalam hook via toast
      console.error('Form submission error:', error)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen)
    if (!newOpen) {
      form.reset()
    }
  }

  // Status loading
  const isLoading = isAdding || isUpdating

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader className="text-start">
          <SheetTitle>{isUpdate ? "Update" : "Create"} Pelanggan</SheetTitle>
          <SheetDescription>
            {isUpdate ? "Perbarui data pelanggan." : "Tambahkan pelanggan baru."} Klik save saat selesai.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id="pelanggan-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 space-y-6 overflow-y-auto px-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Nama pelanggan"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="email@domain.com"
                      type="email"
                      disabled={isLoading}
                      value={field.value === null ? "" : field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="telepon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telepon</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="08xxxxxxxxxx"
                      disabled={isLoading}
                      value={field.value === null ? "" : field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="alamat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Alamat lengkap"
                      rows={3}
                      disabled={isLoading}
                      value={field.value === null ? "" : field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Password {isUpdate ? "(kosongkan jika tidak ingin mengubah)" : "(opsional)"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Minimal 8 karakter"
                      disabled={isLoading}
                      value={field.value === null ? "" : field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <SheetFooter className="gap-2">
          <SheetClose asChild>
            <Button variant="outline" disabled={isLoading}>
              Close
            </Button>
          </SheetClose>
          <Button
            form="pelanggan-form"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save changes"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}