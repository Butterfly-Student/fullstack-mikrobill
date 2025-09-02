"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form } from "@/components/ui/form"
import { Settings } from "lucide-react"
import { FormInput, FormSelect } from "../form"
import { ReusableDialog } from "../dialog"

interface AddProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const FormSchema = z.object({
  profileName: z.string().min(2, {
    message: "Profile name must be at least 2 characters.",
  }),
  expiredMode: z.string().min(1, {
    message: "Expired mode must be selected.",
  }),
  price: z.string().optional(),
  sellingPrice: z.string().optional(),
  lockUser: z.string().min(1, {
    message: "Lock user setting must be selected.",
  }),
  lockServer: z.string().min(1, {
    message: "Lock server setting must be selected.",
  }),
  // Additional profile-specific fields
  bandwidth: z.string().optional(),
  sessionTimeout: z.string().optional(),
  idleTimeout: z.string().optional(),
  downloadLimit: z.string().optional(),
  uploadLimit: z.string().optional(),
  maxSessions: z.string().optional(),
  description: z.string().optional(),
})

export function AddProfileModal({ open, onOpenChange }: AddProfileModalProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      profileName: "",
      expiredMode: "none",
      price: "",
      sellingPrice: "",
      lockUser: "disable",
      lockServer: "disable",
      bandwidth: "",
      sessionTimeout: "",
      idleTimeout: "",
      downloadLimit: "",
      uploadLimit: "",
      maxSessions: "",
      description: "",
    },
  })

  // Options untuk select components
  const expiredModeOptions = [
    { value: "none", label: "None" },
    { value: "notice-record", label: "Notice & Record" },
    { value: "remove", label: "Remove" },
  ]

  const lockOptions = [
    { value: "disable", label: "Disable" },
    { value: "enable", label: "Enable" },
  ]

  const handleSubmit = (data: z.infer<typeof FormSchema>) => {
    toast("Profile added successfully", {
      description: (
        <pre className="mt-2 w-[320px] rounded-md bg-neutral-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
    onOpenChange(false)
    form.reset()
  }

  return (
    <ReusableDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add Profile"
      icon={<Settings className="w-4 h-4" />}
      onConfirm={form.handleSubmit(handleSubmit)}
      cancelText="Cancel"
      submitText="Add Profile"
    >
      <Form {...form}>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-2 mt-4">
            <FormInput
              control={form.control}
              name="profileName"
              label="Profile Name"
              placeholder="Enter profile name"
            />

            <FormSelect
              control={form.control}
              name="expiredMode"
              label="Expired Mode"
              options={expiredModeOptions}
            />

            <FormInput
              control={form.control}
              name="price"
              label="Price"
              type="number"
              placeholder="0"
            />

            <FormInput
              control={form.control}
              name="sellingPrice"
              label="Selling Price"
              type="number"
              placeholder="0"
            />

            <FormSelect
              control={form.control}
              name="lockUser"
              label="Lock User"
              options={lockOptions}
            />

            <FormSelect
              control={form.control}
              name="lockServer"
              label="Lock Server"
              options={lockOptions}
            />
          </TabsContent>

          <TabsContent value="details" className="space-y-2 mt-4">
            <FormInput
              control={form.control}
              name="bandwidth"
              label="Bandwidth Limit"
              placeholder="e.g., 1M/1M"
            />

            <FormInput
              control={form.control}
              name="sessionTimeout"
              label="Session Timeout"
              placeholder="e.g., 30m"
            />

            <FormInput
              control={form.control}
              name="idleTimeout"
              label="Idle Timeout"
              placeholder="e.g., 10m"
            />

            <FormInput
              control={form.control}
              name="downloadLimit"
              label="Download Limit"
              placeholder="e.g., 1G"
            />

            <FormInput
              control={form.control}
              name="uploadLimit"
              label="Upload Limit"
              placeholder="e.g., 1G"
            />

            <FormInput
              control={form.control}
              name="maxSessions"
              label="Max Sessions"
              type="number"
              placeholder="1"
            />

            <FormInput
              control={form.control}
              name="description"
              label="Description"
              placeholder="Profile description"
            />
          </TabsContent>
        </Tabs>
      </Form>
    </ReusableDialog>
  )
}