import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { PppProvider } from './components/ppp-provider'
import { PppTable } from './components/ppp-table'
import { usePppoeSecret } from './hooks/ppp-active'
import { PppActiveDialog } from './components/ppp-dialog'

const route = getRouteApi('/_authenticated/ppp/actives')

export function PppActives() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { activeSessions } = usePppoeSecret()
  return (
    <PppProvider>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>PPP Active</h2>
            <p className='text-muted-foreground'>
              Here&apos;s a list of your PPP Active
            </p>
          </div>
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <PppTable
            data={activeSessions || []}
            search={search}
            navigate={navigate}
          />
        </div>
      </Main>
      <PppActiveDialog />
    </PppProvider>
  )
}
