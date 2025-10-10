import { getRouteApi } from '@tanstack/react-router';
import { ConfigDrawer } from '@/components/config-drawer';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Search } from '@/components/search';
import { ThemeSwitch } from '@/components/theme-switch';
import { PppDialogs } from './components/ppp-dialogs';
import { PppPrimaryButtons } from './components/ppp-primary-buttons';
import { PppProvider } from './components/ppp-provider';
import { PppTable } from './components/ppp-table';
import { getPppSecrets } from '@/features/ppp/server/secrets';
import { useRouterManagement } from '@/hooks/use-router';
import { useQuery } from '@tanstack/react-query';


const route = getRouteApi('/_authenticated/ppp/secrets')

export function PppSecrets() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { activeRouter } = useRouterManagement({ refetchInterval: false })
  const routerId = activeRouter?.id
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['pppActive', routerId],
    queryFn: () => getPppSecrets({ data: { routerId } }),
    enabled: !!routerId, // Hanya fetch jika routerId tersedia
    staleTime: 5 * 60 * 1000, // Data dianggap fresh selama 5 menit
    refetchOnWindowFocus: true,
  })
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
          <PppTable data={data?.data || []} search={search} navigate={navigate} />
        </div>
      </Main>

      <PppDialogs />
    </PppProvider>
  )
}