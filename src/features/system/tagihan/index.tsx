import { ConfigDrawer } from "@/components/config-drawer"
import { Header } from "@/components/layout/header"
import { Main } from "@/components/layout/main"
import { ProfileDropdown } from "@/components/profile-dropdown"
import { Search } from "@/components/search"
import { ThemeSwitch } from "@/components/theme-switch"
import { TagihanDialogs } from "./components/tagihan-dialogs"
import { TagihanPrimaryButtons } from "./components/tagihan-primary-buttons"
import { TagihanProvider } from "./components/tagihan-provider"
import { TagihanTable } from "./components/tagihan-table"
import { useTagihan } from "./hooks/tagihan"
import { useMemo } from "react"
import { format } from "date-fns"

export function Tagihan() {
  const { tagihan } = useTagihan()

  // Format tanggal di sini sebelum pass ke table
  // Ini akan dijalankan konsisten di server dan client
  const formattedTagihan = useMemo(() => {
    if (!tagihan) return []

    return tagihan.map(item => ({
      ...item,
      // Format semua field Date menjadi string
      tanggal: item.tanggal
        ? (typeof item.tanggal === 'string' ? item.tanggal : format(new Date(item.tanggal), "dd-MM-yyyy"))
        : "-",
      jatuhTempo: item.jatuhTempo
        ? (typeof item.jatuhTempo === 'string' ? item.jatuhTempo : format(new Date(item.jatuhTempo), "dd-MM-yyyy"))
        : "-",
      createdAt: item.createdAt
        ? (typeof item.createdAt === 'string' ? item.createdAt : format(new Date(item.createdAt), "dd-MM-yyyy HH:mm"))
        : "-",
      // Simpan original untuk keperluan lain jika dibutuhkan
      _originalCreatedAt: item.createdAt,
    }))
  }, [tagihan])
  return (
    <TagihanProvider>
      <Header fixed>
        <Search />
        <div className="ms-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Tagihan</h2>
            <p className="text-muted-foreground">Daftar tagihan Anda.</p>
          </div>
          <TagihanPrimaryButtons />
        </div>

        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <TagihanTable data={formattedTagihan} />
        </div>
      </Main>
      <TagihanDialogs />
    </TagihanProvider>
  )
}