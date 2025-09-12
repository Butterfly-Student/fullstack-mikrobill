// components/hotspot/hotspot-index.tsx
"use client"

import { getRouteApi } from "@tanstack/react-router"
import { hotspotUsers } from "../data/data"
import HotspotTopNav from "../components/hotspot-top-nav"


const route = getRouteApi('/_authenticated/hotspot/users-non-active')


export default function HotspotUsersNonActive() {

  const search = route.useSearch()
  const navigate = route.useNavigate()

  return (
      <HotspotTopNav>
        <h2>Hotspot user Profiles</h2>
      </HotspotTopNav>
  )
}