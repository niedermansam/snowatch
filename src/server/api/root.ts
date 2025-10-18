import { postRouter } from "~/server/api/routers/post";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { snotelRouter } from "~/server/api/routers/snotel";
 
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  snotel: snotelRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
