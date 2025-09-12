// hotspot-table
"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDown, Power, PowerOff, ChevronRight } from "lucide-react"
import { ConfirmationModal } from "./dialogs/confirmation-modal"
import { EditUserModal } from "./dialogs/edit-user-modal"
import { EditProfileModal } from "./dialogs/edit-profile-modal"

interface NetworkTableProps {
  activeTab: string
  columns: string[]
  sampleProfilesProp?: any[]
  searchTerm: string
  currentPage: number
  itemsPerPage: number
  selectedItems: string[]
  onSelectionChange: (selectedItems: string[]) => void
  onRemoveSelected: () => void
}

export function NetworkTable({
  activeTab,
  columns,
  sampleProfilesProp,
  searchTerm,
  currentPage,
  itemsPerPage,
  selectedItems,
  onSelectionChange,
  onRemoveSelected,
}: NetworkTableProps) {
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean
    title: string
    description: string
    action: () => void
  }>({
    open: false,
    title: "",
    description: "",
    action: () => { },
  })

  const [editUserModal, setEditUserModal] = useState<{
    open: boolean
    userData?: any
  }>({
    open: false,
    userData: undefined,
  })

  const [editProfileModal, setEditProfileModal] = useState<{
    open: boolean
    profileData?: any
  }>({
    open: false,
    profileData: undefined,
  })

  const sampleUsers = [
    {
      server: "all",
      name: "user1",
      profile: "default",
      macAddress: "00:11:22:33:44:55",
      uptime: "1h 30m",
      bytesIn: "1.2MB",
      bytesOut: "3.4MB",
      comment: "",
      enabled: true,
    },
    {
      server: "all",
      name: "user2",
      profile: "testing",
      macAddress: "00:11:22:33:44:56",
      uptime: "45m",
      bytesIn: "800KB",
      bytesOut: "2.1MB",
      comment: "Test user",
      enabled: false,
    },
    {
      server: "all",
      name: "admin",
      profile: "default",
      macAddress: "00:11:22:33:44:57",
      uptime: "3h 15m",
      bytesIn: "5.2MB",
      bytesOut: "8.7MB",
      comment: "Admin user",
      enabled: true,
    },
  ]

  const sampleActiveUsers = [
    {
      server: "all",
      user: "user1",
      address: "192.168.1.100",
      macAddress: "00:11:22:33:44:55",
      uptime: "1h 30m",
      bytesIn: "1.2MB",
      bytesOut: "3.4MB",
      timeLeft: "2h 30m",
      loginBy: "mac",
      comment: "",
    },
    {
      server: "all",
      user: "admin",
      address: "192.168.1.101",
      macAddress: "00:11:22:33:44:57",
      uptime: "3h 15m",
      bytesIn: "5.2MB",
      bytesOut: "8.7MB",
      timeLeft: "unlimited",
      loginBy: "cookie",
      comment: "Admin session",
    },
  ]

  const sampleHosts = [
    {
      macAddress: "00:11:22:33:44:58",
      address: "192.168.1.102",
      toAddress: "192.168.1.1",
      server: "all",
      comment: "Gateway",
    },
    {
      macAddress: "00:11:22:33:44:59",
      address: "192.168.1.103",
      toAddress: "192.168.1.1",
      server: "all",
      comment: "DNS Server",
    },
  ]

  const sampleProfiles = [
    {
      name: "default",
      sharedUsers: 10,
      rateLimit: "1MB/s",
      expireMode: "session",
      validity: "unlimited",
      price: "$10",
      sellingPrice: "$20",
      userLock: false,
      serverLock: false,
    },
    {
      name: "testing",
      sharedUsers: 5,
      rateLimit: "512KB/s",
      expireMode: "time",
      validity: "1h",
      price: "$5",
      sellingPrice: "$10",
      userLock: true,
      serverLock: true,
    },
  ]

  const [openItems, setOpenItems] = useState<{ [key: number]: boolean }>({})

  const getFilteredData = () => {
    let data: any[] = []

    switch (activeTab) {
      case "Users":
      case "Non-Active":
        data = sampleUsers
        break
      case "User Profile":
        data = sampleProfilesProp || sampleProfiles
        break
      case "Active":
        data = sampleActiveUsers
        break
      case "Hosts":
        data = sampleHosts
        break
      default:
        data = []
    }

    // Filter by search term
    if (searchTerm) {
      data = data.filter((item) =>
        Object.values(item).some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Paginate
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage

    return {
      data: data.slice(startIndex, endIndex),
      total: data.length,
    }
  }

  const { data: filteredData } = getFilteredData()

  const handleToggleStatus = (item: any, enable: boolean) => {
    setConfirmModal({
      open: true,
      title: enable ? "Enable Entry" : "Disable Entry",
      description: `Are you sure you want to ${enable ? "enable" : "disable"} this entry?`,
      action: () => {
        console.log(`[v0] ${enable ? "Enabling" : "Disabling"} entry:`, item)
        // Here you would update the actual data
      },
    })
  }

  const handleRowClick = (item: any) => {
    if (activeTab === "User Profile") {
      setEditProfileModal({
        open: true,
        profileData: item,
      })
    } else if (activeTab === "Users" || activeTab === "Active" || activeTab === "Non-Active") {
      setEditUserModal({
        open: true,
        userData: item,
      })
    }
  }

  const toggleCollapsible = (index: number) => {
    setOpenItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  const getItemId = (item: any) => {
    if (activeTab === "User Profile") return item.name
    if (activeTab === "Users" || activeTab === "Non-Active" || activeTab === "Active") return item.name || item.user
    if (activeTab === "Hosts") return item.macAddress
    return item.name || item.macAddress || item.user
  }

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedItems, itemId])
    } else {
      onSelectionChange(selectedItems.filter((id) => id !== itemId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = filteredData.map((item) => getItemId(item))
      onSelectionChange(allIds)
    } else {
      onSelectionChange([])
    }
  }

  const isAllSelected = filteredData.length > 0 && filteredData.every((item) => selectedItems.includes(getItemId(item)))
  const isIndeterminate = selectedItems.length > 0 && !isAllSelected

  const renderMobileCard = (item: any, index: number) => {
    const itemId = getItemId(item)
    const isSelected = selectedItems.includes(itemId)

    return (
      <Card key={index} className="mb-2">
        <Collapsible open={openItems[index] || false} onOpenChange={() => toggleCollapsible(index)}>
          <CollapsibleTrigger asChild>
            <CardContent className="p-3 cursor-pointer hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => handleSelectItem(itemId, checked as boolean)}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-shrink-0"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleStatus(item, !item.enabled)
                    }}
                    className="p-1 h-auto"
                  >
                    {item.enabled !== false ? (
                      <Power className="w-3 h-3 text-green-600" />
                    ) : (
                      <PowerOff className="w-3 h-3 text-red-600" />
                    )}
                  </Button>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate">
                      {activeTab === "User Profile" && (
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${index === 0 ? "bg-yellow-400" : "bg-red-400"}`}></div>
                          {item.name}
                        </div>
                      )}
                      {(activeTab === "Users" || activeTab === "Non-Active") && item.name}
                      {activeTab === "Active" && item.user}
                      {activeTab === "Hosts" && item.macAddress}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {activeTab === "User Profile" && `${item.sharedUsers} shared users`}
                      {(activeTab === "Users" || activeTab === "Non-Active") && item.profile}
                      {activeTab === "Active" && item.address}
                      {activeTab === "Hosts" && item.address}
                    </div>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${openItems[index] ? "rotate-90" : ""}`} />
              </div>
            </CardContent>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 pb-3 px-3">
              <div className="grid grid-cols-1 gap-1 text-xs">
                {activeTab === "User Profile" && (
                  <>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Rate Limit:</span>
                      <span className="truncate ml-2">{item.rateLimit}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Expire Mode:</span>
                      <span className="truncate ml-2">{item.expireMode}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Validity:</span>
                      <span className="truncate ml-2">{item.validity}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Price:</span>
                      <span className="truncate ml-2">{item.price}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Selling Price:</span>
                      <span className="truncate ml-2">{item.sellingPrice}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">User Lock:</span>
                      <span className="truncate ml-2">{item.userLock ? "Yes" : "No"}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Server Lock:</span>
                      <span className="truncate ml-2">{item.serverLock ? "Yes" : "No"}</span>
                    </div>
                  </>
                )}
                {(activeTab === "Users" || activeTab === "Non-Active") && (
                  <>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Server:</span>
                      <span className="truncate ml-2">{item.server}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">MAC Address:</span>
                      <span className="truncate ml-2 font-mono text-xs">{item.macAddress}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Uptime:</span>
                      <span className="truncate ml-2">{item.uptime}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Bytes In:</span>
                      <span className="truncate ml-2">{item.bytesIn}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Bytes Out:</span>
                      <span className="truncate ml-2">{item.bytesOut}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Comment:</span>
                      <span className="truncate ml-2">{item.comment || "-"}</span>
                    </div>
                  </>
                )}
                {activeTab === "Active" && (
                  <>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Server:</span>
                      <span className="truncate ml-2">{item.server}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">MAC Address:</span>
                      <span className="truncate ml-2 font-mono text-xs">{item.macAddress}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Uptime:</span>
                      <span className="truncate ml-2">{item.uptime}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Bytes In:</span>
                      <span className="truncate ml-2">{item.bytesIn}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Bytes Out:</span>
                      <span className="truncate ml-2">{item.bytesOut}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Time Left:</span>
                      <span className="truncate ml-2">{item.timeLeft}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Login By:</span>
                      <span className="truncate ml-2">{item.loginBy}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Comment:</span>
                      <span className="truncate ml-2">{item.comment || "-"}</span>
                    </div>
                  </>
                )}
                {activeTab === "Hosts" && (
                  <>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">To Address:</span>
                      <span className="truncate ml-2">{item.toAddress}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Server:</span>
                      <span className="truncate ml-2">{item.server}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Comment:</span>
                      <span className="truncate ml-2">{item.comment || "-"}</span>
                    </div>
                  </>
                )}
              </div>
              <Button
                className="w-full mt-2 bg-transparent"
                variant="outline"
                size="sm"
                onClick={() => handleRowClick(item)}
              >
                Edit Details
              </Button>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    )
  }

  const renderTableRow = (item: any, index: number) => {
    const itemId = getItemId(item)
    const isSelected = selectedItems.includes(itemId)

    return (
      <TableRow key={index} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(item)}>
        <TableCell className="px-4 py-3 w-12">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => handleSelectItem(itemId, checked as boolean)}
            onClick={(e) => e.stopPropagation()}
          />
        </TableCell>
        <TableCell className="px-4 py-3 w-16">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              handleToggleStatus(item, !item.enabled)
            }}
            className="p-1 h-auto"
          >
            {item.enabled !== false ? (
              <Power className="w-4 h-4 text-green-600" />
            ) : (
              <PowerOff className="w-4 h-4 text-red-600" />
            )}
          </Button>
        </TableCell>

        {activeTab === "User Profile" && (
          <>
            <TableCell className="px-4 py-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${index === 0 ? "bg-yellow-400" : "bg-red-400"}`}></div>
                {item.name}
              </div>
            </TableCell>
            <TableCell className="px-4 py-3">{item.sharedUsers}</TableCell>
            <TableCell className="px-4 py-3">{item.rateLimit}</TableCell>
            <TableCell className="px-4 py-3">{item.expireMode}</TableCell>
            <TableCell className="px-4 py-3">{item.validity}</TableCell>
            <TableCell className="px-4 py-3">{item.price}</TableCell>
            <TableCell className="px-4 py-3">{item.sellingPrice}</TableCell>
            <TableCell className="px-4 py-3">{item.userLock}</TableCell>
            <TableCell className="px-4 py-3">{item.serverLock}</TableCell>
          </>
        )}

        {(activeTab === "Users" || activeTab === "Non-Active") && (
          <>
            <TableCell className="px-4 py-3">{item.server}</TableCell>
            <TableCell className="px-4 py-3">{item.name}</TableCell>
            <TableCell className="px-4 py-3">{item.profile}</TableCell>
            <TableCell className="px-4 py-3">{item.macAddress}</TableCell>
            <TableCell className="px-4 py-3">{item.uptime}</TableCell>
            <TableCell className="px-4 py-3">{item.bytesIn}</TableCell>
            <TableCell className="px-4 py-3">{item.bytesOut}</TableCell>
            <TableCell className="px-4 py-3">{item.comment}</TableCell>
          </>
        )}

        {activeTab === "Active" && (
          <>
            <TableCell className="px-4 py-3">{item.server}</TableCell>
            <TableCell className="px-4 py-3">{item.user}</TableCell>
            <TableCell className="px-4 py-3">{item.address}</TableCell>
            <TableCell className="px-4 py-3">{item.macAddress}</TableCell>
            <TableCell className="px-4 py-3">{item.uptime}</TableCell>
            <TableCell className="px-4 py-3">{item.bytesIn}</TableCell>
            <TableCell className="px-4 py-3">{item.bytesOut}</TableCell>
            <TableCell className="px-4 py-3">{item.timeLeft}</TableCell>
            <TableCell className="px-4 py-3">{item.loginBy}</TableCell>
            <TableCell className="px-4 py-3">{item.comment}</TableCell>
          </>
        )}

        {activeTab === "Hosts" && (
          <>
            <TableCell className="px-4 py-3">{item.macAddress}</TableCell>
            <TableCell className="px-4 py-3">{item.address}</TableCell>
            <TableCell className="px-4 py-3">{item.toAddress}</TableCell>
            <TableCell className="px-4 py-3">{item.server}</TableCell>
            <TableCell className="px-4 py-3">{item.comment}</TableCell>
          </>
        )}
      </TableRow>
    )
  }

  return (
    <>
      <div className="hidden md:block bg-white border border-gray-200 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-left font-medium text-gray-700 whitespace-nowrap px-4 py-3 w-12">
                  <Checkbox
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate
                    }}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="text-left font-medium text-gray-700 whitespace-nowrap px-4 py-3 w-16">
                  Status
                </TableHead>
                {columns.map((column, index) => (
                  <TableHead key={index} className="text-left font-medium text-gray-700 whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-1">
                      {column}
                      {index === 0 && <ChevronDown className="w-3 h-3" />}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => renderTableRow(item, index))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length + 2} className="h-96 text-center text-gray-500 px-4 py-3">
                    No data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="md:hidden">
        {filteredData.length > 0 ? (
          <div className="space-y-2">{filteredData.map((item, index) => renderMobileCard(item, index))}</div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">No data available</CardContent>
          </Card>
        )}
      </div>

      <ConfirmationModal
        open={confirmModal.open}
        onOpenChange={(open) => setConfirmModal({ ...confirmModal, open })}
        title={confirmModal.title}
        description={confirmModal.description}
        onConfirm={confirmModal.action}
      />

      <EditUserModal
        open={editUserModal.open}
        onOpenChange={(open) => setEditUserModal({ ...editUserModal, open })}
        userData={editUserModal.userData}
      />

      <EditProfileModal
        open={editProfileModal.open}
        onOpenChange={(open) => setEditProfileModal({ ...editProfileModal, open })}
        profileData={editProfileModal.profileData}
      />
    </>
  )
}
