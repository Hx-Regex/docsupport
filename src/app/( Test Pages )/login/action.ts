"use server"

import * as z from "zod"
import { api } from "@/trpc/server"
import { loginFormSchema } from "./schema"

// Get profiles from the clinic
export async function getClinicProfiles() {
  const clinicId = process.env.NEXT_PUBLIC_CLINIC_ID || "";
  try {
    const profiles = await api.auth.getClinicProfiles({ clinicId });
    return profiles;
  } catch (error) {
    console.error("Failed to fetch profiles:", error);
    return [];
  }
}

// Login action function
export async function loginAction(state: any, formData: FormData) {
  try {
    const validationResult = loginFormSchema.safeParse({
        userId: formData.get("userId"),
        pin: formData.get("pin"),
      });
    
      if (!validationResult.success) {
        console.error(
          "Validation failed:",
          validationResult.error.flatten().fieldErrors
        );
        return {
          errors: validationResult.error.flatten().fieldErrors,
        };
      }
    
    console.log('Form validation successful')
    const data = validationResult.data;
    // Call the API to login
    const user = await api.auth.login(data)
    
    if (user) {
      console.log('Login successful:', { userId: user.id })
      return { success: true, user }
    } else {
      console.log('Login failed: No user returned')
      return { success: false, error: "Login failed" }
    }
  } catch (error) {
    console.error("Login error:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "An unknown error occurred" 
    }
  }
}