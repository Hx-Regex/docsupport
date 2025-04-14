import { z } from "zod";

import {
  createTRPCRouter,
//   protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { clinics } from "@/server/db/schema";

export const clinicRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),


  getLatest: publicProcedure.query(async ({ ctx }) => {
    const clinic = await ctx.db.query.clinics.findFirst({
      orderBy: (clinics, { desc }) => [desc(clinics.createdAt)],
    });
    return clinic ?? null;
  }),

//   getSecretMessage: protectedProcedure.query(() => {
//     return "you can now see this secret message!";
//   }),
});
