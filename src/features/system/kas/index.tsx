import { TrendingDown, TrendingUp } from 'lucide-react';
import { ConfigDrawer } from '@/components/config-drawer';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { MetricCard } from '@/components/metric-card';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Search } from '@/components/search';
import { ThemeSwitch } from '@/components/theme-switch';
import { KasDialogs } from './components/kas-dialogs';
import { KasPrimaryButtons } from './components/kas-primary-buttons';
import { KasProvider } from './components/kas-provider';
import { KasTable } from './components/kas-table';
import { useKas } from './hooks/kas';


function formatTrend(value?: number) {
  if (value === undefined || value === null) return '0.00%'
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function Kas() {
  const { kas } = useKas()

  // default fallback supaya gak crash
  const summary = kas?.summary ?? {
    current: { masuk: 0, keluar: 0, total: 0 },
    previous: { masuk: 0, keluar: 0, total: 0 },
    growth: { masuk: 0, keluar: 0, total: 0 },
  }

  
  const { current, growth } = summary

  return (
    <KasProvider>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        {/* Bagian Cards */}
        <div className='flex gap-0.5 overflow-hidden *:flex-1 *:shrink *:data-[slot=card]:shadow-xs'>
          <MetricCard
            title='Total Revenue'
            value={`Rp${(current?.saldo ?? 0).toLocaleString('id-ID')}`}
            trend={formatTrend(growth?.saldo)}
            link='/revenue'
          >
            <div className='line-clamp-1 flex gap-2 font-medium'>
              {(growth?.saldo ?? 0) >= 0 ? 'Trending up' : 'Trending down'} this
              month
              {(growth?.saldo ?? 0) >= 0 ? (
                <TrendingUp className='size-4' />
              ) : (
                <TrendingDown className='size-4' />
              )}
            </div>
          </MetricCard>

          <MetricCard
            title='Pemasukan'
            value={`Rp${(current?.masuk ?? 0).toLocaleString('id-ID')}`}
            trend={formatTrend(growth?.masuk)}
            link='/kas/masuk'
          >
            <div className='line-clamp-1 flex gap-2 font-medium'>
              {(growth?.masuk ?? 0) >= 0
                ? 'Income increased'
                : 'Income decreased'}
            </div>
          </MetricCard>

          <MetricCard
            title='Pengeluaran'
            value={`Rp${(current?.keluar ?? 0).toLocaleString('id-ID')}`}
            trend={formatTrend(growth?.keluar)}
            link='/kas/keluar'
          >
            <div className='line-clamp-1 flex gap-2 font-medium'>
              {(growth?.keluar ?? 0) >= 0
                ? 'Expenses increased'
                : 'Expenses decreased'}
            </div>
          </MetricCard>
        </div>

        {/* Bagian Table */}
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Kas</h2>
            <p className='text-muted-foreground'>Daftar transaksi kas.</p>
          </div>
          <KasPrimaryButtons />
        </div>

        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <KasTable data={kas?.data ?? []} />
        </div>
      </Main>

      <KasDialogs />
    </KasProvider>
  )
}