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
import { UserPlus } from "lucide-react"
import { SelectDropdown } from "@/components/select-dropdown"
import { showSubmittedData } from "@/lib/show-submitted-data"

// User Hotspot type interface
interface UserHotspot {
  server: string
  name: string
  passwordEnabled: boolean
  password?: string
  macAddress?: string
  profile: string
  timeLimit?: string
  dataLimit?: string
  comment?: string
  uptime?: string
  bytesIn?: string
  bytesOut?: string
  limitUptime?: string
  limitBytesTotal?: string
  userCode?: string
  expireDate?: string
}

interface UserHotspotActionDialogProps {
  currentRow?: UserHotspot
  open: boolean
  onOpenChange: (open: boolean) => void
}

const FormSchema = z.object({
  server: z.string().min(1, {
    message: "Server must be selected.",
  }),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  passwordEnabled: z.boolean(),
  password: z.string().optional(),
  macAddress: z.string().optional(),
  profile: z.string().min(1, {
    message: "Profile must be selected.",
  }),
  timeLimit: z.string().optional(),
  dataLimit: z.string().optional(),
  comment: z.string().optional(),
  uptime: z.string().optional(),
  bytesIn: z.string().optional(),
  bytesOut: z.string().optional(),
  limitUptime: z.string().optional(),
  limitBytesTotal: z.string().optional(),
  userCode: z.string().optional(),
  expireDate: z.string().optional(),
}).refine((data) => {
  if (data.passwordEnabled && (!data.password || data.password.length < 1)) {
    return false
  }
  return true
}, {
  message: "Password is required when password is enabled.",
  path: ["password"],
})

type UserHotspotForm = z.infer<typeof FormSchema>

export function UserHotspotActionDialog({ currentRow, open, onOpenChange }: UserHotspotActionDialogProps) {
  const isEdit = !!currentRow

  const form = useForm<UserHotspotForm>({
    resolver: zodResolver(FormSchema),
    defaultValues: isEdit
      ? {
        ...currentRow,
      }
      : {
        server: "all",
        name: "",
        passwordEnabled: false,
        password: "",
        macAddress: "",
        profile: "default",
        timeLimit: "",
        dataLimit: "",
        comment: "",
        uptime: "",
        bytesIn: "",
        bytesOut: "",
        limitUptime: "",
        limitBytesTotal: "",
        userCode: "",
        expireDate: "",
      },
  })

  const passwordEnabled = form.watch("passwordEnabled")

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

  const onSubmit = (values: UserHotspotForm) => {
    form.reset()
    showSubmittedData(values)
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="text-start">
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            {isEdit ? "Edit User" : "Add User"}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the user here. " : "Create new user here. "}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>

        <div className="h-[28rem] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3">
          <Form {...form}>
            <form
              id="user-hotspot-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 px-0.5"
            >
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
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
                          defaultValue={field.value}
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
                            placeholder="Enter name"
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
                    name="passwordEnabled"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                        <FormLabel className="col-span-2 text-end">
                          Enable Password
                        </FormLabel>
                        <FormControl>
                          <div className="col-span-4 flex items-center space-x-2">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm">Enable password authentication</span>
                          </div>
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
                            placeholder={passwordEnabled ? "Enter password" : "Password disabled"}
                            disabled={!passwordEnabled}
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
                          defaultValue={field.value}
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
                    name="timeLimit"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                        <FormLabel className="col-span-2 text-end">
                          Time Limit
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="cth: 3h atau 45m"
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
                            placeholder="Enter data limit"
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

                <TabsContent value="details" className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="uptime"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                        <FormLabel className="col-span-2 text-end">
                          Uptime
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter uptime"
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
                    name="bytesIn"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                        <FormLabel className="col-span-2 text-end">
                          Bytes In
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter bytes in"
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
                    name="bytesOut"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                        <FormLabel className="col-span-2 text-end">
                          Bytes Out
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter bytes out"
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
                    name="limitUptime"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                        <FormLabel className="col-span-2 text-end">
                          Limit Uptime
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter limit uptime"
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
                    name="limitBytesTotal"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                        <FormLabel className="col-span-2 text-end">
                          Limit Bytes Total
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter limit bytes total"
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
                    name="userCode"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                        <FormLabel className="col-span-2 text-end">
                          User Code
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter user code"
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
                    name="expireDate"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                        <FormLabel className="col-span-2 text-end">
                          Expire Date
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            className="col-span-4"
                            {...field}
                          />
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
          <Button type="submit" form="user-hotspot-form">
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}