// components/hotspot/hotspot-index.tsx
"use client"

import { useState } from "react"
import HotspotTopNav from "./components/hotspot-top-nav"
import { HotspotTabs } from "./components/hotspot-tabs"
import { HotspotToolbar } from "./components/hotspot-toolbar"
import { HotspotPagination } from "./components/hotspot-pagination"
import { ConfirmationModal } from "./components/dialogs/confirmation-modal"



const sampleProfiles = [
  {
    name: "default",
    sharedUsers: 1,
    rateLimit: "",
    expireMode: "",
    validity: "",
    price: "",
    sellingPrice: "",
    userLock: "",
    serverLock: "",
    enabled: true,
  },
  {
    name: "Testing",
    sharedUsers: 1,
    rateLimit: "",
    expireMode: "Notice & Record",
    validity: "undefined",
    price: "",
    sellingPrice: "",
    userLock: "Disable",
    serverLock: "Disable",
    enabled: false,
  },
]

export default function Hotspot() {
  const [activeTab, setActiveTab] = useState("Users")
  const [connectionCount] = useState(0)
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isAddProfileOpen, setIsAddProfileOpen] = useState(false)
  const [isGenerateOpen, setIsGenerateOpen] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [removeConfirmModal, setRemoveConfirmModal] = useState({
    open: false,
    title: "",
    description: "",
    action: () => { },
  })

  const getTableColumns = () => {
    switch (activeTab) {
      case "Users":
        return ["Server", "Name", "Profile", "MAC Address", "Uptime", "Bytes In", "Bytes Out", "Comment"]
      case "User Profile":
        return [
          "Name",
          "Shared Users",
          "Rate Limit",
          "Expire Mode",
          "Validity",
          "Price",
          "Selling Price",
          "User Lock",
          "Server Lock",
        ]
      case "Active":
        return [
          "Server",
          "User",
          "Address",
          "MAC Address",
          "Uptime",
          "Bytes In",
          "Bytes Out",
          "Time Left",
          "Login By",
          "Comment",
        ]
      case "Hosts":
        return ["Mac Address", "Address", "To Address", "Server", "Comment"]
      case "Non-Active":
        return ["Server", "Name", "Profile", "MAC Address", "Uptime", "Bytes In", "Bytes Out", "Comment"]
      default:
        return ["Server", "Name", "Profile", "MAC Address", "Uptime", "Bytes In", "Bytes Out", "Comment"]
    }
  }

  const getTotalPages = () => {
    const totalItems = activeTab === "User Profile" ? sampleProfiles.length : 3
    return Math.ceil(totalItems / itemsPerPage)
  }

  const handleRemoveSelected = () => {
    if (selectedItems.length === 0) return

    const itemType = activeTab === "User Profile" ? "profiles" : "users"
    const itemCount = selectedItems.length

    setRemoveConfirmModal({
      open: true,
      title: `Remove ${itemCount} ${itemType}`,
      description: `Are you sure you want to remove ${itemCount} selected ${itemType}? This action cannot be undone.`,
      action: () => {
        setSelectedItems([])
      },
    })
  }

  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName)
    setCurrentPage(1)
    setSearchTerm("")
    setSelectedItems([])
  }

  return (
    <HotspotTopNav>
      <div className="h-screen bg-gray-50 flex flex-col">
        <div className="flex-shrink-0">
          <HotspotTabs activeTab={activeTab} onTabChange={handleTabChange} />

          <HotspotToolbar
            activeTab={activeTab}
            connectionCount={connectionCount}
            sampleProfilesLength={sampleProfiles.length}
            selectedItems={selectedItems}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onRemoveSelected={handleRemoveSelected}
            onOpenAddUser={() => setIsAddUserOpen(true)}
            onOpenAddProfile={() => setIsAddProfileOpen(true)}
            onOpenGenerate={() => setIsGenerateOpen(true)}
          />
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-2 sm:p-4">
            <h2>Hai, It's Me</h2>
          </div>
        </div>

        <div className="flex-shrink-0 bg-white border-t border-gray-200">
          <HotspotPagination
            currentPage={currentPage}
            totalPages={getTotalPages()}
            onPageChange={setCurrentPage}
            totalItems={activeTab === "User Profile" ? sampleProfiles.length : 3}
            itemsPerPage={itemsPerPage}
          />
        </div>

        <AddUserModal open={isAddUserOpen} onOpenChange={setIsAddUserOpen} />
        <AddProfileModal open={isAddProfileOpen} onOpenChange={setIsAddProfileOpen} />
        <GenerateModal open={isGenerateOpen} onOpenChange={setIsGenerateOpen} />

        <ConfirmationModal
          open={removeConfirmModal.open}
          onOpenChange={(open) => setRemoveConfirmModal({ ...removeConfirmModal, open })}
          title={removeConfirmModal.title}
          description={removeConfirmModal.description}
          onConfirm={removeConfirmModal.action}
        />
      </div>
    </HotspotTopNav>
  )
}