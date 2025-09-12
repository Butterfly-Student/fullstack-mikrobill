// components/hotspot/modals/edit-user-modal.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface EditUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userData?: any
  onSave: (userData: any) => void
}

export function EditUserModal({
  open,
  onOpenChange,
  userData,
  onSave,
}: EditUserModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    profile: "",
    macAddress: "",
    comment: "",
    enabled: true,
  })

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || userData.user || "",
        profile: userData.profile || "",
        macAddress: userData.macAddress || "",
        comment: userData.comment || "",
        enabled: userData.enabled ?? true,
      })
    } else {
      setFormData({
        name: "",
        profile: "",
        macAddress: "",
        comment: "",
        enabled: true,
      })
    }
  }, [userData])

  const handleSave = () => {
    onSave(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{userData ? "Edit User" : "Add User"}</DialogTitle>
          <DialogDescription>
            {userData ? "Update user information" : "Create a new user"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="profile" className="text-right">
              Profile
            </Label>
            <Select
              value={formData.profile}
              onValueChange={(value) => setFormData(prev => ({ ...prev, profile: value }))}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select profile" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="testing">Testing</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="macAddress" className="text-right">
              MAC Address
            </Label>
            <Input
              id="macAddress"
              value={formData.macAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, macAddress: e.target.value }))}
              placeholder="00:11:22:33:44:55"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="comment" className="text-right">
              Comment
            </Label>
            <Textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              className="col-span-3"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="enabled" className="text-right">
              Enabled
            </Label>
            <Switch
              id="enabled"
              checked={formData.enabled}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked }))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}