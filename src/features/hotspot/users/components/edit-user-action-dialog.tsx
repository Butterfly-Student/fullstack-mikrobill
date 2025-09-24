"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Edit } from "lucide-react"
import { SelectDropdown } from "@/components/select-dropdown"
import { showSubmittedData } from "@/lib/show-submitted-data"
import { useEffect } from "react"

// Schema untuk HotspotUser
const HotspotUserSchema = z.object({
  server: z.string().min(1, {
    message: 'Server must be selected.',
  }),
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  password: z.string().optional(),
  macAddress: z.string().optional(),
  profile: z.string().min(1, {
    message: 'Profile must be selected.',
  }),
  timeLimit: z.string().optional(),
  dataLimit: z.string().optional(),
  comment: z.string().optional(),
  disabled: z.boolean().default(false),
})

export type HotspotUser = z.infer<typeof HotspotUserSchema>

interface EditUserHotspotDialogProps {
  currentRow: HotspotUser
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditUserHotspotDialog({
  currentRow,
  open,
  onOpenChange
}: EditUserHotspotDialogProps) {
  const form = useForm<HotspotUser>({
    resolver: zodResolver(HotspotUserSchema),
    defaultValues: {
      server: "",
      name: "",
      password: "",
      macAddress: "",
      profile: "",
      timeLimit: "",
      dataLimit: "",
      comment: "",
      disabled: false,
    },
  })

  // Reset form dengan data currentRow ketika dialog dibuka
  useEffect(() => {
    if (open && currentRow) {
      form.reset({
        server: currentRow.server || "",
        name: currentRow.name || "",
        password: currentRow.password || "",
        macAddress: currentRow.macAddress || "",
        profile: currentRow.profile || "",
        timeLimit: currentRow.timeLimit || "",
        dataLimit: currentRow.dataLimit || "",
        comment: currentRow.comment || "",
        disabled: currentRow.disabled || false,
      })
    }
  }, [open, currentRow, form])

  // Options untuk select components
  const serverOptions = [
    { label: "all", value: "all" },
    { label: "Server 1", value: "server1" },
    { label: "Server 2", value: "server2" },
  ]

  const profileOptions = [
    { label: "default", value: "default" },
    { label: "Testing", value: "testing" },
  ]

  const onSubmit = (values: HotspotUser) => {
    console.log("Editing user:", values)
    showSubmittedData(values)
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!state) {
          form.reset()
        }
        onOpenChange(state)
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="text-start">
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Edit User
          </DialogTitle>
          <DialogDescription>
            Update user &quot;{currentRow?.name}&quot; information here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>

        <div className="h-[28rem] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3">
          <Form {...form}>
            <form
              id="edit-user-hotspot-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 px-0.5"
            >
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="limits">Limits & Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="server"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                        <FormLabel className="col-span-2 text-end">
                          Server
                        </FormLabel>
                        <SelectDropdown
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select server"
                          className="col-span-4"
                          items={serverOptions}
                        />
                        <FormMessage className="col-span-4 col-start-3" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                        <FormLabel className="col-span-2 text-end">
                          Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter username"
                            className="col-span-4"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="col-span-4 col-start-3" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                        <FormLabel className="col-span-2 text-end">
                          Password
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter new password (leave empty to keep current)"
                            className="col-span-4"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="col-span-4 col-start-3" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="macAddress"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                        <FormLabel className="col-span-2 text-end">
                          MAC Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter MAC address"
                            className="col-span-4"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="col-span-4 col-start-3" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="profile"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                        <FormLabel className="col-span-2 text-end">
                          Profile
                        </FormLabel>
                        <SelectDropdown
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select profile"
                          className="col-span-4"
                          items={profileOptions}
                        />
                        <FormMessage className="col-span-4 col-start-3" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="comment"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                        <FormLabel className="col-span-2 text-end">
                          Comment
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter comment"
                            className="col-span-4"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="col-span-4 col-start-3" />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="limits" className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="timeLimit"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                        <FormLabel className="col-span-2 text-end">
                          Time Limit
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g: 3h, 45m, 1d"
                            className="col-span-4"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="col-span-4 col-start-3" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dataLimit"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                        <FormLabel className="col-span-2 text-end">
                          Data Limit
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g: 1GB, 500MB"
                            className="col-span-4"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="col-span-4 col-start-3" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="disabled"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                        <FormLabel className="col-span-2 text-end">
                          Status
                        </FormLabel>
                        <FormControl>
                          <div className="col-span-4 flex items-center space-x-2">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm">Disable user</span>
                          </div>
                        </FormControl>
                        <FormMessage className="col-span-4 col-start-3" />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>
            </form>
          </Form>
        </div>

        <DialogFooter>
          <Button type="submit" form="edit-user-hotspot-form">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}