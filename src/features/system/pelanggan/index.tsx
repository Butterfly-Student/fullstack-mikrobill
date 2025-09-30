import { ConfigDrawer } from "@/components/config-drawer"
import { Header } from "@/components/layout/header"
import { Main } from "@/components/layout/main"
import { ProfileDropdown } from "@/components/profile-dropdown"
import { Search } from "@/components/search"
import { ThemeSwitch } from "@/components/theme-switch"
import { PelangganDialogs } from "./components/pelanggan-dialogs"
import { PelangganPrimaryButtons } from "./components/pelanggan-primary-buttons"
import { PelangganProvider } from "./components/pelanggan-provider"
import { PelangganTable } from "./components/pelanggan-table"
import { usePelanggan } from "./hooks/pelanggan"

export function Pelanggan() {
  const { pelanggan } = usePelanggan();
  return (
    <PelangganProvider>
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
            <h2 className="text-2xl font-bold tracking-tight">Pelanggan</h2>
            <p className="text-muted-foreground">Daftar pelanggan Anda.</p>
          </div>
          <PelangganPrimaryButtons />
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <PelangganTable data={pelanggan} />
        </div>
      </Main>

      <PelangganDialogs />
    </PelangganProvider>
  )
}
