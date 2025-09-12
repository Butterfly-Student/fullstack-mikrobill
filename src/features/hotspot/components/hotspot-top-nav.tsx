"use client"

import { Header } from "@/components/layout/header"
import { TopNav } from "@/components/layout/top-nav"
import { Search } from "@/components/search"
import { ThemeSwitch } from "@/components/theme-switch"
import { ConfigDrawer } from "@/components/config-drawer"
import { ProfileDropdown } from "@/components/profile-dropdown"
import { Main } from "@/components/layout/main"
import { useLocation } from "@tanstack/react-router"
import { type JSX } from "react"

type HotspotTopNavProps = {
  children: React.ReactNode;
};

export default function HotspotTopNav({ children }: HotspotTopNavProps): JSX.Element{

  const { pathname } = useLocation()

  const topNav = () => {

    const navItems = [
      {title: "Server", href: "/hotspot/server"},
      { title: "Active", href: "/hotspot/users-active" },
      { title: "Non-Active", href: "/hotspot/users-non-active" },
      { title: "Users", href: "/hotspot/users" },
      { title: "Profiles", href: "/hotspot/user-profiles" },
      { title: "Hosts", href: "/hotspot/hosts" },
    ]

    return navItems.map((item) => ({
      ...item,
      isActive: pathname === item.href,
      disabled: false,
    }))
  }


  return (
    <>
      <Header>
        <TopNav links={topNav()} />
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        {children}
      </Main>
    </>
  )
}
