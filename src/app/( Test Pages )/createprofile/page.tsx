"use client";
import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/server";
import { createProfile } from "./action";

const formSchema = z.object({
  id: z.string().uuid("Invalid UUID format"),
  clinicId: z.string().min(1, "Clinic ID is required"),
  role: z.enum(["assistant", "doctor"]),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  pin: z.string().min(4).max(6).regex(/^\d+$/, "PIN must contain only numbers"),
  status: z.string(),
});

function CreateProfilePage() {
  const [uuid, setUuid] = useState("");
  const clinicId = process.env.NEXT_PUBLIC_CLINIC_ID || "";

  useEffect(() => {
    setUuid(uuidv4());
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: uuid,
      clinicId: clinicId,
      role: "assistant",
      firstName: "",
      lastName: "",
      email: "",
      pin: "",
      status: "active",
    },
  });

  useEffect(() => {
    form.setValue("id", uuid);
    form.setValue("clinicId", clinicId);
  }, [uuid, clinicId, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const timestamp = Math.floor(Date.now() / 1000);
    const userData = {
      ...values,
      lastLogin: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    console.log("Form submitted:", userData);
    try {
      const data = await createProfile(userData);
    } catch (err) {
      console.log("[ERROR] ", err);
    }

    // try {
    //   const profile = api.profile.create(values);
    // } catch (err) {}
    // Add your API call here
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Create New User Profile</h2>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User ID (UUID)</FormLabel>
                    <FormControl>
                      <Input {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clinicId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clinic ID</FormLabel>
                    <FormControl>
                      <Input {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="assistant">Assistant</SelectItem>
                        <SelectItem value="doctor">Doctor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
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
                      <Input type="password" {...field} maxLength={6} />
                    </FormControl>
                    <p className="text-muted-foreground text-sm">
                      Enter a PIN between 4-6 digits
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Create Profile
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default CreateProfilePage;
