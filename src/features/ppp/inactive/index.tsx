import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { PppProvider } from './components/ppp-inactive-provider'
import { PppPrimaryButtons } from './components/ppp-inactive-primary-buttons'
import { PppTable } from './components/ppp-inactive-table'
import { PppDialogs } from './components/ppp-inactive-dialogs'
import secrets from '../data/secrets'
import { getRouteApi } from '@tanstack/react-router'



const route = getRouteApi('/_authenticated/ppp/inactives')

export function PppInactives() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  console.log(secrets)
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
            <h2 className='text-2xl font-bold tracking-tight'>Tasks</h2>
            <p className='text-muted-foreground'>
              Here&apos;s a list of your tasks for this month!
            </p>
          </div>
          <PppPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <PppTable data={secrets} search={search} navigate={navigate} />
        </div>
      </Main>

      <PppDialogs />
    </PppProvider>
  )
}
