import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { PermissionsDialogs } from './components/permissions-dialogs'
import { PermissionsPrimaryButtons } from './components/permissions-primary-buttons'
import { PermissionsProvider } from './components/permissions-provider'
import { PermissionsTable } from './components/permissions-table'
import { permissions, resources, actions } from './data/permissions'

const route = getRouteApi('/_authenticated/users/permissions')

export function Permissions() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  return (
    <PermissionsProvider>
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
            <h2 className='text-2xl font-bold tracking-tight'>Permissions Management</h2>
            <p className='text-muted-foreground'>
              Manage system permissions and access control here.
            </p>
          </div>
          <PermissionsPrimaryButtons />
        </div>

        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <PermissionsTable
            data={permissions}
            resources={resources}
            actions={actions}
            search={search}
            navigate={navigate}
          />
        </div>
      </Main>

      <PermissionsDialogs />
    </PermissionsProvider>
  )
}