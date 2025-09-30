import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConfigDrawer } from "@/components/config-drawer"
import { Header } from "@/components/layout/header"
import { Main } from "@/components/layout/main"
import { TopNav } from "@/components/layout/top-nav"
import { ProfileDropdown } from "@/components/profile-dropdown"
import { Search } from "@/components/search"
import { ThemeSwitch } from "@/components/theme-switch"
import { ReportChart } from "./components/report-chart"
import { ReportDataTable } from "./components/report-data-table"
import { ReportFilters } from "./components/report-filters"
import { ReportExport } from "./components/report-export"
import LineChart from "./components/charts"
import LiveChart from "./components/live-chart"

export function Laporan() {
  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <TopNav links={topNav} />
        <div className="ms-auto flex items-center space-x-4">
          <Search />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main ===== */}
      <Main>
        <div className="mb-2 flex items-center justify-between space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Laporan</h1>
          <div className="flex items-center space-x-2">
            <ReportExport />
            <Button>Buat Laporan Baru</Button>
          </div>
        </div>

        <Tabs orientation="vertical" defaultValue="ringkasan" className="space-y-4">
          <div className="w-full overflow-x-auto pb-2">
            <TabsList>
              <TabsTrigger value="ringkasan">Ringkasan</TabsTrigger>
              <TabsTrigger value="penjualan">Penjualan</TabsTrigger>
              <TabsTrigger value="keuangan">Keuangan</TabsTrigger>
              <TabsTrigger value="inventori">Inventori</TabsTrigger>
              <TabsTrigger value="kustom">Laporan Kustom</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="ringkasan" className="space-y-4">
            {/* Report Filters */}
            <ReportFilters />

            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="text-muted-foreground h-4 w-4"
                  >
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Rp 452.318.900</div>
                  <p className="text-muted-foreground text-xs">+20.1% dari bulan lalu</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="text-muted-foreground h-4 w-4"
                  >
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <path d="M2 10h20" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2,350</div>
                  <p className="text-muted-foreground text-xs">+180.1% dari bulan lalu</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pelanggan Aktif</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="text-muted-foreground h-4 w-4"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,234</div>
                  <p className="text-muted-foreground text-xs">+19% dari bulan lalu</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tingkat Konversi</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="text-muted-foreground h-4 w-4"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12.5%</div>
                  <p className="text-muted-foreground text-xs">+2.1% dari minggu lalu</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts and Data */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
              <Card className="col-span-1 lg:col-span-4">
                <CardHeader>
                  <CardTitle>Tren Pendapatan</CardTitle>
                  <CardDescription>Grafik pendapatan dalam 12 bulan terakhir</CardDescription>
                </CardHeader>
                <CardContent className="ps-2">
                  <LiveChart />
                </CardContent>
              </Card>

              <Card className="col-span-1 lg:col-span-3">
                <CardHeader>
                  <CardTitle>Ringkasan Kinerja</CardTitle>
                  <CardDescription>Metrik utama bulan ini</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="penjualan" className="space-y-4">
            <ReportFilters />
            <Card>
              <CardHeader>
                <CardTitle>Data Penjualan</CardTitle>
                <CardDescription>Daftar lengkap transaksi penjualan</CardDescription>
              </CardHeader>
              <CardContent>
                <ReportDataTable type="sales" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="keuangan" className="space-y-4">
            <ReportFilters />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Laporan Laba Rugi</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReportChart type="bar" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Arus Kas</CardTitle>
                </CardHeader>
                <CardContent>
                  <LineChart />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inventori" className="space-y-4">
            <ReportFilters />
            <Card>
              <CardHeader>
                <CardTitle>Status Inventori</CardTitle>
                <CardDescription>Laporan stok dan pergerakan barang</CardDescription>
              </CardHeader>
              <CardContent>
                <ReportDataTable type="inventory" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kustom" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Buat Laporan Kustom</CardTitle>
                <CardDescription>Sesuaikan laporan sesuai kebutuhan Anda</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Fitur laporan kustom akan segera hadir...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}

const topNav = [
  {
    title: "Ringkasan",
    href: "/laporan",
    isActive: true,
    disabled: false,
  },
  {
    title: "Penjualan",
    href: "/laporan/penjualan",
    isActive: false,
    disabled: false,
  },
  {
    title: "Keuangan",
    href: "/laporan/keuangan",
    isActive: false,
    disabled: false,
  },
  {
    title: "Inventori",
    href: "/laporan/inventori",
    isActive: false,
    disabled: false,
  },
]
