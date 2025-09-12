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
import { Zap } from "lucide-react"
import { SelectDropdown } from "@/components/select-dropdown"
import { showSubmittedData } from "@/lib/show-submitted-data"

// Generate Users Configuration type interface
interface GenerateUsersConfig {
  qty: string
  server: string
  userMode: string
  nameLength: string
  prefix?: string
  characters: string
  profile: string
  timeLimit?: string
  comment?: string
  dataLimit?: string
}

interface GenerateUsersActionDialogProps {
  currentRow?: GenerateUsersConfig
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

type GenerateUsersForm = z.infer<typeof FormSchema>

export function GenerateUsersActionDialog({ currentRow, open, onOpenChange }: GenerateUsersActionDialogProps) {
  const isEdit = !!currentRow

  const form = useForm<GenerateUsersForm>({
    resolver: zodResolver(FormSchema),
    defaultValues: isEdit
      ? {
        ...currentRow,
      }
      : {
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
    { label: "all", value: "all" },
    { label: "Server 1", value: "server1" },
    { label: "Server 2", value: "server2" },
  ]

  const userModeOptions = [
    { label: "Username = Password", value: "username-password" },
    { label: "Username Only", value: "username-only" },
    { label: "Custom", value: "custom" },
  ]

  const charactersOptions = [
    { label: "abcd", value: "abcd" },
    { label: "1234", value: "1234" },
    { label: "abcd1234", value: "abcd1234" },
    { label: "ABCD", value: "ABCD" },
    { label: "ABCD1234", value: "ABCD1234" },
  ]

  const profileOptions = [
    { label: "default", value: "default" },
    { label: "Testing", value: "testing" },
  ]

  const onSubmit = (values: GenerateUsersForm) => {
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
            <Zap className="w-4 h-4" />
            {isEdit ? "Edit Generation Template" : "Generate Users"}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the generation template here. " : "Configure user generation settings here. "}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>

        <div className="h-[28rem] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3">
          <Form {...form}>
            <form
              id="generate-users-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 px-0.5"
            >
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="limit">Limit</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="qty"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                        <FormLabel className="col-span-2 text-end">
                          Quantity
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="1"
                            min="1"
                            max="1000"
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
                    name="userMode"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                        <FormLabel className="col-span-2 text-end">
                          User Mode
                        </FormLabel>
                        <SelectDropdown
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select user mode"
                          className="col-span-4"
                          items={userModeOptions}
                        />
                        <FormMessage className="col-span-4 col-start-3" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nameLength"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                        <FormLabel className="col-span-2 text-end">
                          Name Length
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="4"
                            min="1"
                            max="20"
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
                    name="prefix"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                        <FormLabel className="col-span-2 text-end">
                          Prefix
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Optional prefix"
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
                    name="characters"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                        <FormLabel className="col-span-2 text-end">
                          Characters
                        </FormLabel>
                        <SelectDropdown
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select character set"
                          className="col-span-4"
                          items={charactersOptions}
                        />
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
                    name="comment"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                        <FormLabel className="col-span-2 text-end">
                          Comment
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Optional comment"
                            className="col-span-4"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="col-span-4 col-start-3" />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="limit" className="space-y-4 mt-4">
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
                            placeholder="e.g., 1GB, 500MB"
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
          <Button type="submit" form="generate-users-form">
            {isEdit ? "Save changes" : "Generate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}