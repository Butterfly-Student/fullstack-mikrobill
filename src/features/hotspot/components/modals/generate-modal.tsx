"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form } from "@/components/ui/form"
import { Zap } from "lucide-react"
import { FormInput, FormSelect } from "../form"
import { ReusableDialog } from "../dialog"

interface GenerateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const FormSchema = z.object({
  qty: z.string().min(1, {
    message: "Quantity must be at least 1.",
  }).refine((val) => {
    const num = parseInt(val)
    return num >= 1 && num <= 1000
  }, {
    message: "Quantity must be between 1 and 1000.",
  }),
  server: z.string().min(1, {
    message: "Server must be selected.",
  }),
  userMode: z.string().min(1, {
    message: "User mode must be selected.",
  }),
  nameLength: z.string().min(1, {
    message: "Name length must be specified.",
  }).refine((val) => {
    const num = parseInt(val)
    return num >= 1 && num <= 20
  }, {
    message: "Name length must be between 1 and 20.",
  }),
  prefix: z.string().optional(),
  characters: z.string().min(1, {
    message: "Character set must be selected.",
  }),
  profile: z.string().min(1, {
    message: "Profile must be selected.",
  }),
  timeLimit: z.string().optional(),
  comment: z.string().optional(),
  dataLimit: z.string().optional(),
})

export function GenerateModal({ open, onOpenChange }: GenerateModalProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      qty: "1",
      server: "all",
      userMode: "username-password",
      nameLength: "4",
      prefix: "",
      characters: "abcd",
      profile: "default",
      timeLimit: "",
      comment: "",
      dataLimit: "",
    },
  })

  // Options untuk select components
  const serverOptions = [
    { value: "all", label: "all" },
    { value: "server1", label: "Server 1" },
    { value: "server2", label: "Server 2" },
  ]

  const userModeOptions = [
    { value: "username-password", label: "Username = Password" },
    { value: "username-only", label: "Username Only" },
    { value: "custom", label: "Custom" },
  ]

  const charactersOptions = [
    { value: "abcd", label: "abcd" },
    { value: "1234", label: "1234" },
    { value: "abcd1234", label: "abcd1234" },
    { value: "ABCD", label: "ABCD" },
    { value: "ABCD1234", label: "ABCD1234" },
  ]

  const profileOptions = [
    { value: "default", label: "default" },
    { value: "testing", label: "Testing" },
  ]

  const handleSubmit = (data: z.infer<typeof FormSchema>) => {
    toast("Users generated successfully", {
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
      title="Generate Users"
      icon={<Zap className="w-4 h-4" />}
      onConfirm={form.handleSubmit(handleSubmit)}
      cancelText="Cancel"
      submitText="Generate"
    >
      <Form {...form}>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="limit">Limit</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-2 mt-4">
            <FormInput
              control={form.control}
              name="qty"
              label="Quantity"
              type="number"
              placeholder="1"
            />

            <FormSelect
              control={form.control}
              name="server"
              label="Server"
              options={serverOptions}
            />

            <FormSelect
              control={form.control}
              name="userMode"
              label="User Mode"
              options={userModeOptions}
            />

            <FormInput
              control={form.control}
              name="nameLength"
              label="Name Length"
              type="number"
              placeholder="4"
            />

            <FormInput
              control={form.control}
              name="prefix"
              label="Prefix"
              placeholder="Optional prefix"
            />

            <FormSelect
              control={form.control}
              name="characters"
              label="Characters"
              options={charactersOptions}
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
              name="comment"
              label="Comment"
              placeholder="Optional comment"
            />
          </TabsContent>

          <TabsContent value="limit" className="space-y-2 mt-4">
            <FormInput
              control={form.control}
              name="dataLimit"
              label="Data Limit"
              placeholder="e.g., 1GB, 500MB"
            />
          </TabsContent>
        </Tabs>
      </Form>
    </ReusableDialog>
  )
}