import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { RoutersDialogs } from './components/routers-dialogs'
import { RoutersProvider } from './components/routers-provider'
import { RoutersTable } from './components/routers-table'
import { RoutersPrimaryButtons } from './components/routers-primary-button'
import { useRouterManagement } from '@/hooks/use-router'

const route = getRouteApi('/_authenticated/mikrotik/')

export function Routers() {
  const {routers} = useRouterManagement()
  const search = route.useSearch()
  const navigate = route.useNavigate()

  return (
    <RoutersProvider>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Router Management</h2>
            <p className='text-muted-foreground'>
              Manage your network routers and monitor their status.
            </p>
          </div>
          <RoutersPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <RoutersTable data={routers} search={search} navigate={navigate} />
        </div>
      </Main>

      <RoutersDialogs />
    </RoutersProvider>
  )
}