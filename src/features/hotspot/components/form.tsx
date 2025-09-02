import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"

// Reusable FormInput Component
interface FormInputProps {
  control: any
  name: string
  label: string
  placeholder?: string
  type?: string
  disabled?: boolean
}

export function FormInput({ control, name, label, placeholder, type = "text", disabled = false }: FormInputProps) {
  return (
    <div className="grid gap-1">
      <Label htmlFor={name} className="text-xs">{label}</Label>
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input
                id={name}
                type={type}
                placeholder={placeholder}
                disabled={disabled}
                className="h-8"
                {...field}
              />
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />
    </div>
  )
}

// Reusable FormSelect Component
interface FormSelectProps {
  control: any
  name: string
  label: string
  options: Array<{ value: string; label: string }>
  defaultValue?: string
}

export function FormSelect({ control, name, label, options, defaultValue }: FormSelectProps) {
  return (
    <div className="grid gap-1">
      <Label htmlFor={name} className="text-xs">{label}</Label>
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <Select onValueChange={field.onChange} defaultValue={field.value || defaultValue}>
              <FormControl>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />
    </div>
  )
}

// Reusable FormCheckbox Component
interface FormCheckboxProps {
  control: any
  name: string
  label: string
}

export function FormCheckbox({ control, name, label }: FormCheckboxProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              className="h-4 w-4"
            />
          </FormControl>
          <Label className="text-xs">{label}</Label>
        </FormItem>
      )}
    />
  )
}