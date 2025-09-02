"use client"

import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form } from "@/components/ui/form"
import { UserPen } from "lucide-react"
import { FormCheckbox, FormInput, FormSelect } from "../form"
import { ReusableDialog } from "../dialog"

interface EditUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userData?: any
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

export function EditUserModal({ open, onOpenChange, userData }: EditUserModalProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
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

  // Update form values when userData changes
  useEffect(() => {
    if (userData && open) {
      const hasPassword = userData.password && userData.password.length > 0
      form.reset({
        server: userData.server || "all",
        name: userData.name || "",
        passwordEnabled: hasPassword,
        password: userData.password || "",
        macAddress: userData.macAddress || "",
        profile: userData.profile || "default",
        timeLimit: userData.timeLimit || "",
        dataLimit: userData.dataLimit || "",
        comment: userData.comment || "",
        uptime: userData.uptime || "",
        bytesIn: userData.bytesIn || "",
        bytesOut: userData.bytesOut || "",
        limitUptime: userData.limitUptime || "",
        limitBytesTotal: userData.limitBytesTotal || "",
        userCode: userData.userCode || "",
        expireDate: userData.expireDate || "",
      })
    }
  }, [userData, open, form])

  const passwordEnabled = form.watch("passwordEnabled")

  // Options untuk select components
  const serverOptions = [
    { value: "all", label: "all" },
    { value: "server1", label: "Server 1" },
    { value: "server2", label: "Server 2" },
  ]

  const profileOptions = [
    { value: "default", label: "default" },
    { value: "testing", label: "Testing" },
  ]

  const handleSubmit = (data: z.infer<typeof FormSchema>) => {
    toast("User updated successfully", {
      description: (
        <pre className="mt-2 w-[320px] rounded-md bg-neutral-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
    onOpenChange(false)
  }

  return (
    <ReusableDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit User"
      icon={<UserPen className="w-4 h-4" />}
      onConfirm={form.handleSubmit(handleSubmit)}
      cancelText="Cancel"
      submitText="Save Changes"
    >
      <Form {...form}>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-2 mt-4">
            <FormSelect
              control={form.control}
              name="server"
              label="Server"
              options={serverOptions}
            />

            <FormInput
              control={form.control}
              name="name"
              label="Name"
            />

            <div className="grid gap-1">
              <FormCheckbox
                control={form.control}
                name="passwordEnabled"
                label="Enable Password"
              />
              <FormInput
                control={form.control}
                name="password"
                label=""
                placeholder={passwordEnabled ? "Enter password" : "Password disabled"}
                type="password"
                disabled={!passwordEnabled}
              />
            </div>

            <FormInput
              control={form.control}
              name="macAddress"
              label="MAC Address"
            />

            <FormSelect
              control={form.control}
              name="profile"
              label="Profile"
              options={profileOptions}
            />

            <FormInput
              control={form.control}
              name="timeLimit"
              label="Time Limit"
              placeholder="cth: 3h atau 45m"
            />

            <FormInput
              control={form.control}
              name="dataLimit"
              label="Data Limit"
            />

            <FormInput
              control={form.control}
              name="comment"
              label="Comment"
            />
          </TabsContent>

          <TabsContent value="details" className="space-y-2 mt-4">
            <FormInput
              control={form.control}
              name="uptime"
              label="Uptime"
            />

            <FormInput
              control={form.control}
              name="bytesIn"
              label="Bytes In"
            />

            <FormInput
              control={form.control}
              name="bytesOut"
              label="Bytes Out"
            />

            <FormInput
              control={form.control}
              name="limitUptime"
              label="Limit Uptime"
            />

            <FormInput
              control={form.control}
              name="limitBytesTotal"
              label="Limit Bytes Total"
            />

            <FormInput
              control={form.control}
              name="userCode"
              label="User Code"
            />

            <FormInput
              control={form.control}
              name="expireDate"
              label="Expire Date"
              type="date"
            />
          </TabsContent>
        </Tabs>
      </Form>
    </ReusableDialog>
  )
}