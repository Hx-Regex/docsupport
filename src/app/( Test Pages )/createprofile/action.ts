"use server"

import { api } from "@/trpc/server"

export async function createProfile(data: {
  id: string
  clinicId: string
  role: string
  firstName: string
  lastName: string
  email: string
  pin: string
  status?: string
  lastLogin?: Date | null
}) {
  try {
    // Create a clean version of the data to send to tRPC
    const cleanData = {
      ...data,
      // Ensure lastLogin is explicitly null if not a Date
      lastLogin: data.lastLogin instanceof Date ? data.lastLogin : null,
    }

    console.log(`[SERVER ACTION] Sending data:`, JSON.stringify(cleanData))

    // Call the tRPC procedure with the cleaned data
    const profile = await api.profile.create(cleanData)
    console.log(`[PROFILE] created ${JSON.stringify(profile)}`)
    return { success: true, profile }
  } catch (error) {
    console.error("Failed to create profile:", error)
    return { success: false, error: (error as Error).message }
  }
}
