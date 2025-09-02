"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import {
  Wifi,
  Users,
  User,
  Activity,
  Server,
  RefreshCw,
  Filter,
  Plus,
  Zap,
  ChevronDown,
  UserPlus,
  Settings,
  Trash2,
} from "lucide-react"
import { AddUserModal } from "./components/modals/add-user-modal"
import { AddProfileModal } from "./components/modals/add-profile-modal"
import { GenerateModal } from "./components/modals/generate-modal"
import { ConfirmationModal } from "./components/modals/confirmation-modal"
import { NetworkTable } from "./components/network-table"
import { SearchBar } from "./components/search-bar"
import { Pagination } from "./components/pagination"
import { Header } from "@/components/layout/header"
import { TopNav } from "@/components/layout/top-nav"
import { Search } from "@/components/search"
import { ThemeSwitch } from "@/components/theme-switch"
import { ConfigDrawer } from "@/components/config-drawer"
import { ProfileDropdown } from "@/components/profile-dropdown"
import { Main } from "@/components/layout/main"
import { HotspotProvider } from "./components/hotspot-provider"

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

  const tabs = [
    { name: "Hotspot", icon: Wifi },
    { name: "Users", icon: Users },
    { name: "User Profile", icon: User },
    { name: "Active", icon: Activity },
    { name: "Hosts", icon: Server },
    { name: "Non-Active", icon: Users },
  ]

  const topNav = [
    { title: "Hotspot",
      href: "#",
      isActive: true,
      disable: true
     },
    { title: "Users",
      href: "#",
      isActive: true,
      disable: true
     },
    { title: "User Profile", 
      href: "#",
      isActive: true,
      disable: true
     },
    { title: "Active",
      href: "#",
      isActive: true,
      disable: true
     },
    { title: "Hosts",
      href: "#",
      isActive: true,
      disable: true
     },
    { title: "Non-Active",
      href: "#",
      isActive: true,
      disable: true
    },
  ]

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

  const getToolbarButtons = () => {
    const baseButtons = [
      <Button key="refresh" variant="outline" size="sm" className="flex-shrink-0 bg-transparent">
        <RefreshCw className="w-4 h-4" />
      </Button>,
      <DropdownMenu key="filter">
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent flex-shrink-0">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>All</DropdownMenuItem>
          <DropdownMenuItem>Active</DropdownMenuItem>
          <DropdownMenuItem>Inactive</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    ]

    const removeButton =
      selectedItems.length > 0 &&
        (activeTab === "Users" || activeTab === "User Profile" || activeTab === "Non-Active") ? (
        <Button
          key="remove"
          variant="outline"
          size="sm"
          className="gap-2 bg-red-50 text-red-600 border-red-200 hover:bg-red-100 flex-shrink-0"
          onClick={handleRemoveSelected}
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Remove ({selectedItems.length})</span>
          <span className="sm:hidden">({selectedItems.length})</span>
        </Button>
      ) : null

    if (activeTab === "User Profile") {
      return [
        ...baseButtons,
        removeButton,
        <Dialog key="add-profile" open={isAddProfileOpen} onOpenChange={setIsAddProfileOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent flex-shrink-0">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add</span>
            </Button>
          </DialogTrigger>
        </Dialog>,
        <Dialog key="generate" open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent flex-shrink-0">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Generate</span>
            </Button>
          </DialogTrigger>
        </Dialog>,
      ].filter(Boolean)
    }

    if (activeTab === "Users" || activeTab === "Active" || activeTab === "Non-Active") {
      return [
        ...baseButtons,
        removeButton,
        <Dialog key="add-user" open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent flex-shrink-0">
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Add User</span>
            </Button>
          </DialogTrigger>
        </Dialog>,
        <Dialog key="generate" open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent flex-shrink-0">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Generate</span>
            </Button>
          </DialogTrigger>
        </Dialog>,
        <Button key="expire" variant="outline" size="sm" className="gap-2 bg-transparent flex-shrink-0">
          <Settings className="w-4 h-4" />
          <span className="hidden lg:inline">Set Expire Monitor</span>
          <span className="lg:hidden">Expire</span>
        </Button>,
      ].filter(Boolean)
    }

    return [
      ...baseButtons,
      <Button key="add" variant="outline" size="sm" className="gap-2 bg-transparent flex-shrink-0">
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Add</span>
      </Button>,
      <Button key="generate" variant="outline" size="sm" className="gap-2 bg-transparent flex-shrink-0">
        <Zap className="w-4 h-4" />
        <span className="hidden sm:inline">Generate</span>
      </Button>,
    ]
  }

  const getTotalPages = () => {
    // This would normally come from your data source
    const totalItems = activeTab === "User Profile" ? sampleProfiles.length : 3 // Sample data count
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
        // console.log(`[v0] Removing ${itemType}:`, selectedItems)
        // Here you would actually remove the items from your data source
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
    <HotspotProvider>
      <Header>
        <TopNav links={topNav} />
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className="h-screen bg-gray-50 flex flex-col">
          {/* Fixed Header */}
          <div className="flex-shrink-0">
            <div className="bg-white border-b border-gray-200">
              <div className="flex overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.name}
                      onClick={() => handleTabChange(tab.name)}
                      className={`flex items-center gap-2 px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium border-r border-gray-200 hover:bg-gray-50 whitespace-nowrap flex-shrink-0 ${activeTab === tab.name ? "bg-gray-100 text-gray-900" : "text-gray-600"
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="bg-white border-b border-gray-200 p-3">
              <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-hide">
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-lg font-mono">{activeTab === "User Profile" ? "2" : connectionCount}</span>
                </div>
                {getToolbarButtons()}
                <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
              </div>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto p-2 sm:p-4">
              <NetworkTable
                activeTab={activeTab}
                columns={getTableColumns()}
                sampleProfilesProp={activeTab === "User Profile" ? sampleProfiles : undefined}
                searchTerm={searchTerm}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                selectedItems={selectedItems}
                onSelectionChange={setSelectedItems}
                onRemoveSelected={handleRemoveSelected}
              />
            </div>
          </div>

          {/* Fixed Pagination */}
          <div className="flex-shrink-0 bg-white border-t border-gray-200">
            <Pagination
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
      </Main>
    </HotspotProvider>
  )
}
