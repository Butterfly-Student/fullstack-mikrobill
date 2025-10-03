import { TrendingDown, TrendingUp } from 'lucide-react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MetricCard } from '@/components/metric-card'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { TagihanDialogs } from './components/tagihan-dialogs'
import { TagihanPrimaryButtons } from './components/tagihan-primary-buttons'
import { TagihanProvider } from './components/tagihan-provider'
import { TagihanTable } from './components/tagihan-table'
import { useTagihan } from './hooks/tagihan'

function formatTrend(value?: number | null) {
  if (value === undefined || value === null) return '0.00%'
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function Tagihan() {
  const { tagihan, isLoadingTagihan } = useTagihan()

  // default fallback supaya gak crash
  const summary = tagihan?.summary ?? {
    current: {
      total: { jumlahTagihan: 0, nominal: 0 },
      lunas: { jumlahTagihan: 0, nominal: 0, jumlahOrang: 0 },
      belumLunas: { jumlahTagihan: 0, nominal: 0, jumlahOrang: 0 },
    },
    previous: {
      total: { jumlahTagihan: 0, nominal: 0 },
      lunas: { jumlahTagihan: 0, nominal: 0, jumlahOrang: 0 },
      belumLunas: { jumlahTagihan: 0, nominal: 0, jumlahOrang: 0 },
    },
    growth: {
      total: { jumlahTagihan: null, nominal: null },
      lunas: { jumlahTagihan: null, nominal: null, jumlahOrang: null },
      belumLunas: { jumlahTagihan: null, nominal: null, jumlahOrang: null },
    },
  }

  const { current, growth } = summary


  return (
    <TagihanProvider>
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
            title='Total Tagihan'
            value={`Rp${(current?.total?.nominal ?? 0).toLocaleString('id-ID')}`}
            trend={formatTrend(growth?.total?.nominal)}
            link='/tagihan'
          >
            <div className='line-clamp-1 flex gap-2 font-medium'>
              {(growth?.total?.nominal ?? 0) >= 0
                ? 'Trending up'
                : 'Trending down'}{' '}
              this month
              {(growth?.total?.nominal ?? 0) >= 0 ? (
                <TrendingUp className='size-4' />
              ) : (
                <TrendingDown className='size-4' />
              )}
            </div>
          </MetricCard>

          <MetricCard
            title='Lunas'
            value={`Rp${(current?.lunas?.nominal ?? 0).toLocaleString('id-ID')}`}
            trend={formatTrend(growth?.lunas?.nominal)}
            link='/tagihan/lunas'
          >
            <div className='line-clamp-1 flex gap-2 font-medium'>
              {current?.lunas?.jumlahTagihan ?? 0} tagihan dari{' '}
              {current?.lunas?.jumlahOrang ?? 0} orang
            </div>
          </MetricCard>

          <MetricCard
            title='Belum Lunas'
            value={`Rp${(current?.belumLunas?.nominal ?? 0).toLocaleString('id-ID')}`}
            trend={formatTrend(growth?.belumLunas?.nominal)}
            link='/tagihan/belum-lunas'
          >
            <div className='line-clamp-1 flex gap-2 font-medium'>
              {current?.belumLunas?.jumlahTagihan ?? 0} tagihan dari{' '}
              {current?.belumLunas?.jumlahOrang ?? 0} orang
            </div>
          </MetricCard>
        </div>

        {/* Bagian Table */}
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Tagihan</h2>
            <p className='text-muted-foreground'>Daftar tagihan Anda.</p>
          </div>
          <TagihanPrimaryButtons />
        </div>

        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          {isLoadingTagihan ? (
            <div>Loading...</div>
          ) : (
            <TagihanTable data={tagihan?.data || []} />
          )}
        </div>
      </Main>

      <TagihanDialogs />
    </TagihanProvider>
  )
}
