import { z } from "zod";

import {
  createTRPCRouter,
  //   protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { profiles } from "@/server/db/schema";
import bcrypt from "bcrypt";

// Define an input schema for better type safety
// In your Zod schema, change the role definition to use an enum
// const profileInputSchema = z.object({
//   id: z.string(),
//   clinicId: z.string(),
//   role: z.enum(["doctor", "assistant"]), // Restrict to only valid roles
//   firstName: z.string(),
//   lastName: z.string(),
//   email: z.string().email(),
//   pin: z.string(),
//   status: z.string().optional(),
//   lastLogin: z.union([z.date(), z.null(), z.undefined()]).optional(),
// });

export const authRouter = createTRPCRouter({
//   create: publicProcedure
//     .input(profileInputSchema)
//     .mutation(async ({ ctx, input }) => {
//       const saltRounds = 10;
//       console.log(`[PROFILE TRPC] Input received:`, JSON.stringify(input));

//       const pinHash = await bcrypt.hash(input.pin, saltRounds);

//       // Prepare the data for insertion, handling the lastLogin field properly
//       const insertData = {
//         id: input.id,
//         clinicId: input.clinicId,
//         role: input.role,
//         firstName: input.firstName,
//         lastName: input.lastName,
//         email: input.email,
//         pinHash: pinHash,
//         status: input.status ?? "active",
//         // Don't manually set createdAt and updatedAt - let the default values handle it
//       };

//       const profile = await ctx.db
//         .insert(profiles)
//         //@ts-expect-error [TODO] : WHY IS THIS TYPE ERROR HAPPENING?
//         .values(insertData)
//         .returning();

//       return profile[0];
//     }),

  getClinicProfiles: publicProcedure
    .input(z.object({ clinicId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { clinicId } = input;
      const users = await ctx.db.query.profiles.findMany({
        where: (profiles, { eq }) => eq(profiles.clinicId, clinicId),
        columns: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
        },
      });
      return users;
    }),

  login: publicProcedure
    .input(z.object({ userId: z.string(), pin: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId, pin } = input;
      console.log(`[LOGIN TRPC] Input received:`, JSON.stringify(input));
      const user = await ctx.db.query.profiles.findFirst({
        where: (profiles, { eq }) => eq(profiles.id, userId),
      });
      if (!user) {
        throw new Error("User not found");
      }

      const isMatch = await bcrypt.compare(pin, user.pinHash);
      console.log(`[LOGIN TRPC] pin check:`, `isMatch: ${isMatch}`)

      if (!isMatch) {
        throw new Error("Invalid credentials");
      }
      return user;
    })
});
