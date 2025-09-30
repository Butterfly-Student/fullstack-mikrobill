"use client"

import { getRouteApi } from "@tanstack/react-router"
import HotspotTopNav from "../components/hotspot-top-nav"


const route = getRouteApi('/_authenticated/hotspot/users-inactive')


export default function HotspotUsersInactive() {

  const search = route.useSearch()
  const navigate = route.useNavigate()

  return (
      <HotspotTopNav>
        <h2>Hotspot user Profiles</h2>
      </HotspotTopNav>
  )
}