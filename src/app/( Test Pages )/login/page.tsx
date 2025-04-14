"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { loginAction, getClinicProfiles } from "./action"
import { loginFormSchema, type LoginFormValues } from "./schema"
import * as z from "zod"

type Profile = {
  id: string
  firstName: string
  lastName: string
  role: string
  status: string | null
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])

  // Fetch profiles on page load
  useEffect(() => {
    async function fetchProfiles() {
      setIsLoading(true)
      try {
        const profileData = await getClinicProfiles()
        setProfiles(profileData as Profile[])
      } catch (error) {
        console.error("Failed to fetch profiles:", error)
        setError("Failed to load user profiles")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfiles()
  }, [])

  // Make sure we're using the correct schema
  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      userId: "",
      pin: "",
    },
  })

  async function onSubmit(values: z.infer<typeof loginFormSchema>) {
    setIsLoading(true)
    setError(null)
    
    const formData = new FormData()
    formData.append("userId", values.userId)
    formData.append("pin", values.pin)
    
    try {
      const result = await loginAction(null, formData)
      if (!result.success) {
        setError(result.error || "Login failed")
      }
      // Handle successful login (redirect, etc.)
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <h2 className="text-2xl font-bold text-center">Login</h2>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-2 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select User</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isLoading || profiles.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a user" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {profiles.map((profile) => (
                          <SelectItem key={profile.id} value={profile.id}>
                            {profile.firstName} {profile.lastName} ({profile.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PIN</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        maxLength={6}
                        placeholder="Enter 6-digit PIN"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
