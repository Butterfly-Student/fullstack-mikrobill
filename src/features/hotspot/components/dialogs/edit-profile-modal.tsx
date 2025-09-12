// components/hotspot/modals/edit-profile-modal.tsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface EditProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profileData?: any
  onSave: (profileData: any) => void
}

export function EditProfileModal({
  open,
  onOpenChange,
  profileData,
  onSave,
}: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    sharedUsers: 1,
    rateLimit: "",
    expireMode: "session",
    validity: "",
    price: "",
    sellingPrice: "",
    userLock: false,
    serverLock: false,
  })

  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.name || "",
        sharedUsers: profileData.sharedUsers || 1,
        rateLimit: profileData.rateLimit || "",
        expireMode: profileData.expireMode || "session",
        validity: profileData.validity || "",
        price: profileData.price || "",
        sellingPrice: profileData.sellingPrice || "",
        userLock: profileData.userLock || false,
        serverLock: profileData.serverLock || false,
      })
    } else {
      setFormData({
        name: "",
        sharedUsers: 1,
        rateLimit: "",
        expireMode: "session",
        validity: "",
        price: "",
        sellingPrice: "",
        userLock: false,
        serverLock: false,
      })
    }
  }, [profileData])

  const handleSave = () => {
    onSave(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{profileData ? "Edit Profile" : "Add Profile"}</DialogTitle>
          <DialogDescription>
            {profileData ? "Update profile settings" : "Create a new profile"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
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
            <Label htmlFor="sharedUsers" className="text-right">
              Shared Users
            </Label>
            <Input
              id="sharedUsers"
              type="number"
              min="1"
              value={formData.sharedUsers}
              onChange={(e) => setFormData(prev => ({ ...prev, sharedUsers: parseInt(e.target.value) || 1 }))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rateLimit" className="text-right">
              Rate Limit
            </Label>
            <Input
              id="rateLimit"
              value={formData.rateLimit}
              onChange={(e) => setFormData(prev => ({ ...prev, rateLimit: e.target.value }))}
              placeholder="1MB/s"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="expireMode" className="text-right">
              Expire Mode
            </Label>
            <Select
              value={formData.expireMode}
              onValueChange={(value) => setFormData(prev => ({ ...prev, expireMode: value }))}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select expire mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="session">Session</SelectItem>
                <SelectItem value="time">Time</SelectItem>
                <SelectItem value="data">Data</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="validity" className="text-right">
              Validity
            </Label>
            <Input
              id="validity"
              value={formData.validity}
              onChange={(e) => setFormData(prev => ({ ...prev, validity: e.target.value }))}
              placeholder="1h, unlimited"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Price
            </Label>
            <Input
              id="price"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              placeholder="$10"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sellingPrice" className="text-right">
              Selling Price
            </Label>
            <Input
              id="sellingPrice"
              value={formData.sellingPrice}
              onChange={(e) => setFormData(prev => ({ ...prev, sellingPrice: e.target.value }))}
              placeholder="$20"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="userLock" className="text-right">
              User Lock
            </Label>
            <Switch
              id="userLock"
              checked={formData.userLock}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, userLock: checked }))}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="serverLock" className="text-right">
              Server Lock
            </Label>
            <Switch
              id="serverLock"
              checked={formData.serverLock}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, serverLock: checked }))}
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