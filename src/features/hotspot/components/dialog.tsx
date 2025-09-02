import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"

interface ReusableDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  onConfirm?: () => void
  cancelText?: string
  submitText?: string
  icon?: ReactNode
  maxWidth?: string
  isLoading?: boolean
  submitVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function ReusableDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  onConfirm,
  cancelText = "Cancel",
  submitText = "Save",
  icon,
  maxWidth = "sm:max-w-[425px]",
  isLoading = false,
  submitVariant = "default"
}: ReusableDialogProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onConfirm) {
      onConfirm()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={maxWidth}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {icon}
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription>
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-2">
          {children}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isLoading}>
                {cancelText}
              </Button>
            </DialogClose>
            {onConfirm && (
              <Button
                type="submit"
                variant={submitVariant}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : submitText}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}