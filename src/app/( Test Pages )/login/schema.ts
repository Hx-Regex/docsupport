import * as z from "zod"

// Define the login form schema
export const loginFormSchema = z.object({
  userId: z.string({
    required_error: "Please select a user",
  }),
  pin: z.string()
    .length(6, { message: "PIN must be exactly 6 digits." })
    .regex(/^\d+$/, { message: "PIN must contain only digits." }),
})

// Type for the login form values
export type LoginFormValues = z.infer<typeof loginFormSchema> 