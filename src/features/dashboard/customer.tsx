import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { TopNav } from "@/components/layout/top-nav";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";


export function Customer() {
  return (
    <>
    <Header>
            <TopNav links={topNav} />
            <div className='ms-auto flex items-center space-x-4'>
              <Search />
              <ThemeSwitch />
              <ConfigDrawer />
              <ProfileDropdown />
            </div>
          </Header>
    
          {/* ===== Main ===== */}
          <Main>

        <div className='space-y-4'>
          <h2 className='text-xl font-semibold'>Customers</h2>
          <p>Customer management content will go here.</p>
        </div>
          </Main>
    </>
  )
}

const topNav = [
  {
    title: 'Overview',
    href: '/',
    isActive: true,
    disabled: false,
  },
  {
    title: 'Customers',
    href: 'dashboard/customer',
    isActive: true,
    disabled: false,
  },
  {
    title: 'Products',
    href: 'dashboard/products',
    isActive: false,
    disabled: true,
  },
  {
    title: 'Settings',
    href: 'dashboard/settings',
    isActive: false,
    disabled: true,
  },
]