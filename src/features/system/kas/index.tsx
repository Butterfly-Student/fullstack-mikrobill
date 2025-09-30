import { ConfigDrawer } from "@/components/config-drawer"
import { Header } from "@/components/layout/header"
import { Main } from "@/components/layout/main"
import { ProfileDropdown } from "@/components/profile-dropdown"
import { Search } from "@/components/search"
import { ThemeSwitch } from "@/components/theme-switch"
import { KasDialogs } from "./components/kas-dialogs"
import { KasPrimaryButtons } from "./components/kas-primary-buttons"
import { KasProvider } from "./components/kas-provider"
import { KasTable } from "./components/kas-table"
import { useKas } from "./hooks/kas"
import { SectionCards } from "@/components/section-card"

export function Kas() {
  const { kas } = useKas()
  return (
    <KasProvider>
      <Header fixed>
        <Search />
        <div className="ms-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <SectionCards/>
        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Kas</h2>
            <p className="text-muted-foreground">Daftar transaksi kas.</p>
          </div>
          <KasPrimaryButtons />
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <KasTable data={kas} />
        </div>
      </Main>

      <KasDialogs />
    </KasProvider>
  )
}
