import { ConfigDrawer } from "@/components/config-drawer"
import { Header } from "@/components/layout/header"
import { Main } from "@/components/layout/main"
import { ProfileDropdown } from "@/components/profile-dropdown"
import { Search } from "@/components/search"
import { ThemeSwitch } from "@/components/theme-switch"
import { TemplateTagihanDialogs } from "./components/template-tagihan-dialogs"
import { TemplateTagihanPrimaryButtons } from "./components/template-tagihan-primary-buttons"
import { TemplateTagihanProvider } from "./components/template-tagihan-provider"
import { TemplateTagihanTable } from "./components/template-tagihan-table"
import { useTemplateTagihan } from "./hooks/template_tagihan"

export function TemplateTagihan() {
  const { templateTagihan } = useTemplateTagihan()
  return (
    <TemplateTagihanProvider>
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
            <h2 className="text-2xl font-bold tracking-tight">Template Tagihan</h2>
            <p className="text-muted-foreground">Kelola template tagihan untuk pelanggan Anda.</p>
          </div>
          <TemplateTagihanPrimaryButtons />
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <TemplateTagihanTable data={templateTagihan} />
        </div>
      </Main>

      <TemplateTagihanDialogs />
    </TemplateTagihanProvider>
  )
}
