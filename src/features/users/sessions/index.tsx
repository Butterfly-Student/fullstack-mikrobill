import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { SessionsProvider } from './components/sessions-provider'
import { SessionsTable } from './components/sessions-table'
import { sessions } from './data/sessions'
import { SessionsDialogs } from './components/sessions-dialogs'

const route = getRouteApi('/_authenticated/users/sessions')

export function Sessions() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  return (
    <SessionsProvider>
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
            <h2 className='text-2xl font-bold tracking-tight'>Sessions List</h2>
            <p className='text-muted-foreground'>
              Manage your users and their roles here.
            </p>
          </div>
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <SessionsTable data={sessions} search={search} navigate={navigate} />
        </div>
      </Main>

      <SessionsDialogs />
    </SessionsProvider>
  )
}
