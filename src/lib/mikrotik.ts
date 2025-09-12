import { type ProfileForm } from "@/features/hotspot/data/schema"


export interface SearchParams {
  query?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export const getHotspotProfiless = async (id: number) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/mikrobill/mikrotik/hotspot/profiles/${id}`
    )
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error: unknown) {
    throw new Error(`Error fetching hotspot profiles: ${(error as Error).message}`)
  }
}

export const getHotspotProfile = async (profileId: string) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/mikrobill/mikrotik/hotspot/profile/${profileId}`
    )
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error: unknown) {
    throw new Error(`Error fetching hotspot profile: ${(error as Error).message}`)
  }
}

export const addHotspotProfile = async (profileData: ProfileForm, mikrotikId: number) => {
  try {
    const response = await fetch(
      'http://localhost:5000/api/mikrobill/mikrotik/hotspot/profiles/' + mikrotikId,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      }
    )
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error: unknown) {
    throw new Error(`Error adding hotspot profile: ${(error as Error).message}`)
  }
}

export const updateHotspotProfile = async (profileId: string, profileData: ProfileForm) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/mikrobill/mikrotik/hotspot/profiles/${profileId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      }
    )
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error: unknown) {
    throw new Error(`Error updating hotspot profile: ${(error as Error).message}`)
  }
}

export const deleteHotspotProfile = async (profileId: string) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/mikrobill/mikrotik/hotspot/profiles/${profileId}`,
      {
        method: 'DELETE',
      }
    )
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error: unknown) {
    throw new Error(`Error deleting hotspot profile: ${(error as Error).message}`)
  }
}
