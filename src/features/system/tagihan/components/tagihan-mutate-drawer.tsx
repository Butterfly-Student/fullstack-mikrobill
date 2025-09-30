"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
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
import { type TagihanForm, tagihanStatusEnumValues, type Tagihan, tagihanFormSchema } from "../data/schema"
import { idr } from "../data/tagihan"
import { useTagihan } from "../hooks/tagihan"
import { generateNoTagihan } from "../../server/tagihan"

type TagihanMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Tagihan
}


export function TagihanMutateDrawer({ open, onOpenChange, currentRow }: TagihanMutateDrawerProps) {
  const isUpdate = !!currentRow

  // Gunakan hook untuk mutations
  const { addTagihan, updateTagihan, isAdding, isUpdating } = useTagihan()

  const form = useForm<TagihanForm>({
    resolver: zodResolver(tagihanFormSchema),
    defaultValues: currentRow
      ? {
        noTagihan: currentRow.noTagihan,
        tanggal: currentRow.tanggal,
        jatuhTempo: currentRow.jatuhTempo,
        deskripsi: currentRow.deskripsi ?? "",
        status: currentRow.status,
        total: currentRow.total.toString(),
        pelangganId: currentRow.pelangganId,
        templateId: currentRow.templateId,
      }
      : {
        tanggal: "",
        jatuhTempo: "",
        deskripsi: "",
        status: "belum_lunas",
        total: "",
        pelangganId: "",
        templateId: undefined,
      },
  })

  const onSubmit = async (data: TagihanForm) => {
    try {
      // Convert total dari string ke number

      if (isUpdate && currentRow) {
        // Update tagihan
        await updateTagihan.mutateAsync({
          tagihanId: currentRow.id,
          tagihanData: data,
        })
      } else {
        // Create tagihan baru
        const noTagihan = await generateNoTagihan()
        const payload = {
          ...data,
          noTagihan: noTagihan.data ?? '',
        }
        await addTagihan.mutateAsync(payload)
      }

      // Close drawer dan reset form setelah berhasil
      onOpenChange(false)
      form.reset()
    } catch (error) {
      // Error handling sudah ditangani di hook via toast
      console.error('Error submitting tagihan:', error)
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
          <SheetTitle>{isUpdate ? "Update" : "Create"} Tagihan</SheetTitle>
          <SheetDescription>
            {isUpdate ? "Perbarui data tagihan." : "Tambahkan tagihan baru."} Klik save saat selesai.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id="tagihan-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 space-y-6 overflow-y-auto px-4"
          >

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="tanggal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal</FormLabel>
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
                      <Input {...field} type="date" disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="deskripsi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Opsional" disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                        <SelectContent>
                          {tagihanStatusEnumValues.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s.replace("_", " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="total"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="decimal"
                        value={`${field.value ?? ""}`}
                        onChange={(e) => field.onChange(e.target.value)}
                        placeholder="0"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">{idr(Number(field.value || 0))}</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="pelangganId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pelanggan ID</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="UUID Pelanggan" disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="templateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template ID (opsional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="UUID Template (opsional)" disabled={isSubmitting} />
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
            form="tagihan-form"
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